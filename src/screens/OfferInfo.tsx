import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_OFFER_BY_ID, GET_USER_INFO } from '../graphql/queries';
import OfferStyles from '../styles/OfferInfo.Styles';
import { off } from 'process';

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

interface OfferByIdResponse {
  offer: {
    success: boolean;
    message: string;
    data: Job;
  };
}

const OfferInfo = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { id } = useParams<{ id: string }>();

  const { data: userData, loading: userLoading, error: userError } = useQuery<UserQueryResponse>(GET_USER_INFO);
  const { data: offerData, loading: offerLoading, error: offerError } = useQuery<OfferByIdResponse>(GET_OFFER_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const offer = offerData?.offer?.data;
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

  const handleApply = (jobId: string) => {
    alert(`Applied to job with ID: ${jobId}`);
  };

  if (userLoading || offerLoading) return <div style={OfferStyles.container}>Cargando...</div>;
  if (userError)
    return (
      <div style={OfferStyles.container}>
        Error al cargar los datos del usuario: {userError.message}
      </div>
    );
  if (offerError)
    return (
      <div style={OfferStyles.container}>
        Error al cargar la oferta: {offerError.message}
      </div>
    );

  const formatFecha = (isoDate: string) => {
    const fecha = new Date(isoDate);
    return `${fecha.getDate()} de ${fecha.toLocaleString('es-ES', { month: 'long', timeZone: 'America/Santiago' })} de ${fecha.getFullYear()} a las ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })}`;
  };

  return (
    <div style={OfferStyles.container}>
      {/* Fixed Sidebar */}
      <div style={OfferStyles.sidebar}>
        <div style={OfferStyles.logoContainer}>
          <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={OfferStyles.logoImage} onClick={() => navigate('/Home')} />
        </div>
        <div style={OfferStyles.userProfile}>
          <img src="/user-icon.png" alt="User" style={OfferStyles.userPhoto} />
          <p style={OfferStyles.userName}>{userName.toUpperCase()}</p>
          <p style={OfferStyles.userData}>{user?.email}</p>
          <p style={OfferStyles.userData}>{userRole}</p>
        </div>
        {user?.role === 'student' && (
          <>
            <button style={OfferStyles.sidebarButton} onClick={() => navigate('/cv')}>
              📄 Mi CV
            </button>
            <button style={OfferStyles.sidebarButton} onClick={() => navigate('/postulaciones')}>
              ⭐ Mis Postulaciones
            </button>
          </>
        )}
        <div style={OfferStyles.searchContainer}>
          <input type="text" placeholder="Buscar Ofertas" style={OfferStyles.searchInput} />
        </div>
        <button style={OfferStyles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      {/* Main Content */}
      <div style={OfferStyles.mainContent}>
        <h1 style={OfferStyles.sectionTitle}>Información de la Oferta</h1>
        {offer ? (
          <div style={OfferStyles.jobCard}>
            <div style={OfferStyles.jobHeader}>
                <h2 style={OfferStyles.jobTitle}> {offer.title}</h2>
            </div>
              <div style={{ margin: '8px 0' }}>
                <span style={OfferStyles.jobType}>
                  {offer.isInternship ? 'Práctica' : 'Empleo Regular'}
                </span>
              </div>
              <p style={OfferStyles.jobLocation}>
                {offer.company}, {offer.location}
              </p>
              <p style={OfferStyles.jobLocation}>{'Publicado el ' + formatFecha(offer.createdAt)}</p>
              <p style={OfferStyles.jobLocation}>{'Actualizado el ' + formatFecha(offer.updatedAt)}</p>
              <p style={OfferStyles.jobDescription}>Publicado por el Administrador</p>
              <p style={OfferStyles.jobDescription}>Descripción: {offer.description}</p>
              <p style={OfferStyles.jobDescription}>Salario: ${offer.salary}</p>
              {user?.role === 'head_of_career' ? (
                <button
                  style={OfferStyles.applicantsButton}
                  onClick={() => navigate(`/oferta/${offer.id}/postulaciones`)}
                >
                  Ver postulaciones
                </button>
              ) : (
                <button style={OfferStyles.applyButton} onClick={() => handleApply(offer.id)}>
                  ☆ Postular
                </button>
              )}
            </div>
        ) : (
          <div style={OfferStyles.errorMessage}>
            No se encontró la oferta solicitada.
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferInfo;