"use client";
import React, { useEffect, useState } from "react";
import { getCookie } from "@/utils/getCookies";
import TestCreate from "@/app/components/TestCreate";

export default function CreatePage() {
  const [role, setRole] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getCookie("token");

        const res = await fetch("http://localhost:8080/data/config", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        // ✅ Assuming API returns something like: { user: { role: "player" } }
        setRole(data?.role || "player");
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user role");
      }
    };

    fetchUser();
  }, []);

  // 🕓 While fetching
  if (!role && !error) return <p>Loading...</p>;

  // ❌ Show error popup if player
  if (role === "player") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl max-w-sm text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>Player is not allowed to create mentor</p>
        </div>
      </div>
    );
  }

  // ✅ Otherwise, allow access
  if (role !== "player") {
    return <TestCreate />;
  }

  return null;
}
