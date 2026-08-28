import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, loginWithEmail, logout as firebaseLogout, registerWithEmail, resetPassword } from '../lib/firebase';
import type { AppUser, UserRole } from '../types/user';

interface AuthContextValue {
  uid: string | null;
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  displayName: string;
  role: UserRole | null;
  municipio: string;
  register: (fields: { displayName: string; email: string; password: string; municipio: string; role: UserRole }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setProfile(null);
        setProfileLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    return onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? (snapshot.data() as AppUser) : null);
      setProfileLoading(false);
    });
  }, [user]);

  async function register(fields: { displayName: string; email: string; password: string; municipio: string; role: UserRole }) {
    const newUser = await registerWithEmail(fields.email, fields.password, fields.displayName);
    await setDoc(doc(db, 'users', newUser.uid), {
      uid: newUser.uid,
      displayName: fields.displayName,
      role: fields.role,
      municipio: fields.municipio,
      createdAt: serverTimestamp(),
    });
  }

  async function login(email: string, password: string) {
    await loginWithEmail(email, password);
  }

  async function logout() {
    await firebaseLogout();
  }

  async function forgotPassword(email: string) {
    await resetPassword(email);
  }

  const value = useMemo(
    () => ({
      uid: user?.uid ?? null,
      user,
      profile,
      loading: authLoading || (!!user && profileLoading),
      displayName: profile?.displayName ?? user?.displayName ?? '',
      role: profile?.role ?? null,
      municipio: profile?.municipio ?? '',
      register,
      login,
      logout,
      forgotPassword,
    }),
    [user, profile, authLoading, profileLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
