import React, { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Truck,
  Shield,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import BuyerNav from "../buyer/BuyerNav";
import { toast } from "react-toastify";

const BASE_API = import.meta.env.VITE_BASE_API_URL;
const API = `${BASE_API}/orderProduct/getProductFromCart`;

const DELIVERY_CHARGE = 49;
const Cart = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("cropconnect_token");
        const res = await fetch(API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch cart");

        const productQuantities = new Map();
        for (const item of data.cart.products) {
          const id = item.productId;
          productQuantities.set(id, (productQuantities.get(id) || 0) + 1);
        }

        const enrichedProducts = data.product.map((p) => ({
          ...p,
          quantity: productQuantities.get(p._id) || 1,
        }));

        setProducts(enrichedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);



  // ✅ Updated to call DELETE API
  const removeFromCart = async (productId) => {
    const token = localStorage.getItem("cropconnect_token");
    try {  // http://localhost:3000/orderProduct/cancelOrder/68389719319856b3ace69b86
      const res = await fetch(`${BASE_API}/orderProduct/cancelOrder/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove product from cart");
      }
      setProducts(products.filter((product) => product._id !== productId));
      toast.success("Removed from cart.")
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const calculateSubtotal = () => {
    return products.reduce(
      (total, product) => total + product.pricePerUnit * (product.quantityAvailable || 1),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 0 ? subtotal + DELIVERY_CHARGE : 0;
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    setTimeout(() => {
      setProcessingPayment(false);
      alert("Hey! Payment integration isn’t live just yet. Sorry for the inconvenience, and thanks for bearing with us!");
    }, 1000);
  };

  const goToDashboard = () => {
    navigate("/products/browse");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center mt-4">
          <BuyerNav />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            </div>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm animate-pulse">
              Loading items...
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="bg-white shadow rounded p-6 animate-pulse">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 bg-gray-200 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                      <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="xl:col-span-1 bg-white shadow rounded p-6 space-y-4 animate-pulse sticky top-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <hr />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
              <div className="h-10 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-center mt-4">
        <BuyerNav />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center bg-white p-8 shadow rounded">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some fresh produce to get started!</p>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              onClick={() => navigate("/products/browse")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white shadow rounded p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <ShoppingCart className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                          {product.variety && (
                            <p className="text-sm text-gray-600">Variety: {product.variety}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {product.location?.city}, {product.location?.state}
                        </div>
                        {product.isCertified && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                            <Shield className="h-3 w-3 mr-1" /> Certified Organic
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            ₹{product.pricePerUnit} / {product.unit}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity :{product.quantityAvailable} {product.unit}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            Amount: ₹
                            {(product.pricePerUnit * (product.quantityAvailable || 1)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="xl:col-span-1 space-y-4 bg-white shadow rounded p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({products.length} items)</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Delivery Charges
                </div>
                <span>₹{DELIVERY_CHARGE.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-green-600">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={handlePayment}
                disabled={processingPayment || products.length === 0}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                {processingPayment ? "Processing..." : `Pay ₹${calculateTotal().toFixed(2)}`}
              </button>
              <button
                className="w-full border py-2 rounded"
                onClick={goToDashboard}
              >
                Continue Shopping
              </button>
              <div className="text-xs text-gray-500 pt-4 space-y-1">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure checkout with SSL encryption
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Fixed delivery charges ₹49
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

