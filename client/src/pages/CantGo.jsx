
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

const CantGo = ({ onClose }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", position: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please enter name, phone and email");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/guests`, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        position: form.position.trim(),
        going: false, 
      });
      onClose(); 
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-black/90 p-8 border border-white/20 w-full max-w-lg text-center relative">
        <p className="text-white/80 mb-4">
          მადლობთ თქვენს პასუხს.<br />
          თუ გსურთ, რომ ადრე მიიღოთ წვდომა მომავალ ღონისძიებებზე, სპეციალურ შეთავაზებებსა და ექსკლუზიურ სიახლეებზე, გთხოვთ, გამოიწეროთ არხი.
        </p>

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
          type="email"
          placeholder="ელექტრონული ფოსტა"
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-4"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
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
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-6"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white text-black py-3 font-bold tracking-wide disabled:opacity-60"
        >
          {loading ? "გაგზავნა..." : "გაგზავნა"}
        </button>

        <button onClick={onClose} className="w-full text-white/60 text-sm mt-3">
          გაუქმება
        </button>
      </div>
    </div>
  );
};

export default CantGo;
