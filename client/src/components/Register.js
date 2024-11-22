import React, { useState } from 'react';
import RegisterImage from '../image/logo.jpg';
import { TextField, Button, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to validate email
  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  };

  // Function to validate password
  const isValidPassword = (password) => {
    // Check if the password is at least 6 characters long, contains at least one uppercase letter, one number, and one special character
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation
    if (!email || !password || !name) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      toast.error("Password must be at least 6 characters long, contain an uppercase letter, a number, and a special character");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful!");
        setName("");
        setEmail("");
        setPassword("");
        navigate('/login');
      } else {
        toast.error(data.message || "Registration failed");
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error("An error occurred, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen flex justify-center py-12">
      <div className="flex flex-col lg:flex-row overflow-hidden bg-white w-full lg:w-3/4 max-w-5xl shadow-xl rounded-lg p-6 h-5/6">
        
        {/* Image section */}
        <div className="hidden lg:block lg:w-1/2 p-8">
          <img
            src={RegisterImage}
            alt="Register"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Register Form Section */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center items-center space-y-6">
          <Typography variant="h4" className="text-gray-800 font-bold text-center mb-4">
            Create Your Account
          </Typography>
          <Typography className="mb-6 text-gray-600 text-center">
            Enter your details to register!
          </Typography>

          {/* Form Section */}
          <form noValidate onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <TextField
              id="fullname"
              label="Full Name"
              type="text"
              variant="outlined"
              fullWidth
              required
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-100 rounded-lg"
            />
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
              className="bg-gray-100 rounded-lg"
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
              className="bg-gray-100 rounded-lg"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="mt-4 py-2 rounded-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <Typography className="text-red-600 text-center mt-2">{error}</Typography>
          )}

          {/* Link to Login page */}
          <div className="mt-4 text-center text-gray-700">
            <Typography>
              <span className="pr-2">Already have an Account?</span>
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
