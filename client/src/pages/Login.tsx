import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setSignInLoading(true);
    try {
      await login(signInEmail, signInPassword);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirm) {
      toast.error('Please fill in all fields');
      return;
    }
    if (signUpPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSignUpLoading(true);
    try {
      await register(signUpEmail, signUpPassword, signUpName);
      toast.success('Account created! Signing you in...');
      await login(signUpEmail, signUpPassword);
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body">
      {/* ── Left Panel ──────────────────────────────────── */}
      <div className="hidden lg:flex w-[48%] bg-holst-sage relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/8" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-holst-navy-900/15" />

        {/* Top content */}
        <div className="relative z-10">
          <h1 className="font-display text-3xl text-white font-bold tracking-wide">
            {activeTab === 'signin'
              ? 'Welcome back to Nexus'
              : 'Start with Nexus'}
          </h1>
          <p className="mt-4 text-sm text-white/80 max-w-sm leading-relaxed">
            {activeTab === 'signin'
              ? 'Sign in to manage your projects, assign tasks, and track your team\'s progress — all in one place.'
              : 'Create your account to start managing projects, assigning tasks, and collaborating with your team in real time.'}
          </p>
        </div>

        {/* Dashboard Preview Illustration */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-[340px] h-[300px] relative">
            {/* Main dashboard card */}
            <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-5 flex flex-col gap-3">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/25 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">N</span>
                  </div>
                  <span className="text-xs font-semibold text-white/90 tracking-wide">Nexus Dashboard</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                </div>
              </div>

              {/* Stat cards row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/15 p-3 text-center">
                  <p className="text-lg font-bold text-white">12</p>
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">Projects</p>
                </div>
                <div className="rounded-xl bg-white/15 p-3 text-center">
                  <p className="text-lg font-bold text-white">48</p>
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">Tasks</p>
                </div>
                <div className="rounded-xl bg-white/15 p-3 text-center">
                  <p className="text-lg font-bold text-white">7</p>
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">Team</p>
                </div>
              </div>

              {/* Task list preview */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-white/80 flex-1">Design system finalized</span>
                  <span className="text-[9px] text-white/40">Done</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  <span className="text-[10px] text-white/80 flex-1">API integration in progress</span>
                  <span className="text-[9px] text-white/40">Active</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span className="text-[10px] text-white/80 flex-1">User testing scheduled</span>
                  <span className="text-[9px] text-white/40">Pending</span>
                </div>
              </div>

              {/* Bottom progress bar */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-white/50">Sprint Progress</span>
                  <span className="text-[9px] text-white/50">72%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-holst-sand/80 to-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="relative z-10 flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-white/60">Real-time collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <span className="text-xs text-white/60">Role-based access</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────── */}
      <div className="flex-1 bg-holst-cream flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="neu-lg p-8">
            {/* Tabs */}
            <div className="flex gap-8 mb-10">
              <button
                onClick={() => setActiveTab('signin')}
                className={`font-display text-2xl tracking-wide transition-colors pb-1 ${
                  activeTab === 'signin'
                    ? 'text-holst-navy-900 font-bold border-b-2 border-holst-blue'
                    : 'text-holst-navy-900/40 font-medium hover:text-holst-navy-900/60'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`font-display text-2xl tracking-wide transition-colors pb-1 ${
                  activeTab === 'signup'
                    ? 'text-holst-navy-900 font-bold border-b-2 border-holst-blue'
                    : 'text-holst-navy-900/40 font-medium hover:text-holst-navy-900/60'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* ── Login Form ───────────────────────────────── */}
            {activeTab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-holst-navy-900/60 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-neu w-full px-4 py-4 rounded-xl bg-holst-cream text-holst-navy-900 placeholder:text-holst-navy-900/30 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-holst-navy-900/60 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-neu w-full px-4 py-4 rounded-xl bg-holst-cream text-holst-navy-900 placeholder:text-holst-navy-900/30 focus:outline-none font-body text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={signInLoading}
                  className="btn-neu w-full py-4 rounded-xl bg-gradient-to-r from-holst-blue to-holst-navy-800 text-white font-display font-semibold tracking-wider text-sm uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {signInLoading ? 'Signing in...' : 'Login'}
                </button>
              </form>
            )}

            {/* ── Sign Up Form ─────────────────────────────── */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-holst-navy-900/60 mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="John Doe"
                    className="input-neu w-full px-4 py-4 rounded-xl bg-holst-cream text-holst-navy-900 placeholder:text-holst-navy-900/30 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-holst-navy-900/60 mb-2 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-neu w-full px-4 py-4 rounded-xl bg-holst-cream text-holst-navy-900 placeholder:text-holst-navy-900/30 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-holst-navy-900/60 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input-neu w-full px-4 py-4 rounded-xl bg-holst-cream text-holst-navy-900 placeholder:text-holst-navy-900/30 focus:outline-none font-body text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-holst-navy-900/60 mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`input-neu w-full px-4 py-4 rounded-xl bg-holst-cream text-holst-navy-900 placeholder:text-holst-navy-900/30 focus:outline-none font-body text-sm ${
                      signUpConfirm && signUpPassword !== signUpConfirm
                        ? 'ring-2 ring-red-400'
                        : ''
                    }`}
                  />
                  {signUpConfirm && signUpPassword !== signUpConfirm && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={signUpLoading}
                  className="btn-neu w-full py-4 rounded-xl bg-gradient-to-r from-holst-sage to-holst-navy-800 text-white font-display font-semibold tracking-wider text-sm uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {signUpLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
