import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient, useQuery, useMutation } from '@apollo/client';
import { GET_CV_BY_USER_ID, GET_USER_INFO } from '../graphql/queries';
import { UPDATE_CV } from '../graphql/mutations';
import CVStyles from '../styles/CV.Styles';

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

interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  rate: number;
}

interface CVData {
  userId: string;
  name: string;
  description: string;
  career: string;
  email: string;
  phone: string;
  projects: Project[];
  skills: Skill[];
}

interface CVQueryResponse {
  getCv: CVData;
}

const blueColor = "#30507a";

const CV = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  // Obtener datos del usuario
  const { data: userData, loading: userLoading, error: userError } = useQuery<UserQueryResponse>(GET_USER_INFO);
  const user = userData?.getUserProfile?.data;
  const userRole =
    user?.role === 'student'
      ? 'Estudiante'
      : user?.role === 'head_of_career'
      ? 'Jefe de Carrera'
      : user?.role || 'Usuario';

  // Obtener datos del CV usando el userId
  const { data: cvData, loading: cvLoading, error: cvError, refetch } = useQuery<CVQueryResponse>(GET_CV_BY_USER_ID, {
    variables: { userId: user?.id },
    skip: !user?.id,
    fetchPolicy: 'network-only',
  });

  const [updateCV, { loading: updatingCV }] = useMutation(UPDATE_CV);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<CVData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (cvData?.getCv && !editMode) {
      setForm(cvData.getCv);
    }
  }, [cvData, editMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    client.clearStore();
    navigate('/');
  };

  const handleEdit = () => {
    setEditMode(true);
    setErrorMsg(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm(cvData?.getCv || null);
    setErrorMsg(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Proyectos
  const handleProjectChange = (idx: number, field: keyof Project, value: string) => {
    if (!form) return;
    const projects = [...form.projects];
    projects[idx] = { ...projects[idx], [field]: value };
    setForm({ ...form, projects });
  };

  const handleAddProject = () => {
    if (!form) return;
    setForm({
      ...form,
      projects: [
        ...form.projects,
        { id: `${Date.now()}`, name: '', url: '', description: '' }
      ]
    });
  };

  const handleRemoveProject = (idx: number) => {
    if (!form) return;
    const projects = form.projects.filter((_, i) => i !== idx);
    setForm({ ...form, projects });
  };

  // Habilidades
  const handleSkillChange = (idx: number, field: keyof Skill, value: string | number) => {
    if (!form) return;
    const skills = [...form.skills];
    skills[idx] = { ...skills[idx], [field]: value };
    setForm({ ...form, skills });
  };

  const handleAddSkill = () => {
    if (!form) return;
    setForm({
      ...form,
      skills: [
        ...form.skills,
        { id: `${Date.now()}`, name: '', rate: 1 }
      ]
    });
  };

  const handleRemoveSkill = (idx: number) => {
    if (!form) return;
    const skills = form.skills.filter((_, i) => i !== idx);
    setForm({ ...form, skills });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form) return;
  try {
    // Helper function to remove __typename from an object
    const removeTypename = (obj: any) => {
      const { __typename, ...rest } = obj;
      return rest;
    };

    // Clean form data
    const cleanedForm = {
      ...removeTypename(form),
      projects: form.projects.map((project) => removeTypename(project)),
      skills: form.skills.map((skill) => removeTypename(skill)),
    };

    await updateCV({
      variables: {
        input: {
          ...cleanedForm,
          projects: cleanedForm.projects.map((project: Project) => {
            const { id, ...rest } = project;
            return rest;
          }),
          skills: cleanedForm.skills.map((skill: Skill) => {
            const { id, ...rest } = skill;
            return rest;
          }),
        },
      },
    });
    setEditMode(false);
    setErrorMsg(null);
    await refetch();
  } catch (err: any) {
    setErrorMsg(err.message || "Error al actualizar el CV");
  }
};

  // Detectar si el error es "record not found"
  const noCV =
    cvError &&
    typeof cvError.message === 'string' &&
    cvError.message.toLowerCase().includes('record not found');

  // Hook para redirigir si no hay CV
  useEffect(() => {
    if (noCV) {
      const timer = setTimeout(() => {
        navigate('/Home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [noCV, navigate]);

  if (userLoading || cvLoading) return <div style={CVStyles.container}>Cargando...</div>;
  if (userError)
    return (
      <div style={CVStyles.container}>
        Error al cargar los datos del usuario: {userError.message}
      </div>
    );

  // Mostrar mensaje personalizado si no hay CV
  if (noCV) {
    return (
      <div style={CVStyles.container}>
        <div style={{ color: '#1e4d04', fontWeight: 'bold', fontSize: 24, textAlign: 'center', marginTop: 40 }}>
          Usted no tiene un CV creado aún. Redirigiendo al menú principal...
        </div>
      </div>
    );
  }

  if (cvError)
    return (
      <div style={CVStyles.container}>
        Error al cargar el CV: {cvError.message}
      </div>
    );

  const cv = cvData?.getCv;

  // Función para mostrar estrellas según el nivel
  const renderStars = (rate: number, editable = false, onChange?: (rate: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{ color: blueColor, fontSize: 18, cursor: editable ? 'pointer' : 'default' }}
          onClick={editable && onChange ? () => onChange(i) : undefined}
        >
          {i <= rate ? '★' : '☆'}
        </span>
      );
    }
    return stars;
  };

  return (
    <div style={CVStyles.container}>
      {/* Sidebar igual que antes */}
      <div style={CVStyles.sidebar}>
        <div style={CVStyles.logoContainer}>
          <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={CVStyles.logoImage} onClick={() => navigate('/Home')} />
        </div>
        <div style={CVStyles.userProfile}>
          <img src="/user-icon.png" alt="User" style={CVStyles.userPhoto} />
          <p style={CVStyles.userName}>{user?.name?.toUpperCase()}</p>
          <p style={CVStyles.userData}>{user?.email}</p>
          <p style={CVStyles.userData}>{userRole}</p>
        </div>
        {user?.role === 'student' && (
          <>
            <button style={CVStyles.sidebarButton} onClick={() => window.location.reload()}>
              📄 Mi CV
            </button>
            <button style={CVStyles.sidebarButton} onClick={() => navigate('/applications')}>
              ⭐ Mis Postulaciones
            </button>
          </>
        )}
        <div style={CVStyles.searchContainer}>
          <input type="text" placeholder="Buscar Ofertas" style={CVStyles.searchInput} />
        </div>
        <button style={CVStyles.logoutButton} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      {/* Main Content */}
      <div style={CVStyles.mainContent}>
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={CVStyles.sectionTitle}>Mi CV</h1>
          {user?.role === 'student' && cv && (
            <button
              style={{
                ...CVStyles.createJobButton,
                backgroundColor: '#30507a',
                color: '#fff',
                marginTop: 12,
                border: '1px solid #30507a',
                alignSelf: 'center'
              }}
              onClick={handleEdit}
            >
              Editar CV
            </button>
          )}
        </div>
        {errorMsg && <div style={{ color: 'red', marginBottom: 12 }}>{errorMsg}</div>}
        {/* Mensaje si no hay CV */}
        {!cv || !form ? (
          <div style={{ color: '#7f1313', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
            No se encontró información de CV para este usuario.
          </div>
        ) : editMode ? (
          <form style={CVStyles.CVCard} onSubmit={handleSubmit}>
            <h2
              style={{
                ...CVStyles.boxTitle,
                marginBottom: 8,
                textAlign: 'center'
              }}
            >
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  fontSize: 28,
                  color: blueColor,
                  fontWeight: 'bold',
                  border: 'none',
                  borderBottom: '1px solid #ccc',
                  marginBottom: 8,
                  textAlign: 'center'
                }}
                required
              />
            </h2>
            <p style={CVStyles.boxCareer}>
              <input
                type="text"
                name="career"
                value={form.career}
                onChange={handleChange}
                style={{ width: '100%', color: blueColor, border: 'none', borderBottom: '1px solid #ccc', fontWeight: 'bold' }}
                required
              />
            </p>
            <h3 style={CVStyles.boxSubtitle}>Información Personal</h3>
            <p style={{ marginBottom: 8 }}>
              <span style={CVStyles.boxPersonalInfo}>Correo Electrónico:</span>{' '}
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                style={{ color: blueColor, border: 'none', borderBottom: '1px solid #ccc', width: '60%' }}
                required
              />
            </p>
            <p style={{ marginBottom: 8 }}>
              <span style={CVStyles.boxPersonalInfo}>Teléfono:</span>{' '}
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={{ color: blueColor, border: 'none', borderBottom: '1px solid #ccc', width: '60%' }}
                required
              />
            </p>
            <p style={{ marginBottom: 16 }}>
              <span style={CVStyles.boxPersonalInfo}>Descripción:</span>{' '}
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                style={{ color: blueColor, border: '1px solid #ccc', borderRadius: 4, width: '100%', minHeight: 60 }}
                required
              />
            </p>
            <hr style={{ margin: '24px 0' }} />
            <h3 style={CVStyles.boxSubtitle}>Proyectos</h3>
            <ul style={{ paddingLeft: 20 }}>
              {form.projects.map((project, idx) => (
                <li key={project.id} style={{ marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={project.name}
                    onChange={e => handleProjectChange(idx, 'name', e.target.value)}
                    style={{ color: blueColor, border: 'none', borderBottom: '1px solid #ccc', marginRight: 8 }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={project.url}
                    onChange={e => handleProjectChange(idx, 'url', e.target.value)}
                    style={{ color: blueColor, border: 'none', borderBottom: '1px solid #ccc', marginRight: 8 }}
                  />
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={project.description}
                    onChange={e => handleProjectChange(idx, 'description', e.target.value)}
                    style={{ color: blueColor, border: 'none', borderBottom: '1px solid #ccc', width: 200 }}
                    required
                  />
                  <button type="button" onClick={() => handleRemoveProject(idx)} style={{ marginLeft: 8, color: '#7f1313', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={handleAddProject} style={{ marginBottom: 16, color: blueColor, background: 'none', border: '1px dashed #30507a', borderRadius: 4, cursor: 'pointer' }}>Agregar Proyecto</button>
            <hr style={{ margin: '24px 0' }} />
            <h3 style={CVStyles.boxSubtitle}>Habilidades</h3>
            <ul style={{ paddingLeft: 20 }}>
              {form.skills.map((skill, idx) => (
                <li key={skill.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Habilidad"
                    value={skill.name}
                    onChange={e => handleSkillChange(idx, 'name', e.target.value)}
                    style={{ color: blueColor, border: 'none', borderBottom: '1px solid #ccc', marginRight: 8 }}
                    required
                  />
                  <span style={{ marginLeft: 8 }}>
                    {renderStars(skill.rate, true, (rate) => handleSkillChange(idx, 'rate', rate))}
                  </span>
                  <button type="button" onClick={() => handleRemoveSkill(idx)} style={{ marginLeft: 8, color: '#7f1313', background: 'none', border: 'none', cursor: 'pointer' }}>Eliminar</button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={handleAddSkill} style={{ marginBottom: 16, color: blueColor, background: 'none', border: '1px dashed #30507a', borderRadius: 4, cursor: 'pointer' }}>Agregar Habilidad</button>
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <button type="submit" style={{ ...CVStyles.createJobButton, backgroundColor: '#1e4d04', color: '#fff' }} disabled={updatingCV}>
                Guardar
              </button>
              <button type="button" style={{ ...CVStyles.createJobButton, backgroundColor: '#7f1313', border: '#7f1313', color: '#fff' }} onClick={handleCancel} disabled={updatingCV}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div style={CVStyles.CVCard}>
            <h2
              style={{
                ...CVStyles.boxTitle,
                marginBottom: 8,
                textAlign: 'center'
              }}
            >
              {cv.name}
            </h2>
            <p style={CVStyles.boxCareer}>Estudiante de {cv.career}</p>
            <h3 style={CVStyles.boxSubtitle}>Información Personal</h3>
            <p style={{ marginBottom: 8 }}>
              <span style={CVStyles.boxPersonalInfo}>Correo Electrónico:</span>{' '}
              <span style={{ color: blueColor }}>{cv.email}</span>
            </p>
            <p style={{ marginBottom: 8 }}>
              <span style={CVStyles.boxPersonalInfo}>Teléfono:</span>{' '}
              <span style={{ color: blueColor }}>{cv.phone}</span>
            </p>
            <p style={{ marginBottom: 16 }}>
              <span style={CVStyles.boxPersonalInfo}>Descripción:</span>{' '}
              <span style={{ color: blueColor }}>{cv.description}</span>
            </p>
            <hr style={{ margin: '24px 0' }} />
            <h3 style={CVStyles.boxSubtitle}>Proyectos</h3>
            {cv.projects && cv.projects.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {cv.projects.map((project) => (
                  <li key={project.id} style={{ marginBottom: 12 }}>
                    <span style={CVStyles.boxPersonalInfo}>{project.name}</span>
                    {project.url && (
                      <>
                        {' '}
                        -{' '}
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: blueColor, textDecoration: 'underline' }}
                        >
                          {project.url}
                        </a>
                      </>
                    )}
                    <div style={{ color: blueColor, marginTop: 4 }}>{project.description}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#888' }}>No hay proyectos registrados.</p>
            )}
            <hr style={{ margin: '24px 0' }} />
            <h3 style={CVStyles.boxSubtitle}>Habilidades</h3>
            {cv.skills && cv.skills.length > 0 ? (
              <ul style={{ paddingLeft: 20 }}>
                {cv.skills.map((skill) => (
                  <li key={skill.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <span style={{ ...CVStyles.boxPersonalInfo, color: blueColor }}>{skill.name}</span>
                    <span style={{ marginLeft: 12 }}>{renderStars(skill.rate)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#888' }}>No hay habilidades registradas.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CV;