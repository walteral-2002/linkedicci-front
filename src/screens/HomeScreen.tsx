import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeStyles from '../styles/HomeScreen.Styles';
import { GET_USER_INFO } from '../graphql/queries';
import { useApolloClient, useQuery } from '@apollo/client';

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

// Mock data for job listings (replace with actual query data)
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
}

const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Oficial de Datos',
    company: 'CGE S.A.',
    location: 'Región Metropolitana de Santiago, Chile',
    description:
      'En CGE buscamos un/a Oficial de Datos (base Las Condes), donde deberá disferir y ejecutar proyectos de inteligencia artificial, analítica avanzada y gobierno de datos, que permitan extraer conocimiento e insights de los datos para mejorar la toma de decisiones y optimizar los procesos.',
    requirements: ['Identificar y priorizar las necesidades y oportunidades de negocio que...'],
  },
  {
    id: 2,
    title: 'Técnico Informático',
    company: 'SQM',
    location: 'Región de Coquimbo, Chile',
    description:
      'Subido por Javier Lopez Jaramillo. Compañía líder que aborda todo tipo de proyectos. En la actualidad requiere al alumno de la carrera de Ingeniería Civil Informática/Técnico Informático para desempeñarse en la Serena Santiago para el proyecto de AutoPista Concesionada.',
    requirements: ['Cumples con los aspectos que se evalúan? Si es así, esta puede ser la oportunidad perfecta para ti.'],
  },
];

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  const { data, loading, error } = useQuery<UserQueryResponse>(GET_USER_INFO);

  const user = data?.getUserProfile?.data;
  const userName = user?.name || 'Usuario';
  const userRole =
  user?.role === 'student'
    ? 'Estudiante'
    : user?.role === 'head_of_career' || user?.role === 'jefatura'
    ? 'Jefatura'
    : user?.role || 'Estudiante';

  const handleLogout = () => {
    localStorage.removeItem('token');
    client.clearStore();
    navigate('/');
  };

  if (loading) return <div style={HomeStyles.container}>Cargando...</div>;
  if (error) return <div style={HomeStyles.container}>Error al cargar los datos del usuario</div>;

  return (
    <div style={HomeStyles.container}>
      {/* Fixed Sidebar */}
      <div style={HomeStyles.sidebar}>
        <div style={HomeStyles.logoContainer}>
          <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={HomeStyles.logoImage} />
        </div>
        <div style={HomeStyles.userProfile}>
          <img src="/user-icon.png" alt="User Photo" style={HomeStyles.userPhoto} />
          <p style={HomeStyles.userName}>{userName.toUpperCase()}</p>
          <p style={HomeStyles.userData}>{user?.email}</p>
          <p style={HomeStyles.userData}>{userRole}</p>
        </div>
        <button style={HomeStyles.sidebarButton} onClick={() => navigate('/cv')}>
          📄 Mi CV
        </button>
        <button style={HomeStyles.sidebarButton} onClick={() => navigate('/postulaciones')}>
          ⭐ Mis Postulaciones
        </button>
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
        {mockJobs.map((job) => (
          <div key={job.id} style={HomeStyles.jobCard}>
            <div style={HomeStyles.jobHeader}>
              <h2 style={HomeStyles.jobTitle}>{job.title}</h2>
              <img
                src={`/path-to-${job.company.toLowerCase()}-logo.png`}
                alt={`${job.company} Logo`}
                style={HomeStyles.companyLogo}
              />
            </div>
            <p style={HomeStyles.jobLocation}>
              {job.company}, {job.location}
            </p>
            <p style={HomeStyles.jobDescription}>{job.description}</p>
            <h3 style={HomeStyles.jobSubtitle}>Principales Funciones:</h3>
            <ul style={HomeStyles.jobRequirements}>
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
            <button style={HomeStyles.applyButton}>☆ Postular</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;