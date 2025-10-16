
import { useState } from "react";
import axios from "axios";
import useEventStore from "../store/eventStore";
import useSettingsStore from "../store/settingsStore";
import { buildGoogleCalendarUrl } from "../utils/calendar";

const API_URL = import.meta.env.VITE_API_URL || "";

const Going = ({ onClose }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", company: "", position: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { activeEvent } = useEventStore();
  const { logoText, subtitleText, dressCodeLabel, addressLabel } = useSettingsStore();

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please enter name, phone and email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`/api/guests`,{
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        position: form.position.trim(),
        going: true,
      });
      console.log("Saved:", res.data);
      
      const evt = activeEvent || {};
      const start = evt?.date ? new Date(evt.date) : null;
      const dateLine = start && !Number.isNaN(start.getTime())
        ? start.toLocaleString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
        : '';

      const calendarUrl = buildGoogleCalendarUrl({
        title: evt.title,
        dateText: evt.date,
        endDate: evt.endDate,
        durationMinutes: 240,
        location: evt.address,
        description: [
          logoText || subtitleText || 'EXPECT THE UNEXPECTED',
          dateLine,
          evt.title,
          '\u00A0', 
          
          'Event Agenda:',
          ...(Array.isArray(evt.agenda)
            ? evt.agenda.map(a => `${a.time} ${a.title}${a.subtitle ? ` (${a.subtitle})` : ''}`)
            : []),
          '\u00A0',
          
          evt.dressCode ? `${dressCodeLabel || 'Dress Code'}: ${evt.dressCode}` : '',
          evt.address ? `${addressLabel || 'Address'}: ${evt.address}` : '',
          evt.guestInfo || ''
        ].filter(Boolean).join("\n")
      });
      window.open(calendarUrl, "_blank", "noopener,noreferrer");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-black p-8 border border-white/30 w-full max-w-md">
        <h2 className="text-white text-center mb-6">Confirm Attendance</h2>

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
          className="w-full p-3 bg-transparent border border-white/30 text-white mb-4"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-white text-black py-3 font-bold disabled:opacity-60"
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

export default Going;
