var firebaseConfig = {
    // apiKey: "AIzaSyDwxI4I-bofCFOATLhGPUUS2nFVa9KBJIU",
    authDomain: "surf-16cf2.firebaseapp.com",
    databaseURL: "https://surf-16cf2.firebaseio.com",
    projectId: "surf-16cf2",
    storageBucket: "surf-16cf2.appspot.com",
    messagingSenderId: "969093632326",
    appId: "1:969093632326:web:f31539998a7a8446d19547",
    measurementId: "G-KSEHC2L0VZ"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();

function save(board) {
    db.collection("boards").add(board)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
}