import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const ProfileImage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?._id) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);  // Changed to match backend expectation

      // Send to our backend instead of directly to Cloudinary
      const token = localStorage.getItem("cropconnect_token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/profileImg/set-profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      setImage(data.optimizedUrl);
      setMessage("Profile image updated!");
    } catch (err) {
      console.error("Upload Error:", err);
      setMessage("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Profile Image</h2>

      <input type="file" onChange={handleFileUpload} accept="image/*" />
      {loading && <p className="text-blue-500">Uploading...</p>}
      {message && <p className="mt-2 text-green-600">{message}</p>}

      {image && (
        <div className="mt-4 w-48 h-48">
          <img src={image} alt="Profile" className="rounded-full w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default ProfileImage;


// import React, { useState } from 'react'

// const ProfileImage = () => {
//     const[loading, setLoading] = useState(false)
//     const[image, setImage] = useState(null)
//     const handleFileUploaded = async(e)=>{
//         // e.preventDefault()
//         // file is a fixed keyword in clodinary, allow to send file only
//         const file = e.target.files[0] ;
//         if(!file) return ;
//         // since the images is save in binary data so we can't directally send it to node.js, we need to use backend server node.js and cloudinary
//         const data= new FormData() // constructor function
//         data.append("file",file) // data will be store in key-value pair
//         data.append("upload_preset","CropConnect_Profile_Image")
//         data.append("cloud_name","doavbw5k7")
//         // const res = await fetch("https://api.cloudinary.com/v1_1/doavbw5k7/image/upload",{method:"POST",body:data})
//         const res = await fetch("https://api.cloudinary.com/v1_1/doavbw5k7/image/upload", {
//   method: "POST",
//   body: data
// });

//         const UploadImageUrl = await res.json()
// setImage(UploadImageUrl.secure_url)
//         console.log(UploadImageUrl)
//         console.log(file)
//     }

//   return (
//     <div>
//       <h1>ProfileImage</h1>
//       <div className='file-uploader'>
//         <div className='uploaded-container'>
//             <div className='upload-icon'>
//                 <img src="upload.svg" alt="" />
//             </div>
//             <input type="file" className='file-input' onChange={handleFileUploaded} />
//         </div>
//         <div className='w-48 h-48 border-black '  >
//             <img src={image} alt="imagr" />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfileImage
