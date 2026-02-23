const firebaseConfig = {
    apiKey: "AIzaSyCnz_WN7VvCyOnq0X2bT8GWrrdYz3dfhDk",
    authDomain: "messeng-2375a.firebaseapp.com",
    projectId: "messeng-2375a",
    storageBucket: "messeng-2375a.firebasestorage.app",
    messagingSenderId: "1067260834357",
    appId: "1:1067260834357:web:8fcf7ff2a2f9e9bc2a777c"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

window.db = db;

console.log('Firebase инициализирован');