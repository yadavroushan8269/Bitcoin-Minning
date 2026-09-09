const firebaseConfig = {
  apiKey: "AIzaSyAN5jFZ0hBOb-Zmbrv8W1E2aGqnmd8_iOM",
  authDomain: "bitcoin-minning-web.firebaseapp.com",
  projectId: "bitcoin-minning-web",
  storageBucket: "bitcoin-minning-web.firebasestorage.app",
  messagingSenderId: "691683594489",
  appId: "1:691683594489:web:96252fee18748e54ad9228"
};

// Firebase initialize
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
