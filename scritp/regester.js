import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

let profileImgUrl = "";
let myWidget = null;

const uploadBtn = document.getElementById("upload_widget");
const nativeFileInput = document.getElementById("native_file_input");
const uploadStatus = document.getElementById("upload_status");
const imgPreview = document.getElementById("img_preview");
const previewContainer = document.getElementById("image_preview_container");

// Initialize Cloudinary Widget if available
if (typeof cloudinary !== "undefined") {
  try {
    myWidget = cloudinary.createUploadWidget(
      {
        cloudName: 'dfu6dxt8o',
        uploadPreset: 'user-img',
        sources: ['local', 'url', 'camera']
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          profileImgUrl = result.info.secure_url;
          handleUploadSuccess(profileImgUrl);
        }
      }
    );
  } catch (e) {
    console.warn("Cloudinary widget setup error:", e);
  }
}

function handleUploadSuccess(url) {
  profileImgUrl = url;
  if (uploadBtn) {
    uploadBtn.innerHTML = `✅ Profile Picture Selected`;
    uploadBtn.style.backgroundColor = "#28a745";
  }
  if (uploadStatus) {
    uploadStatus.textContent = "Profile picture uploaded successfully!";
    uploadStatus.style.display = "block";
    uploadStatus.style.color = "#28a745";
  }
  if (imgPreview) imgPreview.src = url;
  if (previewContainer) previewContainer.style.display = "block";
}

if (uploadBtn) {
  uploadBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (myWidget) {
      myWidget.open();
    } else if (nativeFileInput) {
      nativeFileInput.click();
    }
  }, false);
}

if (nativeFileInput) {
  nativeFileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (uploadStatus) {
      uploadStatus.style.display = "block";
      uploadStatus.style.color = "#007bff";
      uploadStatus.textContent = "Uploading image... ⏳";
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "user-img");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dfu6dxt8o/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.secure_url) {
        handleUploadSuccess(data.secure_url);
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Direct Upload Error:", error);
      if (uploadStatus) {
        uploadStatus.style.color = "#dc3545";
        uploadStatus.textContent = "Upload failed: " + error.message;
      }
    }
  });
}

const form = document.querySelector("#form");
const fullName = document.querySelector("#fullname");
const email = document.querySelector("#inpEmail");
const password = document.querySelector("#inpPassword");
const submitBtn = form ? form.querySelector("button[type='submit']") : null;

if (form) {
  form.addEventListener("submit", async (eve) => {
    eve.preventDefault();
    const userEmail = email ? email.value.trim() : "";
    const userPass = password ? password.value : "";
    const userName = fullName ? fullName.value.trim() : "";

    if (!userEmail || !userPass) {
      if (typeof Swal !== "undefined") {
        Swal.fire("Required", "Please fill in email and password!", "warning");
      } else {
        alert("Please fill in email and password!");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPass);
      const user = userCredential.user;

      // Save user record to Firestore users collection
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        fullname: userName || userEmail.split("@")[0],
        email: userEmail,
        profile: profileImgUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        createdAt: new Date().toISOString()
      });

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Your account has been registered successfully. Please login.',
          confirmButtonColor: '#002f34'
        });
      } else {
        alert("Account created successfully!");
      }
      window.location.href = "login.html";
    } catch (error) {
      console.error("Registration Error:", error);
      if (typeof Swal !== "undefined") {
        Swal.fire("Registration Failed", error.message, "error");
      } else {
        alert("Error creating account: " + error.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Account";
      }
    }
  });
}
