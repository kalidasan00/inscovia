"use client";
import { useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function RegisterInstitute() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    description: "",
    password: ""
  });

  const update = (key, val) => setForm({ ...form, [key]: val });

  const submitForm = (e) => {
    e.preventDefault();
    console.log("New Institute (STATIC):", form);
    alert("Institute registered (static mode only)\nCheck console for data.");
  };

  return (
    <>
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Register Your Institute</h1>
        <p className="text-gray-600 mt-2">
          Add your institute to Inscovia and manage your courses.
        </p>

        <form onSubmit={submitForm} className="mt-6 bg-white p-6 rounded-lg shadow space-y-4">

          <div>
            <label className="text-sm">Institute Name</label>
            <input
              className="w-full border px-3 py-2 rounded-md"
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded-md"
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Password (TEMP STATIC)</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded-md"
              onChange={(e) => update("password", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Location</label>
            <input
              className="w-full border px-3 py-2 rounded-md"
              onChange={(e) => update("location", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm">Short Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded-md"
              rows="3"
              onChange={(e) => update("description", e.target.value)}
            ></textarea>
          </div>

          <button className="w-full bg-accent text-white py-2 rounded-md">
            Register
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}
