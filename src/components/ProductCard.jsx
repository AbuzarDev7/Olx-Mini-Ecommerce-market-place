import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ item }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const formattedPrice = typeof item.price === 'number' ? item.price.toLocaleString() : item.price;

  const handleCardClick = () => {
    localStorage.setItem('cartInf', item.docid);
    navigate(`/product/${item.docid}`);
  };

  return (
    <div className="card">
      <div className="card-img-wrapper">
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80'}
          alt={item.title || 'Product Image'}
          loading="lazy"
        />
        <span className="badge">Featured</span>
      </div>
      <div className="card-content">
        <h3>{item.title || 'Untitled Item'}</h3>
        <div className="price">Rs {formattedPrice || 'N/A'}</div>
        <p>{item.description || 'No description provided.'}</p>
        <button className="more-btn" onClick={handleCardClick}>
          <i className="fa-solid fa-circle-info"></i> View Details
        </button>
      </div>
      <div className="card-footer">
        <div className="location">
          <i className="fa-solid fa-location-dot"></i> {item.location || 'Pakistan'}
        </div>
        <i
          className={`favorite ${isFavorite ? 'fa-solid fa-heart active' : 'fa-regular fa-heart'}`}
          onClick={() => setIsFavorite(!isFavorite)}
          title="Save to favorites"
        ></i>
      </div>
    </div>
  );
}
