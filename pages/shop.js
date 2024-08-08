import Layout from "@/components/Layout";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { getDatabase } from "firebase/database";
import { useTable, useSortBy } from "react-table";

const database = getDatabase();

const Products = () => {
  const [products, setProducts] = useState([]);
  const [productSets, setProductSets] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [newSetName, setNewSetName] = useState("");

  useEffect(() => {
    // Fetch products from the database
    const productsRef = ref(database, "products");
    get(productsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const productsArray = Object.entries(snapshot.val()).map(
          ([key, value]) => {
            return { _id: key, ...value };
          }
        );
        setProducts(productsArray);
      } else {
        console.log("No product data available");
      }
    });

    // Fetch product sets from the database
    // const productSetsRef = ref(database, "productSets");
    // get(productSetsRef).then((snapshot) => {
    //   if (snapshot.exists()) {
    //     const setsArray = Object.entries(snapshot.val()).map(([key, value]) => {
    //       return { _id: key, ...value };
    //     });
    //     setProductSets(setsArray);
    //   } else {
    //     console.log("No product set data available");
    //   }
    // });
  }, []);

  // Define columns for the product table
  const productTableColumns = React.useMemo(
    () => [
      {
        Header: "Product ID",
        accessor: "_id", // Use "_id" instead of "id"
      },
      {
        Header: "Product name",
        accessor: "title",
      },
      {
        Header: "Brand",
        accessor: "brand",
      },
      {
        Header: "Category",
        accessor: "category",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Sizes",
        accessor: "sizes",
      },
    ],
    []
  );

  // Create an instance of the useTable hook for the product table
  const {
    getTableProps: getProductTableProps,
    getTableBodyProps: getProductTableBodyProps,
    headerGroups: productTableHeaderGroups,
    rows: productTableRows,
    prepareRow: prepareProductTableRow,
  } = useTable({ columns: productTableColumns, data: products }, useSortBy);

  // Function to handle product selection for creating a set
  const handleProductSelection = (productId) => {
    // Toggle product selection
    setSelectedProductIds((prevIds) =>
      prevIds.includes(productId)
        ? prevIds.filter((id) => id !== productId)
        : [...prevIds, productId]
    );
  };

  // Function to create a new set
  const createProductSet = () => {
    if (selectedProductIds.length < 2 || !newSetName) {
      alert("Please select at least two products and enter a set name.");
      return;
    }

    // Implement your logic to save the product set to the database or perform any other actions

    // Clear the selected products and set name after creating the set
    setSelectedProductIds([]);
    setNewSetName("");
    alert("Product set created successfully!");
  };

  return (
    <Layout>
      <div>
        <Link href="/products/new" passHref>
          <p
            style={{
              padding: "10px",
              background: "#007bff",
              color: "#fff",
              display: "inline-block",
            }}
            className="btn btn-primary mt-2"
          >
            Add Product
          </p>
        </Link>

        {/* Display existing product sets */}
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Existing Product Sets</h2>
          <ul>
            {productSets.map((productSet) => (
              <li key={productSet._id}>{productSet.name}</li>
            ))}
          </ul>
        </div>

        {/* Create Set Section */}
        <div className="mb-4 mt-4">
          <h2 className="text-xl font-bold mb-2">Create Product Set</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Set Name"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              className="p-2 border border-gray-300"
            />
            <button
              onClick={createProductSet}
              className="bg-green-500 text-white p-2 rounded"
            >
              Create Product Set
            </button>
          </div>

          {/* Product Table */}
          <table
            {...getProductTableProps()}
            className="table-dark table-responsive basic mt-2"
          >
            <thead>
              {productTableHeaderGroups.map((headerGroup) => (
                <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      key={headerGroup.id}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getProductTableBodyProps()}>
              {productTableRows.map((row) => {
                prepareProductTableRow(row);
                return (
                  <tr key={row.id} {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td key={row.id} {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </td>
                    ))}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(row.original._id)}
                        onChange={() =>
                          handleProductSelection(row.original._id)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
