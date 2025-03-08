import { useState } from "react";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = `https://chatappserver-kjob.onrender.com/join`;

export default function LoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (username: string) => {
    if (!username.trim()) {
      toast.warn("⚠️ Please enter a name!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const text = await res.text();
      console.log("🔹 Raw API Response:", text);

      if (!res.ok) {
        throw new Error(`Login failed: ${res.status} - ${text}`);
      }

      try {
        const data = JSON.parse(text);
        console.log("🔹 Parsed API Response:", data);

        if (data.uuid) {
          localStorage.setItem("uuid", data.uuid);
          localStorage.setItem("user", username);
          console.log("✅ Name stored in localStorage:", username);

          toast.success("✅ Login successful!");
          setTimeout(() => router.push("/"), 1000); // Redirect after success
        } else {
          toast.error("❌ No UUID returned in API response.");
        }
      } catch (jsonError) {
        toast.error("❌ JSON Parsing Failed. Check console for details.");
        console.error("❌ JSON Parsing Failed:", jsonError, "Response:", text);
      }
    } catch (error) {
      toast.error(`❌ Login failed: ${error.message}`);
      console.error("❌ Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6">
          Login as Anonymous
        </h1>
        <input
          type="text"
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="w-full mt-4 p-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center"
          onClick={() => handleLogin(name)}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-spin border-2 border-indigo-600 border-t-transparent rounded-full w-5 h-5"></span>
          ) : (
            "Login"
          )}
        </button>
      </div>
    </div>
  );
}
