import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHpVb4JbsveioJV-eb7a3bNKr7VyKhuI4",
  authDomain: "dhd-44be0.firebaseapp.com",
  projectId: "dhd-44be0",
  storageBucket: "dhd-44be0.appspot.com",
  messagingSenderId: "124606557096",
  appId: "1:124606557096:web:56247ad8b9bedb8efd8b9d",
  measurementId: "G-P3442BLFSM",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user != null) {
    console.log("user", user);
  } else {
    console.log("No user");
  }
});

// Initialize event listeners
function initListeners() {
  $("#signInBtn").on("click", (e) => {
    let email = $("#sEmail").val();
    let pw = $("#sPassword").val();

    signInWithEmailAndPassword(auth, email, pw)
      .then((userCredential) => {
        console.log("signed in");
      })
      .catch((error) => {
        console.log("error", error.message);
      });
  });

  $("#show").on("click", (e) => {
    let user = auth.currentUser;
    if (user) {
      $(".profile .displayName").html(user.displayName);
      $(".profile .profileImage").html(`<img src="${user.photoURL}"/>`);
    } else {
      alert("No User is signed in. ");
    }
  });

  $("#signout").on("click", (e) => {
    signOut(auth)
      .then(() => {
        console.log("signed out");
        $(".profile .displayName").html("");
        $(".profile .profileImage").html("");
      })
      .catch((error) => {
        console.log("error", error.message);
      });
  });

  $("#submit").on("click", (e) => {
    console.log("submit");
    let fn = $("#fName").val();
    let ln = $("#lName").val();
    let imgURL = $("#imageURL").val();
    let email = $("#email").val();
    let pw = $("#password").val();

    console.log(`fn: ${fn}, ln: ${ln}, email: ${email}, pw: ${pw}`);

    createUserWithEmailAndPassword(auth, email, pw)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        updateProfile(auth.currentUser, {
          displayName: `${fn} ${ln}`,
          photoURL: imgURL,
        })
          .then(() => {
            console.log("user full name:" + user.displayName);
          })
          .catch((error) => {
            console.log("error", error.message);
          });
        console.log("create", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("error" + errorMessage);
      });
  });
}

// Document ready function
$(document).ready(function () {
  initListeners();
});
