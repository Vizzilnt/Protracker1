
import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/auth';
import { User } from '../types';
import { LogIn, UserPlus, Lock, Mail, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthView = 'login' | 'register';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearErrors = () => {
      setError('');
  };

  const switchView = (newView: AuthView) => {
      clearErrors();
      setView(newView);
      // Clear sensitive fields when switching, but keep email for convenience in flows
      setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setIsLoading(true);

    // Artificial delay for better UX feel
    await new Promise(r => setTimeout(r, 600));

    try {
        if (view === 'login') {
            const result = loginUser(email, password);
            if ('error' in result) {
                setError(result.error);
            } else {
                onLogin(result);
            }
        } else if (view === 'register') {
             if (!name.trim()) {
                setError('Name is required.');
                setIsLoading(false);
                return;
              }
              const result = registerUser(name, email, password);
              if ('error' in result) {
                setError(result.error);
              } else {
                onLogin(result);
              }
        }
    } catch (err) {
        setError('An unexpected error occurred.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const renderTitle = () => {
      switch(view) {
          case 'login': return 'Sign In';
          case 'register': return 'Create Account';
      }
  };

  const renderSubtitle = () => {
      switch(view) {
          case 'login': return 'Welcome back! Please sign in.';
          case 'register': return 'Join ProTracker today.';
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-200 relative">
        
        {view !== 'login' && (
            <button 
                onClick={() => switchView('login')}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
                title="Back to Login"
            >
                <ArrowLeft size={20} />
            </button>
        )}

        <div className="flex flex-col items-center mb-8 mt-2">
          <Logo className="mb-6 scale-125" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{renderTitle()}</h1>
          <p className="text-slate-500 text-sm text-center">{renderSubtitle()}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-pulse">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div className="space-y-1 animate-fade-in-up">
              <label className="block text-xs font-bold uppercase text-slate-500">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                  placeholder="John Doe"
                  required={view === 'register'}
                />
              </div>
            </div>
          )}

          <div className="space-y-1 animate-fade-in-up">
            <label className="block text-xs font-bold uppercase text-slate-500">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1 animate-fade-in-up">
            <label className="block text-xs font-bold uppercase text-slate-500">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                    {view === 'login' && <><LogIn size={18} /> Sign In</>}
                    {view === 'register' && <><UserPlus size={18} /> Create Account</>}
                </>
            )}
          </button>
        </form>

        {view === 'login' && (
             <div className="mt-4 flex items-center justify-center text-sm">
                <p className="text-slate-500">Don't have an account?</p>
                <button onClick={() => switchView('register')} className="ml-2 text-blue-600 font-semibold hover:text-blue-800 hover:underline">
                    Create Account
                </button>
             </div>
        )}

        {view === 'register' && (
            <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                    Already have an account? <button onClick={() => switchView('login')} className="font-semibold text-blue-600 hover:underline">Sign In</button>
                </p>
            </div>
        )}
      </div>
    </div>
  );
};
