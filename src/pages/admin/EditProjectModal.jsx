/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { FaTimes, FaCheck } from "react-icons/fa";

export default function EditProjectModal({ initialData, onSubmit, onClose }) {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const projectId = initialData._id;

  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerContacts, setCustomerContacts] = useState([]);

  // Options
  const audience = [
    { value: "B2B", label: "B2B" },
    { value: "B2C", label: "B2C" },
    { value: "Consumer", label: "Consumer" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Other", label: "Other" },
  ];

  const categories = [
    { value: "Automotive", label: "Automotive" },
  { value: "Beauty/Cosmetics", label: "Beauty/Cosmetics" },
  { value: "Beverages - Alcoholic", label: "Beverages - Alcoholic" },
  { value: "Beverages - Non Alcoholic", label: "Beverages - Non Alcoholic" },
  { value: "Education", label: "Education" },
  { value: "Electronics/Computer/Software", label: "Electronics/Computer/Software" },
  { value: "Entertainment (Movies, Music, TV, etc.)", label: "Entertainment (Movies, Music, TV, etc.)" },
  { value: "Explicit Content", label: "Explicit Content" },
  { value: "Fashion/Clothing", label: "Fashion/Clothing" },
  { value: "Financial Services/Insurance", label: "Financial Services/Insurance" },
  { value: "Food/Snacks", label: "Food/Snacks" },
  { value: "Gambling/Lottery", label: "Gambling/Lottery" },
  { value: "Gaming", label: "Gaming" },
  { value: "HRDM", label: "HRDM" },
  { value: "Healthcare/Pharmaceuticals", label: "Healthcare/Pharmaceuticals" },
  { value: "Home (Utilities/Appliances)", label: "Home (Utilities/Appliances)" },
  { value: "Home Entertainment (DVD,VHS)", label: "Home Entertainment (DVD,VHS)" },
  { value: "Home Improvement/Real Estate/Construction", label: "Home Improvement/Real Estate/Construction" },
  { value: "IT (Servers, Databases, Etc.)", label: "IT (Servers, Databases, Etc.)" },
  { value: "ITDM", label: "ITDM" },
  { value: "Job/Career", label: "Job/Career" },
  { value: "Marketing/Advertising", label: "Marketing/Advertising" },
  { value: "Other", label: "Other" },
  { value: "Other-B2B", label: "Other-B2B" },
  { value: "Parenting", label: "Parenting" },
  { value: "Personal Care/toiletries", label: "Personal Care/toiletries" },
  { value: "Pets", label: "Pets" },
  { value: "Politics", label: "Politics" },
  { value: "Publishing (Newspaper, Magazines, Books)", label: "Publishing (Newspaper, Magazines, Books)" },
  { value: "Religion", label: "Religion" },
  { value: "Restaurants", label: "Restaurants" },
  { value: "Sensitive Content", label: "Sensitive Content" },
  { value: "Shopping", label: "Shopping" },
  { value: "Social Media", label: "Social Media" },
  { value: "Sports/Outdoor", label: "Sports/Outdoor" },
  { value: "Telecommunications (Phone, Cell Phone, Cable)", label: "Telecommunications (Phone, Cell Phone, Cable)" },
  { value: "Tobacco (Smokers)", label: "Tobacco (Smokers)" },
  { value: "Toys", label: "Toys" },
  { value: "Transportation/Shipping", label: "Transportation/Shipping" },
  { value: "Travel", label: "Travel" },
  { value: "Website/Internet/E-Commerce", label: "Website/Internet/E-Commerce" },
  ];

  const deviceOptions = [
    { value: "All", label: "All" },
    { value: "Mobile Only", label: "Mobile Only" },
    { value: "Desktop Only", label: "Desktop Only" },
  ];

  const redirectOptions = [
    { value: "Static", label: "Static" },
    { value: "Dynamic", label: "Dynamic" },
  ];

  const projectTypeOptions = [
    { value: "Adhoc", label: "Adhoc" },
              { value: "Tracker", label: "Tracker" },
              { value: "IHUT", label: "IHUT" },
              { value: "Community Recruit", label: "Community Recruit" },
              { value: "Panel Sourcing", label: "Panel Sourcing" },
              { value: "Qual", label: "Qual" },
              { value: "IR Check", label: "IR Check" },
              { value: "Other", label: "Other" },
  ];

  // Form state stores React Select objects
  const [form, setForm] = useState({
    customerName: null,
    projectName: initialData.projectName || "",
    invoicingClientContact: null,
    clientProjectLeader: null,
    projectManager: null,
    salesContact: null,
    audienceType: null,
    category: null,
    deviceType: null,
    projectType: initialData.projectType || "",
    redirectType: null,
    projectURL: initialData.projectURL || "",
    status: initialData.status || "Live",
  });

  useEffect(() => {
    fetchUsers();
    fetchCustomers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);

      const findUserOption = (name) => {
        const user = res.data.find(u => `${u.firstName} ${u.lastName}` === name);
        return user ? { value: user._id, label: `${user.firstName} ${user.lastName}` } : null;
      };

      setForm(prev => ({
        ...prev,
        projectManager: findUserOption(initialData.projectManager?.[0]),
        salesContact: findUserOption(initialData.salesContact?.[0]),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);

      const cust = res.data.find(c => c.customerName === initialData.customerName);
      setForm(prev => ({
        ...prev,
        customerName: cust ? { value: cust._id, label: cust.customerName, contacts: cust.contacts } : null,
        invoicingClientContact: initialData.invoicingClientContact?.[0] ? { value: initialData.invoicingClientContact[0], label: initialData.invoicingClientContact[0] } : null,
        clientProjectLeader: initialData.clientProjectLeader?.[0] ? { value: initialData.clientProjectLeader[0], label: initialData.clientProjectLeader[0] } : null,
        audienceType: initialData.audienceType?.[0] ? { value: initialData.audienceType[0], label: initialData.audienceType[0] } : null,
        category: initialData.category?.[0] ? { value: initialData.category[0], label: initialData.category[0] } : null,
        deviceType: initialData.deviceType?.[0] ? { value: initialData.deviceType[0], label: initialData.deviceType[0] } : null,
        redirectType: initialData.redirectType?.[0] ? { value: initialData.redirectType[0], label: initialData.redirectType[0] } : null,
      }));

      setCustomerContacts(cust?.contacts || []);
    } catch (err) {
      console.error(err);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   // Convert React Select objects into array values
  //   const payload = {
  //     customerName: form.customerName?.label || "",
  //     projectName: form.projectName,
  //     invoicingClientContact: form.invoicingClientContact ? [form.invoicingClientContact.value] : [],
  //     clientProjectLeader: form.clientProjectLeader ? [form.clientProjectLeader.value] : [],
  //     projectManager: form.projectManager ? [`${users.find(u => u._id === form.projectManager.value)?.firstName} ${users.find(u => u._id === form.projectManager.value)?.lastName}`] : [],
  //     salesContact: form.salesContact ? [`${users.find(u => u._id === form.salesContact.value)?.firstName} ${users.find(u => u._id === form.salesContact.value)?.lastName}`] : [],
  //     audienceType: form.audienceType ? [form.audienceType.value] : [],
  //     category: form.category ? [form.category.value] : [],
  //     deviceType: form.deviceType ? [form.deviceType.value] : [],
  //     redirectType: form.redirectType ? [form.redirectType.value] : [],
  //     projectType: form.projectType,
  //     projectURL: form.projectURL,
  //     status: form.status,
  //   };

  //   try {
  //     const { data } = await axios.put(`${BASE_URL}/api/admin/projects/${projectId}`, payload, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     onSubmit(data.project);
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert(err.response?.data?.msg || "Failed to update project.");
  //   }
  // };

  
const handleSubmit = async (e) => {
  e.preventDefault();

  const findUserName = (userId) => {
    const user = users.find((u) => u._id === userId);

    return user
      ? `${user.firstName} ${user.lastName}`
      : "";
  };

  // Convert React Select objects into API payload
  const payload = {
    customerName: form.customerName?.label || "",
    projectName: form.projectName,

    invoicingClientContact: form.invoicingClientContact
      ? [form.invoicingClientContact.value]
      : [],

    clientProjectLeader: form.clientProjectLeader
      ? [form.clientProjectLeader.value]
      : [],

    projectManager: form.projectManager
      ? [findUserName(form.projectManager.value)]
      : [],

    salesContact: form.salesContact
      ? [findUserName(form.salesContact.value)]
      : [],

    audienceType: form.audienceType
      ? [form.audienceType.value]
      : [],

    category: form.category
      ? [form.category.value]
      : [],

    deviceType: form.deviceType
      ? [form.deviceType.value]
      : [],

    redirectType: form.redirectType
      ? [form.redirectType.value]
      : [],

    projectType: form.projectType,
    projectURL: form.projectURL,
    status: form.status,
  };

  try {
    if (!token) {
      throw new Error("Authentication token missing. Please log in again.");
    }

    // Step 1: Get a fresh CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const csrfToken = csrfResponse.data.csrfToken;

    if (!csrfToken) {
      throw new Error("Unable to obtain CSRF token.");
    }

    // Step 2: Update project using the CSRF token
    const { data } = await axios.put(
      `${BASE_URL}/api/admin/projects/${projectId}`,
      payload,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    onSubmit(data.project);
    onClose();
  } catch (err) {
    console.error("UPDATE PROJECT ERROR:", {
      status: err.response?.status,
      response: err.response?.data,
      message: err.message,
    });

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.response?.data?.error ||
      err.message ||
      "Failed to update project."
    );
  }
};

  const renderCheck = (fieldValue) => fieldValue ? <FaCheck className="text-green-500 inline ml-1" /> : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-4 overflow-y-auto max-h-[90vh] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          <FaTimes size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-3">Edit Project</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Customer */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Customer {renderCheck(form.customerName)}
            </label>
            <Select
              options={customers.map(c => ({ value: c._id, label: c.customerName, contacts: c.contacts }))}
              value={form.customerName}
              onChange={v => {
                setForm(prev => ({ ...prev, customerName: v, invoicingClientContact: null, clientProjectLeader: null }));
                setCustomerContacts(v.contacts || []);
              }}
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Project Name {renderCheck(form.projectName)}
            </label>
            <input type="text" name="projectName" value={form.projectName} onChange={e => setForm(prev => ({ ...prev, projectName: e.target.value }))} className="w-full border rounded px-2 py-1 text-sm" required />
          </div>

          {/* Project URL */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Project URL {renderCheck(form.projectURL)}
            </label>
            <input type="text" name="projectURL" value={form.projectURL} onChange={e => setForm(prev => ({ ...prev, projectURL: e.target.value }))} className="w-full border rounded px-2 py-1 text-sm" />
          </div>

          {/* Project Type */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Project Type {renderCheck(form.projectType)}
            </label>
            <Select
              options={projectTypeOptions}
              value={projectTypeOptions.find(p => p.value === form.projectType)}
              onChange={v => setForm(prev => ({ ...prev, projectType: v.value }))}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Status {renderCheck(form.status)}
            </label>
            <Select
              options={[{ value: "Live", label: "Live" }, { value: "Paused", label: "Paused" }, { value: "Complete", label: "Complete" }]}
              value={{ value: form.status, label: form.status }}
              onChange={v => setForm(prev => ({ ...prev, status: v.value }))}
            />
          </div>

          {/* Customer Contacts */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Invoicing Client Contact {renderCheck(form.invoicingClientContact)}
            </label>
            <Select
              options={customerContacts.map(c => ({ value: c.name, label: c.name }))}
              value={form.invoicingClientContact}
              onChange={v => setForm(prev => ({ ...prev, invoicingClientContact: v }))}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Client Project Leader {renderCheck(form.clientProjectLeader)}
            </label>
            <Select
              options={customerContacts.map(c => ({ value: c.name, label: c.name }))}
              value={form.clientProjectLeader}
              onChange={v => setForm(prev => ({ ...prev, clientProjectLeader: v }))}
            />
          </div>

          {/* Users */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Project Manager {renderCheck(form.projectManager)}
            </label>
            <Select
              options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }))}
              value={form.projectManager}
              onChange={v => setForm(prev => ({ ...prev, projectManager: v }))}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Sales Contact {renderCheck(form.salesContact)}
            </label>
            <Select
              options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }))}
              value={form.salesContact}
              onChange={v => setForm(prev => ({ ...prev, salesContact: v }))}
            />
          </div>

          {/* Audience Type */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Audience Type {renderCheck(form.audienceType)}
            </label>
            <Select
              options={audience}
              value={form.audienceType}
              onChange={v => setForm(prev => ({ ...prev, audienceType: v }))}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Category {renderCheck(form.category)}
            </label>
            <Select
              options={categories}
              value={form.category}
              onChange={v => setForm(prev => ({ ...prev, category: v }))}
            />
          </div>

          {/* Device Type */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Device Type {renderCheck(form.deviceType)}
            </label>
            <Select
              options={deviceOptions}
              value={form.deviceType}
              onChange={v => setForm(prev => ({ ...prev, deviceType: v }))}
            />
          </div>

          {/* Redirect Type */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Redirect Type {renderCheck(form.redirectType)}
            </label>
            <Select
              options={redirectOptions}
              value={form.redirectType}
              onChange={v => setForm(prev => ({ ...prev, redirectType: v }))}
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-2 mt-3">
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Update</button>
            <button type="button" onClick={onClose} className="bg-gray-300 text-black px-3 py-1 rounded text-sm hover:bg-gray-400">Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}
