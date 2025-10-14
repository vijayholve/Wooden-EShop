import { useState } from 'react';
import { API_BASE_URL } from '../utils/config.js';

const useAuthForm = (isLogin) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        ...(isLogin ? {} : { email: '', password2: '' }),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (onSuccess) => {
        setError(null);
        setIsLoading(true);

        const url = isLogin
            ? `${API_BASE_URL}/token/`
            : `${API_BASE_URL}/users/register/`;

        const payload = isLogin
            ? { username: formData.username, password: formData.password }
            : {
                  username: formData.username,
                  email: formData.email,
                  password: formData.password,
                  password2: formData.password2,
              };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = 'An unexpected error occurred.';
                if (data) {
                    errorMessage = Object.entries(data)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                        .join(' | ');
                }
                throw new Error(errorMessage);
            }

            onSuccess(data);
        } catch (err) {
            setError(err.message || 'Network error or request failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, handleChange, handleSubmit, isLoading, error };
};

export default useAuthForm;