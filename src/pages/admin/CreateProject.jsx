
import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { FaArrowLeft, FaUserPlus, FaCheckCircle } from "react-icons/fa";

export default function CreateProject({ setActivePage }) {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [customers, setCustomers] = useState([]);
  const [customerContacts, setCustomerContacts] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    customerName: null,
    projectName: "",
    invoicingClientContact: null,
    clientProjectLeader: null,
    projectManager: null,
    salesContact: null,
    audienceType: null,
    category: null,
    deviceType: null,
    projectType: "",
    redirectType: null,
    projectURL: "",
  });

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // const fetchUsers = async () => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/api/admin/employees`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setUsers(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const fetchUsers = async () => {
  try {
    const res = await axios.get("/api/admin/employees", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Flatten grouped object
    const usersArray = Object.values(res.data).flat(); // flat() merges arrays

    setUsers(usersArray); // now users is an array
  } catch (err) {
    console.error(err);
  }
};

  /* ================= OPTIONS ================= */
  const audience = [
    { value: "b2b", label: "B2B" },
    { value: "b2c", label: "B2C" },
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
    { value: "static", label: "Static" },
    { value: "dynamic", label: "Dynamic" },
  ];

  const projectTypeoptions=[
              { value: "Adhoc", label: "Adhoc" },
              { value: "Tracker", label: "Tracker" },
              { value: "IHUT", label: "IHUT" },
              { value: "Community Recruit", label: "Community Recruit" },
              { value: "Panel Sourcing", label: "Panel Sourcing" },
              { value: "Qual", label: "Qual" },
              { value: "IR Check", label: "IR Check" },
              { value: "Other", label: "Other" },
            ]

  /* ================= HELPER ================= */
  const getUserNameById = (id) => {
    if (!id) return null;
    const user = users.find((u) => u._id.toString() === id.toString());
    return user ? `${user.firstName} ${user.lastName}` : null;
  };

  const getContactName = (contact) => {
    if (!contact) return null;
    return typeof contact === "string" ? contact : contact.value;
  };

  const getUserLabel = (u) => {
  const firstName = u.firstName || "";
  const lastName = u.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    u.name ||
    u.username ||
    u.email ||
    "Unnamed User"
  );
};

  /* ================= SUBMIT ================= */
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const payload = {
  //     customerName: form.customerName?.label || "",
  //     projectName: form.projectName,
  //     invoicingClientContact: getContactName(form.invoicingClientContact),
  //     clientProjectLeader: getContactName(form.clientProjectLeader),
  //     projectManager: getUserNameById(form.projectManager?.value),
  //     salesContact: getUserNameById(form.salesContact?.value),
  //     audienceType: form.audienceType?.value || "",
  //     category: form.category?.value || "",
  //     deviceType: form.deviceType?.value || "",
  //     projectType: form.projectType || "",
  //     redirectType: form.redirectType?.value || "",
  //     projectURL: form.projectURL,
  //   };

  //   try {
  //     await axios.post(`${BASE_URL}/api/admin/projects/`, payload, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     alert("✅ Project Created Successfully");
  //     console.log("Payload sent:", payload);
  //   } catch (err) {
  //     console.error(err);
  //     alert("❌ Failed to create project");
  //   }
  // };

 
const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    customerName: form.customerName?.label || "",
    projectName: form.projectName,

    invoicingClientContact: getContactName(
      form.invoicingClientContact
    ) || "",

    clientProjectLeader: getContactName(
      form.clientProjectLeader
    ) || "",

    projectManager:
      getUserNameById(form.projectManager?.value) || "",

    salesContact:
      getUserNameById(form.salesContact?.value) || "",

    audienceType: form.audienceType?.value || "",
    category: form.category?.value || "",
    deviceType: form.deviceType?.value || "",
    projectType: form.projectType || "",
    redirectType: form.redirectType?.value || "",
    projectURL: form.projectURL,
  };

  try {
    if (!token) {
      throw new Error("Login session missing. Please log in again.");
    }

    // Step 1: Fetch CSRF token
    const csrfResponse = await axios.get(
      `${BASE_URL}/api/csrf-token`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const csrfToken = csrfResponse.data?.csrfToken;

    if (!csrfToken) {
      throw new Error("CSRF token not received from server.");
    }

    // Step 2: Create project with CSRF token
    const response = await axios.post(
      `${BASE_URL}/api/admin/projects/`,
      payload,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
      }
    );

    alert("Project Created Successfully");
    console.log("Payload sent:", payload);

    // Optional: return to project list after success
    // setActivePage("projectList");

  } catch (err) {
    console.error("CREATE PROJECT ERROR:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });

    alert(
      err.response?.data?.message ||
      err.response?.data?.msg ||
      err.response?.data?.error ||
      err.message ||
      "Failed to create project."
    );
  }
};

  return (
    <div className="max-w-6xl mx-auto bg-white shadow rounded p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <button
          onClick={() => setActivePage("projectList")}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <FaArrowLeft /> Back To Project List
        </button>

        <button
          onClick={() => setActivePage("addCustomer")}
          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
        >
          <FaUserPlus /> Add New Customer
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Create New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TwoCol>
          {/* Customer Dropdown */}
          <Choose
            label="Customer Name"
            value={form.customerName}
            options={customers.map((cust) => ({
              value: cust._id,
              label: cust.customerName,
              contacts: cust.contacts,
            }))}
            onChange={(selected) => {
              setForm({
                ...form,
                customerName: selected,
                invoicingClientContact: null,
                clientProjectLeader: null,
              });
              setCustomerContacts(selected.contacts || []);
            }}
          />

          <Input
            label="Project Name"
            value={form.projectName}
            onChange={(e) => setForm({ ...form, projectName: e.target.value })}
          />
        </TwoCol>

        <TwoCol>
          <Choose
            label="Invoicing Client Contact"
            value={form.invoicingClientContact}
            options={customerContacts.map((c) => ({
              value: c.name,
              label: c.name,
            }))}
            onChange={(v) => setForm({ ...form, invoicingClientContact: v })}
          />

          <Choose
            label="Client Project Leader"
            value={form.clientProjectLeader}
            options={customerContacts.map((c) => ({
              value: c.name,
              label: c.name,
            }))}
            onChange={(v) => setForm({ ...form, clientProjectLeader: v })}
          />
        </TwoCol>

        <TwoCol>
          {/* <Choose
            label="Project Manager"
            value={form.projectManager}
            options={users.map((u) => ({
              value: u._id,
              label: `${u.firstName} ${u.lastName}`,
            }))}
            onChange={(v) => setForm({ ...form, projectManager: v })}
          />

          <Choose
            label="Sales Contact"
            value={form.salesContact}
            options={users.map((u) => ({
              value: u._id,
              label: `${u.firstName} ${u.lastName}`,
            }))}
            onChange={(v) => setForm({ ...form, salesContact: v })}
          /> */}
          
<Choose
  label="Project Manager"
  value={form.projectManager}
  options={users.map((u) => ({
    value: u._id,
    label: getUserLabel(u),
  }))}
  onChange={(v) =>
    setForm({ ...form, projectManager: v })
  }
/>

<Choose
  label="Sales Contact"
  value={form.salesContact}
  options={users.map((u) => ({
    value: u._id,
    label: getUserLabel(u),
  }))}
  onChange={(v) =>
    setForm({ ...form, salesContact: v })
  }
/>

        </TwoCol>

        <TwoCol>
          <Choose
            label="Audience Type"
            value={form.audienceType}
            options={audience}
            onChange={(v) => setForm({ ...form, audienceType: v })}
          />

 <Choose
    label="Category"
    value={form.category}
    options={categories}
    onChange={(v) => setForm({ ...form, category: v })}
  />
          
        </TwoCol>

        <TwoCol>

          <Choose
            label="Device Type Needed"
            value={form.deviceType}
            options={deviceOptions}
            onChange={(v) => setForm({ ...form, deviceType: v })}
          />

          <Choose
            label="Project URL Redirect Type"
            value={form.redirectType}
            options={redirectOptions}
            onChange={(v) => setForm({ ...form, redirectType: v })}
          />

          
        </TwoCol>
            <TwoCol>
              <Choose
            label="Project Type"
            value={
              form.projectType ? { value: form.projectType, label: form.projectType } : null
            }
            options={projectTypeoptions}
            onChange={(v) => setForm({ ...form, projectType: v?.value || "" })}
          />

          <Input
          label="Project URL"
          value={form.projectURL}
          onChange={(e) => setForm({ ...form, projectURL: e.target.value })}
        />
            </TwoCol>
        

        <div className="text-right pt-4">
          <button className="bg-teal-500 text-white px-8 py-2 rounded hover:bg-teal-600">
            Submit Project
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

const TwoCol = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Input = ({ label, value, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-medium">{label}</label>
    <input value={value} onChange={onChange} className="w-full border rounded p-2 mt-1 pr-10" />
    {value && <FaCheckCircle className="absolute right-3 top-[38px] text-green-500" />}
  </div>
);

const Choose = ({ label, options, value, onChange }) => (
  <div className="relative">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Select options={options} value={value} onChange={onChange} isMulti={false} placeholder="Select..." />
    {value && <FaCheckCircle className="absolute right-3 top-[38px] text-green-500" />}
  </div>
);
