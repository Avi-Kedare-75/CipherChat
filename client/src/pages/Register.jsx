import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, Lock, Mail, User, AtSign, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.username.trim() || formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = 'Only letters, numbers, and underscores allowed';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    const result = await register(payload);
    if (result.success) {
      toast.success('Account created with E2EE key bundle!', {
        icon: '🛡️',
        style: {
          background: '#202c33',
          color: '#e9edef',
          border: '1px solid #10b981',
        },
      });
      navigate('/', { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-dark-bg chat-pattern-bg flex items-center justify-center p-4 relative overflow-hidden py-10">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cipher-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cipher-600 to-emerald-400 p-0.5 shadow-glow">
              <div className="w-full h-full bg-dark-sidebar rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-cipher-400" />
              </div>
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-dark-textPrimary">
            Create Encrypted Account
          </h1>
          <p className="text-xs text-dark-textMuted mt-0.5">
            Your keys, your privacy. Zero knowledge server architecture.
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Alice Johnson"
              icon={User}
              error={validationErrors.fullName}
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="alice"
              icon={AtSign}
              error={validationErrors.username}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alice@cipher.app"
              icon={Mail}
              error={validationErrors.email}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                icon={Lock}
                endIcon={showPassword ? EyeOff : Eye}
                onEndIconClick={() => setShowPassword(!showPassword)}
                error={validationErrors.password}
              />

              <Input
                label="Confirm"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                icon={KeyRound}
                error={validationErrors.confirmPassword}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              <span>Initialize Identity & Register</span>
            </Button>
          </form>

          {/* E2EE Info Callout */}
          <div className="mt-4 p-3 rounded-xl bg-dark-panel/60 border border-white/5 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-cipher-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-dark-textMuted leading-relaxed">
              Your cryptographic identity keys are generated locally in your browser. Even server administrators cannot read your messages.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-dark-textMuted mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-cipher-400 hover:text-cipher-300 font-medium transition-colors hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
