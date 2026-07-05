import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthInput from '../components/AuthInput';
import { toast } from 'react-toastify';

const BASE_API = import.meta.env.VITE_BASE_API_URL
const BASE_URL = `${BASE_API}/forgetPassword/user` // url for generate reset-password link and send it to registered email id 


const ForgotPassword = () => {
    const { requestPasswordReset, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await requestPasswordReset(email);
            if (result && result.success) {
                setMessage('Password reset link has been sent to your email.');
                toast.success("Password reset link sent.")
            }
        } catch (_err) {
            toast.error("Failed to send reset link.")
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <AuthInput
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="text-green-500 text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            //  onClick={()=>navigate("/user/forgetpassword")}
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                        >
                            {loading ? 'Sending...' : 'Send reset link'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
