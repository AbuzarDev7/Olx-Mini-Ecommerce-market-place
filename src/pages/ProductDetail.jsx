import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { defaultProducts } from './Home';
import Swal from 'sweetalert2';

export default function ProductDetail() {
  const { id } = useParams();
  const itemId = id || localStorage.getItem('cartInf');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!itemId) {
      Swal.fire('No Item Selected', 'Please select a product first.', 'info');
      navigate('/');
      return;
    }

    const fetchProduct = async () => {
      // First check if it's a default demo product
      const demoMatch = defaultProducts.find(p => p.docid === itemId);
      if (demoMatch) {
        setProduct(demoMatch);
        setLoading(false);
        return;
      }

      // Otherwise fetch from Firestore
      try {
        const docRef = doc(db, 'carts', itemId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ ...docSnap.data(), docid: docSnap.id });
        } else {
          Swal.fire('Not Found', 'Product not found or removed.', 'error');
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        Swal.fire('Error', 'Could not load product details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [itemId, navigate]);

  const handleEdit = async () => {
    if (!product) return;

    if (product.docid?.startsWith('demo')) {
      Swal.fire('Demo Item', 'Demo items cannot be edited on live Firestore.', 'info');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Edit Product Details',
      html:
        `<label style="text-align:left;display:block;margin:5px 0;font-weight:600;">Title</label>` +
        `<input id="swal-title" class="swal2-input" value="${product.title || ''}" placeholder="Title">` +
        `<label style="text-align:left;display:block;margin:5px 0;font-weight:600;">Price (Rs)</label>` +
        `<input id="swal-price" type="number" class="swal2-input" value="${product.price || ''}" placeholder="Price">` +
        `<label style="text-align:left;display:block;margin:5px 0;font-weight:600;">Description</label>` +
        `<textarea id="swal-desc" class="swal2-textarea" style="width:80%;" placeholder="Description">${product.description || ''}</textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      preConfirm: () => {
        return {
          title: document.getElementById('swal-title').value,
          price: document.getElementById('swal-price').value,
          description: document.getElementById('swal-desc').value
        };
      }
    });

    if (formValues) {
      if (!formValues.title || !formValues.price || !formValues.description) {
        Swal.fire('Warning', 'Title, Price, and Description are required!', 'warning');
        return;
      }

      try {
        const docRef = doc(db, 'carts', product.docid);
        await updateDoc(docRef, {
          title: formValues.title.trim(),
          price: Number(formValues.price),
          description: formValues.description.trim()
        });
        await Swal.fire('Updated!', 'Product details updated successfully.', 'success');
        setProduct(prev => ({
          ...prev,
          title: formValues.title.trim(),
          price: Number(formValues.price),
          description: formValues.description.trim()
        }));
      } catch (err) {
        console.error('Error updating product:', err);
        Swal.fire('Error', 'Failed to update product: ' + err.message, 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    if (product.docid?.startsWith('demo')) {
      Swal.fire('Demo Item', 'Demo items cannot be deleted.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Product?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#002f34',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const docRef = doc(db, 'carts', product.docid);
        await deleteDoc(docRef);
        await Swal.fire('Deleted!', 'Product has been deleted.', 'success');
        navigate('/');
      } catch (err) {
        console.error('Error deleting product:', err);
        Swal.fire('Error', 'Failed to delete product: ' + err.message, 'error');
      }
    }
  };

  const isOwner = currentUser && product && currentUser.uid === product.uid;
  const formattedPrice = product && typeof product.price === 'number' ? product.price.toLocaleString() : product?.price;

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '40px' }}>
        {loading ? (
          <div className="loading-spinner">
            Loading product details...
          </div>
        ) : !product ? null : (
          <div className="detail-card">
            <div className="image-container">
              <span className="badge">Verified Listing</span>
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80'}
                alt={product.title}
              />
            </div>

            <div className="content">
              <h1 className="title">{product.title || 'Untitled Product'}</h1>

              <div className="price-section">
                <span className="price">Rs {formattedPrice || 'N/A'}</span>
              </div>

              <p className="description">{product.description || 'No description available.'}</p>

              <div className="actions">
                <button
                  className="more-btn"
                  style={{ padding: '12px', fontSize: '15px' }}
                  onClick={() => Swal.fire('Contact Seller', `Item ID: ${product.docid}\nCity: ${product.location || 'Pakistan'}`, 'info')}
                >
                  <i className="fa-solid fa-phone"></i> Contact Seller
                </button>
              </div>

              {isOwner && (
                <div className="edit-delete" style={{ marginTop: '16px' }}>
                  <button className="edit" onClick={handleEdit}>
                    Edit Listing
                  </button>
                  <button className="delete" onClick={handleDelete}>
                    Delete Listing
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
