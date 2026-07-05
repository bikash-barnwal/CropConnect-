import React, { useEffect, useState, useCallback } from "react"
import { GeorgianLari, BanknoteArrowDown, BanknoteArrowUp, CalendarSync, Building, Waypoints, Tractor, Phone, Mail, MapPin, Shield, Leaf, FileText, AlertCircle, CheckCircle, Edit3, Plus } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import FarmerNavbar from "../components/farmer/FarmerNavbar"
import EditFarmerProfile from "../components/farmer/EditFarmerProfile"
import { toast } from "react-toastify"
import ProfileImg from "../imageAndCloudinary/ProfileImg"

const BASE_API = import.meta.env.VITE_BASE_API_URL
const BASE_URL = `${BASE_API}/farmerProfile`

const FarmerProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

        const res = await fetch(`${BASE_URL}/get-farmerProfile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile")
        const farmer = data.getFarmerProfile?.find((p) => p.userId === user._id) || data.data || data.profile || null
        setProfile(farmer)
        toast.success("Farmer profile loaded successfully")
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    if (user?._id) fetchProfile()

    return () => controller.abort()
  }, [user?._id])

  const handleEdit = () => {
    toast.info("Redirecting to edit profile...")
    navigate("/profile/farmer/edit")
  }

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 min-h-screen animate-pulse">
        {/* Navbar placeholder */}
        <div className="flex justify-center mb-4">
          <div className="h-10 w-32 sm:w-40 bg-gray-300 rounded" />
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Profile Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center p-6">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/30 rounded-full" />
                <div className="space-y-2 text-left sm:text-center">
                  <div className="h-6 w-32 sm:w-40 bg-white/40 rounded" />
                  <div className="h-4 w-24 sm:w-32 bg-white/40 rounded" />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded mb-1" />
                        <div className="h-4 w-24 sm:w-28 bg-gray-300 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="h-5 bg-gray-300 w-1/3 mb-4 rounded " />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded">
                      <div className="h-3 w-14 sm:w-16 bg-gray-200 rounded mb-1" />
                      <div className="h-4 w-24 sm:w-28 bg-gray-300 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Crops & Certifications */}
              <div className="space-y-6">
                <div>
                  <div className="h-5 bg-gray-300 w-1/2 mb-4 rounded" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-6 w-16 sm:w-20 bg-gray-200 rounded-full"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-5 bg-gray-300 w-2/3 mb-4 rounded" />
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded">
                        <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded mb-1" />
                        <div className="h-4 w-24 sm:w-28 bg-gray-300 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-5 bg-gray-300 w-1/3 mb-3 rounded" />
                  <div className="h-4 w-32 sm:w-40 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 flex justify-center border-t">
              <div className="h-10 w-28 sm:w-32 bg-gray-300 rounded" />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <div className="h-4 w-48 sm:w-64 bg-gray-300 rounded mx-auto" />
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
    toast.info("No profile found. Please create one.")

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <EditFarmerProfile />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4">
      <div className="flex justify-center">
        <FarmerNavbar />
      </div>
      <div className="mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-2">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center py-2">
            <div className="flex flex-row gap-2 justify-center items-center">
              <ProfileImg profile={profile} onImageUpdate={handleImageUpdate} />
              <div>
                <h2 className="text-2xl font-bold text-black">Mr. {profile.name || user?.name}</h2>
                <p className="text-sm flex items-center justify-center gap-1 mt-1 text-green-100">
                  <CheckCircle className="h-4 w-4" />
                  Registered Farmer
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h3>
              <div className="space-y-3">
                <InfoRow icon={<Mail className="text-blue-600" />} label="Email" value={profile.email || user?.email} />
                <InfoRow icon={<Phone className="text-green-600" />} label="Phone" value={profile.phone || user?.phone} />
                <InfoRow icon={<Tractor className="text-purple-600" />} label="Farm Size" value={profile.farmSize ? `${profile.farmSize} acres` : "Not provided"} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold border-b pb-2">Location Details</h3>
              <div className="space-y-3 mt-5 ">

                <InfoRow icon={<Waypoints className="text-gray-600" />} label="City" value={profile.location?.city || "Not provided"} />

                <InfoRow icon={<Building className="text-yellow-600" />} label="State" value={profile.location?.state || "Not provided"} />

                <InfoRow icon={<MapPin className="text-orange-600" />} label="Coordinates" value={profile.location?.coordinates?.coordinates?.join(", ") || "Not provided"} />


              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.certificationDetails && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
                    <Shield className="text-blue-500 h-5 w-5" />
                    Certification
                  </h3>
                  <div className="space-y-3">
                    {/* GeorgianLari */}
                    <InfoRow icon={<GeorgianLari className="text-orange-600" />} label="Authority" value={profile.certificationDetails.authority || "Not provided"} />

                    <InfoRow icon={<CalendarSync className="text-green-600" />} label="Certificate issue on" value={profile.certificationDetails.certifiedOn ? new Date(profile.certificationDetails.certifiedOn).toLocaleDateString() : "Not provided"}
                    />

                    {profile.certificationDetails.documents?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                          <FileText className="h-4 w-4 text-blue-500" /> Documents:
                        </p>
                        <ul className="pl-4 list-disc text-sm text-blue-600">
                          {profile.certificationDetails.documents.map((doc, idx) => (
                            <li key={idx}>
                              <a href={doc} target="_blank" rel="noopener noreferrer" className="underline">
                                {doc}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className=" text-center">
                <h4 className="text-lg font-semibold border-b pb-2">Member </h4>
                <div class="bg-gray-50 mb-6 mt-5">
                  {/* BanknoteArrowDown  BanknoteArrowUp */}


                  <div className="flex justify-ceter gap-4">
                    <BanknoteArrowDown />
                    <p className="pb-2"> Profile created</p>
                  </div>
                  <p className="font-bold text-black">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="flex justify-ceter gap-4">
                  <BanknoteArrowUp />
                  <p> Last profile update</p>
                </div>
                <p className="font-bold text-black"> {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}</p>

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
        <p className="text-gray-600">Manage your farming details and certifications.</p>
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

export default FarmerProfile
