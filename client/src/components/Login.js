import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginImage from '../image/logo.jpg';
import { TextField, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login Successful");
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred, please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen flex justify-center py-12">
      {/* Login Section */}
      <div className="flex flex-col lg:flex-row overflow-hidden bg-white w-full max-w-5xl shadow-xl rounded-lg p-8 h-full">
        
        {/* Image Section */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <img
            src={LoginImage}
            alt="Login"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center items-center">
          <Typography variant="h4" className="text-gray-800 font-bold text-center mb-4">
            Login To Your Account
          </Typography>
          <Typography className="mb-6 text-gray-600 text-center">
            Enter your email and password to login!
          </Typography>

          {/* Login Form */}
          <form noValidate onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <TextField
              id="email"
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-100 rounded-lg shadow-md"
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-100 rounded-lg shadow-md"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="mt-4 py-2 rounded-lg shadow-md"
              type="submit"
            >
              Sign In
            </Button>
          </form>

          {/* Forgot Password and Sign Up Links */}
          <div className="mt-4 text-center text-gray-700">  
            <Typography>
              <span className="pr-2">Don't have an account?</span>
              <Link to="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
