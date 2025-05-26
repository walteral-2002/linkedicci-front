// Register.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterStyles from '../styles/Register.Styles';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div style={RegisterStyles.container}>
        
      <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={RegisterStyles.logoImage} />


      <div style={RegisterStyles.centeredContent}>
        <h2 style={RegisterStyles.title}>Crear cuenta</h2>

        <form>
            <div style={RegisterStyles.formGroup}>
                <label htmlFor="name" style={RegisterStyles.label}>Nombre</label>
                <input
                    type="name"
                    id="name"
                    placeholder="Pedro Pérez López"
                    style={RegisterStyles.input}
                />
            </div>

            <div style={RegisterStyles.formGroup}>
                <label htmlFor="email" style={RegisterStyles.label}>Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    placeholder="ejemplo@mail.com"
                    style={RegisterStyles.input}
                />
            </div>

            <div style={RegisterStyles.formGroup}>
                <label htmlFor="password" style={RegisterStyles.label}>Contraseña</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Mínimo 8 caracteres"
                    style={RegisterStyles.input}
                />
            </div>

            <div style={RegisterStyles.formGroup}>
                <label htmlFor="password" style={RegisterStyles.label}>Repetir contraseña</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Mínimo 8 caracteres"
                    style={RegisterStyles.input}
                />
            </div>

            <div style={RegisterStyles.buttonContainer}>
                <button style={RegisterStyles.button} onClick={() => navigate('/')}> Volver </button>

                <button style={RegisterStyles.button} onClick={() => navigate('/some-route')}> Registrarse </button>
            </div>
        </form>

        
      </div>
    </div>
  );
};

export default Register;