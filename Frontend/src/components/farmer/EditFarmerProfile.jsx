import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import FarmerNavbar from "./FarmerNavbar";
import { toast } from "react-toastify";

const BASE_URL = `${import.meta.env.VITE_BASE_API_URL}/farmerProfile`;

const EditFarmerProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        phone: "",
        city: "",
        state: "",
        pin: "",
        coordinates: "",
        farmSize: "",
        isCertifiedSustainable: false,
        authority: "",
        certifiedOn: "",
        documents: [],
    });

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("cropconnect_token");
                const res = await fetch(`${BASE_URL}/get-farmerProfile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const farmer = data.getFarmerProfile?.find((p) => p.userId === user._id) || null;
                setProfile(farmer);

                if (farmer) {
                    setFormData({
                        phone: farmer.phone || "",
                        city: farmer.location?.city || "",
                        state: farmer.location?.state || "",
                        pin: farmer.location?.pin || "",
                        coordinates: farmer.location?.coordinates?.coordinates?.join(", ") || "",
                        farmSize: farmer.farmSize || "",
                        isCertifiedSustainable: farmer.isCertifiedSustainable || false,
                        authority: farmer.certificationDetails?.authority || "",
                        certifiedOn: farmer.certificationDetails?.certifiedOn?.split("T")[0] || "",
                        documents: farmer.certificationDetails?.documents || [],
                    });
                }
            } catch (_err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) fetchProfile();
    }, [user?._id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.phone) {
            errors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            errors.phone = "Please enter a valid 10-digit phone number";
        }

        if (!formData.city.trim()) errors.city = "City is required";
        if (!formData.state.trim()) errors.state = "State is required";
        if (!formData.pin) errors.pin = "PIN code is required";
        if (!formData.farmSize) errors.farmSize = "Farm size is required";

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage("");

        if (!validateForm()) return;

        const token = localStorage.getItem("cropconnect_token");
        const coordinates = formData.coordinates.split(",").map(Number);

        const payload = {
            userId: user._id,
            phone: formData.phone,
            location: {
                city: formData.city,
                state: formData.state,
                pin: formData.pin,
                coordinates: { type: "Point", coordinates },
            },
            farmSize: formData.farmSize,
            isCertifiedSustainable: formData.isCertifiedSustainable,
            certificationDetails: {
                authority: formData.authority,
                certifiedOn: formData.certifiedOn,
                documents: formData.documents,
            },
        };

        try {
            const res = await fetch(
                profile ? `${BASE_URL}/update-farmerProfile` : `${BASE_URL}/add-farmerProfile`,
                {
                    method: profile ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Submission failed");

            setSuccessMessage(profile ? "Profile updated successfully!" : "Profile created successfully!");
            toast.success(profile ? 'Profile updated successfully!' : 'Profile created successfully!');
            setTimeout(() => navigate("/profile/farmer"), 1000);
        } catch (err) {
            toast.error("Something went wrong.")
            setError(err.message || "Something went wrong.");
        }
    };

    if (loading) {
        return (
            <div className="mt-4">
                <FarmerNavbar />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
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

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <FarmerNavbar />
            <h1 className="text-2xl font-bold mb-4 text-center">
                {profile ? "Edit Farmer Profile" : "Create Farmer Profile"}
            </h1>

            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Phone</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded ${validationErrors.phone ? "border-red-500" : ""
                            }`}
                        placeholder="Enter 10-digit phone number"
                    />
                    {validationErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">City</label>
                    <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded ${validationErrors.city ? "border-red-500" : ""
                            }`}
                    />
                    {validationErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">State</label>
                    <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded ${validationErrors.state ? "border-red-500" : ""
                            }`}
                    />
                    {validationErrors.state && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">PIN Code</label>
                    <input
                        name="pin"
                        value={formData.pin}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded ${validationErrors.pin ? "border-red-500" : ""
                            }`}
                    />
                    {validationErrors.pin && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.pin}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium">Coordinates (lng, lat)</label>
                    <input
                        name="coordinates"
                        value={formData.coordinates}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="e.g., 77.1025, 28.7041"
                    />
                </div>

                <div>
                    <label className="block font-medium">Farm Size (acres)</label>
                    <input
                        name="farmSize"
                        value={formData.farmSize}
                        onChange={handleChange}
                        className={`w-full border px-3 py-2 rounded ${validationErrors.farmSize ? "border-red-500" : ""
                            }`}
                    />
                    {validationErrors.farmSize && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.farmSize}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isCertifiedSustainable"
                        checked={formData.isCertifiedSustainable}
                        onChange={handleChange}
                    />
                    <label className="font-medium">Certified Sustainable</label>
                </div>

                <div>
                    <label className="block font-medium">Certifying Authority</label>
                    <input
                        name="authority"
                        value={formData.authority}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium">Certification Date</label>
                    <input
                        type="date"
                        name="certifiedOn"
                        value={formData.certifiedOn}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    {profile ? "Update Profile" : "Create Profile"}
                </button>
            </form>
        </div>
    );
};

export default EditFarmerProfile;
