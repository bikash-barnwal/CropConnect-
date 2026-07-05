import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Truck, Package, MapPin, Phone, Mail, User, Calendar, AlertCircle, Eye, Plus, Minus } from "lucide-react";
import FarmerNavbar from "../farmer/FarmerNavbar";

const BASE_API = import.meta.env.VITE_BASE_API_URL;
const BASE_URL = `${BASE_API}/addProductByFarmer/requestToBuyProducts`;

const OrderReceived = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [productStatuses, setProductStatuses] = useState({});
    const [productQuantities, setProductQuantities] = useState({});
    const [deliveryDates, setDeliveryDates] = useState({});

    // Product-level statuses
    const productStatusOptions = [
        { id: "pending", label: "Pending Review", color: "yellow", description: "Reviewing request" },
        { id: "available_now", label: "Available Now", color: "green", description: "Can deliver immediately" },
        { id: "available_later", label: "Available Later", color: "blue", description: "Can deliver on future date" },
        { id: "partial_available", label: "Partially Available", color: "orange", description: "Some quantity available" },
        { id: "negotiating", label: "Negotiating", color: "purple", description: "Discussing terms" },
        { id: "confirmed", label: "Confirmed", color: "emerald", description: "Order confirmed" },
        { id: "unavailable", label: "Not Available", color: "red", description: "Cannot fulfill" }
    ];

    // Request-level statuses for filtering
    const requestStatuses = [
        { id: "all", label: "All Requests", count: 0 },
        { id: "new", label: "New", count: 0 },
        { id: "in_progress", label: "In Progress", count: 0 },
        { id: "confirmed", label: "Confirmed", count: 0 },
        { id: "completed", label: "Completed", count: 0 }
    ];

    const getProductStatus = (requestId, productId) => {
        return productStatuses[`${requestId}_${productId}`] || "pending";
    };

    const getProductQuantity = (requestId, productId, defaultQty = 1) => {
        return productQuantities[`${requestId}_${productId}`] || defaultQty;
    };

    const getDeliveryDate = (requestId, productId) => {
        return deliveryDates[`${requestId}_${productId}`] || "";
    };

    const updateProductStatus = (requestId, productId, newStatus) => {
        setProductStatuses(prev => ({
            ...prev,
            [`${requestId}_${productId}`]: newStatus
        }));
    };

    const updateProductQuantity = (requestId, productId, quantity) => {
        setProductQuantities(prev => ({
            ...prev,
            [`${requestId}_${productId}`]: Math.max(0, quantity)
        }));
    };

    const updateDeliveryDate = (requestId, productId, date) => {
        setDeliveryDates(prev => ({
            ...prev,
            [`${requestId}_${productId}`]: date
        }));
    };

    const getProductStatusBadge = (status) => {
        const statusConfig = productStatusOptions.find(s => s.id === status) || productStatusOptions[0];
        const colorClasses = {
            yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
            green: "bg-green-100 text-green-800 border-green-200",
            blue: "bg-blue-100 text-blue-800 border-blue-200",
            orange: "bg-orange-100 text-orange-800 border-orange-200",
            purple: "bg-purple-100 text-purple-800 border-purple-200",
            emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
            red: "bg-red-100 text-red-800 border-red-200"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[statusConfig.color]}`}>
                {statusConfig.label}
            </span>
        );
    };

    const getRequestOverallStatus = (request) => {
        if (!request.products || request.products.length === 0) return "new";

        const productStatuses = request.products.map(p =>
            getProductStatus(request._id, p.productId)
        );

        if (productStatuses.every(s => s === "pending")) return "new";
        if (productStatuses.some(s => s === "confirmed")) return "confirmed";
        if (productStatuses.some(s => s !== "pending" && s !== "unavailable")) return "in_progress";
        return "new";
    };

    const createOrderForProduct = async (requestId, productId, _quantity, _deliveryDate) => {
        try {
            // API call to create individual product order
            // console.log("Creating order:", { requestId, productId, quantity, deliveryDate });
            // Update status to confirmed
            updateProductStatus(requestId, productId, "confirmed");
        } catch (err) {
            console.error("Failed to create order:", err);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(BASE_URL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("cropconnect_token")}`,
                    },
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Failed to fetch requests: ${res.status} ${errText}`);
                }

                const result = await res.json();
                // console.log(result);

                // Initialize product quantities with available quantities
                const initialQuantities = {};
                result.checkProductIds?.forEach(request => {
                    request.products.forEach(productRequest => {
                        const product = result.checkProducts.find(p => p._id === productRequest.productId);
                        if (product) {
                            initialQuantities[`${request._id}_${product._id}`] = Math.min(
                                product.quantityAvailable,
                                product.quantityAvailable // Default to available quantity
                            );
                        }
                    });
                });
                setProductQuantities(initialQuantities);

                setData(result);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredRequests = data?.checkProductIds?.filter(request => {
        if (selectedStatus === "all") return true;
        return getRequestOverallStatus(request) === selectedStatus;
    }) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 mt-4">
                <FarmerNavbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading order requests...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 mt-4">
                <FarmerNavbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-md">
                        <div className="text-red-500 text-5xl mb-3">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Requests</h2>
                        <p className="text-gray-600 text-base">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || !data.checkProductIds?.length) {
        return (
            <div className="min-h-screen bg-gray-50 mt-4">
                <FarmerNavbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 font-medium">No buyer requests yet</p>
                        <p className="text-gray-500 mt-2">Buyer interest requests will appear here</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-4">
            <FarmerNavbar />
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8  ">
                {/* Header */}
                <div className="">
                    <h1 className="text-3xl font-extrabold text-gray-900 ">
                        Product Interest Requests
                    </h1>
                </div>

                {/* Status Filter */}
                <div className="rounded-lg shadow-sm py-2">
                    <div className="flex flex-wrap gap-2">
                        {requestStatuses.map(status => {
                            const count = status.id === "all"
                                ? data.checkProducts.length
                                : filteredRequests.filter(r => getRequestOverallStatus(r) === status.id).length;

                            return (
                                <button
                                    key={status.id}
                                    onClick={() => setSelectedStatus(status.id)}
                                    className={`px-2 py-1 rounded-full text-sm font-medium transition-colors ${selectedStatus === status.id
                                        ? 'bg-green-600 text-white border-2 border-black'
                                        : 'bg-gray-100 text-gray-700 hover:underline  border-2 border-black'
                                        }`}
                                >
                                    {status.label}
                                    <span className="ml-2 text-xs">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Requests List */}
                <div className="space-y-6">
                    {filteredRequests.map((request) => {
                        const buyer = request.userId;
                        const buyerInfo = data.additionalBuyerInfo?.find(info => info.userId === buyer?._id);

                        return (
                            <div key={request._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {/* Request Header */}
                                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center py-2 lg:justify-between">

                                        <h2 className="text-xl font-semibold text-white ">
                                            Request #{request._id.slice(-8).toUpperCase()}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-4 text-green-100">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                <span>{request.products.length} Products</span>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                                    {/* Buyer Details */}
                                    <div className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Buyer Details
                                        </h3>
                                        <div className="space-y-3">
                                            {buyerInfo?.profileImage && (
                                                <div className="flex justify-center mb-4">
                                                    <img
                                                        src={buyerInfo.profileImage}
                                                        alt={buyer?.name}
                                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                                    />
                                                </div>
                                            )}
                                            <p className="font-medium text-gray-900">{buyer?.name || "Unknown"}</p>
                                            <p className="flex items-center gap-2 text-gray-600 text-sm">
                                                <Mail className="w-3 h-3" />
                                                <span>{buyer?.email}</span>
                                            </p>
                                            {buyerInfo && (
                                                <>
                                                    <p className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <Phone className="w-3 h-3" />
                                                        <span>{buyerInfo.phone}</span>
                                                    </p>
                                                    <p className="flex items-start gap-2 text-gray-600 text-sm">
                                                        <MapPin className="w-3 h-3 mt-1" />
                                                        <span>{buyerInfo.location?.city}, {buyerInfo.location?.state}</span>
                                                    </p>
                                                    {buyerInfo.preferences?.length > 0 && (
                                                        <div>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {buyerInfo.preferences.map((pref, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                                        {pref}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products with Individual Management */}
                                    <div className="lg:col-span-3">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Products - Individual Management
                                        </h3>
                                        <div className="space-y-6">
                                            {request.products.map((productRequest) => {
                                                const product = data.checkProducts.find(p => p._id === productRequest.productId);
                                                if (!product) return null;

                                                const currentStatus = getProductStatus(request._id, product._id);
                                                const currentQuantity = getProductQuantity(request._id, product._id, product.quantityAvailable);
                                                const currentDeliveryDate = getDeliveryDate(request._id, product._id);

                                                return (
                                                    <div key={product._id} className="border-2 rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white">
                                                        {/* Product Header */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-start gap-4">
                                                                <img
                                                                    src={product.images?.[0]}
                                                                    alt={product.name}
                                                                    className="w-20 h-20 object-cover rounded-lg border"
                                                                />
                                                                <div>
                                                                    <h4 className="font-bold text-lg text-gray-900">{product.name}</h4>
                                                                    {product.variety && (
                                                                        <p className="text-gray-600">{product.variety}</p>
                                                                    )}
                                                                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                {getProductStatusBadge(currentStatus)}
                                                            </div>
                                                        </div>

                                                        {/* Product Details Grid */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                                            <div className="bg-white p-3 rounded-lg border">
                                                                <div className="font-medium text-gray-700">Price</div>
                                                                <div className="text-green-600 font-bold">₹{product.pricePerUnit}/{product.unit}</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border">
                                                                <div className="font-medium text-gray-700">Available</div>
                                                                <div className="font-bold">{product.quantityAvailable} {product.unit}</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border">
                                                                <div className="font-medium text-gray-700">Category</div>
                                                                <div className="font-bold capitalize">{product.category}</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border">
                                                                <div className="font-medium text-gray-700">Harvest</div>
                                                                <div className="font-bold">{new Date(product.harvestDate).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>

                                                        {/* Product Management Controls */}
                                                        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200">
                                                            <h5 className="font-semibold text-gray-900 mb-3">Manage This Product</h5>

                                                            {/* Status Selection */}
                                                            <div className="mb-4">
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Product Status
                                                                </label>
                                                                <select
                                                                    value={currentStatus}
                                                                    onChange={(e) => updateProductStatus(request._id, product._id, e.target.value)}
                                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                                >
                                                                    {productStatusOptions.map(option => (
                                                                        <option key={option.id} value={option.id}>
                                                                            {option.label} - {option.description}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            {/* Quantity Control */}
                                                            {(currentStatus === "available_now" || currentStatus === "available_later" || currentStatus === "partial_available") && (
                                                                <div className="mb-4">
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Quantity to Offer ({product.unit})
                                                                    </label>
                                                                    <div className="flex items-center gap-3">
                                                                        <button
                                                                            onClick={() => updateProductQuantity(request._id, product._id, currentQuantity - 1)}
                                                                            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                                                        >
                                                                            <Minus className="w-4 h-4" />
                                                                        </button>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={product.quantityAvailable}
                                                                            value={currentQuantity}
                                                                            onChange={(e) => updateProductQuantity(request._id, product._id, parseInt(e.target.value) || 0)}
                                                                            className="w-20 p-2 text-center border border-gray-300 rounded-lg"
                                                                        />
                                                                        <button
                                                                            onClick={() => updateProductQuantity(request._id, product._id, Math.min(currentQuantity + 1, product.quantityAvailable))}
                                                                            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                                                        >
                                                                            <Plus className="w-4 h-4" />
                                                                        </button>
                                                                        <span className="text-sm text-gray-600">
                                                                            Max: {product.quantityAvailable} {product.unit}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Delivery Date */}
                                                            {currentStatus === "available_later" && (
                                                                <div className="mb-4">
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                        Expected Delivery Date
                                                                    </label>
                                                                    <input
                                                                        type="date"
                                                                        value={currentDeliveryDate}
                                                                        min={new Date().toISOString().split('T')[0]}
                                                                        onChange={(e) => updateDeliveryDate(request._id, product._id, e.target.value)}
                                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex flex-wrap gap-2">
                                                                {currentStatus !== "pending" && currentStatus !== "unavailable" && (
                                                                    <button
                                                                        onClick={() => createOrderForProduct(
                                                                            request._id,
                                                                            product._id,
                                                                            currentQuantity,
                                                                            currentDeliveryDate
                                                                        )}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                                    >
                                                                        Confirm This Product
                                                                    </button>
                                                                )}
                                                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                                    Contact Buyer
                                                                </button>
                                                                {currentStatus === "confirmed" && (
                                                                    <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                                                                        ✓ Order Created
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Estimated Value */}
                                                            {currentQuantity > 0 && (
                                                                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-medium text-green-800">Estimated Value:</span>
                                                                        <span className="font-bold text-green-600 text-lg">
                                                                            ₹{(product.pricePerUnit * currentQuantity).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-gray-500 mt-3">
                                                            Interest shown: {new Date(productRequest.addedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default OrderReceived;