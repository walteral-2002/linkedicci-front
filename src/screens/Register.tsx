import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterStyles from '../styles/Register.Styles';
import { useMutation } from '@apollo/client';
import { REGISTER_USER, LOGIN_USER } from '../graphql/mutations';

type UserData = {
  name: string;
  email: string;
  password: string;
};

const Register = () => {
    const navigate = useNavigate();
    const [registerUser, { loading: registerLoading }] = useMutation(REGISTER_USER);
    const [login, { loading: loginLoading }] = useMutation(LOGIN_USER);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        general: ''
    });

    const validateForm = () => {
        const newErrors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            general: ''
        };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
            isValid = false;
        }

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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            // 1. Registrar usuario
            const { data: registerData } = await registerUser({ 
                variables: { 
                    input: {
                        name: formData.name,
                        email: formData.email,
                        password: formData.password
                    } 
                } 
            });

            if (!registerData?.register?.success) {
                setErrors(prev => ({
                    ...prev,
                    general: registerData?.register?.message || 'Error al registrar el usuario'
                }));
                return;
            }

            // 2. Login automático
            const { data: loginData } = await login({ 
                variables: { 
                    input: {
                        email: formData.email,
                        password: formData.password
                    } 
                } 
            });

            if (loginData?.login?.success) {
                localStorage.setItem('token', loginData.login.data.accessToken);
                navigate('/Home');
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: 'Registro exitoso, pero no se pudo iniciar sesión automáticamente'
                }));
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                general: 'Error en el servidor. Por favor intente más tarde'
            }));
            console.error('Error:', err);
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
    <div style={RegisterStyles.container}>
        
      <img src="/LinkedICCI Logo.png" alt="LinkedICCI Logo" style={RegisterStyles.logoImage} onClick={() => navigate('/')}/>


      <div style={RegisterStyles.centeredContent}>
        <h2 style={RegisterStyles.title}>Crear cuenta</h2>
        
        {errors.general && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>
                {errors.general}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div style={RegisterStyles.formGroup}>
                <label htmlFor="name" style={RegisterStyles.label}>Nombre</label>
                <input
                    type="name"
                    id="name"
                    name="name"
                    placeholder="Pedro Pérez López"
                    value={formData.name}
                    onChange={handleChange}
                    style={RegisterStyles.input}
                />
                {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
            </div>

            <div style={RegisterStyles.formGroup}>
                <label htmlFor="email" style={RegisterStyles.label}>Correo electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="ejemplo@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={RegisterStyles.input}
                />
                {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
            </div>

            <div style={RegisterStyles.formGroup}>
                <label htmlFor="password" style={RegisterStyles.label}>Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    style={RegisterStyles.input}
                    onChange={handleChange}
                />
                {errors.password && <span style={{ color: 'red' }}>{errors.password}</span>}
            </div>

            <div style={RegisterStyles.formGroup}>
                <label htmlFor="password" style={RegisterStyles.label}>Repetir contraseña</label>
                <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.confirmPassword}
                    style={RegisterStyles.input}
                    onChange={handleChange}
                />
                {errors.confirmPassword && <span style={{ color: 'red' }}>{errors.confirmPassword}</span>}
            </div>

            <div style={RegisterStyles.buttonContainer}>
                <button 
                    type="button"
                    style={RegisterStyles.button} 
                    onClick={() => navigate('/')}
                > 
                    Volver 
                </button>

                <button 
                    type="submit"
                    style={RegisterStyles.button} 
                    disabled={registerLoading || loginLoading}
                > 
                    {registerLoading ? 'Creando cuenta...' : loginLoading ? 'Iniciando sesión...' : 'Registrarse'} 
                </button>

            </div>
        </form>

        
      </div>
    </div>
  );
};

export default Register;