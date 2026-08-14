import { db, auth } from "./config.js";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const itemID = localStorage.getItem("cartInf");
if (!itemID) {
  alert("No product selected!");
  window.location.href = "index.html";
}

const imgEl = document.querySelector(".image-container img");
const titleEl = document.querySelector(".title");
const priceEl = document.querySelector(".price");
const oldPriceEl = document.querySelector(".old-price");
const descEl = document.querySelector(".description");
const editBtn = document.querySelector(".edit");
const deleteBtn = document.querySelector(".delete");
const ownerActions = document.querySelector(".edit-delete");

async function loadProduct(currentUserUid) {
  try {
    const docRef = doc(db, "carts", itemID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      if (typeof Swal !== "undefined") {
        await Swal.fire("Not Found", "Product not found or removed.", "error");
      } else {
        alert("Product not found!");
      }
      window.location.href = "index.html";
      return;
    }

    const data = docSnap.data();

    if (imgEl) imgEl.src = data.imageUrl || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80";
    if (titleEl) titleEl.textContent = data.title || "Untitled Product";
    if (priceEl) priceEl.textContent = `Rs ${typeof data.price === 'number' ? data.price.toLocaleString() : data.price}`;
    if (oldPriceEl) oldPriceEl.textContent = data.oldPrice ? `Rs ${data.oldPrice}` : "";
    if (descEl) descEl.textContent = data.description || "No description available.";

    // Show edit/delete only if current user owns this listing
    if (data.uid === currentUserUid) {
      if (ownerActions) ownerActions.style.display = "flex";
      if (editBtn) editBtn.style.display = "inline-flex";
      if (deleteBtn) deleteBtn.style.display = "inline-flex";
    } else {
      if (ownerActions) ownerActions.style.display = "none";
      if (editBtn) editBtn.style.display = "none";
      if (deleteBtn) deleteBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading product details:", error);
  }
}

// Edit product details
if (editBtn) {
  editBtn.addEventListener("click", async () => {
    const currentTitle = titleEl ? titleEl.textContent : "";
    const currentDesc = descEl ? descEl.textContent : "";
    const currentPriceText = priceEl ? priceEl.textContent.replace("Rs ", "").replace(/,/g, "") : "0";

    if (typeof Swal !== "undefined") {
      const { value: formValues } = await Swal.fire({
        title: 'Edit Product Details',
        html:
          `<label style="text-align:left;display:block;margin:5px 0;font-weight:600;">Title</label>` +
          `<input id="swal-title" class="swal2-input" value="${currentTitle}" placeholder="Title">` +
          `<label style="text-align:left;display:block;margin:5px 0;font-weight:600;">Price (Rs)</label>` +
          `<input id="swal-price" type="number" class="swal2-input" value="${currentPriceText}" placeholder="Price">` +
          `<label style="text-align:left;display:block;margin:5px 0;font-weight:600;">Description</label>` +
          `<textarea id="swal-desc" class="swal2-textarea" style="width:80%;" placeholder="Description">${currentDesc}</textarea>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        preConfirm: () => {
          return {
            title: document.getElementById('swal-title').value,
            price: document.getElementById('swal-price').value,
            description: document.getElementById('swal-desc').value
          }
        }
      });

      if (formValues) {
        if (!formValues.title || !formValues.price || !formValues.description) {
          Swal.fire("Warning", "Title, Price, and Description are required!", "warning");
          return;
        }

        try {
          const docRef = doc(db, "carts", itemID);
          await updateDoc(docRef, {
            title: formValues.title.trim(),
            price: Number(formValues.price),
            description: formValues.description.trim()
          });
          await Swal.fire("Updated!", "Product updated successfully.", "success");
          loadProduct(auth.currentUser ? auth.currentUser.uid : null);
        } catch (err) {
          console.error("Error updating product:", err);
          Swal.fire("Error", "Failed to update product: " + err.message, "error");
        }
      }
    } else {
      const newTitle = prompt("Enter new title:", currentTitle);
      const newDesc = prompt("Enter new description:", currentDesc);
      const newPrice = prompt("Enter new price:", currentPriceText);

      if (!newTitle || !newDesc || !newPrice) return;

      try {
        const docRef = doc(db, "carts", itemID);
        await updateDoc(docRef, {
          title: newTitle.trim(),
          description: newDesc.trim(),
          price: Number(newPrice)
        });
        alert("Product updated!");
        loadProduct(auth.currentUser ? auth.currentUser.uid : null);
      } catch (err) {
        alert("Failed to update product: " + err.message);
      }
    }
  });
}

// Delete product
if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    if (typeof Swal !== "undefined") {
      const result = await Swal.fire({
        title: 'Delete Product?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#4a5568',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        try {
          const docRef = doc(db, "carts", itemID);
          await deleteDoc(docRef);
          await Swal.fire("Deleted!", "Your product has been deleted.", "success");
          window.location.href = "index.html";
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire("Error", "Failed to delete product: " + error.message, "error");
        }
      }
    } else {
      if (confirm("Are you sure you want to delete this product?")) {
        try {
          const docRef = doc(db, "carts", itemID);
          await deleteDoc(docRef);
          alert("Product deleted!");
          window.location.href = "index.html";
        } catch (error) {
          alert("Failed to delete product: " + error.message);
        }
      }
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadProduct(user.uid);
  } else {
    loadProduct(null);
  }
});
