import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, provider, db } from "./config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.querySelector("#form");
const email = document.querySelector("#inpEmail");
const password = document.querySelector("#inpPassword");
const submitBtn = document.querySelector(".btn-login");

if (form) {
  form.addEventListener("submit", async (eve) => {
    eve.preventDefault();
    if (!email.value || !password.value) {
      if (typeof Swal !== "undefined") {
        Swal.fire("Required", "Please enter both email and password.", "warning");
      } else {
        alert("Please enter both email and password.");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in...`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
      console.log("Logged in user:", userCredential.user);
      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'Logged in successfully!',
          timer: 1500,
          showConfirmButton: false
        });
      }
      window.location.href = "index.html";
    } catch (error) {
      console.error("Login Error:", error.message);
      let errorMsg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMsg = "Invalid email or password. Please check your credentials.";
      }
      if (typeof Swal !== "undefined") {
        Swal.fire("Login Failed", errorMsg, "error");
      } else {
        alert("Login failed: " + errorMsg);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
      }
    }
  });
}

const googleBtn = document.querySelector(".social-btn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google User =>", user);

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        fullname: user.displayName || "Google User",
        email: user.email,
        profile: user.photoURL || "",
        provider: "google",
      }, { merge: true });

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: 'success',
          title: 'Google Sign-In Successful',
          text: `Welcome ${user.displayName || ''}!`,
          timer: 1500,
          showConfirmButton: false
        });
      }
      window.location.href = "index.html";
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
      if (typeof Swal !== "undefined") {
        Swal.fire("Sign-In Failed", error.message, "error");
      } else {
        alert("Google Sign-in failed: " + error.message);
      }
    }
  });
}
