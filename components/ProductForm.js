import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  getDatabase,
  push,
  set,
  onValue,
  ref,
  update,
} from "firebase/database";
//swal fire
import swal from "sweetalert2";

import {
  getStorage,
  listAll,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  increment,
  get,
} from "firebase/storage";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
// import fetchProductCountAndGenerateId from "../pages/products/generateProductId";

const db = getDatabase();
const storage = getStorage();

export default function ProductForm({
  _id = Date
    .now
    // Generate a new product ID if none is provided
    (),
  // Generate a new product ID if none is provided */,

  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
  brand: assignedBrand,
  colors: assignedColor,
  sizes: assignedSize,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [product_id, setProductId] = useState("");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [colors, setColor] = useState(assignedColor || "");
  const [sizes, setSize] = useState(assignedSize || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [folderIndex, setFolderIndex] = useState(0); // Initialize folderIndex state

  const [id, setId] = useState(existingTitle || "");
  const [brand, setBrand] = useState(assignedBrand || "");

  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || []);
  //videos
  const [videos, setVideos] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [categories, setCategories] = useState([]);

  const [isUploading, setIsUploading] = useState(false);
  const [VisUploading, setVIsUploading] = useState(false);

  const [propertiesToFill, setPropertiesToFill] = useState([]);
  const [brands, setBrands] = useState([]);

  function fetchProductCount() {
    const productsRef = ref(db, "products");
    onValue(
      productsRef,
      (snapshot) => {
        const productsData = snapshot.val();
        if (productsData) {
          const productCount = Object.keys(productsData).length;
          const productCountRef = ref(db, "productCount");
          if (typeof newCount === "number" && !isNaN(newCount)) {
            set(productCountRef, newCount);
            console.log("Product count set successfully.");
          }

          console.log("Product count:", productCount);
          return productCount; // Return the product count if needed
        } else {
          console.log("No products found");
          return 0; // Return 0 if no products found
        }
      },
      (error) => {
        console.error("Error fetching product count:", error);
        return null; // Return null or handle the error accordingly
      }
    );
  }

  const router = useRouter();
  useEffect(() => {
    // Fetch folder index when component mounts
    const fetchFolderIndex = async () => {
      try {
        // Get the number of existing folders in "products"
        const productsRef = storageRef(storage, "products");
        const productsList = await listAll(productsRef);
        const newIndex = productsList.prefixes.length + 1;
        setFolderIndex(newIndex);
        setProductId(newIndex.toString());
      } catch (error) {
        console.error("Error fetching folder index:", error);
      }
    };
    fetchFolderIndex(); // Call the function to fetch folder index
  }, []);

  useEffect(() => {
    const productCountRef = ref(db, "productCount");
    // onValue(productCountRef, (snapshot) => {
    //   if (snapshot.exists()) {
    //     const productCount = snapshot.val();
    //     console.log("Product count:", productCount);
    //   }
    // });
    const productsRef = ref(db, "products");
    fetchProductCount();

    const brandsRef = ref(db, "brands");

    onValue(brandsRef, (snapshot) => {
      if (snapshot.exists()) {
        const brandsData = snapshot.val();
        const brandsArray = Object.keys(brandsData).map((id) => ({
          id,
          name: brandsData[id].name,
        }));

        setBrands(brandsArray);
      }
    });
    //category
    const categoryRef = ref(db, "category");
    onValue(categoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const brandsData = snapshot.val();
        const brandsArray = Object.keys(brandsData).map((id) => ({
          id,
          name: brandsData[id].name,
        }));

        setCategories(brandsArray);
      }
    });
  }, []);

  // useEffect(() => {
  //   const productsRef = ref(db, "products");

  //   onValue(productsRef, (snapshot) => {
  //     if (snapshot.exists()) {
  //       const productsData = snapshot.val();
  //       const categoriesSet = new Set();

  //       // Iterate through products and collect unique categories
  //       Object.values(productsData).forEach((product) => {
  //         if (product.category) {
  //           categoriesSet.add(product.category);
  //         }
  //       });

  //       // Convert the set to an array
  //       const categoriesArray = Array.from(categoriesSet);
  //       console.log(categoriesArray);

  //       setCategories(categoriesArray);
  //     }
  //   });
  // }, []);

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);

      // Get the number of existing folders in "products"
      const productsRef = storageRef(storage, "products");

      // Create a new folder with the next index
      const folderName = folderIndex.toString();
      const productFolderRef = storageRef(productsRef, folderName);

      // Upload images to the newly created folder
      for (const file of files) {
        const imageRef = storageRef(productFolderRef, file.name);

        try {
          // Upload file to Firebase Storage
          await uploadBytes(imageRef, file);

          // Get the download URL
          const imageUrl = await getDownloadURL(imageRef);

          // Update state with the new image URL
          setImages((oldImages) => [...oldImages, imageUrl]);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
      setIsUploading(false);
      //navigate to products
    }
  }
  async function uploadVideos(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setVIsUploading(true);

      // Get the number of existing folders in "products"
      const productsRef = storageRef(storage, "videos");

      // Create a new folder with the next index
      const folderName = folderIndex.toString();
      const productFolderRef = storageRef(productsRef, folderName);

      // Upload images to the newly created folder
      for (const file of files) {
        const imageRef = storageRef(productFolderRef, file.name);

        try {
          // Upload file to Firebase Storage
          await uploadBytes(imageRef, file);

          // Get the download URL
          const imageUrl = await getDownloadURL(imageRef);

          // Update state with the new image URL
          setVideos((oldImages) => [...oldImages, imageUrl]);
        } catch (error) {
          console.error("Error uploading videos:", error);
        }
      }
      setVIsUploading(false);
      //navigate to products
    }
  }
  async function saveProduct(ev) {
    ev.preventDefault();
    if (
      !product_id ||
      !title ||
      !description ||
      !price ||
      // !category ||
      !brand ||
      !colors ||
      !sizes
    ) {
      swal.fire("Please fill in all required fields.");
      return;
    }

    const productData = {
      product_id,
      title,
      description,
      price,
      id,

      category,
      brand,
      colors,
      sizes,
    };

    const db = getDatabase();

    if (_id) {
      // Update existing product
      const updates = {};
      updates[`/products/${title}`] = productData;

      try {
        await update(ref(db), updates);
        console.log("Product updated successfully!");
        const productCountRef = ref(db, "productCount");
      } catch (error) {
        console.error("Error updating product:", error);
      }
    } else {
      // Create a new product
      const newProductRef = push(ref(db, "products"));
      const newProductKey = newProductRef.key;

      try {
        // Set the data for the new product
        await set(newProductRef, productData);
        console.log("New product created successfully!");
      } catch (error) {
        console.error("Error creating new product:", error);
      }

      // Optionally, you can return the product ID or other relevant information
      // return newProductKey;
    }

    setGoToProducts(true);
    router.push("/products");
    //navigate to products
  }
  async function removeImage(imageUrl) {
    try {
      // Get the reference to the image file in storage
      const imageRef = storageRef(storage, imageUrl);

      // Delete the image file
      await deleteObject(imageRef);

      // Update the state to remove the image from the UI
      const updatedImages = images.filter((image) => image !== imageUrl);
      setImages(updatedImages);

      console.log("Image removed successfully!");
    } catch (error) {
      console.error("Error removing image:", error);
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function updateVideosOrder(images) {
    setVideos(images);
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product ID</label>
      <input
        type="text"
        placeholder="product id"
        value={title}
        onChange={(ev) => {
          setTitle(ev.target.value);
          setId(ev.target.value);
        }}
      />
      <label>Brand</label>
      <select value={brand} onChange={(ev) => setBrand(ev.target.value)}>
        <option value="">Select Brand</option>{" "}
        {/* Add an empty option for placeholder */}
        {brands.map((brandValue) => (
          <option key={brandValue.id} value={brandValue.name}>
            {brandValue.name}
          </option>
        ))}
      </select>

      <label>Colors</label>
      <input
        type="text"
        placeholder="colors"
        value={colors}
        onChange={(ev) => setColor(ev.target.value)}
      />

      <label>Sizes</label>
      <input
        type="text"
        placeholder="sizes"
        value={sizes}
        onChange={(ev) => setSize(ev.target.value)}
      />

      <div>
        <label className="block mb-2 ">Categories:</label>
        <p className="text-sm text-gray-500 ">
          Hold ctrl to select multiple categories
        </p>
        <div className="relative">
          <select
            value={category}
            onChange={(ev) => {
              const selectedOptions = Array.from(
                ev.target.selectedOptions,
                (option) => option.value
              );
              setCategory(selectedOptions);
              console.log("Selected Categories:", selectedOptions);
            }}
            multiple
            className="block w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-400"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </div>
        </div>
      </div>

      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div key={p.name} className="">
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <div>
              <select
                value={productProperties[p.name]}
                onChange={(ev) => setProductProperties(p.name, ev.target.value)}
              >
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {!!images?.length &&
            images.map((link) => (
              <div
                key={link}
                className="relative h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
              >
                <img src={link} alt="" className="rounded-lg" />
                <button
                  onClick={() => removeImage(link)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                >
                  X
                </button>
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>

      {/* <label>Videos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={videos}
          className="flex flex-wrap gap-1"
          setList={updateVideosOrder}
        >
          {!!videos?.length &&
            videos.map((link) => (
              <div
                key={link}
                className="relative h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
              >
                <img src={link} alt="" className="rounded-lg" />
                <button
                  onClick={() => removeImage(link)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
                >
                  X
                </button>
              </div>
            ))}
        </ReactSortable>
        {VisUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add videos</div>
          <input type="file" onChange={uploadVideos} className="hidden" />
        </label>
      </div> */}

      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />
      <label>Price (in USD)</label>
      <input
        type="text"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />

      <button type="submit" onSubmit={saveProduct} className="btn-primary">
        Save
      </button>
    </form>
  );
}
