import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApolloClient, useQuery, useMutation } from '@apollo/client';
import { GET_USER_INFO, GET_OFFER_BY_ID, GET_APPLICANTS_BY_OFFER, GET_USER_BY_ID, GET_USER_APPLICATIONS } from '../graphql/queries';
import { DECIDE_APPLICATION } from '../graphql/mutations';
import OfferApplicantsStyles from '../styles/OfferApplicants.Styles';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserQueryResponse {
  getUserProfile: {
    success: boolean;
    message: string;
    data: User;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  createdByHeadOfCareerId: string;
  isInternship: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Applicant {
  id: string;
  offerId: string;
  studentId: string;
  message: string;
  status: string;
  createdAt: string;
}

interface OfferByIdResponse {
  offer: {
    success: boolean;
    message: string;
    data: Job;
  };
}

interface ApplicantsByOfferResponse {
  getApplicantsByOffer: {
    success: boolean;
    message: string;
    data: Applicant[];
  };
}

const OfferApplicants = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { offerId } = useParams<{ offerId: string }>();

  console.log('Offer ID in OfferApplicants:', offerId);

  const [students, setStudents] = useState<{ [id: string]: User }>({});
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Track previous applicantsData to prevent unnecessary effect runs
  const prevApplicantsDataRef = useRef<ApplicantsByOfferResponse | undefined>(undefined);

  const { data: userData, loading: userLoading, error: userError } = useQuery<UserQueryResponse>(GET_USER_INFO);
  const { data: offerData, loading: offerLoading, error: offerError } = useQuery<OfferByIdResponse>(GET_OFFER_BY_ID, {
    variables: { id: offerId },
    skip: !offerId,
  });
  const { data: applicantsData, loading: applicantsLoading, error: applicantsError, refetch } = useQuery<ApplicantsByOfferResponse>(GET_APPLICANTS_BY_OFFER, {
    variables: { offerId },
    skip: !offerId,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('GET_APPLICANTS_BY_OFFER Completed:', data);
    },
    onError: (error) => {
      console.log('GET_APPLICANTS_BY_OFFER Error:', error);
    },
  });

  const [updateApplicationStatus, { loading: mutationLoading }] = useMutation(DECIDE_APPLICATION, {
    onError: (error) => {
      console.error('Mutation Error:', error);
      setMutationError(error.message);
    },
  });

  // Memoize fetchStudents to prevent recreation
  const fetchStudents = useCallback(async (applicants: Applicant[]) => {
    console.log('Running fetchStudents');
    setIsFetchingStudents(true);
    const studentPromises = applicants
      .filter((applicant) => !students[applicant.studentId])
      .map((applicant) =>
        client
          .query({ query: GET_USER_BY_ID, variables: { id: applicant.studentId } })
          .then((res) => {
            console.log(`User Data for studentId ${applicant.studentId}:`, res.data);
            return { studentId: applicant.studentId, data: res.data?.getUser?.data };
          })
          .catch((error) => {
            console.error(`Error fetching user ${applicant.studentId}:`, error);
            return { studentId: applicant.studentId, data: null };
          })
      );

    const results = await Promise.all(studentPromises);
    const newStudents = results.reduce((acc, { studentId, data }) => {
      if (data) {
        acc[studentId] = data;
      }
      return acc;
    }, {} as { [id: string]: User });

    setStudents((prev) => ({ ...prev, ...newStudents }));
    setIsFetchingStudents(false);
  }, [client, students]);

  useEffect(() => {
    console.log('useEffect Running', { applicantsData });
    const currentApplicants = applicantsData?.getApplicantsByOffer?.data || [];
    
    // Compare with previous data to avoid unnecessary fetches
    if (
      applicantsData &&
      Array.isArray(currentApplicants) &&
      currentApplicants.length > 0 &&
      JSON.stringify(currentApplicants) !== JSON.stringify(prevApplicantsDataRef.current?.getApplicantsByOffer?.data)
    ) {
      fetchStudents(currentApplicants);
    }
    
    // Update ref after effect
    prevApplicantsDataRef.current = applicantsData;
  }, [applicantsData, fetchStudents]);

  const user = userData?.getUserProfile?.data;
  const userName = user?.name || 'Usuario';
  const userRole =
    user?.role === 'student'
      ? 'Estudiante'
      : user?.role === 'head_of_career'
      ? 'Jefe de Carrera'
      : user?.role || 'Usuario';

  const handleLogout = () => {
    localStorage.removeItem('token');
    client.clearStore();
    navigate('/');
  };

  const handleAction = useCallback((applicant: Applicant, action: 'accept' | 'reject') => {
    console.log('handleAction Called', { applicantId: applicant.id, action });
    setSelectedApplicant(applicant);
    setActionType(action);
    setShowConfirmPopup(true);
    setMutationError(null);
  }, []);

  const offer = offerData?.offer?.data;
  const applicants: Applicant[] = applicantsData?.getApplicantsByOffer?.data || [];

  // Usar una referencia para evitar llamadas infinitas
  const fetchedStudentIds = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const fetchStudents = async () => {
      setIsFetchingStudents(true);
      const studentPromises = (applicants || [])
        .filter((applicant) => !students[applicant.studentId] && !fetchedStudentIds.current.has(applicant.studentId))
        .map((applicant) => {
          fetchedStudentIds.current.add(applicant.studentId);
          return client
            .query({ query: GET_USER_BY_ID, variables: { id: applicant.studentId } })
            .then((res) => {
              return { studentId: applicant.studentId, data: res.data?.getUser?.data };
            })
            .catch(() => ({ studentId: applicant.studentId, data: null }));
        });

      const results = await Promise.all(studentPromises);
      const newStudents = results.reduce((acc, { studentId, data }) => {
        if (data) {
          acc[studentId] = data;
        }
        return acc;
      }, {} as { [id: string]: User });

      if (Object.keys(newStudents).length > 0) {
        setStudents((prev) => ({ ...prev, ...newStudents }));
      }
      setIsFetchingStudents(false);
    };

    if (applicants.length > 0) {
      fetchStudents();
    }
    // SOLO depende de applicants y client
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicants, client]);

  // Función para rechazar otras postulaciones del usuario aceptado
  const rejectOtherUserApplications = useCallback(
    async (studentId: string, exceptOfferId: string) => {
      try {
        // 1. Obtener todas las postulaciones del usuario seleccionado
        const { data } = await client.query({
          query: GET_USER_APPLICATIONS,
          variables: { studentId }, 
          fetchPolicy: 'network-only',
        });
        const userApplications = data?.getApplicationsByStudent?.data || [];
        
        // 2. Filtrar postulaciones distintas a la oferta actual y que estén pendientes o aceptadas
        const toReject = userApplications.filter(
          (app: any) =>
            app.offerId !== exceptOfferId &&
            (app.status === 'pending' || app.status === 'accepted')
        );

        // 3. Rechazar todas esas postulaciones
        await Promise.all(
          toReject.map((app: any) =>
            updateApplicationStatus({
              variables: {
                input: {
                  applicationId: app.id,
                  status: 'rejected',
                },
              },
            })
          )
        );
      } catch (err) {
        console.error('Error rechazando otras postulaciones del usuario:', err);
      }
    },
    [client, updateApplicationStatus]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!selectedApplicant || !actionType) return;

    try {
      if (actionType === 'accept') {
        // 1. Aceptar la postulación seleccionada
        await updateApplicationStatus({
          variables: {
            input: {
              applicationId: selectedApplicant.id,
              status: 'accepted',
            },
          },
          update: (cache, { data }) => {
            if (data?.updateApplicationStatus?.success) {
              cache.modify({
                fields: {
                  getApplicantsByOffer(existing = {}) {
                    return {
                      ...existing,
                      data: existing.data.map((app: Applicant) =>
                        app.id === selectedApplicant.id ? { ...app, status: 'accepted' } : app
                      ),
                    };
                  },
                },
              });
            }
          },
        });

        // 2. Rechazar todas las demás postulaciones a esta oferta
        const otherApplicants = applicants.filter(
          (app) => app.id !== selectedApplicant.id && app.status === 'pending'
        );
        if (otherApplicants.length > 0) {
          await Promise.all(
            otherApplicants.map((app) =>
              updateApplicationStatus({
                variables: {
                  input: {
                    applicationId: app.id,
                    status: 'rejected',
                  },
                },
                update: (cache, { data }) => {
                  if (data?.updateApplicationStatus?.success) {
                    cache.modify({
                      fields: {
                        getApplicantsByOffer(existing = {}) {
                          return {
                            ...existing,
                            data: existing.data.map((existingApp: Applicant) =>
                              existingApp.id === app.id ? { ...existingApp, status: 'rejected' } : existingApp
                            ),
                          };
                        },
                      },
                    });
                  }
                },
              })
            )
          );
        }

        // 3. Rechazar otras postulaciones del usuario aceptado en otras ofertas
        await rejectOtherUserApplications(selectedApplicant.studentId, selectedApplicant.offerId);
      } else {
        // Rechazar la postulación seleccionada
        await updateApplicationStatus({
          variables: {
            input: {
              applicationId: selectedApplicant.id,
              status: 'rejected',
            },
          },
          update: (cache, { data }) => {
            if (data?.updateApplicationStatus?.success) {
              cache.modify({
                fields: {
                  getApplicantsByOffer(existing = {}) {
                    return {
                      ...existing,
                      data: existing.data.map((app: Applicant) =>
                        app.id === selectedApplicant.id ? { ...app, status: 'rejected' } : app
                      ),
                    };
                  },
                },
              });
            }
          },
        });
      }

      // Reset state
      setShowConfirmPopup(false);
      setSelectedApplicant(null);
      setActionType(null);
      setMutationError(null);

      await refetch();
    } catch (error) {
      console.error('Mutation error:', error);
      setMutationError((error as Error).message);
    }
  }, [
    selectedApplicant,
    actionType,
    applicants,
    updateApplicationStatus,
    refetch,
    rejectOtherUserApplications,
  ]);

  const handleCancelAction = useCallback(() => {
    console.log('handleCancelAction Called');
    setShowConfirmPopup(false);
    setSelectedApplicant(null);
    setActionType(null);
    setMutationError(null);
  }, []);

  if (userLoading || offerLoading || applicantsLoading || isFetchingStudents) {
    return <div style={OfferApplicantsStyles.container}>Cargando...</div>;
  }
  if (userError) {
    return <div style={OfferApplicantsStyles.container}>Error al cargar los datos del usuario: {userError.message}</div>;
  }
  if (offerError) {
    return <div style={OfferApplicantsStyles.container}>Error al cargar la oferta: {offerError.message}</div>;
  }
  if (applicantsError) {
    return <div style={OfferApplicantsStyles.container}>Error al cargar las postulaciones: {applicantsError.message}</div>;
  }

  

  // (Moved applicants declaration above handleConfirmAction)

  const formatFecha = (isoDate: string) => {
    const fecha = new Date(isoDate);
    return `${fecha.getDate()} de ${fecha.toLocaleString('es-ES', { month: 'long', timeZone: 'America/Santiago' })} de ${fecha.getFullYear()} a las ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}`;
  };

  return (
    <div style={OfferApplicantsStyles.container}>
      {/* Confirmation Popup */}
      {showConfirmPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ marginBottom: '15px' }}>
              ¿Estás seguro de {actionType === 'accept' ? 'aceptar' : 'rechazar'} la postulación de{' '}
              {(selectedApplicant && students[selectedApplicant.studentId]?.name) || 'este estudiante'}?
            </h3>
            {actionType === 'accept' && (
              <p style={{ color: '#555', marginBottom: '15px' }}>
                Al aceptar esta postulación, todas las demás serán rechazadas automáticamente.
              </p>
            )}
            {mutationError && <p style={{ color: 'red', marginBottom: '15px' }}>{mutationError}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: mutationLoading ? '#ccc' : '#1e4d04',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: mutationLoading ? 'not-allowed' : 'pointer',
                }}
                onClick={handleConfirmAction}
                disabled={mutationLoading}
              >
                {mutationLoading ? 'Procesando...' : 'Confirmar'}
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#7f1313',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={handleCancelAction}
                disabled={mutationLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={OfferApplicantsStyles.sidebar}>
        <div style={OfferApplicantsStyles.logoContainer}>
          <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={OfferApplicantsStyles.logoImage} onClick={() => navigate('/Home')} />
        </div>
        <div style={OfferApplicantsStyles.userProfile}>
          <img src="/user-icon.png" alt="User" style={OfferApplicantsStyles.userPhoto} />
          <p style={OfferApplicantsStyles.userName}>{userName.toUpperCase()}</p>
          <p style={OfferApplicantsStyles.userData}>{user?.email}</p>
          <p style={OfferApplicantsStyles.userData}>{userRole}</p>
        </div>
        {user?.role === 'student' && (
          <>
            <button style={OfferApplicantsStyles.sidebarButton} onClick={() => navigate('/cv')}>
              📄 Mi CV
            </button>
            <button style={OfferApplicantsStyles.sidebarButton} onClick={() => navigate('/applications')}>
              ⭐ Mis Postulaciones
            </button>
          </>
        )}
        <div style={OfferApplicantsStyles.searchContainer}>
          <input type="text" placeholder="Buscar Ofertas" style={OfferApplicantsStyles.searchInput} />
        </div>
        <button style={OfferApplicantsStyles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      <div style={OfferApplicantsStyles.mainContent}>
        <h1 style={OfferApplicantsStyles.sectionTitle}>
          Postulantes para: {offer?.title || 'Oferta'}
        </h1>
        <h2 style={OfferApplicantsStyles.sectionSubtitle}>
          {offer?.company} - {offer?.location}
        </h2>
        {applicants.length === 0 ? (
          <p style={OfferApplicantsStyles.sectionNoApplicants}>
            No hay postulantes para esta oferta (offerId: {offerId}).
          </p>
        ) : (
          applicants.map((applicant) => {
            const student = students[applicant.studentId];
            return (
              <div key={applicant.id} style={OfferApplicantsStyles.jobCard}>
                <div style={OfferApplicantsStyles.jobHeader}>
                  <h3 style={OfferApplicantsStyles.jobTitle}>
                    {student ? student.name : `Cargando datos del estudiante (ID: ${applicant.studentId})...`}
                  </h3>
                  <span style={OfferApplicantsStyles.jobType}>{applicant.status}</span>
                </div>
                <p style={OfferApplicantsStyles.jobLocation}>
                  Email: {student ? student.email : `Cargando (ID: ${applicant.studentId})...`}
                </p>
                <p style={OfferApplicantsStyles.jobDescription}>Mensaje: {applicant.message}</p>
                <p style={OfferApplicantsStyles.jobDescription}>
                  Fecha de postulación: {formatFecha(applicant.createdAt)}
                </p>
                {user?.role === 'head_of_career' && applicant.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#1e4d04',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAction(applicant, 'accept')}
                    >
                      Aceptar
                    </button>
                    <button
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#7f1313',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAction(applicant, 'reject')}
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OfferApplicants;