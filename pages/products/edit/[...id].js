import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import {
  getStorage,
  listAll,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";
import { getDatabase } from "firebase/database";
import ProductForm from "@/components/ProductForm";
import { SyncLoader } from "react-spinners";

const db = getDatabase();
const storage = getStorage();

export default function EditProductPage() {
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchProductInfo = async () => {
      if (!id) {
        return;
      }

      try {
        const productRef = ref(db, `products/${id}`);
        const productSnapshot = await get(productRef);

        if (productSnapshot.exists()) {
          setProductInfo(productSnapshot.val());
          console.log(productSnapshot.val());
        } else {
          console.log("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product info:", error);
      }
    };

    fetchProductInfo();
  }, [id]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!productInfo || !productInfo.product_id) {
        return;
      }

      const folderName = productInfo.product_id.toString();
      const productFolderRef = storageRef(storage, `products/${folderName}`);

      try {
        const imageUrls = [];
        const imageRefs = await listAll(productFolderRef);
        for (const imageRef of imageRefs.items) {
          const imageUrl = await getDownloadURL(imageRef);
          imageUrls.push(imageUrl);
        }
        setProductInfo((prevProduct) => ({
          ...prevProduct,
          images: imageUrls,
        }));
        console.log(imageUrls);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false); // Set loading state to false when image fetching is done
      }
    };

    fetchImages();
  }, [productInfo]);

  return (
    <Layout>
      <h1>Edit product</h1>
      {loading ? (
        <SyncLoader color={"#5545F6"} loading={loading} size={15} /> // Render the spinner
      ) : (
        productInfo && <ProductForm {...productInfo} _id={id} />
      )}
    </Layout>
  );
}
