import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient, useQuery, useMutation } from '@apollo/client';
import HomeStyles from '../styles/HomeScreen.Styles';
import { GET_USER_INFO, GET_APPLICATIONS } from '../graphql/queries';
import { CREATE_APPLICATION } from '../graphql/mutations';

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

interface JobsQueryResponse {
  offers: {
    success: boolean;
    message: string;
    data: Job[];
  };
}

interface CreateOfferInput {
  title: string;
  description: string;
  company: string;
  location: string;
  salary: string;
  isInternship: boolean;
}

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  const { data: userData, loading: userLoading, error: userError } = useQuery<UserQueryResponse>(GET_USER_INFO);
  const { data: jobsData, loading: jobsLoading, error: jobsError } = useQuery<JobsQueryResponse>(GET_APPLICATIONS, {
    onError: (error) => {
      console.error('GET_APPLICATIONS Error:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
        extraInfo: error.extraInfo,
      });
    },
  });

  // Mutation for creating a new offer
  const [createOffer, { error: createOfferError }] = useMutation(CREATE_APPLICATION, {
    refetchQueries: [{ query: GET_APPLICATIONS }],
    onError: (error) => {
      console.error('CREATE_APPLICATION Error:', {
        message: error.message,
        graphQLErrors: error.graphQLErrors,
        networkError: error.networkError,
      });
    },
  });

  // State for new offer form
  const [newOffer, setNewOffer] = useState<CreateOfferInput>({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    isInternship: false,
  });

  const [showCreateOffer, setShowCreateOffer] = useState(false);

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

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOffer({
        variables: {
          input: {
            ...newOffer,
            salary: parseFloat(newOffer.salary) || 0, // Fallback to 0 if invalid
            isInternship: Boolean(newOffer.isInternship),
          },
        },
      });
      // Reset form
      setNewOffer({
        title: '',
        description: '',
        company: '',
        location: '',
        salary: '',
        isInternship: false,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Error al crear la oferta: ' + (error instanceof Error ? error.message : 'Desconocido'));
    }
  };

  const handleApply = (jobId: string) => {
    alert(`Applied to job with ID: ${jobId}`);
  };

  if (userLoading || jobsLoading) return <div style={HomeStyles.container}>Cargando...</div>;
  if (userError)
    return (
      <div style={HomeStyles.container}>
        Error al cargar los datos del usuario: {userError.message}
      </div>
    );
  if (jobsError)
    return (
      <div style={HomeStyles.container}>
        Error al cargar las ofertas: {jobsError.message}
        <pre>{JSON.stringify({ graphQLErrors: jobsError.graphQLErrors, networkError: jobsError.networkError }, null, 2)}</pre>
      </div>
    );

  const jobs = jobsData?.offers?.data || [];

  const formatFecha = (isoDate: string) => {
    const fecha = new Date(isoDate);
    return `Publicado el ${fecha.getDate()} de ${fecha.toLocaleString('es-ES', { month: 'long', timeZone: 'America/Santiago' })} de ${fecha.getFullYear()} a las ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}`;
  };

  return (
    <div style={HomeStyles.container}>
      {/* Fixed Sidebar */}
      <div style={HomeStyles.sidebar}>
        <div style={HomeStyles.logoContainer}>
          <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={HomeStyles.logoImage} onClick={() => navigate('/Home')} />
        </div>
        <div style={HomeStyles.userProfile}>
          <img src="/user-icon.png" alt="User" style={HomeStyles.userPhoto} />
          <p style={HomeStyles.userName}>{userName.toUpperCase()}</p>
          <p style={HomeStyles.userData}>{user?.email}</p>
          <p style={HomeStyles.userData}>{userRole}</p>
        </div>
        {user?.role === 'student' && (
          <>
            <button style={HomeStyles.sidebarButton} onClick={() => navigate('/cv')}>
              📄 Mi CV
            </button>
            <button style={HomeStyles.sidebarButton} onClick={() => navigate('/postulaciones')}>
              ⭐ Mis Postulaciones
            </button>
          </>
        )}
        <div style={HomeStyles.searchContainer}>
          <input type="text" placeholder="Buscar Ofertas" style={HomeStyles.searchInput} />
        </div>
        <button style={HomeStyles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div style={HomeStyles.mainContent}>
        <h1 style={HomeStyles.sectionTitle}>Ofertas Vigentes</h1>
        <h1 style={HomeStyles.sectionSubtitle}> Para ver más detalles, haga click en el título de la oferta</h1>
        
        {/* Create Offer Form (only for head_of_career) */}
        {user?.role === 'head_of_career' && (
          <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button style={HomeStyles.createJobButton } onClick={() => setShowCreateOffer(true)} type="button">
              Crear Oferta
            </button>
          </div>
            {/* Popup */}
            {showCreateOffer && (
              <div style={HomeStyles.createJobContainer}>
                <div style={ HomeStyles.createJobPopup }>
                  <h2 style={HomeStyles.boxTitle}>Crear Nueva Oferta</h2>
                  {createOfferError && (
                    <p style={{ color: 'red' }}>Error al crear oferta: {createOfferError.message}</p>
                  )}
                  <form
                    onSubmit={async (e) => {
                      await handleCreateOffer(e);
                      setShowCreateOffer(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}
                  >
                    <input
                      type="text"
                      placeholder="Título"
                      value={newOffer.title}
                      onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                      style={HomeStyles.searchInput}
                      required
                    />
                    <textarea
                      placeholder="Descripción"
                      value={newOffer.description}
                      onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                      style={{ ...HomeStyles.searchInput, fontFamily: 'sans-serif' , minHeight: '100px' }}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Empresa"
                      value={newOffer.company}
                      onChange={(e) => setNewOffer({ ...newOffer, company: e.target.value })}
                      style={HomeStyles.searchInput}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Ubicación"
                      value={newOffer.location}
                      onChange={(e) => setNewOffer({ ...newOffer, location: e.target.value })}
                      style={HomeStyles.searchInput}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Salario"
                      value={newOffer.salary}
                      onChange={(e) => setNewOffer({ ...newOffer, salary: e.target.value })}
                      style={HomeStyles.searchInput}
                      required
                    />
                    <label style={HomeStyles.boxIsInternship}>
                      <input
                        type="checkbox"
                        checked={newOffer.isInternship}
                        onChange={(e) => setNewOffer({ ...newOffer, isInternship: e.target.checked })}
                      />
                      ¿Es práctica?
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" style={HomeStyles.createJobButton}>
                        Crear Oferta
                      </button>
                      <button
                        type="button"
                        style={{ ...HomeStyles.createJobButton, backgroundColor: '#7f1313', border: '1px solid #7f1313', color: '#fff' }}
                        onClick={() => setShowCreateOffer(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* Job Listings */}
        {jobs.length === 0 ? (
          <p>No hay ofertas disponibles.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} style={HomeStyles.jobCard}>
              <div style={HomeStyles.jobHeader}>
                <h2 style={{ ...HomeStyles.jobTitle, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(`/offer/${job.id}`)}>
                 {job.title}
                </h2>
              </div>
              <div style={{ margin: '8px 0' }}>
                <span style={HomeStyles.jobType}>
                  {job.isInternship ? 'Práctica' : 'Empleo Regular'}
                </span>
              </div>
              <p style={HomeStyles.jobLocation}>
                {job.company}, {job.location}
              </p>
              <p style={HomeStyles.jobLocation}>{formatFecha(job.createdAt)}</p>
              <p style={HomeStyles.jobDescription}>Descripción: {job.description}</p>
              <p style={HomeStyles.jobDescription}>Salario: ${job.salary}</p>
              {user?.role === 'head_of_career' ? (
                <button
                  style={HomeStyles.applicantsButton}
                  onClick={() => navigate(`/oferta/${job.id}/postulaciones`)}
                >
                  Ver postulaciones
                </button>
              ) : (
                <button style={HomeStyles.applyButton} onClick={() => handleApply(job.id)}>
                  ☆ Postular
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeScreen;