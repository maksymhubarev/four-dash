import Layout from "@/components/Layout";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ref, get, remove } from "firebase/database";
import { getDatabase } from "firebase/database";
import { useTable, useSortBy } from "react-table";
import Swal from "sweetalert2";
import router from "next/router";

const database = getDatabase();

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const productsRef = ref(database, "products");
    get(productsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const productsArray = Object.entries(snapshot.val()).map(
            ([key, value]) => {
              return { _id: key, ...value };
            }
          );
          setProducts(productsArray);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const deleteProduct = (productId) => {
    // Display SweetAlert modal
    Swal.fire({
      title: "Do you really want to delete?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        // If user confirms deletion
        const productRef = ref(database, `products/${productId}`);
        remove(productRef)
          .then(() => {
            // Product deleted successfully
            Swal.fire("Deleted!", "Your product has been deleted.", "success");
            // Refresh products list after deletion
            refreshProducts();
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
            Swal.fire(
              "Error",
              "An error occurred while deleting the product.",
              "error"
            );
          });
      }
    });
  };

  const refreshProducts = () => {
    const productsRef = ref(database, "products");
    get(productsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const productsArray = Object.entries(snapshot.val()).map(
            ([key, value]) => {
              return { _id: key, ...value };
            }
          );
          setProducts(productsArray);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  const editProduct = (productId) => {
    console.log("Edit product with ID:", productId);
    router.push(`/products/edit/${productId}`);
  };

  // Define columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: "Product ID",
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
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ value }) => (
          <div>
            <button
              className="btn btn-primary me-2"
              onClick={() => editProduct(value)}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => deleteProduct(value)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  // Create an instance of the useTable hook
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: products }, useSortBy);

  return (
    <Layout>
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

      <table
        key={headerGroups.id}
        {...getTableProps()}
        className="table-dark table-responsive basic mt-2"
      >
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr key={index} {...headerGroup.getHeaderGroupProps()}>
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
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <tr key={index} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td key={index} {...cell.getCellProps()}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
}
