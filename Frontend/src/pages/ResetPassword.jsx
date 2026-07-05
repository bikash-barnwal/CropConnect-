import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthInput from '../components/AuthInput';
import { toast } from 'react-toastify';

const BASE_API = import.meta.env.VITE_BASE_API_URL;
const BASE_URL = `${BASE_API}/user/resetPassword`;

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

    const [formError, setFormError] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError[name]) {
            setFormError(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.password) errors.password = 'Password is required';
        else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormError(errors);
            return;
        }

        if (!token) {
            setMessage('Invalid or expired reset link');
            toast.error('Invalid or expired reset link');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');

            const res = await axios.post(BASE_URL, {
                token,
                password: formData.password
            });

            if (res.data?.message) {
                setMessage(res.data.message);
                toast.success(res.data.message);
                setTimeout(() => navigate('/signin'), 2000);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to reset password.");
            setError(
                err.response?.data?.message || 'Failed to reset password.'
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <AuthInput
                            label="New Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={formError.password}
                            required
                        />

                        <AuthInput
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={formError.confirmPassword}
                            required
                        />

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        {message && (
                            <div className="text-green-500 text-sm">{message}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

