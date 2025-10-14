
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;


export default function RSVPModal({ onClose, initialGoing = true }) {
  const [form, setForm] = useState({ name: "", phone: "", company: "", position: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter name and phone");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/rsvp`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        position: form.position.trim(),
        going: Boolean(initialGoing), 
      });
      toast.success(initialGoing ? "Marked as Going" : "Marked as Can’t Go");
      onClose(true); 
    } catch (e) {
      toast.error(e.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-black p-8 border border-white/30 w-full max-w-md">
        <h2 className="text-white text-center mb-6">
          {initialGoing ? "Confirm Attendance" : "Can’t Go"}
        </h2>

        <input
          type="text"
          placeholder="სახელი და გვარი"
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-4"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="ტელეფონის ნომერი"
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-4"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="კომპანია"
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-4"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          type="text"
          placeholder="თანამდებობა"
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-4"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 font-bold ${initialGoing ? "bg-white text-black" : "bg-red-500 text-white"} disabled:opacity-60`}
        >
          {loading ? "გაგზავნა..." : initialGoing ? "გაგზავნა (მოვდივარ)" : "გაგზავნა (ვერ მოვდივარ)"}
        </button>

        <button onClick={() => onClose(false)} className="w-full text-white/60 text-sm mt-3">
          Cancel
        </button>
      </div>
    </div>
  );
}
