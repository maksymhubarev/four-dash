import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { ref, get, push, update, remove } from "firebase/database";
import { getDatabase } from "firebase/database";
import { withSwal } from "react-sweetalert2";

const database = getDatabase(); // Replace this with your Firebase configuration

function Categories({ swal }) {
  const [editedBrand, setEditedBrand] = useState(null);
  const [name, setName] = useState("");
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  function fetchBrands() {
    const brandsRef = ref(database, "category");
    get(brandsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const brandsData = snapshot.val();
        const brandsArray = Object.keys(brandsData).map((id) => ({
          id,
          name: brandsData[id].name,
        }));

        setBrands(brandsArray);
      } else {
        console.log("No data available");
      }
    });
  }

  async function saveBrand(ev) {
    ev.preventDefault();

    const data = {
      name,
    };

    if (editedBrand) {
      const brandRef = ref(database, `category/${editedBrand.id}`);
      await update(brandRef, data);
      setEditedBrand(null);
    } else {
      const newBrandRef = push(ref(database, "category"));
      await update(newBrandRef, data);
    }

    setName("");
    fetchBrands();
  }

  function deleteBrand(brand) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete ${brand.name}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const brandRef = ref(database, `category/${brand.id}`);
          await remove(brandRef);
          fetchBrands();
        }
      });
  }

  return (
    <Layout>
      <h1>category</h1>
      <label>
        {editedBrand ? `Edit brand ${editedBrand.name}` : "Create new brand"}
      </label>
      <form onSubmit={saveBrand}>
        <div className="mb-2">
          <label className="block">Brand Name</label>
          <input
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter brand name"
            required
          />
        </div>
        <div className="flex gap-1">
          {editedBrand && (
            <button
              type="button"
              onClick={() => {
                setEditedBrand(null);
                setName("");
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>
      {!editedBrand && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Brand name</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {brands.length > 0 &&
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td>{brand.name}</td>
                  <td>
                    <button
                      onClick={() => deleteBrand(brand)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
