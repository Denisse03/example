import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

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
const db = getFirestore(app);

const deeplApiUrl = "https://api-free.deepl.com/v2/translate";
const deeplApiKey = "567bd260-1f62-40fd-b70b-a6ce5cf54034:fx";

onAuthStateChanged(auth, (user) => {
  if (user != null) {
    console.log("user", user);
  } else {
    console.log("No user");
  }
});

async function translatePage(targetLang) {
  const indexs = $(".translate");
  for (let index of indexs) {
    const originalText = $(index).text().trim();
    if (originalText) {
      const translatedText = await translateText(originalText, targetLang);
      $(index).text(translatedText);
    }
  }
  initListeners();
}

async function translateText(text, targetLang) {
  const response = await fetch(deeplApiUrl, {
    method: "POST",
    body: new URLSearchParams({
      auth_key: deeplApiKey,
      text: text,
      target_lang: targetLang,
    }),
  });

  const data = await response.json();
  return data.translations[0].text;
}

function initListeners() {
  $("#languages").on("change", function () {
    const selectedLang = $(this).val();
    localStorage.setItem("selectedLang", selectedLang);
    translatePage(selectedLang);
  });
  $("#addDiary").on("click", (e) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to post content.");
      return;
    }
    console.log("addDiary");
    let diaryName = $("#diaryName").val();
    let diaryDate = $("#diaryDate").val();
    let diaryImage = $("#diaryImage").val();

    console.log(diaryName, diaryDate, diaryImage);
    let diaryObj = {
      diaryName: diaryName,
      diaryDate: diaryDate,
      diaryImage: diaryImage,
    };
    addDiaryToDB(diaryObj);
  });

  $("#signInBtn").on("click", (e) => {
    let email = $("#sEmail").val();
    let pw = $("#sPassword").val();

    signInWithEmailAndPassword(auth, email, pw)
      .then((userCredential) => {
        alert("sign in");
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

    console.log(
      `first Name: ${fn}, ln: ${ln}, email: ${email}, pw: ${pw} image ${imgURL}`
    );

    createUserWithEmailAndPassword(auth, email, pw)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        updateProfile(auth.currentUser, {
          displayName: `${fn} ${ln}`,
          photoURL: imgURL,
        })
          .then(() => {
            alert("Account was created");
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

export async function addDiaryToDB(diaryObj) {
  try {
    const docRef = await addDoc(collection(db, "diarys"), diaryObj);
    console.log("document written id:", docRef.id);
  } catch (error) {
    console.error("error");
  }
}

onSnapshot(collection(db, "diarys"), (snapshot) => {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to view content.");
    return;
  }

  $(".showPosts").empty();
  let diarystring = "";
  snapshot.forEach((doc) => {
    const docId = doc.id;
    diarystring += `<div class="diary" id="post-${docId}">`;
    diarystring += `<h3>${doc.data().diaryName}</h3>`;
    diarystring += `<p class="diaryDate">${doc.data().diaryDate}</p>`;
    diarystring += `<div class="diaryImg"><img src="${
      doc.data().diaryImage
    }"/></div>`;

    diarystring += `<button class="deleteBtn" data-id="${docId}">Delete</button>`;

    diarystring += `</div>`;
  });
  $(".showPosts").append(diarystring);

  $(".deleteBtn").on("click", async function () {
    const docId = $(this).data("id");
    try {
      await deleteDoc(doc(db, "diarys", docId));
      console.log(`Post with ID: ${docId} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting document: ", error.message);
    }
  });
});

export async function showAllDiarys() {
  try {
    const querySnapshot = await getDocs(collection(db, "diarys"));
    let diaryString = "";
    querySnapshot.forEach((doc) => {
      diaryString += `<div class ="diary">`;
      diaryString += `<h3>${doc.data().diaryName}</h3>`;
      diaryString += `<h3>${doc.data().diaryDate}</h3>`;
      diaryString += `<div class ="diaryImg"><img src="${
        doc.data().diaryImage
      }"/></div>`;

      diaryString += `</div>`;
    });
    $(".showPosts").empty();
    $(".showPosts").append(diaryString);
  } catch (e) {
    console.error("Error getting documents: ", e.message);
  }
}

// Document ready function
$(document).ready(function () {
  initListeners();
});
