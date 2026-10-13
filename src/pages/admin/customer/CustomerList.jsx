/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import ContactModal from "./ContactModal";
import CustomerEditModal from "./CustomerEditModal";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  // ================= FETCH =================
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
      if (res.data.length && !selectedCustomer) {
        setSelectedCustomer(res.data[0]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ================= FILTER =================
  const filteredCustomers = customers.filter((c) =>
    (c.customerName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= HANDLE CONTACT =================
  const handleAddContact = () => {
    setEditIndex(null);
    setEditContact(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact, index) => {
    setEditIndex(index);
    setEditContact(contact);
    setShowContactModal(true);
  };

  // ================= HANDLE CUSTOMER EDIT =================
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // ================= UI =================
  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100">
      {/* ========== LEFT CUSTOMER LIST ========== */}
      <div className="w-1/4 bg-white border-r overflow-y-auto">
        <div className="p-3">
          <input
            placeholder="Find clients"
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredCustomers.map((c) => (
          <div
  key={c._id}
  onClick={() => setSelectedCustomer(c)}
  className={`p-3 cursor-pointer border-l-4 ${
    selectedCustomer?._id === c._id
      ? "border-blue-600 bg-blue-50"
      : "border-transparent"
  }`}
>
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white 
                      flex items-center justify-center font-bold uppercase">
        {(c.customerName || "?").charAt(0)}
      </div>

      {/* Name + location */}
      <div>
        <div className="font-semibold leading-tight">
          {c.customerName || "Unnamed Customer"}
        </div>
        <div className="text-xs text-gray-500">
          {c.city || "-"}, {c.country || "-"}
        </div>
      </div>
    </div>

    <button
      className="text-sm text-blue-600"
      onClick={(e) => {
        e.stopPropagation();
        handleEditCustomer(c);
      }}
    >
      Edit
    </button>
  </div>
</div>

        ))}
      </div>

      {/* ========== RIGHT DETAIL PANEL ========== */}
      {selectedCustomer && (
        <div className="flex-1 p-6 overflow-y-auto">
          {/* HEADER */}
          <h1 className="text-2xl font-bold">
            {selectedCustomer.customerName || "Unnamed Customer"}
          </h1>
          <p className="text-gray-500 mb-6">
            {selectedCustomer.state || "-"}, {selectedCustomer.country || "-"}
          </p>

          {/* BILLING ADDRESS */}
          <div className="bg-white rounded shadow p-5 mb-6">
            <div className="flex justify-between mb-2">
              <h2 className="font-semibold">Billing Address</h2>
              <button
                className="text-blue-600 text-sm"
                onClick={() => handleEditCustomer(selectedCustomer)}
              >
                Edit
              </button>
            </div>
            <p>{selectedCustomer.address1 || "-"}</p>
            <p>{selectedCustomer.address2 || "-"}</p>
            <p>
              {selectedCustomer.city || "-"}, {selectedCustomer.zipCode || "-"}
            </p>
            <p>{selectedCustomer.country || "-"}</p>
          </div>

          {/* CONTACTS */}
          <div className="bg-white rounded shadow p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Contacts</h2>
              <button
                className="text-blue-600 flex items-center gap-1"
                onClick={handleAddContact}
              >
                ➕ Add contact
              </button>
            </div>

            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {selectedCustomer.contacts?.length > 0 ? (
                  selectedCustomer.contacts.map((ct, i) => (
                    <tr key={ct._id || i} className="border-t">
                      <td className="p-2">{ct.name || "-"}</td>
                      <td className="p-2">{ct.email || "-"}</td>
                      <td className="p-2">{ct.phone || "-"}</td>
                      <td className="p-2 text-right">
                        <button onClick={() => handleEditContact(ct, i)}>✏️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center text-gray-400">
                      No contacts added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== MODALS ========== */}
      {selectedCustomer && (
        <>
          {/* Contact Modal */}
          <ContactModal
            open={showContactModal}
            onClose={() => setShowContactModal(false)}
            customerId={selectedCustomer._id}
            editIndex={editIndex}
            existingContact={editContact}
            refreshCustomer={fetchCustomers}
          />

          {/* Customer Edit Modal */}
          {showCustomerModal && (
            <CustomerEditModal
              customer={selectedCustomer}
              onClose={() => setShowCustomerModal(false)}
              onUpdated={fetchCustomers}
            />
          )}
        </>
      )}
    </div>
  );
}



