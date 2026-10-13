import React from "react";

export default function CustomerViewModal({ customer, onClose }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 relative">
        <h2 className="text-xl font-bold mb-4">Customer Details</h2>
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div><strong>Name:</strong> {customer.name}</div>
          <div><strong>Email:</strong> {customer.email}</div>
          <div><strong>Phone:</strong> {customer.phone}</div>
          <div><strong>City:</strong> {customer.city || "-"}</div>
          <div><strong>State:</strong> {customer.state || "-"}</div>
          <div><strong>Country:</strong> {customer.country || "-"}</div>
          <div><strong>Zip Code:</strong> {customer.zipCode || "-"}</div>
          <div><strong>Customer Type:</strong> {customer.customerType}</div>
          <div className="col-span-2"><strong>Address:</strong> {customer.address || "-"}</div>
          <div className="col-span-2"><strong>Notes:</strong> {customer.notes || "-"}</div>
          <div><strong>Created At:</strong> {new Date(customer.createdAt).toLocaleString()}</div>
          <div><strong>Updated At:</strong> {new Date(customer.updatedAt).toLocaleString()}</div>
        </div>

        <div className="mt-4 text-right">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
