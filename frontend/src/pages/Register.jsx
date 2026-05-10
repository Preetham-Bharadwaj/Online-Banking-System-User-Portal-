import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="max-w-md w-full glass-card p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Registration Restricted</h2>
        <p className="text-slate-600 mb-8">
          Self-registration is currently disabled for institutional security. Please contact your account manager to initiate the onboarding process.
        </p>
        <Link to="/login" className="btn-primary w-full block">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default Register;
