import Layout from "@/components/Layout";
import React, { useEffect, useState } from "react";
import { ref, get, set } from "firebase/database";
import { Auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTable, useSortBy } from "react-table";
import { getDatabase } from "firebase/database";
import Link from "next/link";
import { Button } from "@material-ui/core";
import swal from "sweetalert2";

const database = getDatabase();
//fetch userID from firebase
// ... (your existing imports)
const Users = () => {
  const [users, setUsers] = useState([]);
  const [, updateState] = useState();
  const [viewableBrands, setViewableBrands] = useState([]);

  const [user] = useAuthState(Auth);
  const handleAuthorizeAllBrands = async (productId) => {
    try {
      const userRef = ref(database, `users/${productId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      // Get the current authorized brands for the user
      const currentAuthorizedBrands = userData.authorizedBrands || [];
      const allBrandsAuthorized =
        currentAuthorizedBrands.length === viewableBrands.length;

      // Toggle authorization: Remove all brands if all are currently authorized, otherwise authorize all brands
      const updatedBrands = allBrandsAuthorized ? [] : [...viewableBrands];

      // Update the user's authorized brands in Firebase
      await set(userRef, { ...userData, authorizedBrands: updatedBrands });

      // Update the user's authorized brands locally
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === productId
            ? { ...user, authorizedBrands: updatedBrands }
            : user
        )
      );

      console.log(
        `${
          allBrandsAuthorized ? "Removed all" : "Authorized all"
        } brands for user with ID ${productId}`
      );
    } catch (error) {
      console.error("Error authorizing all brands:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRef = ref(database, `users`);
        const usersSnapshot = await get(usersRef);
        const usersArray = Object.entries(usersSnapshot.val() || {}).map(
          ([key, value]) => {
            return { _id: key, ...value };
          }
        );
        setUsers(usersArray);
        console.log(usersArray);

        const brandsRef = ref(database, "brands");
        const brandsSnapshot = await get(brandsRef);
        const brandsData = brandsSnapshot.val() || {};

        // Extract brand names from brand objects and store them in an array
        const brandNames = Object.values(brandsData).map((brand) => brand.name);

        // Set the array of brand names in state
        setViewableBrands(brandNames);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const columns = React.useMemo(
    () => [
      { Header: "Created at", accessor: "createdAt" },
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone Number", accessor: "phoneNumber" },

      {
        Header: "Authorized Brands",
        accessor: "authorizedBrands",
        Cell: ({ value }) => {
          return <div>{Array.isArray(value) ? value.join(", ") : ""}</div>;
        },
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ row }) => (
          <div className="d-flex gap-2">
            <Button
              onClick={() => handleAuthorizeAllBrands(row.original._id)}
              style={{
                backgroundColor: "#5543F6",
                borderRadius: "20px",
                fontSize: "12px",
                padding: "6px 12px",
                color: "#FFFFFF",
                boxShadow: "none",
                border: "none",
              }}
            >
              All
            </Button>

            {Array.isArray(viewableBrands) ? (
              <>
                {viewableBrands.map((brand, index) => (
                  <>
                    <Button
                      key={brand}
                      onClick={() =>
                        handleAuthorizeBrand(row.original._id, brand)
                      }
                      style={{
                        backgroundColor:
                          Array.isArray(row.values.authorizedBrands) &&
                          row.values.authorizedBrands.includes(brand)
                            ? "#5542F6"
                            : "#A5A5A5",
                        borderRadius: "20px",
                        fontSize: "12px",
                        padding: "6px 12px",
                        color: "#FFFFFF",
                        boxShadow: "none",
                        border: "none",
                      }}
                      className={`${
                        index < viewableBrands.length - 1 ? "mr-4" : ""
                      }`}
                    >
                      {brand}
                    </Button>
                  </>
                  //ADD A DELETE FUNCTIONALITY
                ))}
                <Button
                  key={`delete-${row.original._id}`}
                  onClick={() => deleteUser(row.original._id)}
                  style={{
                    backgroundColor: "#FF0000",
                    borderRadius: "20px",
                    fontSize: "12px",
                    padding: "6px 12px",
                    color: "#FFFFFF",
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        ),
      },
      //delete user
    ],
    [viewableBrands]
  );

  const deleteUser = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, null);

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      console.log(`User with ID ${userId} deleted`);
      swal.fire({
        title: "User Deleted",
        text: `User with ID ${userId} has been deleted successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      swal.fire({
        title: "Error",
        text: "An error occurred while deleting the user.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleAuthorizeBrand = async (userId, brand) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      // Check if the brand is already authorized for the user
      const isBrandAuthorized = userData.authorizedBrands?.includes(brand);

      let updatedBrands;
      if (isBrandAuthorized) {
        // Remove the brand from authorizedBrands
        updatedBrands = userData.authorizedBrands.filter((b) => b !== brand);
      } else {
        // Add the brand to authorizedBrands
        updatedBrands = [...(userData.authorizedBrands || []), brand];
      }

      // Update the user's authorized brands in Firebase
      await set(userRef, { ...userData, authorizedBrands: updatedBrands });

      // Update the user's authorized brands locally
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, authorizedBrands: updatedBrands }
            : user
        )
      );

      console.log(
        `User with ID ${userId} authorized for brands: ${updatedBrands.join(
          ", "
        )}`
      );
    } catch (error) {
      console.error("Error authorizing brand:", error);
    }
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: users }, useSortBy);

  return (
    <Layout>
      <table
        {...getTableProps()}
        className="min-w-full divide-y divide-gray-200"
      >
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  key={headerGroup.id}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
          {rows.map((row) => {
            prepareRow(row);

            return (
              <tr key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                    key={row.id}
                    {...cell.getCellProps()}
                    className="px-6 py-4 whitespace-nowrap"
                  >
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
};

export default Users;
