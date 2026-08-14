import { onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { auth, db } from "./config.js";
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const userProfile = document.querySelector("#userProfile") || document.querySelector(".profile");
const userImg = document.querySelector("#userImg");
const loginBtn = document.querySelector("#loginBtn") || document.querySelector(".login-btn");
const loginBtnLink = document.querySelector("#loginBtnLink");
const logoutBtn = document.querySelector("#logoutBtn");
const productContainer = document.querySelector("#product-cards");
const searchInput = document.querySelector("#searchInput");

const defaultProducts = [
  {
    docid: "demo1",
    title: "iPhone 13 Pro",
    price: "235,000",
    description: "PTA approved, 256GB storage, perfect battery health — like new!",
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80",
    location: "Lahore"
  },
  {
    docid: "demo2",
    title: "Toyota Corolla",
    price: "7,235,000",
    description: "2019 model, first owner, mint condition, excellent fuel average.",
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=500&q=80",
    location: "Karachi"
  },
  {
    docid: "demo3",
    title: "Honda SP 125",
    price: "296,900",
    description: "Powered by 124cc engine, 10.7bhp power, mint condition.",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&q=80",
    location: "Karachi"
  },
  {
    docid: "demo4",
    title: "MacBook Pro M2",
    price: "284,999",
    description: "16GB RAM, 512GB SSD, Space Gray, pristine condition with box.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    location: "Islamabad"
  }
];

let currentFetchedProducts = [];

// Listen to Firebase Auth state change
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    console.log("Logged in UID:", uid);

    if (userProfile) userProfile.style.display = "flex";
    if (logoutBtn) logoutBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "none";
    if (loginBtnLink) loginBtnLink.style.display = "none";

    getUserProfile(uid);
  } else {
    console.log("Not logged in");
    if (userProfile) userProfile.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "flex";
    if (loginBtnLink) loginBtnLink.style.display = "inline-block";
  }
});

// Get user profile details from Firestore
async function getUserProfile(uid) {
  try {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((docSnap) => {
      const userData = docSnap.data();
      if (userData.profile && userImg) {
        userImg.src = userData.profile;
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
}

// Fetch all listings from Firestore real-time listener
function listenToAllListings() {
  const q = query(collection(db, "carts"));
  onSnapshot(q, (snapshot) => {
    const firestoreProducts = [];
    snapshot.forEach((docSnap) => {
      firestoreProducts.push({ ...docSnap.data(), docid: docSnap.id });
    });
    currentFetchedProducts = firestoreProducts;
    renderListings(currentFetchedProducts);
  }, (error) => {
    console.error("Error fetching listings from Firestore:", error);
    renderListings([]);
  });
}

// Render product cards in UI
function renderListings(userItems) {
  if (!productContainer) return;
  productContainer.innerHTML = "";

  const allItems = [...userItems, ...defaultProducts];

  if (allItems.length === 0) {
    productContainer.innerHTML = `<div class="no-products"><i class="fa-solid fa-box-open"></i><p>No products available yet. Click "Upload Product" to add one!</p></div>`;
    return;
  }

  allItems.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");
    const formattedPrice = typeof item.price === "number" ? item.price.toLocaleString() : item.price;
    
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80'}" alt="${item.title}" loading="lazy">
        <span class="badge">Featured</span>
      </div>
      <div class="card-content">
        <h3>${item.title || 'Untitled Item'}</h3>
        <div class="price">Rs ${formattedPrice || 'N/A'}</div>
        <p>${item.description || 'No description provided.'}</p>
        <button class="more-btn" data-id="${item.docid}">
          <i class="fa-solid fa-circle-info"></i> View Details
        </button>
      </div>
      <div class="card-footer">
        <div class="location"><i class="fa-solid fa-location-dot"></i> ${item.location || 'Pakistan'}</div>
        <i class="fa-regular fa-heart favorite" title="Save to favorites"></i>
      </div>
    `;
    productContainer.appendChild(card);
  });

  // Attach click events for product details
  const moreInfoBtns = productContainer.querySelectorAll(".more-btn");
  moreInfoBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const cartInfo = button.dataset.id;
      localStorage.setItem("cartInf", cartInfo);
      window.location.href = "info.html";
    });
  });

  // Favorite button toggle animation
  const favBtns = productContainer.querySelectorAll(".favorite");
  favBtns.forEach((fav) => {
    fav.addEventListener("click", () => {
      fav.classList.toggle("fa-regular");
      fav.classList.toggle("fa-solid");
      fav.classList.toggle("active");
    });
  });
}

// Search functionality
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const filtered = currentFetchedProducts.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm))
    );
    renderListings(filtered);
  });
}

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: 'Logout?',
        text: 'Are you sure you want to log out?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#4a5568',
        confirmButtonText: 'Yes, logout'
      }).then((result) => {
        if (result.isConfirmed) {
          signOut(auth).then(() => {
            window.location.href = "login.html";
          });
        }
      });
    } else {
      if (confirm("Are you sure you want to log out?")) {
        signOut(auth).then(() => {
          window.location.href = "login.html";
        });
      }
    }
  });
}

// Start listening to products immediately
listenToAllListings();
