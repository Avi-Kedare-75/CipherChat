import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen w-screen bg-dark-bg chat-pattern-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8 text-rose-400" />
      </div>
      <h1 className="text-3xl font-bold text-dark-textPrimary">404</h1>
      <p className="text-sm text-dark-textMuted mt-1 mb-6 max-w-sm">
        The encrypted channel or page you are looking for does not exist or has been terminated.
      </p>
      <Link to="/">
        <Button variant="primary" icon={ArrowLeft}>
          Return to CipherChat
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
