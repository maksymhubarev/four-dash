import Layout from "@/components/Layout";
import React, { useState, useEffect } from "react";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
//spinner
import Spinner from "@/components/Spinner";

const storage = getStorage();

const AppManager = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isReloading, setIsReloading] = useState(false); // New reloading state

  // Function to upload banner image to Firebase Storage
  const uploadBannerImage = async (file) => {
    setIsUploading(true);

    try {
      // Get the storage reference for the "banners" folder
      const bannersRef = storageRef(storage, "banners");

      // Upload file to Firebase Storage
      const imageRef = storageRef(bannersRef, file.name);
      await uploadBytes(imageRef, file);

      // Get the download URL
      const imageUrl = await getDownloadURL(imageRef);

      // Update state with the new banner image URL
      setBannerImages((prevImages) => [...prevImages, imageUrl]);
    } catch (error) {
      console.error("Error uploading banner image:", error);
    }

    setIsUploading(false);
  };

  // Function to fetch and set the list of banner images
  const fetchBannerImages = async () => {
    setIsReloading(true); // Set reloading state to true

    try {
      // Get the storage reference for the "banners" folder
      const bannersRef = storageRef(storage, "banners");

      // List all items (images) in the "banners" folder
      const items = await listAll(bannersRef);

      // Get the download URL for each image and store it in the bannerImages state
      const urls = await Promise.all(
        items.items.map(async (item) => {
          return await getDownloadURL(item);
        })
      );
      setBannerImages(urls);
    } catch (error) {
      console.error("Error fetching banner images:", error);
    }

    setIsReloading(false); // Set reloading state to false after fetching images
  };

  async function deleteBannerImage(imageUrl) {
    try {
      // Get the reference to the image file in storage
      const imageRef = storageRef(storage, imageUrl);

      // Delete the image file
      await deleteObject(imageRef);

      // Update the state to remove the image from the UI
      fetchBannerImages();

      console.log("Image removed successfully!");
    } catch (error) {
      console.error("Error removing image:", error);
    }
  }

  // Function to handle file input change for uploading banner images
  const handleBannerImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Upload each file
      Array.from(files).forEach((file) => {
        uploadBannerImage(file);
      });
    }
  };

  // Fetch the list of banner images when the component mounts
  useEffect(() => {
    fetchBannerImages();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">App Manager</h1>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Banners</h3>
          <div className="mb-4">
            {/* Display existing banner images */}
            <div className="grid grid-cols-4 gap-4">
              {isReloading && ( //spinner
                <Spinner />
              )}{" "}
              {bannerImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-auto rounded"
                  />
                  <button
                    onClick={() => deleteBannerImage(image)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            {/* Button to add new banner image */}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerImageUpload}
              className="hidden"
              id="bannerInput"
              multiple
            />
            <label
              htmlFor="bannerInput"
              className="block w-max mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              {isUploading ? "Uploading..." : "Upload Banner Image"}
            </label>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppManager;
