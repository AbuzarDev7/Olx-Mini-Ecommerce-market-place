import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, provider } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Firestore user doc
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Register
  const registerUser = async (email, password, fullname, profileUrl) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    // Save record to users collection
    const userDoc = {
      uid: user.uid,
      fullname: fullname || email.split('@')[0],
      email: email,
      profile: profileUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid), userDoc);
    setUserProfile(userDoc);
    return res;
  };

  // Google Sign-In
  const googleSignIn = async () => {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;
    
    const userDoc = {
      uid: user.uid,
      fullname: user.displayName || 'Google User',
      email: user.email,
      profile: user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      provider: 'google'
    };
    await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true });
    setUserProfile(userDoc);
    return res;
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    login,
    registerUser,
    googleSignIn,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
