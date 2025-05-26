import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginStyles from '../styles/Login.Styles';

const Login = () => {
    const navigate = useNavigate();
    return (
        <div style={LoginStyles.container}>
            <div style={LoginStyles.logoContainer}>
                <div style={LoginStyles.logoBox}>
                    <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={LoginStyles.logoImage} />
                    <p style={LoginStyles.logoSubtext}>Unas puertas a tu futuro</p>
                </div>
            </div>

            <div style={LoginStyles.loginForm}>
                <h2 style={LoginStyles.welcomeText}>¡Bienvenidos a nuestro portal!
                    <br />
                    Por favor, ingrese sus credenciales
                </h2>
                

                <form>
                    <div style={LoginStyles.formGroup}>
                        <label htmlFor="email" style={LoginStyles.label}>Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="ejemplo@mail.com"
                            style={LoginStyles.input}
                        />
                    </div>

                    <div style={LoginStyles.formGroup}>
                        <label htmlFor="password" style={LoginStyles.label}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Mínimo 8 caracteres"
                            style={LoginStyles.input}
                        />
                    </div>

                    <div style={LoginStyles.buttonContainer}>
                        <button type="submit" style={LoginStyles.loginButton}>Iniciar Sesión</button>
                        <button type="button" style={LoginStyles.createAccount} onClick={() => navigate('/register')}>Crear Cuenta</button>
                    </div>
                </form>
            </div>

            <footer style={LoginStyles.footer}>
                © Mambo Rambo - 2025. Todos los derechos reservados.
            </footer>
        </div>
    );
};

export default Login;