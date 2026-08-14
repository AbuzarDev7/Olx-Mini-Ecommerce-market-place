import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";

let uploadImgUrl = "";
let userUID = "";
let myWidget = null;

const form = document.querySelector("#form");
const description = document.querySelector("#description");
const title = document.querySelector("#title");
const price = document.querySelector("#price");
const locationInput = document.querySelector("#location");
const uploadBtn = document.getElementById("upload_widget");
const nativeFileInput = document.getElementById("native_file_input");
const uploadStatus = document.getElementById("upload_status");
const imgPreview = document.getElementById("img_preview");
const previewContainer = document.getElementById("image_preview_container");
const submitBtn = form ? form.querySelector("button[type='submit']") : null;

// Auth Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    userUID = user.uid;
    console.log("Upload Page: Logged in user UID =>", userUID);
  } else {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Login Required",
        text: "Please log in to upload products.",
        icon: "info"
      }).then(() => {
        window.location.href = "login.html";
      });
    } else {
      alert("Please log in to upload products.");
      window.location.href = "login.html";
    }
  }
});

// Initialize Cloudinary Widget if script loaded
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
          handleUploadSuccess(result.info.secure_url);
        }
      }
    );
  } catch (err) {
    console.warn("Cloudinary widget setup fallback:", err);
  }
}

function handleUploadSuccess(url) {
  uploadImgUrl = url;
  if (uploadBtn) {
    uploadBtn.innerHTML = `✅ Image Selected`;
    uploadBtn.style.backgroundColor = "#28a745";
  }
  if (uploadStatus) {
    uploadStatus.style.color = "#28a745";
    uploadStatus.textContent = "Image uploaded successfully!";
    uploadStatus.style.display = "block";
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
      uploadStatus.textContent = "Uploading image to Cloudinary... ⏳";
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
      alert("Failed to upload image: " + error.message);
    }
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!userUID) {
      alert("User not logged in!");
      window.location.href = "login.html";
      return;
    }
    if (!uploadImgUrl) {
      if (typeof Swal !== "undefined") {
        Swal.fire("Image Required", "Please upload a product image first!", "warning");
      } else {
        alert("Please upload a product image first!");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Product...`;
    }

    const productData = {
      title: title.value.trim(),
      description: description.value.trim(),
      price: Number(price.value),
      imageUrl: uploadImgUrl,
      location: locationInput ? locationInput.value.trim() : "Pakistan",
      time: Timestamp.fromDate(new Date()),
      uid: userUID
    };

    try {
      await addDoc(collection(db, "carts"), productData);
      if (typeof Swal !== "undefined") {
        await Swal.fire({
          title: "Success!",
          text: "Product created successfully!",
          icon: "success"
        });
      } else {
        alert("Product uploaded successfully!");
      }
      window.location.href = "index.html"; 
    } catch (error) {
      console.error("Error adding document:", error);
      if (typeof Swal !== "undefined") {
        Swal.fire("Upload Error", error.message, "error");
      } else {
        alert("Failed to upload product: " + error.message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Listing";
      }
    }
  });
}
