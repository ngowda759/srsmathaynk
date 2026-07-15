// Firebase stub types - used during Firebase to Supabase transition
// All Firebase modules are typed as 'any' to allow gradual migration

declare module 'firebase/firestore' {
  const doc: any;
  const collection: any;
  const getDoc: any;
  const getDocs: any;
  const setDoc: any;
  const updateDoc: any;
  const deleteDoc: any;
  const addDoc: any;
  const serverTimestamp: any;
  const Timestamp: any;
  export { doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, Timestamp };
}

declare module 'firebase/app' {
  const initializeApp: any;
  const getApps: any;
  const getApp: any;
  export { initializeApp, getApps, getApp };
}

declare module 'firebase/auth' {
  const getAuth: any;
  const signInWithEmailAndPassword: any;
  const createUserWithEmailAndPassword: any;
  const signOut: any;
  const onAuthStateChanged: any;
  export { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
}

declare module 'firebase/storage' {
  const getStorage: any;
  const ref: any;
  const uploadBytesResumable: any;
  const getDownloadURL: any;
  const deleteObject: any;
  export { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject };
}

// Global Firebase instances
declare const db: any;

// Firebase function declarations for files that use them without importing
declare function doc(...args: any[]): any;
declare function collection(...args: any[]): any;
declare function getDoc(...args: any[]): any;
declare function getDocs(...args: any[]): any;
declare function setDoc(...args: any[]): any;
declare function updateDoc(...args: any[]): any;
declare function deleteDoc(...args: any[]): any;
declare function addDoc(...args: any[]): any;
declare function serverTimestamp(): any;
