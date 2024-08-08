import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  get,
  remove,
  deleteObject,
  decrement,
} from "firebase/database";

// Firebase Database
const db = getDatabase();

export default function DeleteProductPage() {
  const router = useRouter();
  const [productInfo, setProductInfo] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    // Fetch product info from Firebase
    const fetchProductInfo = async () => {
      try {
        const productRef = ref(db, `products/${id}`);
        const productSnapshot = await get(productRef);

        if (productSnapshot.exists()) {
          setProductInfo(productSnapshot.val());
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product info:", error);
      }
    };

    fetchProductInfo();
  }, [id]);

  const goBack = () => {
    router.push("/products");
  };

  const deleteProduct = async () => {
    try {
      // Remove product data from the Realtime Database
      await remove(ref(db, `products/${id}`));

      // Delete images folder from Firebase Storage
      const productImagesRef = ref(storage, `products/${id}`);
      await deleteObject(productImagesRef);

      console.log(`Products Id ${id}` + " deleted and Images removed");
      const productCountRef = ref(db, "productCount");
      await update(productCountRef, {
        count: decre(1),
      });
      console.log("Product count updated successfully!");

      // Redirect to the products page
      router.push("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <Layout>
      <h1 className="text-center">
        Do you really want to delete &quot;{productInfo?.title}&quot;?
      </h1>
      <div className="flex gap-2 justify-center">
        <button onClick={deleteProduct} className="btn-red">
          Yes
        </button>
        <button onClick={goBack} className="btn-default">
          No
        </button>
      </div>
    </Layout>
  );
}
