// CreateSetPage.js
import { useState } from "react";
import Layout from "@/components/Layout";

const CreateSetPage = () => {
  const [products] = useState([
    { productId: "1", name: "Product 1" },
    { productId: "2", name: "Product 2" },
    { productId: "3", name: "Product 3" },
    // Add more products as needed
  ]);

  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [setName, setSetName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleProductSelection = (productId) => {
    // Toggle product selection
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds((prevIds) =>
        prevIds.filter((id) => id !== productId)
      );
    } else {
      setSelectedProductIds((prevIds) => [...prevIds, productId]);
    }
  };

  const createProductSet = () => {
    try {
      if (selectedProductIds.length < 2 || !setName) {
        setErrorMessage(
          "Please select at least two products and enter a set name."
        );
        return;
      }

      // Implement your logic to save the product set to the database or perform any other actions

      setSuccessMessage("Product set created successfully!");
      setErrorMessage("");
      setSetName("");
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Error creating product set:", error);
      setErrorMessage("Error creating product set. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6">Create Set Page</h1>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Select Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.productId} className="mb-2">
                <input
                  type="checkbox"
                  id={product.productId}
                  checked={selectedProductIds.includes(product.productId)}
                  onChange={() => handleProductSelection(product.productId)}
                  className="mr-2"
                />
                <label htmlFor={product.productId}>{product.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Set Name</h2>
          <input
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            className="p-2 border border-gray-300 w-full"
          />
        </div>

        <div className="mb-4">
          <button
            onClick={createProductSet}
            className="bg-green-500 text-white p-2 rounded"
          >
            Create Product Set
          </button>
        </div>

        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      </div>
    </Layout>
  );
};

export default CreateSetPage;
