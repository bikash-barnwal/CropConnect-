import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import Loader from './Common/Loader';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [formError, setFormError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError[name]) setFormError((prev) => ({ ...prev, [name]: '' }));
  };


  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    try {
      const result = await signup(formData);
      if (result.success) {
        toast.success("Registration successful! Please sign in.")
        navigate('/signin');
      }
      else {
        toast.error(result.message || "Registration failed. Try again.");
      }
    }
    catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Join CropConnect
        </h1>
        <p className="text-gray-600">Create your account to get started</p>
      </div>

      <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formError.name ? 'border-red-500' : ''}`}
            id="name"
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
          {formError.name && <p className="text-red-500 text-xs italic">{formError.name}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formError.email ? 'border-red-500' : ''}`}
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          {formError.email && <p className="text-red-500 text-xs italic">{formError.email}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formError.password ? 'border-red-500' : ''}`}
            id="password"
            name="password"
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          {formError.password && <p className="text-red-500 text-xs italic">{formError.password}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >

            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className='flex justify-center gap-4'>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader /> : 'Sign Up'}
            {/* {loading ? 'Signing Up...' : 'Sign Up'} */}

          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"

            onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
