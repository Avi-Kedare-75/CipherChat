import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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

    const result = await login(formData);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.fullName}!`, {
        icon: '🔐',
        style: {
          background: '#202c33',
          color: '#e9edef',
          border: '1px solid #10b981',
        },
      });
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-dark-bg chat-pattern-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cipher-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cipher-600 to-emerald-400 p-0.5 shadow-glow">
              <div className="w-full h-full bg-dark-sidebar rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-9 h-9 text-cipher-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-dark-sidebar rounded-full ring-2 ring-dark-border">
              <Lock className="w-3.5 h-3.5 text-cipher-400" />
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-dark-textPrimary flex items-center gap-2">
            CipherChat
            <span className="text-xs px-2 py-0.5 rounded-full bg-cipher-500/10 text-cipher-400 border border-cipher-500/20 font-medium">
              E2EE
            </span>
          </h1>
          <p className="text-xs text-dark-textMuted mt-1">
            Private, secure, end-to-end encrypted messaging
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark-textPrimary">Sign In</h2>
            <p className="text-xs text-dark-textMuted mt-0.5">
              Enter your credentials to access your encrypted chats
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="alice@example.com"
              icon={Mail}
              error={validationErrors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              endIcon={showPassword ? EyeOff : Eye}
              onEndIconClick={() => setShowPassword(!showPassword)}
              error={validationErrors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Unlock CipherChat</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Quick autofill helper for pair testing */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-dark-textMuted mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cipher-400" />
              <span>Quick Test Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'alice@cipher.app', password: 'password123' });
                  setValidationErrors({});
                }}
                className="px-3 py-1.5 rounded-lg bg-dark-panel hover:bg-dark-panelHover text-xs text-dark-textPrimary border border-white/5 transition-all text-left truncate"
              >
                👩 <strong>Alice</strong> (alice@cipher.app)
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ email: 'bob@cipher.app', password: 'password123' });
                  setValidationErrors({});
                }}
                className="px-3 py-1.5 rounded-lg bg-dark-panel hover:bg-dark-panelHover text-xs text-dark-textPrimary border border-white/5 transition-all text-left truncate"
              >
                👨 <strong>Bob</strong> (bob@cipher.app)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-dark-textMuted mt-6">
          Don't have an encrypted account?{' '}
          <Link
            to="/register"
            className="text-cipher-400 hover:text-cipher-300 font-medium transition-colors underline-offset-4 hover:underline"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
