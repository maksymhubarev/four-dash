import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import React from "react";

import axios from "axios";
import { ref, get } from "firebase/database";
import { getDatabase } from "firebase/database";
import Link from "next/link";
import * as XLSX from "xlsx"; // Import XLSX

const database = getDatabase();

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchOrderId, setSearchOrderId] = useState(""); // State to store the search order ID]
  const [startDate, setStartDate] = useState(null); // State to store the start date
  const [endDate, setEndDate] = useState(null);
  //products

  // Function to filter orders by order date range
  const filterOrdersByDateRange = () => {
    if (!startDate || !endDate) return orders;
    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };
  //filter orders and search
  const searchAndFilterOrders = () => {
    // Filter orders by order date range
    const filteredOrders = filterOrdersByDateRange();

    if (searchOrderId.trim() === "") {
      // If searchOrderId is empty, return all filtered orders
      return filteredOrders;
    } else {
      // Filter orders based on searchOrderId (product ID or product name)
      return filteredOrders.filter((order) => {
        // Check if orderedProducts exist and is not null
        if (order.orderedProducts && Array.isArray(order.orderedProducts)) {
          // Iterate through each product in orderedProducts
          for (const product of order.orderedProducts) {
            // Check if the product ID or product name matches the searchOrderId
            if (
              product.productId &&
              product.productId
                .toLowerCase()
                .includes(searchOrderId.toLowerCase())
              // (product.productName &&
              //   product.productName
              //     .toLowerCase()
              //     .includes(searchOrderId.toLowerCase()))
            ) {
              return true; // Found a match, include this order
            }
          }
        }
        return false; // No match found for the searchOrderId in this order
      });
    }
  };

  //export to excel
  const exportToExcel = (filteredOrders) => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Check if filteredOrders is an array
    if (!Array.isArray(filteredOrders)) {
      console.error("Filtered orders data is not an array");
      return;
    }

    // Convert filteredOrders data to worksheet
    const wsData = filteredOrders.flatMap((order) => {
      // Check if orderedProducts is an array
      if (!Array.isArray(order.orderedProducts)) {
        console.error(
          "Ordered products data is not an array for order ID:",
          order.orderId
        );
        return [];
      }

      return order.orderedProducts.flatMap((product) => {
        // Generate rows for each color
        return Object.entries(product.sizeCounts).flatMap(([color, sizes]) => {
          const sizeArray = ["S", "M", "L", "XL"].map((key) => sizes[key] || 0);

          return [
            [
              order.orderId,
              order.orderDate,
              // order.shippingAddress,
              order.totalPrice,
              product.productName,
              color,
              ...sizeArray,
              product.price,
            ],
          ];
        });
      });
    });

    // Add header row
    wsData.unshift([
      "Order ID",
      "Order Date",
      // "Shipping Address",
      "Total Price",
      "Product Name",
      "Color",
      "S",
      "M",
      "L",
      "XL",
      "Price",
    ]);

    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Export the workbook to Excel file
    XLSX.writeFile(wb, "filtered_orders.xlsx");
  };

  // Function to handle searching for order ID and filtering orders

  useEffect(() => {
    const ordersRef = ref(database, "orders");
    get(ordersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const ordersArray = Object.values(snapshot.val());
          console.log("ordersArray", ordersArray);
          setOrders(ordersArray);
        } else {
          console.log("No orders available");
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        // Handle error as needed
      });
  }, []);

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="mb-4">
          <label className="block mb-1">Search by Product Id:</label>
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            className="border px-2 py-1"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Filter by Order Date Range:</label>
          <div className="flex gap-4">
            <input
              type="date"
              value={startDate ? startDate.toISOString().split("T")[0] : ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="border px-2 py-1"
            />
            <input
              type="date"
              value={endDate ? endDate.toISOString().split("T")[0] : ""}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="border px-2 py-1"
            />
          </div>
        </div>

        <table className="table-auto w-full border-collapse border">
          <thead>
            <tr className="border">
              <th className="px-2 py-2 border">Product Id</th>

              <th className="px-2 py-2 border">Order ID</th>
              <th className="px-2 py-2 border">Order Date</th>
              {/* <th className="px-2 py-2 border">Shipping Address</th> */}
              <th className="px-2 py-2 border">Total Price</th>
              <th className="px-2 py-2 border">Product Name</th>
              <th className="px-2 py-2 border">Color</th>
              <th className="px-2 py-2 border">Sizes</th>
            </tr>
            <tr className="border">
              <th className="px-2 py-2 border"></th>{" "}
              <th className="px-2 py-2 border"></th>{" "}
              {/* Empty cell for Order ID */}
              <th className="px-2 py-2 border"></th>{" "}
              {/* Empty cell for Order Date */}
              <th className="px-2 py-2 border"></th>{" "}
              {/* Empty cell for Shipping Address */}
              {/* <th className="px-2 py-2 border"></th>{" "} */}
              {/* Empty cell for Total Price */}
              <th className="px-2 py-2 border"></th>{" "}
              {/* Empty cell for Product Name */}
              <th className="px-2 py-2 border"></th>{" "}
              {/* Empty cell for Color */}
              <th className="px-2 py-2 border flex items-center gap-10">
                <span className="mr-1">S</span>
                <span className="mr-1">M</span>
                <span className="mr-1">L</span>
                <span>XL</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {searchAndFilterOrders().map((order, index) => (
              <tr key={index} className="border">
                {order.orderedProducts &&
                  Array.isArray(order.orderedProducts) &&
                  order.orderedProducts.map((product, productIndex) => (
                    <>
                      <div
                        key={`${product.productId}-${productIndex}`}
                        className=" px-2 py-2"
                      >
                        {product.productId}
                      </div>
                    </>
                  ))}
                <td className="border px-2 py-2">{order.orderId}</td>
                <td className="border px-2 py-2">
                  <div className="break-words">
                    {new Date(order.orderDate).toLocaleString()}
                  </div>
                </td>

                {/* <td className="border px-2 py-2">{order.shippingAddress}</td> */}
                <td className="border px-2 py-2">{order.totalPrice}</td>
                <td className="border px-2 py-2">
                  {order.orderedProducts &&
                    Array.isArray(order.orderedProducts) &&
                    order.orderedProducts.map((product, productIndex) => (
                      <>
                        <div
                          key={`${product.productId}-${productIndex}`}
                          className=" px-2 py-2"
                        >
                          {product.productName}
                        </div>
                      </>
                    ))}
                </td>

                {/* <td className=" px-2 py-2">
                  {order.orderedProducts &&
                    Array.isArray(order.orderedProducts) &&
                    order.orderedProducts.map((product, productIndex) => (
                      <div
                        key={`${product.productId}-${productIndex}`}
                        className=" px-2 py-2"
                      >
                        {product.price}
                      </div>
                    ))}
                </td> */}

                <td className="border px-2 py-2">
                  {order.orderedProducts &&
                    Array.isArray(order.orderedProducts) &&
                    order.orderedProducts.map((product, productIndex) => (
                      <div
                        key={`${product.productId}-${productIndex}`}
                        className=" px-2 py-2"
                      >
                        {Object.entries(product.sizeCounts).map(
                          ([color, sizes], index) => (
                            <div key={index}>
                              <p>{color}</p>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                </td>

                <td className=" px-2 py-2 " key={index}>
                  {order.orderedProducts &&
                    Array.isArray(order.orderedProducts) &&
                    order.orderedProducts.map((product, productIndex) => (
                      <div
                        key={`${product.productId}-${productIndex}`}
                        className=" px-2 py-2"
                      >
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {product.sizeCounts &&
                            Object.entries(product.sizeCounts).map(
                              ([size, count], index) => (
                                <div
                                  className="flex items-center gap-10"
                                  key={index + 1}
                                >
                                  <li
                                    key={index + 2}
                                    className="
                                "
                                  >
                                    {`${count["S"]}`}
                                  </li>
                                  <li key={index + 3} className="">
                                    {`${count["M"]}`}
                                  </li>
                                  <li key={index + 4} className="">
                                    {`${count["L"]}`}
                                  </li>
                                  <li key={index + 5} className="">
                                    {`${count["XL"]}`}
                                  </li>
                                </div>
                              )
                            )}
                        </ul>
                      </div>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={() => exportToExcel(searchAndFilterOrders())}
      >
        Export to Excel
      </button>
    </Layout>
  );
};

export default OrdersPage;
