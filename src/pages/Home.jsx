import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

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

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'carts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreProducts = [];
      snapshot.forEach((docSnap) => {
        firestoreProducts.push({ ...docSnap.data(), docid: docSnap.id });
      });
      setProducts(firestoreProducts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching Firestore products:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const allItems = [...products, ...defaultProducts];
  const filteredProducts = allItems.filter(item => 
    (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase().trim()))
  );

  return (
    <div className="page-wrapper">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <header className="sub-banner">
        <h1>Find Anything You Need in Pakistan</h1>
        <p>Buy and sell cars, electronics, smartphones, and accessories directly via Firebase in React</p>
      </header>

      <main className="main-wrapper">
        <h2 className="section-title">
          <i className="fa-solid fa-fire" style={{ color: '#e63946' }}></i> Fresh Recommendations
        </h2>

        {loading ? (
          <div className="loading-spinner">
            Loading listings...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products match your search. Try another keyword!</p>
          </div>
        ) : (
          <div className="product-container">
            {filteredProducts.map((item) => (
              <ProductCard key={item.docid} item={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
