import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Package, Truck, Shield, Leaf, Clock, DollarSign } from "lucide-react";
import FarmerNavbar from "../components/farmer/FarmerNavbar";
import { toast } from "react-toastify";

const BASE_API = import.meta.env.VITE_BASE_API_URL
const BASE_URL = `${BASE_API}/addProductByFarmer`

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("cropconnect_token");
        const res = await fetch(`${BASE_URL}/get-productByFarmer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const found = (data.getAllProduct || data.data || data).find((p) => p._id === id);
        if (!found) throw new Error("Product not found");
        setProduct(found);
        // console.log(found)
        toast.success("Product loaded successfully.")
      } catch (err) {
        setError(err.message);
        toast.error(`Error: ${err.message}`)
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="mt-4">
        <FarmerNavbar />
        <div className="min-h-[60vh] bg-gray-50 py-6 px-2 sm:px-4 animate-pulse">
          <div className="max-w-2xl mx-auto">
            {/* Back button skeleton */}
            <div className="mb-4">
              <div className="h-8 w-40 bg-gray-200 rounded" />
            </div>

            <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-20 bg-gray-200 rounded-full" />
                </div>
              </div>

              {/* Grid: Image + Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Gallery */}
                <div>
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-12 h-12 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-5 w-24 bg-gray-100 rounded" />
                    <div className="h-5 w-32 bg-gray-100 rounded" />
                    <div className="h-5 w-28 bg-gray-100 rounded" />
                    <div className="h-5 w-36 bg-gray-100 rounded" />
                  </div>

                  {/* Cert block skeleton */}
                  <div className="bg-blue-50 p-2 rounded space-y-2">
                    <div className="h-3 w-20 bg-blue-100 rounded" />
                    <div className="h-3 w-3/4 bg-blue-100 rounded" />
                    <div className="h-3 w-1/2 bg-blue-100 rounded" />
                  </div>

                  {/* Location block skeleton */}
                  <div className="bg-green-50 p-2 rounded space-y-2">
                    <div className="h-3 w-24 bg-green-100 rounded" />
                    <div className="h-3 w-3/4 bg-green-100 rounded" />
                    <div className="h-3 w-1/2 bg-green-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="mt-4">
        <FarmerNavbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center bg-white p-6 rounded-lg shadow">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-1">Error</h2>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-4">
        <FarmerNavbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center bg-white p-6 rounded-lg shadow">
            <div className="text-gray-400 text-4xl mb-2">📦</div>
            <h2 className="text-xl font-bold text-gray-600 mb-1">No Product Found</h2>
            <p className="text-gray-500 text-sm">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "sold":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  // console.log(product.certificationDetails.authority)
  return (

    <div className="mt-4">
      <FarmerNavbar />
      <div className="min-h-[60vh] bg-gray-50 py-6 px-2 sm:px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <Link
              to="/dashboard/farmer"
              className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors duration-200 bg-white px-3 py-1.5 rounded shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            {/* Product Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-green-900 mb-1">{product.name}</h1>
                <p className="text-green-700 text-sm">{product.variety}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
                {product.isOrganic && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium border border-green-200 flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Organic
                  </span>
                )}
                {product.isCertified && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Certified
                  </span>
                )}
              </div>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div>
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={product.images?.[selectedImage] || product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images?.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-12 h-12 rounded border-2 transition-all duration-200 ${selectedImage === idx
                          ? "border-green-500 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt="product thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-gray-800">₹{product.pricePerUnit} / {product.unit}</span>
                  <span className="text-xs text-gray-500">({product.quantityAvailable} {product.unit} available)</span>
                </div>
                <div className="text-gray-700 text-sm mb-2">{product.description}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Package className="w-3 h-3" />{product.category}</span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Calendar className="w-3 h-3" />Harvest: {new Date(product.harvestDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Clock className="w-3 h-3" />Expiry: {new Date(product.expiryDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"><Truck className="w-3 h-3" />{product.deliveryAvailable ? `Delivery (${product.deliveryRadiusKm}km)` : "No Delivery"}</span>
                </div>
                {product.certificationDetails && (
                  <div className="bg-blue-50 p-2 rounded mt-2 text-xs">
                    <div className="font-semibold mb-1 flex items-center gap-1"><Shield className="w-3 h-3" />Certification</div>
                    <div>Authority: {product.certificationDetails?.authority || 'N/A'}</div>
                    <div>Cert #: {product.certificationDetails.certificateNumber}</div>
                    <div>Certified On: {new Date(product.certificationDetails.certifiedOn).toLocaleDateString() || 'Not mentioned'}</div>
                  </div>
                )}
                <div className="bg-green-50 p-2 rounded mt-2 text-xs">
                  <div className="font-semibold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Location</div>
                  <div>{product.location?.city}, {product.location?.state} - {product.location?.pin}</div>
                  {product.location?.coordinates?.coordinates && (
                    <div className="text-gray-500 text-xs">Coordinates: {product.location.coordinates.coordinates.join(", ")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;


