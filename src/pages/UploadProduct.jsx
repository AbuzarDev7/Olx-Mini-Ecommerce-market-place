import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function UploadProduct() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Lahore');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to upload products.',
        icon: 'info'
      }).then(() => {
        navigate('/login');
      });
    }
  }, [currentUser, navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'user-img');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dfu6dxt8o/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        Swal.fire('Success', 'Product image uploaded!', 'success');
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      Swal.fire('Upload Failed', err.message, 'error');
    } finally {
      setUploadingImg(false);
    }
  };

  const openCloudinaryWidget = () => {
    if (typeof window.cloudinary !== 'undefined') {
      try {
        const widget = window.cloudinary.createUploadWidget(
          {
            cloudName: 'dfu6dxt8o',
            uploadPreset: 'user-img',
            sources: ['local', 'url', 'camera']
          },
          (error, result) => {
            if (!error && result && result.event === 'success') {
              setImageUrl(result.info.secure_url);
            }
          }
        );
        widget.open();
        return;
      } catch (err) {
        console.warn('Widget fallback:', err);
      }
    }
    document.getElementById('native_product_file').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      Swal.fire('Error', 'User not logged in!', 'error');
      navigate('/login');
      return;
    }
    if (!imageUrl) {
      Swal.fire('Image Required', 'Please upload a product image first!', 'warning');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'carts'), {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        location: location.trim() || 'Pakistan',
        imageUrl: imageUrl,
        time: Timestamp.fromDate(new Date()),
        uid: currentUser.uid
      });

      await Swal.fire({
        title: 'Success!',
        text: 'Product created successfully!',
        icon: 'success'
      });
      navigate('/');
    } catch (error) {
      console.error('Error publishing product:', error);
      Swal.fire('Publish Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page-body">
      <main className="main-content">
        <div className="upload-container">
          <h2><i className="fa-solid fa-cloud-arrow-up" style={{ color: '#002f34' }}></i> Post New Product</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="title">Product Title</label>
              <input
                type="text"
                id="title"
                placeholder="e.g., iPhone 13 Pro Max or Honda Civic 2021"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Describe the item condition, specs, reason for selling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="input-group">
              <label htmlFor="price">Price (Rs)</label>
              <input
                type="number"
                id="price"
                placeholder="Enter price in Rs"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="location">Location / City</label>
              <input
                type="text"
                id="location"
                placeholder="e.g. Lahore, Karachi, Islamabad"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Product Image</label>
              <button type="button" onClick={openCloudinaryWidget} className="cloudinary-button">
                {uploadingImg ? (
                  <>Uploading Image...</>
                ) : imageUrl ? (
                  <> Image Uploaded</>
                ) : (
                  <>Select & Upload Image</>
                )}
              </button>
              <input
                type="file"
                id="native_product_file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />

              {imageUrl && (
                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <img
                    src={imageUrl}
                    alt="Product Preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: '12px',
                      border: '3px solid #002f34',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? <>Publishing...</> : 'Publish Listing'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
