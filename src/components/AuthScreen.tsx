import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, User, Ruler } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthScreenProps {
  onLoginSuccess: (email: string, name: string, preferredSize: number, isNew: boolean) => void;
  athleteSprinterImage: string;
}

export default function AuthScreen({ onLoginSuccess, athleteSprinterImage }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('athlete@elitekicks.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [shoeSize, setShoeSize] = useState<number>(9.5);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 5) {
      setFormError('Password must be at least 5 characters');
      return;
    }
    if (isSignUp && !fullName.trim()) {
      setFormError('Please fill in your full name');
      return;
    }

    setIsSubmitting(true);
    if (isSignUp) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const formattedName = fullName.trim().toUpperCase();
          const profileData = {
            email: user.email || email,
            fullName: formattedName,
            joinedDate: 'Jun 2026',
            preferredSize: shoeSize,
            favorites: ['aero-blast-v2', 'volt-glide-runner']
          };
          await setDoc(doc(db, 'users', user.uid), profileData);
          setIsSubmitting(false);
          onLoginSuccess(email, formattedName, shoeSize, true);
        })
        .catch((error: any) => {
          setIsSubmitting(false);
          let errMsg = error.message || 'Error occurred during account creation.';
          if (error.code === 'auth/email-already-in-use') {
            errMsg = 'This email address is already in use by another athlete.';
          }
          setFormError(errMsg);
        });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          let loadedFullName = email.split('@')[0];
          loadedFullName = loadedFullName.charAt(0).toUpperCase() + loadedFullName.slice(1);
          let loadedSize = shoeSize;
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            loadedFullName = data.fullName || loadedFullName;
            loadedSize = data.preferredSize || loadedSize;
          } else {
            const profileData = {
              email: user.email || email,
              fullName: loadedFullName,
              joinedDate: 'Jun 2026',
              preferredSize: loadedSize,
              favorites: ['aero-blast-v2', 'volt-glide-runner']
            };
            await setDoc(docRef, profileData);
          }
          
          setIsSubmitting(false);
          onLoginSuccess(email, loadedFullName, loadedSize, false);
        })
        .catch((error: any) => {
          setIsSubmitting(false);
          let errMsg = error.message || 'Error occurred during sign in.';
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errMsg = 'Invalid email or password. Please verify credentials.';
          }
          setFormError(errMsg);
        });
    }
  };

  const handleOAuthLogin = async (providerName: string) => {
    setIsSubmitting(true);
    setFormError('');
    try {
      if (providerName.toLowerCase() === 'google') {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const formattedName = (user.displayName || 'Google Athlete').toUpperCase();
          const initialProfile = {
            email: user.email || '',
            fullName: formattedName,
            joinedDate: 'Jun 2026',
            preferredSize: 9.5,
            favorites: ['aero-blast-v2', 'volt-glide-runner']
          };
          await setDoc(userDocRef, initialProfile);
          setIsSubmitting(false);
          onLoginSuccess(user.email || '', formattedName, 9.5, true);
        } else {
          const data = userDoc.data();
          setIsSubmitting(false);
          onLoginSuccess(
            data.email || user.email || '',
            data.fullName || user.displayName || 'Google Athlete',
            data.preferredSize || 9.5,
            false
          );
        }
      } else if (providerName.toLowerCase() === 'apple') {
        const provider = new OAuthProvider('apple.com');
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const formattedName = (user.displayName || 'Apple Athlete').toUpperCase();
          const initialProfile = {
            email: user.email || '',
            fullName: formattedName,
            joinedDate: 'Jun 2026',
            preferredSize: 9.5,
            favorites: ['aero-blast-v2', 'volt-glide-runner']
          };
          await setDoc(userDocRef, initialProfile);
          setIsSubmitting(false);
          onLoginSuccess(user.email || '', formattedName, 9.5, true);
        } else {
          const data = userDoc.data();
          setIsSubmitting(false);
          onLoginSuccess(
            data.email || user.email || '',
            data.fullName || user.displayName || 'Apple Athlete',
            data.preferredSize || 9.5,
            false
          );
        }
      } else {
        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(
            `${providerName.toLowerCase()}athlete@elitekicks.com`,
            `${providerName} Member`,
            9.5,
            false
          );
        }, 600);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setFormError(err.message || 'An error occurred during social login.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-end bg-[#0b0c10] relative overflow-hidden">
      {/* Background image area representing the mockup */}
      <div className="absolute top-0 left-0 right-0 h-[48%] md:h-[52%] overflow-hidden bg-[#e5e5e5]">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 via-transparent to-transparent z-10" />
        <img
          src={athleteSprinterImage}
          alt="Athlete Sprinter Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter saturate-75 opacity-90"
        />
      </div>

      {/* Main card panel extending from bottom */}
      <motion.div
        initial={{ y: '25%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="w-full bg-neutral-50 text-neutral-800 rounded-t-[2.5rem] p-8 md:p-12 z-20 shadow-[0_-15px_40px_rgba(0,0,0,0.2)] max-w-md mx-auto relative border-t border-white flex flex-col"
      >
        {/* Top visual handlebar */}
        <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-6" />

        {/* Title headers */}
        <div className="space-y-1 mb-6 text-left">
          <h1 className="font-display font-black text-3xl leading-none text-neutral-900 tracking-tight flex flex-col uppercase">
            <span>Join the</span>
            <span className="text-[#0a46e4] text-4xl mt-1 tracking-wide font-black">Movement</span>
          </h1>
          <p className="text-neutral-500 font-medium text-sm leading-relaxed pt-1">
            {isSignUp
              ? 'Create an elite account to customize fit profiles and save lists.'
              : 'Sign in to access exclusive drops and personalized training insights.'}
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded-r-md">
              {formError}
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-left">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <input
                  id="signup-fullname"
                  type="text"
                  placeholder="Steve Prefontaine"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0a46e4] focus:border-[#0a46e4] placeholder-neutral-300 font-medium text-neutral-900"
                  required
                />
              </div>
            </div>
          )}

          {/* Email block */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-left">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input
                id="login-email"
                type="email"
                placeholder="athlete@elitekicks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0a46e4] focus:border-[#0a46e4] placeholder-neutral-300 font-medium text-neutral-900"
                required
              />
            </div>
          </div>

          {/* Password block */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-left">
                Password
              </label>
              {!isSignUp && (
                <button
                  id="forgot-pass-btn"
                  type="button"
                  onClick={() => alert('Password reset directions dispatched to: ' + email)}
                  className="text-xs text-[#0a46e4] font-bold hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0a46e4] focus:border-[#0a46e4] placeholder-neutral-300 font-medium text-neutral-900"
                required
              />
            </div>
          </div>

          {/* Shoe size block (SignUp Only) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-left">
                Preferred Brand/Size (US Men)
              </label>
              <div className="relative flex gap-2 items-center">
                <Ruler className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                <select
                  id="signup-shoe-size"
                  value={shoeSize}
                  onChange={(e) => setShoeSize(parseFloat(e.target.value))}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#0a46e4] focus:border-[#0a46e4] font-medium text-neutral-900 appearance-none cursor-pointer"
                >
                  {[7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13].map((size) => (
                    <option key={size} value={size}>
                      Size {size} US
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-500" />
              </div>
            </div>
          )}

          {/* Get Started Button */}
          <motion.button
            id="auth-submit-btn"
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="w-full h-13 mt-2 bg-neutral-900 hover:bg-neutral-800 text-white font-display uppercase tracking-widest text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4 mt-[-1px]" />
              </>
            )}
          </motion.button>
        </form>

        {/* Separator line */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-neutral-200" />
          <span className="relative z-10 px-3 bg-neutral-50 text-[10px] uppercase font-bold text-neutral-400 tracking-widest">
            Or continue with
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            id="google-oauth-btn"
            onClick={() => handleOAuthLogin('Google')}
            className="flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-4 py-3 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {/* Google G multi-color logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            id="apple-oauth-btn"
            onClick={() => handleOAuthLogin('Apple')}
            className="flex items-center justify-center gap-2 border border-neutral-200 rounded-xl px-4 py-3 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {/* Apple black logo */}
            <svg className="w-4 h-4 fill-neutral-800" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.11.67-2.83 1.52-.61.71-1.14 1.85-1 2.96 1.09.08 2.18-.58 2.84-1.42z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Footer Toggle text */}
        <div className="mt-8 text-center text-xs">
          <span className="text-neutral-500 font-semibold">
            {isSignUp ? 'Already have an account? ' : 'New to the club? '}
          </span>
          <button
            id="toggle-auth-mode-btn"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#0a46e4] font-black hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
