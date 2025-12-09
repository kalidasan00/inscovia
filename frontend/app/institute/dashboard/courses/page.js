"use client";
import { useState } from "react";
import institutes from "../../../../data/institutes.json";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

export default function ManageCourses() {
  const [courses, setCourses] = useState(institutes[0].courses);
  const [newCourse, setNewCourse] = useState("");

  const addCourse = () => {
    if (!newCourse.trim()) return;
    setCourses([...courses, newCourse]);
    setNewCourse("");
  };

  const removeCourse = (name) => {
    setCourses(courses.filter(c => c !== name));
  };

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold">Manage Courses</h1>

        <div className="bg-white p-6 rounded-lg shadow mt-6 space-y-4">

          <div className="flex gap-3">
            <input
              className="border px-3 py-2 rounded-md w-full"
              placeholder="Add new course"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
            />
            <button onClick={addCourse} className="px-4 py-2 bg-accent text-white rounded-md">
              Add
            </button>
          </div>

          <ul className="space-y-2">
            {courses.map((course, idx) => (
              <li key={idx} className="flex justify-between items-center border p-2 rounded">
                {course}
                <button onClick={() => removeCourse(course)} className="text-red-500 text-sm">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </>
  );
}
