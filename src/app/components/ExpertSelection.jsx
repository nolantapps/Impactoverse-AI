"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  Sparkles,
  Crown,
  Heart,
  Star,
  Zap,
  Shield,
  Gem,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/utils/getCookies";

// Map icon name from DB to actual component
const iconMap = {
  User,
  Sparkles,
  Crown,
  Heart,
  Star,
  Zap,
  Shield,
  Gem,
};

function AvatarCard({ avatar }) {
  const router = useRouter();

  const handleClick = () => {
    // Store mentor id in localStorage
    localStorage.setItem("selectedMentorId", avatar._id);
    router.push("/route/experience");
  };

  const IconComponent = iconMap[avatar.icon] || User; // fallback to User

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden">
        <div
          className={`h-32 bg-gradient-to-br ${avatar.gradient} flex items-center justify-center relative`}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-all duration-300">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-purple-800 mb-2 group-hover:text-purple-600 transition-colors">
            {avatar.title}
          </h3>
          <p className="text-purple-600 text-sm leading-relaxed">
            {avatar.description}
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-purple-50 rounded-lg p-3 text-center group-hover:bg-purple-100 transition-colors duration-300">
            <span className="text-purple-700 font-semibold text-sm">
              Enter 3D Experience
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpertSelection() {
  const [mentors, setMentors] = useState([]);
  const router = useRouter();

  // fetching all the users mentors from the backend
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = await getCookie("token"); // or from cookies, wherever you store it

        const res = await fetch("http://localhost:8080/mentor", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Send the token
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setMentors(data.data); // since your controller returns { message, data }
      } catch (err) {
        console.error("Error fetching mentors:", err);
      }
    };

    fetchMentors();
  }, []);

  const handleDelete = async (mentorId) => {
    try {
      const res = await fetch(`/api/mentor/${mentorId}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMentors((prev) => prev.filter((mentor) => mentor._id !== mentorId));
      } else {
        console.error("Failed to delete mentor");
      }
    } catch (error) {
      console.error("Error deleting mentor:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">
              Choose Your Expert
            </h1>
            <p className="text-xl text-purple-600 max-w-2xl mx-auto leading-relaxed">
              Select your digital identity and step into an immersive 3D
              learning experience. Each Expert represents a unique journey of
              discovery and growth.
            </p>

            {/* Create Button */}
            <button
              onClick={() => router.push("/route/mentorCreate")}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              + Create Expert
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mentors.map((mentor) => (
            <div key={mentor._id} className="relative">
              <AvatarCard avatar={mentor} />
              <button
                onClick={() => handleDelete(mentor._id)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExpertSelection;
