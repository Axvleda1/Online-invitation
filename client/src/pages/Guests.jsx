import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL || "";

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

const Guests = () => {
  const [rawGuests, setRawGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all"); 
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [refreshTick, setRefreshTick] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); 
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 250);
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [search]);

  
  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        setError("");
        let res;
        try {
          res = await axios.get(`${API_URL}/api/guests`, { withCredentials: true });
        } catch {
          res = await axios.get(`/api/guests`);
        }
        const payload = res.data;
        const guests = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.guests)
          ? payload.guests
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.guests)
          ? payload.data.guests
          : [];
        setRawGuests(guests);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || "სტუმრების ჩამოტვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [refreshTick]);

  const counts = useMemo(() => {
    const going = rawGuests.filter((g) => g.going === true).length;
    const notGoing = rawGuests.filter((g) => g.going === false).length;
    return { total: rawGuests.length, going, notGoing };
  }, [rawGuests]);

  const filteredGuests = useMemo(() => {
    let list = [...rawGuests];
    if (filter === "going") list = list.filter((g) => g.going === true);
    else if (filter === "notgoing") list = list.filter((g) => g.going === false);

    if (debouncedSearch) {
      list = list.filter((g) => {
        const f = debouncedSearch;
        return (
          (g.name || "").toLowerCase().includes(f) ||
          (g.phone || "").toLowerCase().includes(f) ||
          (g.email || "").toLowerCase().includes(f) ||
          (g.company || "").toLowerCase().includes(f) ||
          (g.position || "").toLowerCase().includes(f)
        );
      });
    }

    list.sort((a, b) => {
      if (sortKey === "createdAt") {
        const dA = new Date(a.createdAt || 0).getTime();
        const dB = new Date(b.createdAt || 0).getTime();
        return sortDir === "asc" ? dA - dB : dB - dA;
      }
      const A = (a[sortKey] ?? "").toString().toLowerCase();
      const B = (b[sortKey] ?? "").toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [rawGuests, filter, debouncedSearch, sortKey, sortDir]);

  
  const itemsPerPage = isMobile ? 10 : 15; 
  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGuests = filteredGuests.slice(startIndex, endIndex);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, debouncedSearch, sortKey, sortDir, isMobile]);

  const reload = () => setRefreshTick((t) => t + 1);

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.success("გაკოპირდა");
    } catch {
      toast.error("ვერ დაკოპირდა");
    }
  };

  const exportXLSX = () => {
    const rows = filteredGuests.map((g) => ({
      Name: g.name ?? "",
      Phone: g.phone ?? "",
      Email: g.email ?? "",
      Company: g.company ?? "",
      Position: g.position ?? "",
      Going: g.going ? "YES" : "NO",
      "Created At": g.createdAt ? new Date(g.createdAt).toLocaleString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows, {
      header: ["Name", "Phone", "Email", "Company", "Position", "Going", "Created At"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guests");

    const headers = ["Name", "Phone", "Email", "Company", "Position", "Going", "Created At"];
    ws["!cols"] = headers.map((k) => {
      const maxLen = Math.max(k.length, ...rows.map((r) => (r[k] ? String(r[k]).length : 0)));
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    XLSX.writeFile(wb, `guests-${stamp}.xlsx`);
    toast.success("ექსპორტი დასრულდა");
  };

  const deleteAllGuests = async () => {
    if (!confirm(`ნამდვილად გსურთ ყველა სტუმრის წაშლა? (${rawGuests.length} სტუმარი)`)) {
      return;
    }

    if (!confirm("ეს მოქმედება შეუქცევადია! ნამდვილად გსურთ გაგრძელება?")) {
      return;
    }

    try {
      setLoading(true);
      let res;
      try {
        res = await axios.delete(`${API_URL}/api/guests/all`, { withCredentials: true });
      } catch {
        res = await axios.delete(`/api/guests/all`);
      }
      
      toast.success(`წარმატებით წაიშალა ${res.data.deletedCount} სტუმარი`);
      setRawGuests([]);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "სტუმრების წაშლა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const SkeletonRow = () => (
    <li className="grid grid-cols-12 px-6 py-4 animate-pulse">
      <div className="col-span-2"><div className="h-4 bg-gray-700 rounded w-3/4" /></div>
      <div className="col-span-2"><div className="h-4 bg-gray-700 rounded w-1/2" /></div>
      <div className="col-span-2"><div className="h-4 bg-gray-700 rounded w-2/3" /></div>
      <div className="col-span-2"><div className="h-4 bg-gray-700 rounded w-1/3" /></div>
      <div className="col-span-2"><div className="h-4 bg-gray-700 rounded w-1/3" /></div>
      <div className="col-span-1"><div className="h-5 bg-gray-700 rounded w-16" /></div>
      <div className="col-span-1 text-right"><div className="h-4 bg-gray-700 rounded w-24 ml-auto" /></div>
    </li>
  );

  return (
    <div className="w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {}
      <div className=" top-0 z-30 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-3 border-b border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">სტუმრები</h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={reload}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:translate-y-[1px] transition"
            >
              განახლება
            </button>
            <button
              onClick={exportXLSX}
              className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 active:translate-y-[1px] transition"
            >
              ექსელის ექსპორტი
            </button>
            <button
              onClick={deleteAllGuests}
              disabled={rawGuests.length === 0}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 active:translate-y-[1px] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ყველა სტუმრის წაშლა
            </button>
          </div>
        </div>
      </div>

      {}
      <section className="mt-4 bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">ძებნა</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="სახელი, ტელეფონი, ფოსტა, კომპანია…"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
              />
              {debouncedSearch && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                  title="Clear"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">ფილტრი</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={classNames(
                  "px-3 py-2 rounded-lg border transition",
                  filter === "all"
                    ? "bg-tech-blue text-tech-black border-tech-blue"
                    : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                )}
              >
                ყველა <span className="opacity-70">({counts.total})</span>
              </button>
              <button
                onClick={() => setFilter("going")}
                className={classNames(
                  "px-3 py-2 rounded-lg border transition",
                  filter === "going"
                    ? "bg-tech-blue text-tech-black border-tech-blue"
                    : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                )}
              >
                მოვდივარ <span className="opacity-70">({counts.going})</span>
              </button>
              <button
                onClick={() => setFilter("notgoing")}
                className={classNames(
                  "px-3 py-2 rounded-lg border transition",
                  filter === "notgoing"
                    ? "bg-tech-blue text-tech-black border-tech-blue"
                    : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                )}
              >
                ვერ მოვდივარ <span className="opacity-70">({counts.notGoing})</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">დალაგება</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "createdAt", label: "თარიღი" },
                { key: "name", label: "სახელი" },
                { key: "phone", label: "ტელეფონი" },
                { key: "company", label: "კომპანია" },
                { key: "position", label: "თანამდებობა" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSort(s.key)}
                  className={classNames(
                    "px-3 py-2 rounded-lg border transition",
                    sortKey === s.key
                      ? "bg-tech-blue text-tech-black border-tech-blue"
                      : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                  )}
                  title="Toggle sort"
                >
                  {s.label} {sortKey === s.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-gray-400 bg-gray-900/40 sticky top-[64px]">
            <div className="col-span-2">სახელი</div>
            <div className="col-span-2">ტელეფონი</div>
            <div className="col-span-2">ელ.ფოსტა</div>
            <div className="col-span-2">კომპანია</div>
            <div className="col-span-2">თანამდებობა</div>
            <div className="col-span-1">სტატუსი</div>
            <div className="col-span-1 text-right">შექმნილი</div>
          </div>
          <ul className="divide-y divide-gray-700">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </ul>
        </div>
      ) : error ? (
        <div className="mt-6 bg-red-900/20 border border-red-500 rounded-xl p-4">
          <div className="text-red-300">{error}</div>
          <button
            onClick={reload}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            გამეორება
          </button>
        </div>
      ) : (
        <>
          {}
          <ul className="mt-6 space-y-3 md:hidden">
            {paginatedGuests.map((g) => (
              <li key={g._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate text-lg">
                      {g.name || "—"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(g.createdAt)}</div>
                  </div>
                  <span
                    className={classNames(
                      "px-2 py-1 text-xs rounded border shrink-0",
                      g.going
                        ? "bg-green-500/15 text-green-300 border-green-500/30"
                        : "bg-red-500/15 text-red-300 border-red-500/30"
                    )}
                  >
                    {g.going ? "მოდის" : "ვერ მოდის"}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400">ტელეფონი</dt>
                    <dd className="text-gray-200 truncate">{g.phone || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400">ელ.ფოსტა</dt>
                    <dd className="text-gray-200 truncate">{g.email || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400">კომპანია</dt>
                    <dd className="text-gray-200 truncate">{g.company || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-400">თანამდებობა</dt>
                    <dd className="text-gray-200 truncate">{g.position || "—"}</dd>
                  </div>
                </dl>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => copyText(g.phone)} className="text-xs px-2 py-1 border border-gray-600 rounded hover:bg-gray-700">ტელეფონის კოპირება</button>
                  <button onClick={() => copyText(g.email)} className="text-xs px-2 py-1 border border-gray-600 rounded hover:bg-gray-700">ელ.ფოსტის კოპირება</button>
                </div>
              </li>
            ))}
            {paginatedGuests.length === 0 && (
              <li className="px-6 py-10 text-center text-gray-400">მონაცემები ვერ მოიძებნა</li>
            )}
          </ul>

          {}
          <div className="hidden md:block mt-6 bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-12 px-6 py-3 text-xs uppercase tracking-wider text-gray-400 bg-gray-900/40 ">
                <div className="col-span-2">სახელი</div>
                <div className="col-span-2">ტელეფონი</div>
                <div className="col-span-2">ელ.ფოსტა</div>
                <div className="col-span-2">კომპანია</div>
                <div className="col-span-2">თანამდებობა</div>
                <div className="col-span-1">სტატუსი</div>
                <div className="col-span-1 text-right">შექმნილი</div>
              </div>

              <ul className="divide-y divide-gray-700">
                {paginatedGuests.map((g) => (
                  <li key={g._id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-900/30 transition">
                    <div className="col-span-2 text-white flex items-center gap-2 min-w-0">
                      <span className="truncate">{g.name || "—"}</span>
                     
                    </div>
                    <div className="col-span-2 text-gray-300 flex items-center gap-2 min-w-0">
                      <span className="truncate">{g.phone || "—"}</span>
                      <button onClick={() => copyText(g.phone)} className="text-[11px] px-2 py-0.5 border border-gray-600 rounded hover:bg-gray-700" title="Copy phone">copy</button>
                    </div>
                    <div className="col-span-2 text-gray-300 flex items-center gap-2 min-w-0">
                      <span className="truncate">{g.email || "—"}</span>
                      <button onClick={() => copyText(g.email)} className="text-[11px] px-2 py-0.5 border border-gray-600 rounded hover:bg-gray-700" title="Copy email">copy</button>
                    </div>
                    <div className="col-span-2 text-gray-300 flex items-center gap-2 min-w-0">
                      <span className="truncate">{g.company || "—"}</span>
                    </div>
                    <div className="col-span-2 text-gray-300 flex items-center gap-2 min-w-0">
                      <span className="truncate">{g.position || "—"}</span>
                    </div>
                    <div className="col-span-1">
                      {g.going ? (
                        <span className="px-2 py-1 text-xs rounded bg-green-500/15 text-green-300 border border-green-500/30">მოვდივარ</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded bg-red-500/15 text-red-300 border border-red-500/30">ვერ მოვდივარ</span>
                      )}
                    </div>
                    <div className="col-span-1 text-right text-gray-400">{formatDate(g.createdAt)}</div>
                  </li>
                ))}
                {paginatedGuests.length === 0 && (
                  <li className="px-6 py-10 text-center text-gray-400">მონაცემები ვერ მოიძებნა</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}

      {}
      {!loading && !error && filteredGuests.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">

          
          <div className="flex items-center gap-2">
            {}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            
            {}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisible = 5;
                
                if (totalPages <= maxVisible) {
                  
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  
                  if (currentPage <= 3) {
                    
                    for (let i = 1; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-tech-blue text-tech-black border-tech-blue"
                        : page === '...'
                        ? "border-transparent cursor-default"
                        : "border-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}
            </div>
            
            {}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
