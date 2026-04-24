import React, { useEffect, useMemo, useState } from 'react';
import { doctorsPageStyles } from '../assets/dummyStyles';
import {
  ChevronRight,
  CircleChevronDown,
  CircleChevronUp,
  Medal,
  MousePointer2Off,
  Search,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorsPage = () => {
  const API_BASE = "http://localhost:4000";

  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Load doctors
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/api/doctors`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            (json && json.message) || `Failed to load doctors (${res.status})`;
          if (mounted) {
            setError(msg);
            setAllDoctors([]);
            setLoading(false);
          }
          return;
        }

        const items = (json && (json.data || json)) || [];

        const normalized = (Array.isArray(items) ? items : []).map((d) => {
          const id = d._id || d.id;
          const image =
            d.imageUrl || d.image || d.imageSmall || d.imageSrc || "";

          let available = true;
          if (typeof d.availability === "string") {
            available = d.availability.toLowerCase() === "available";
          } else if (typeof d.available === "boolean") {
            available = d.available;
          } else {
            available = d.availability === "Available" || d.available === true;
          }

          return {
            id,
            name: d.name || "Unknown",
            specialization: d.specialization || "",
            image,
            experience:
              (d.experience ?? d.experience === 0)
                ? String(d.experience)
                : "—",
            fee: d.fee ?? d.price ?? 0,
            available,
            raw: d,
          };
        });

        if (mounted) {
          setAllDoctors(normalized);
          setError("");
        }
      } catch (err) {
        console.error("load doctors error:", err);
        if (mounted) {
          setError("Network error while loading doctors.");
          setAllDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter
  const filteredDoctors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allDoctors;

    return allDoctors.filter(
      (doctor) =>
        (doctor.name || "").toLowerCase().includes(q) ||
        (doctor.specialization || "").toLowerCase().includes(q)
    );
  }, [allDoctors, searchTerm]);

  const displayedDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, 8);

  // Retry
  const retry = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError((json && json.message) || `Failed to load (${res.status})`);
        setAllDoctors([]);
        return;
      }

      const items = (json && (json.data || json)) || [];

     const normalized = (Array.isArray(items) ? items : []).map((d) => {
  const id = d._id || d.id;

  // 🔥 IMAGE FIX
  let image = "";
  if (d.imageUrl) {
    image = d.imageUrl;
  } else if (d.image) {
    image = `${API_BASE}/${d.image}`;
  } else if (d.imageSmall) {
    image = `${API_BASE}/${d.imageSmall}`;
  }

  let available = true;
  if (typeof d.availability === "string") {
    available = d.availability.toLowerCase() === "available";
  } else if (typeof d.available === "boolean") {
    available = d.available;
  }

  return {
    id,
    name: d.name || "Unknown",
    specialization: d.specialization || "",
    image,
    experience: d.experience ?? "—",
    fee: d.fee ?? 0,
    available,
    raw: d,
  };
});

      setAllDoctors(normalized);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Network error while loading doctors.");
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={doctorsPageStyles.mainContainer}>
      <div className={doctorsPageStyles.wrapper}>
        <div className="text-center mb-6">
  <h1 className={doctorsPageStyles.headerTitle}>
    Our Medical Experts
  </h1>

  {/* NEW subtitle */}
  <p className="text-sm text-gray-600 mt-1">
    Find doctor by name and specialization
  </p>
</div>

        {/* Search */}
        <div className={`${doctorsPageStyles.searchWrapper} mx-auto max-w-xl`}>
          <input
            type="text"
            placeholder="Search doctors by name and specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={doctorsPageStyles.searchInput}
          />

          <Search className={doctorsPageStyles.searchIcon} />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={doctorsPageStyles.clearButton}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div>
            <p>{error}</p>
            <button onClick={retry}>Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={doctorsPageStyles.doctorsGrid}>
            {displayedDoctors.map((doctor, index) => (
              <div
  key={doctor.id || index}
  className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center hover:shadow-lg transition"
>
                <img
                  src={doctor.image || "/placeholder-doctor.jpg"}
                  alt={doctor.name}
                />

                <h3>{doctor.name}</h3>
                <p>{doctor.specialization}</p>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
  <Medal className="w-4 h-4 text-yellow-500" />
  {doctor.experience} Experience
</div>

               {doctor.available ? (
  <Link
    to={`/doctors/${doctor.id}`}
    className="bg-green-600 text-white px-4 py-1 rounded-full text-sm hover:bg-green-700"
  >
    <ChevronRight className="inline w-4 h-4" /> Book Now
  </Link>
) : (
  <button
    disabled
    className="bg-gray-300 text-gray-600 px-4 py-1 rounded-full text-sm"
  >
    <MousePointer2Off className="inline w-4 h-4" /> Not Available
  </button>
)}
              </div>
            ))}
          </div>
        )}

        {/* Show More */}
        {filteredDoctors.length > 8 && (
          <button onClick={() => setShowAll(!showAll)}>
            {showAll ? (
              <>
                <CircleChevronUp /> Hide
              </>
            ) : (
              <>
                <CircleChevronDown /> Show More
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;