// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function ContactModal({
//   open,
//   onClose,
//   customerId,
//   editIndex = null,
//   existingContact,
//   refreshCustomer,
// }) {
//   const [form, setForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     phone: "",
//   });

//     const BASE_URL = import.meta.env.VITE_BACKEND_URL;
//   // Fill form if editing
//   useEffect(() => {
//     if (existingContact) {
//       const [firstName, lastName] = (existingContact.name || "").split(" ");
//       setForm({
//         firstName: firstName || "",
//         lastName: lastName || "",
//         email: existingContact.email || "",
//         phone: existingContact.phone || "",
//       });
//     } else {
//       setForm({
//         firstName: "",
//         lastName: "",
//         email: "",
//         phone: "",
//       });
//     }
//   }, [existingContact]);

//   if (!open) return null;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Admin not logged in");

//       const { firstName, lastName, email, phone } = form;

//       if (!firstName || !lastName || !email || !phone) {
//         return alert("All fields are required");
//       }

//       const payload = { firstName, lastName, email, phone };

//       // Correct API URLs
//       const url =
//         editIndex !== null
//           ? `${BASE_URL}/api/admin/customers/${customerId}/contacts/${editIndex}`
//           : `${BASE_URL}/api/admin/customers/${customerId}/contacts`;

//       // POST for add, PUT for edit
//       if (editIndex !== null) {
//         await axios.put(url, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } else {
//         await axios.post(url, payload, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }

//       refreshCustomer(); // Refresh customer data
//       onClose(); // Close modal
//     } catch (err) {
//       console.error("CONTACT SUBMIT ERROR:", err);
//       alert(err.response?.data?.message || err.message);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white w-96 rounded shadow p-6 relative">
//         <h2 className="font-semibold text-lg mb-4">
//           {editIndex !== null ? "Edit Contact" : "Add Contact"}
//         </h2>

//         <div className="flex gap-2 mb-2">
//           <div className="flex-1">
//             <label className="block text-sm mb-1">First Name</label>
//             <input
//               name="firstName"
//               placeholder="First Name"
//               className="w-full border p-2 rounded"
//               value={form.firstName}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm mb-1">Last Name</label>
//             <input
//               name="lastName"
//               placeholder="Last Name"
//               className="w-full border p-2 rounded"
//               value={form.lastName}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         <div className="mb-2">
//           <label className="block text-sm mb-1">Email</label>
//           <input
//             name="email"
//             placeholder="Email"
//             type="email"
//             className="w-full border p-2 rounded"
//             value={form.email}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="mb-2">
//           <label className="block text-sm mb-1">Phone</label>
//           <input
//             name="phone"
//             placeholder="Phone"
//             type="tel"
//             className="w-full border p-2 rounded"
//             value={form.phone}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="flex justify-end gap-2 mt-5">
//           <button
//             onClick={onClose}
//             className="border px-4 py-1 rounded hover:bg-gray-100"
//           >
//             Close
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import axios from "axios";

export default function ContactModal({
  open,
  onClose,
  customerId,
  editIndex = null,
  existingContact,
  refreshCustomer,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fill form when editing an existing contact
  useEffect(() => {
    if (existingContact) {
      const [firstName, ...lastNameParts] = (
        existingContact.name || ""
      ).split(" ");

      setForm({
        firstName: firstName || "",
        lastName: lastNameParts.join(" "),
        email: existingContact.email || "",
        phone: existingContact.phone || "",
      });
    } else {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }
  }, [existingContact]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch CSRF token
  const getCsrfToken = async () => {
    const response = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
      }
    );

    return response.data.csrfToken;
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Admin not logged in");
      }

      const { firstName, lastName, email, phone } = form;

      if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
        alert("All fields are required");
        return;
      }

      const csrfToken = await getCsrfToken();

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      const url =
        editIndex !== null
          ? `${BASE_URL}/api/admin/customers/${customerId}/contacts/${editIndex}`
          : `${BASE_URL}/api/admin/customers/${customerId}/contacts`;

      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      };

      if (editIndex !== null) {
        await axios.put(url, payload, config);
      } else {
        await axios.post(url, payload, config);
      }

      await refreshCustomer();
      onClose();
    } catch (err) {
      console.error(
        "CONTACT SUBMIT ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-96 rounded shadow p-6 relative">
        <h2 className="font-semibold text-lg mb-4">
          {editIndex !== null ? "Edit Contact" : "Add Contact"}
        </h2>

        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">
              First Name
            </label>
            <input
              name="firstName"
              placeholder="First Name"
              className="w-full border p-2 rounded"
              value={form.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1">
              Last Name
            </label>
            <input
              name="lastName"
              placeholder="Last Name"
              className="w-full border p-2 rounded"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            placeholder="Email"
            type="email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm mb-1">Phone</label>
          <input
            name="phone"
            placeholder="Phone"
            type="tel"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="border px-4 py-1 rounded hover:bg-gray-100"
          >
            Close
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
