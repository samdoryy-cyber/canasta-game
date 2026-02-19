const firebaseConfig = {
  apiKey: "AIzaSyDLbGUPlTR356qyfYyWIvQ3Eg-ZdWsvD2c",
  authDomain: "canasta-39b3a.firebaseapp.com",
  databaseURL: "https://canasta-39b3a-default-rtdb.firebaseio.com",
  projectId: "canasta-39b3a",
  storageBucket: "canasta-39b3a.firebasestorage.app",
  messagingSenderId: "1027811262010",
  appId: "1:1027811262010:web:a3ac28a25fbbfa0adabf03"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();