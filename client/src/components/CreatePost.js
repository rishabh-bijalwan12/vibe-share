import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function CreatePost() {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleBodyChange = (e) => {
    setBody(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if an image is selected
    if (!image) {
      toast.error("No image selected. Please upload an image.");
      return;
    }

    // Upload the image to Cloudinary
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "Vibe Share");

    try {
      const cloudinaryResponse = await fetch(
        "https://api.cloudinary.com/v1_1/dkagoq0pm/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const cloudinaryResult = await cloudinaryResponse.json();
      setImageURL(cloudinaryResult.url);

      // Save the post to the database
      try {
        const databaseResponse = await fetch("http://localhost:5000/createpost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "bearer " + localStorage.getItem("jwt"),
          },
          body: JSON.stringify({
            body,
            imageURL: cloudinaryResult.url,
          }),
        });

        if (!databaseResponse.ok) {
          throw new Error("Failed to save post to database");
        }
        
        toast.success("Post shared successfully!");
        navigate('/');
      } catch (error) {
        toast.error("Error saving post: " + error.message);
      }

    } catch (error) {
      toast.error("Error uploading image: " + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 min-h-screen flex justify-center py-12">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-lg mx-auto p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-gray-800 text-center">
          Create a New Post
        </h2>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 w-full p-3 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Preview */}
        {image && (
          <div className="relative mb-6">
            <div className="absolute top-0 right-0 p-2 text-white bg-black bg-opacity-50 rounded-full cursor-pointer hover:bg-opacity-80">
              <button onClick={() => setImage(null)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Post Body */}
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700">Post Content</label>
          <textarea
            value={body}
            onChange={handleBodyChange}
            placeholder="Write something..."
            className="w-full p-4 border rounded-lg text-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default CreatePost;
