import React, { useState, useEffect, memo } from "react";
import { toast } from "react-toastify";

// Memoize the component to prevent unnecessary re-renders
const ProfileImg = memo(({ profile, onImageUpdate }) => {
    const [preview, setPreview] = useState(profile?.profileImage || "/default-avatar.png");
    const [loading, setLoading] = useState(false);

    const BASE_API = import.meta.env.VITE_BASE_API_URL;
    const BASE_URL = `${BASE_API}/setProfileImg/set-profile-image`;
    const MAX_FILE_SIZE = 0.5 * 1024 * 1024; // 0.5MB in bytes

    // Sync preview with profile image when it changes
    useEffect(() => {
        if (profile?.profileImage) {
            setPreview(profile.profileImage);
        }
    }, [profile?.profileImage]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side file size validation
        if (file.size > MAX_FILE_SIZE) {
            toast.error("File size exceeds 0.5MB limit");
            return;
        }

        // Temporary preview
        const tempPreview = URL.createObjectURL(file);
        setPreview(tempPreview);

        const formData = new FormData();
        formData.append("image", file);

        try {
            setLoading(true);
            const token = localStorage.getItem("cropconnect_token");

            const res = await fetch(BASE_URL, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Upload failed");

            // Update preview with Cloudinary URL
            setPreview(data.optimizedUrl);
            // Notify parent to update profile state
            onImageUpdate(data.optimizedUrl);
            toast.success("Profile image updated!");
        } catch (err) {
            toast.error(err.message || "Upload failed");
            // Revert to previous image on error
            setPreview(profile?.profileImage || "/default-avatar.png");
        } finally {
            // Clean up temporary URL
            if (tempPreview) URL.revokeObjectURL(tempPreview);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center py-1">
            <div className="w-[12rem] h-[12rem] rounded-full overflow-hidden border-2  border-blue-800">
                <img
                    src={preview}
                    alt="profile"
                    className="w-full h-full object-cover"
                />
            </div>
            <label className=" mt-1 cursor-pointer text-sm font-semibold text-white px-4 py-1 bg-blue-600 border-black border-1 rounded-lg shadow hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center justify-center">
                {loading ? "Uploading..." : "change"}
                <input type="file" accept="image/*" onChange={handleFileChange} hidden />
            </label>

        </div>
    );
});

export default ProfileImg;
