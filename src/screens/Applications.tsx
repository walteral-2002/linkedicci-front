import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_USER_APPLICATIONS, GET_USER_INFO, GET_APPLICATIONS } from '../graphql/queries';
import ApplicationStyles from '../styles/Applications.Styles';

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

const Applications = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  const { data: userData, loading: userLoading, error: userError } = useQuery<UserQueryResponse>(GET_USER_INFO);
  const { data: applicationsData, loading: applicationsLoading, error: applicationsError } = useQuery<any>(GET_USER_APPLICATIONS);
  const { data: jobsData, loading: jobsLoading, error: jobsError } = useQuery<JobsQueryResponse>(GET_APPLICATIONS);

  const [applyMessage, setApplyMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyPopup, setShowApplyPopup] = useState(false);

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

  // Obtener todas las postulaciones del usuario
  const userApplications = applicationsData?.getApplicationsByStudent?.data || [];
  // Obtener todas las ofertas
  const jobs = jobsData?.offers?.data || [];

  // Filtrar las ofertas a las que el usuario ha postulado
  const appliedJobs = jobs.filter((job) =>
    userApplications.some((app: any) => app.offerId === job.id)
  );

  if (userLoading || applicationsLoading || jobsLoading)
    return <div style={ApplicationStyles.container}>Cargando...</div>;
  if (userError)
    return (
      <div style={ApplicationStyles.container}>
        Error al cargar los datos del usuario: {userError.message}
      </div>
    );
  if (applicationsError)
    return (
      <div style={ApplicationStyles.container}>
        Error al cargar las postulaciones: {applicationsError.message}
      </div>
    );
  if (jobsError)
    return (
      <div style={ApplicationStyles.container}>
        Error al cargar las ofertas: {jobsError.message}
      </div>
    );

  const formatFecha = (isoDate: string) => {
    const fecha = new Date(isoDate);
    return `${fecha.getDate()} de ${fecha.toLocaleString('es-ES', { month: 'long', timeZone: 'America/Santiago' })} de ${fecha.getFullYear()} a las ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}`;
  };

  const handleApply = (job: Job, existingMessage?: string) => {
    setSelectedJob(job);
    setApplyMessage(existingMessage || '');
    setShowApplyPopup(true);
  };

  return (
    <div style={ApplicationStyles.container}>
      {/* Fixed Sidebar */}
      <div style={ApplicationStyles.sidebar}>
        <div style={ApplicationStyles.logoContainer}>
          <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={ApplicationStyles.logoImage} onClick={() => navigate('/Home')} />
        </div>
        <div style={ApplicationStyles.userProfile}>
          <img src="/user-icon.png" alt="User" style={ApplicationStyles.userPhoto} />
          <p style={ApplicationStyles.userName}>{userName.toUpperCase()}</p>
          <p style={ApplicationStyles.userData}>{user?.email}</p>
          <p style={ApplicationStyles.userData}>{userRole}</p>
        </div>
        {user?.role === 'student' && (
          <>
            <button style={ApplicationStyles.sidebarButton} onClick={() => navigate('/cv')}>
              📄 Mi CV
            </button>
            <button style={ApplicationStyles.sidebarButton} onClick={() => window.location.reload()}>
              ⭐ Mis Postulaciones
            </button>
          </>
        )}
        <div style={ApplicationStyles.searchContainer}>
          <input type="text" placeholder="Buscar Ofertas" style={ApplicationStyles.searchInput} />
        </div>
        <button style={ApplicationStyles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      {/* Main Content */}
      <div style={ApplicationStyles.mainContent}>

        {showApplyPopup && (
          <div style={ApplicationStyles.createJobContainer}>
            <div style={ApplicationStyles.createJobPopup}>
              <h2 style={ApplicationStyles.boxTitle}>
                {userApplications.find((a: any) => a.offerId === selectedJob?.id)
                  ? 'Mensaje de tu postulación'
                  : 'Postular a la oferta'}
              </h2>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }}>
                <textarea
                  placeholder="Escribe un mensaje para tu postulación"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  style={{ ...ApplicationStyles.searchInput, fontFamily: 'sans-serif', minHeight: '80px' }}
                  required
                  disabled={!!userApplications.find((a: any) => a.offerId === selectedJob?.id)}
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    style={{ ...ApplicationStyles.createJobButton, backgroundColor: '#7f1313', border: '1px solid #7f1313', color: '#fff' }}
                    onClick={() => setShowApplyPopup(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <h1 style={ApplicationStyles.sectionTitle}>Mis postulaciones</h1>
        <h1 style={ApplicationStyles.sectionSubtitle}> Para ver más detalles, haga click en el título de la oferta</h1>
        {/* Job Listings */}
        {appliedJobs.length === 0 ? (
          <p>No hay ofertas disponibles.</p>
        ) : (
          appliedJobs.map((job: Job) => {
            const application = userApplications.find((a: any) => a.offerId === job.id);
            return (
              <div key={job.id} style={ApplicationStyles.jobCard}>
                <div style={ApplicationStyles.jobHeader}>
                  <h2
                    style={{ ...ApplicationStyles.jobTitle, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate(`/offer/${job.id}`)}
                  >
                    {job.title}
                  </h2>
                </div>
                <div style={{ margin: '8px 0' }}>
                  <span style={ApplicationStyles.jobType}>
                    {job.isInternship ? 'Práctica' : 'Empleo Regular'}
                  </span>
                </div>
                <p style={ApplicationStyles.jobLocation}>
                  {job.company}, {job.location}
                </p>
                <p style={ApplicationStyles.jobLocation}>{formatFecha(job.createdAt)}</p>
                <p style={ApplicationStyles.jobDescription}>Descripción: {job.description}</p>
                <p style={ApplicationStyles.jobDescription}>Salario: ${job.salary}</p>
                {user?.role === 'head_of_career' ? (
                  <button
                    style={ApplicationStyles.applicantsButton}
                    onClick={() => navigate(`/offer/applicants/${job.id}`)}
                  >
                    Ver postulaciones
                  </button>
                ) : (
                  // Mostrar el botón según el estado de la postulación
                  application?.status === 'pending' ? (
                    <button
                      style={{ ...ApplicationStyles.applyButton, backgroundColor: '#695d0d', borderColor: '#695d0d', color: '#ffffff' }}
                      onClick={() => handleApply(job, application.message)}
                    >
                      Pendiente
                    </button>
                  ) : application?.status === 'accepted' ? (
                    <button
                      style={{ ...ApplicationStyles.applyButton, backgroundColor: '#1e4d04', color: '#ffffff', cursor: 'default' }}
                      disabled
                    >
                      ✓ Aceptado
                    </button>
                  ) : application?.status === 'rejected' ? (
                    <button
                      style={{ ...ApplicationStyles.applyButton, backgroundColor: '#7f1313', color: '#ffffff', borderColor: '#7f1313', cursor: 'default' }}
                      disabled
                    >
                      X Rechazado
                    </button>
                  ) : null
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Applications;