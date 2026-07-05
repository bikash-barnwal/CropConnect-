import React, { useEffect, useState, useCallback } from "react"
import { User, Navigation, Map, Mail, Phone, MapPin, Heart, Edit3, Plus, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import BuyerNav from "../components/buyer/BuyerNav"
import EditBuyerProfile from "./EditBuyerProfile"
import { toast } from "react-toastify"
import ProfileImg from "../imageAndCloudinary/ProfileImg"

const BASE_API = import.meta.env.VITE_BASE_API_URL
const BASE_URL = `${BASE_API}/buyerProfile`

const BuyerProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Callback to update profile image
  const handleImageUpdate = useCallback((newImageUrl) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      profileImage: newImageUrl,
    }));
  }, []);

  useEffect(() => {
    const controller = new AbortController()
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("cropconnect_token")
        if (!token || !user?._id) return

        const res = await fetch(`${BASE_URL}/get-buyerProfile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        const data = await res.json()
        setProfile(data?.profileImage ? "null" : data.profileImage)
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile")
        const buyer = data.getBuyerProfile?.find((p) => p.userId === user._id)
          || data.data || data.profile || null
        if (buyer) {
          toast.success("Profile loaded successfully.")
          setProfile(buyer)
        } else {
          toast.warn("No profile found.")
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error(`Error ${err.message}`)
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    return () => controller.abort()
  }, [user?._id])

  const handleEdit = () => navigate("/profile/buyer/edit")

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 min-h-screen animate-pulse">
        {/* Navbar placeholder */}
        <div className="flex justify-center mb-4">
          <div className="h-10 w-28 sm:w-36 md:w-40 bg-gray-300 rounded" />
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Profile Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center p-6">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/30 rounded-full" />
                <div className="space-y-2 text-center sm:text-left">
                  <div className="h-6 w-28 sm:w-32 md:w-40 bg-white/40 rounded" />
                  <div className="h-4 w-20 sm:w-28 md:w-32 bg-white/40 rounded" />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Contact Info */}
              <div>
                <div className="h-5 bg-gray-300 w-1/2 mb-4 rounded" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded"
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full" />
                      <div>
                        <div className="h-3 w-14 sm:w-16 md:w-20 bg-gray-200 rounded mb-1" />
                        <div className="h-4 w-20 sm:w-24 md:w-28 bg-gray-300 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="h-5 bg-gray-300 w-1/3 mb-4 rounded" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded">
                      <div className="h-3 w-12 sm:w-14 md:w-16 bg-gray-200 rounded mb-1" />
                      <div className="h-4 w-20 sm:w-24 md:w-28 bg-gray-300 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences & Status */}
              <div className="space-y-6">
                {/* Preferences */}
                <div>
                  <div className="h-5 bg-gray-300 w-1/2 mb-4 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 w-14 sm:w-16 md:w-20 bg-gray-200 rounded-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <div className="h-5 bg-gray-300 w-1/3 mb-3 rounded" />
                  <div className="h-4 w-24 sm:w-32 md:w-40 bg-gray-200 rounded" />
                </div>

                {/* Member Since */}
                <div>
                  <div className="h-5 bg-gray-300 w-1/2 mb-3 rounded" />
                  <div className="h-4 w-16 sm:w-20 md:w-28 bg-gray-300 rounded" />
                </div>
              </div>
            </div>

            {/* Footer (Edit button placeholder) */}
            <div className="p-6 flex justify-center border-t">
              <div className="h-10 w-24 sm:w-28 md:w-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <div className="h-4 w-40 sm:w-48 md:w-64 bg-gray-300 rounded mx-auto" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md bg-white rounded shadow p-6 text-center">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <div className="flex justify-center">
          <BuyerNav />
        </div>
        <EditBuyerProfile />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4">
      <div className="flex justify-center">
        <BuyerNav />
      </div>
      <div className="mx-auto">


        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-2  ">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center ">
            <div className="flex flex-rows gap-4 justify-center items-center">

              <ProfileImg profile={profile} onImageUpdate={handleImageUpdate} />

              <div>
                <h2 className="text-2xl font-bold text-black"> Mr. {profile.name || user?.name}</h2>
                <p className="text-sm flex items-center justify-center gap-1 mt-1 text-green-100">
                  <CheckCircle className="h-4 w-4" />
                  Verified Buyer
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
              <InfoRow icon={<Mail className="text-blue-600" />} label="Email" value={profile.email || user?.email} />
              <InfoRow icon={<Phone className="text-green-600" />} label="Phone" value={profile.phone} />
              <InfoRow icon={<MapPin className="text-purple-600" />} label="Address" value={profile.address} />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Location Details</h3>
              <InfoRow icon={<MapPin className="text-red-500" />} label="City" value={profile.location?.city} />
              <InfoRow icon={<Map className="text-yellow-500" />} label="State" value={profile.location?.state} />
              <InfoRow icon={<Navigation className="text-blue-500" />} label="Coordinates" value={profile.location?.coordinates?.coordinates?.join(", ") || "Not provided"} />
            </div>


            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                  <Heart className="text-red-500 h-5 w-5" />
                  Preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences?.length > 0 ? (
                    profile.preferences.map((pref, i) => (
                      <span
                        key={i}
                        className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full border border-green-300"
                      >
                        {pref}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No preferences set</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Account Status</h4>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Active & Verified</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">Member Since</h4>
                <p className="text-gray-600">January 2024</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex justify-center border-t">
            <button
              onClick={handleEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"
            >
              <Edit3 className="h-5 w-5" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mb-8">
        <p className="text-gray-600">Manage your profile information.</p>
      </div>
    </div>
  )
}

// Helper components
const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">{icon}</div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{value || "Not provided"}</p>
    </div>
  </div>
)

const SimpleRow = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value || "Not provided"}</p>
  </div>
)

export default BuyerProfile


{/* <div className="bg-white shadow-md rounded-lg overflow-hidden mb-2">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center p-6">
            <div className="flex flex-rows gap-4 justify-center items-center">
              <div className="border-4 border-red-600 w-24 h-24 bg-white/30 rounded-full flex items-center justify-center mb-4 mr-4">
              <User className="h-20 w-20 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black"> Mr. {profile.name || user?.name}</h2>
                <p className="text-sm flex items-center justify-center gap-1 mt-1 text-green-100">
                  <CheckCircle className="h-4 w-4" />
                  Verified Buyer
                </p>
              </div>
            </div>
          </div> */}