import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import LoginStyles from '../styles/Login.Styles';

type LoginInput = {
  email: string;
  password: string;
};

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginInput>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        general: ''
    });
    const [login, { loading }] = useMutation(LOGIN_USER);

    const validateForm = (): boolean => {
        const newErrors = {
            email: '',
            password: '',
            general: ''
        };
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Ingrese un email válido';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
            isValid = false;
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            const { data } = await login({ 
                variables: { 
                    input: {
                        email: formData.email,
                        password: formData.password
                    } 
                } 
            });

            if (data?.login?.success) {
                localStorage.setItem('token', data.login.data.accessToken);
                navigate('/Home');
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: data?.login?.message || 'Credenciales incorrectas'
                }));
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Error en el servidor. Por favor intente más tarde'
            }));
            console.error('Error en login:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar errores al escribir
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
                general: ''
            }));
        }
    };

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
                
                {errors.general && (
                    <div style={{ 
                        color: '#ff4d4f', 
                        backgroundColor: '#fff2f0',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        border: '1px solid #ffccc7'
                    }}>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={LoginStyles.formGroup}>
                        <label htmlFor="email" style={LoginStyles.label}>Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="ejemplo@mail.com"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                ...LoginStyles.input,
                                ...(errors.email && { borderColor: '#ff4d4f' })
                            }}
                        />
                        {errors.email && (
                            <span style={{
                                color: '#ff4d4f',
                                fontSize: '0.8rem',
                                marginTop: '4px',
                                display: 'block'
                            }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div style={LoginStyles.formGroup}>
                        <label htmlFor="password" style={LoginStyles.label}>Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                ...LoginStyles.input,
                                ...(errors.password && { borderColor: '#ff4d4f' })
                            }}
                        />
                        {errors.password && (
                            <span style={{
                                color: '#ff4d4f',
                                fontSize: '0.8rem',
                                marginTop: '4px',
                                display: 'block'
                            }}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div style={LoginStyles.buttonContainer}>
                        <button 
                            type="submit" 
                            style={LoginStyles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                        <button 
                            type="button" 
                            style={LoginStyles.createAccount} 
                            onClick={() => navigate('/register')}
                            disabled={loading}
                        >
                            Crear Cuenta
                        </button>
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