'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { validateCPF } from '@/lib/utils';

// Check if Firebase is configured
const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

export interface DunasUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  cpf: string | null;
  role: 'tourist' | 'admin';
  provider: 'google' | 'cpf' | 'mock';
  createdAt: string;
}

interface AuthContextType {
  user: DunasUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithCPF: (cpf: string, name: string, email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock user for development without Firebase
const MOCK_STORAGE_KEY = 'dunastech_mock_user';

function getMockUser(): DunasUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(MOCK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function setMockUser(user: DunasUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DunasUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Initialize auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Mock mode: check localStorage
      const mockUser = getMockUser();
      setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
      }, 0);
      return;
    }

    // Real Firebase Auth listener
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch user profile from Firestore
          try {
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUser(userDoc.data() as DunasUser);
            } else {
              // First login — create profile
              const newUser: DunasUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                cpf: null,
                role: 'tourist',
                provider: 'google',
                createdAt: new Date().toISOString(),
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              setUser(newUser);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              cpf: null,
              role: 'tourist',
              provider: 'google',
              createdAt: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured) {
      // Mock Google sign-in
      const mockUser: DunasUser = {
        uid: 'mock-google-' + Date.now(),
        email: 'turista@dunastech.com',
        displayName: 'Turista Demo',
        photoURL: null,
        cpf: null,
        role: 'tourist',
        provider: 'mock',
        createdAt: new Date().toISOString(),
      };
      setMockUser(mockUser);
      setUser(mockUser);
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login com Google';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const signInWithCPF = useCallback(async (cpf: string, name: string, email: string) => {
    setError(null);
    setLoading(true);

    // Validate CPF
    const cleanCPF = cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCPF)) {
      setError('CPF inválido. Verifique os dígitos e tente novamente.');
      setLoading(false);
      return;
    }

    if (!name.trim() || name.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres.');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('E-mail inválido.');
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // Mock CPF sign-in
      const mockUser: DunasUser = {
        uid: 'mock-cpf-' + cleanCPF,
        email,
        displayName: name,
        photoURL: null,
        cpf: cleanCPF,
        role: 'tourist',
        provider: 'mock',
        createdAt: new Date().toISOString(),
      };
      setMockUser(mockUser);
      setUser(mockUser);
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      
      // Check if CPF already exists
      const cpfQuery = query(collection(db, 'users'), where('cpf', '==', cleanCPF));
      const existing = await getDocs(cpfQuery);
      
      if (!existing.empty) {
        // CPF already registered — log them in
        const existingUser = existing.docs[0].data() as DunasUser;
        setUser(existingUser);
        setLoading(false);
        return;
      }

      // Create new user with CPF
      const uid = `cpf-${cleanCPF}`;
      const newUser: DunasUser = {
        uid,
        email,
        displayName: name,
        photoURL: null,
        cpf: cleanCPF,
        role: 'tourist',
        provider: 'cpf',
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', uid), newUser);
      setUser(newUser);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setMockUser(null);
      setUser(null);
      return;
    }

    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao sair';
      setError(errorMessage);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithCPF,
        signOutUser,
        isAuthenticated: !!user,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
