// app/institute/dashboard/promote/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, ChevronLeft, CheckCircle, Clock,
  XCircle, AlertTriangle, Upload, X,
  Search, Info
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const PLACEMENT_LABELS = {
  FEATURED: { label: "Featured Listing", desc: "Featured card on centers search page", color: "blue", icon: Search }
};

const DURATION_OPTIONS = [
  { days: 7,  label: "7 Days",  popular: false },
  { days: 15, label: "15 Days", popular: false },
  { days: 30, label: "30 Days", popular: true  }
];

function formatPrice(paise) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function StatusBadge({ banner }) {
  const now = new Date();
  const isExpired = new Date(banner.endDate) < now;
  if (isExpired) return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> Expired
    </span>
  );
  if (banner.isActive) return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <CheckCircle className="w-3 h-3" /> Active
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> Pending Approval
    </span>
  );
}

export default function PromotePage() {
  const router = useRouter();
  const [centerId, setCenterId] = useState(null);
  const [centerName, setCenterName] = useState("");
  const [slots, setSlots] = useState({ FEATURED: null });
  const [myBanners, setMyBanners] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState("FEATURED");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [form, setForm] = useState({ title: "", tagline: "", ctaText: "View Institute" });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterError, setPosterError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("instituteToken");
    if (!token) { router.push("/institute/login"); return; }
    fetchInstituteData(token);
  }, [router]);

  const fetchInstituteData = async (token) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCenterId(data.center?.id);
      setCenterName(data.user?.instituteName || "");
      setForm(f => ({ ...f, title: data.user?.instituteName || "" }));
    } catch {
      router.push("/institute/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!centerId) return;
    fetchSlots();
    fetchMyBanners();
  }, [centerId]);

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${API_URL}/banners/slots?placement=FEATURED`);
      setSlots({ FEATURED: await res.json() });
    } catch { }
  };

  const fetchMyBanners = async () => {
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/banners/institute/${centerId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setMyBanners(data.banners || []);
    } catch { }
  };

  const handlePosterSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPosterError("Image must be under 5MB. Please choose a smaller file.");
      return;
    }
    setPosterError(null);
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const uploadPoster = async () => {
    if (!posterFile) return null;
    setUploading(true);
    try {
      const token = localStorage.getItem("instituteToken");
      const formData = new FormData();
      formData.append("image", posterFile);
      const res = await fetch(`${API_URL}/centers/${centerId}/upload-gallery`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.imageUrl || data.url || null;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setSubmitResult({ type: "error", message: "Please enter a banner title." });
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);

    let imageUrl = null;
    if (posterFile) imageUrl = await uploadPoster();

    try {
      const res = await fetch(`${API_URL}/banners/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId,
          title: form.title,
          tagline: form.tagline || null,
          imageUrl,
          ctaText: form.ctaText || "View Institute",
          placement: selectedPlacement,
          duration: selectedDuration
        })
      });
      const data = await res.json();

      if (res.status === 409 && data.isFull) {
        setSubmitResult({ type: "full", message: data.message });
        setShowWaitlist(true);
        return;
      }
      if (res.status === 409 && data.isPending) {
        setSubmitResult({ type: "error", message: data.error });
        return;
      }
      if (!res.ok) {
        setSubmitResult({ type: "error", message: data.error || "Submission failed." });
        return;
      }

      setSubmitResult({ type: "success", message: "Banner submitted! Admin will review within 24 hours." });
      fetchMyBanners();
      fetchSlots();
    } catch {
      setSubmitResult({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlist = async () => {
    if (!waitlistEmail.trim()) return;
    try {
      await fetch(`${API_URL}/banners/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerId, placement: selectedPlacement, duration: selectedDuration, email: waitlistEmail, centerName })
      });
      setWaitlistDone(true);
    } catch { }
  };

  const currentSlot = slots[selectedPlacement];
  const price = currentSlot?.prices?.[selectedDuration];
  const activeBanners = myBanners.filter(b => b.isActive && new Date(b.endDate) >= new Date());
  const pendingBanners = myBanners.filter(b => !b.isActive && new Date(b.endDate) >= new Date());

  if (loading) return (
    <main className="max-w-2xl mx-auto px-4 py-10 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mx-auto" />
    </main>
  );

  return (
    <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/institute/dashboard"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Promote My Institute
          </h1>
          <p className="text-xs text-gray-500">Get featured on Inscovia search</p>
        </div>
      </div>

      {/* Active banners summary */}
      {(activeBanners.length > 0 || pendingBanners.length > 0) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-700 mb-3">My Banners</p>
          <div className="space-y-2">
            {myBanners.slice(0, 5).map(banner => (
              <div key={banner.id} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{banner.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {banner.placement} · {banner.duration} days · ends {new Date(banner.endDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <StatusBadge banner={banner} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success state */}
      {submitResult?.type === "success" ? (
        <div className="bg-white border border-green-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Request Submitted!</h2>
          <p className="text-sm text-gray-500 mb-1">{submitResult.message}</p>
          <p className="text-xs text-gray-400 mb-6">Our team will review and activate your banner within 24 hours.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSubmitResult(null)}
              className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Submit Another
            </button>
            <Link href="/institute/dashboard"
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Step 1 — Placement (FEATURED only, static card) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Step 1 — Placement</p>
            <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Featured Listing</p>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Featured card on centers search page</p>
              {currentSlot ? (
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${currentSlot.isFull ? "text-red-500" : "text-green-600"}`}>
                  {currentSlot.isFull
                    ? <><AlertTriangle className="w-3 h-3" /> All slots full</>
                    : <><CheckCircle className="w-3 h-3" /> {currentSlot.available}/{currentSlot.limit} slots available</>
                  }
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">Checking availability...</p>
              )}
            </div>

            {currentSlot?.isFull && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">All Featured slots are full. Join the waitlist below.</p>
              </div>
            )}
          </div>

          {/* Step 2 — Duration */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Step 2 — Select Duration</p>
            <div className="grid grid-cols-3 gap-3">
              {DURATION_OPTIONS.map(({ days, label, popular }) => {
                const p = slots["FEATURED"]?.prices?.[days];
                return (
                  <button key={days} onClick={() => setSelectedDuration(days)}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                      selectedDuration === days
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-200"
                    }`}>
                    {popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                        BEST VALUE
                      </span>
                    )}
                    <p className="text-sm font-bold text-gray-900">{label}</p>
                    {p && <p className="text-xs text-indigo-600 font-semibold mt-1">{formatPrice(p)}</p>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3 — Banner Details */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Step 3 — Banner Details</p>
            <div className="space-y-3">

              {/* Poster Upload */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1.5">
                  Promotional Poster <span className="text-gray-400 font-normal">(optional)</span>
                </p>
                {posterPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={posterPreview} alt="Poster preview" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => { setPosterFile(null); setPosterPreview(null); setPosterError(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors">
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-2 left-2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded-full">
                      Custom poster
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                    <Upload className="w-6 h-6 text-gray-400 mb-1.5" />
                    <p className="text-xs text-gray-500 font-medium">Upload poster image</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG · max 5MB · recommended 800×400px</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePosterSelect} />
                  </label>
                )}

                {posterError && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {posterError}
                  </div>
                )}

                <div className="flex items-start gap-1.5 mt-1.5">
                  <Info className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-400">
                    If no poster uploaded, your institute logo/cover photo will be used automatically.
                  </p>
                </div>
              </div>

              <input
                type="text"
                placeholder="Banner title* (e.g. Best Python Coaching in Kerala)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                maxLength={80}
              />
              <input
                type="text"
                placeholder="Tagline (optional — e.g. 100% Placement Assistance)"
                value={form.tagline}
                onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                maxLength={80}
              />
              <input
                type="text"
                placeholder="Button text (default: View Institute)"
                value={form.ctaText}
                onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                maxLength={30}
              />
            </div>
          </div>

          {/* Error / Full message */}
          {submitResult && submitResult.type !== "success" && (
            <div className={`p-3 rounded-xl text-sm font-medium ${
              submitResult.type === "full"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {submitResult.message}
            </div>
          )}

          {/* Waitlist */}
          {showWaitlist && !waitlistDone && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-800">Join Waitlist</p>
              <p className="text-xs text-blue-600">We'll email you when a Featured slot opens.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={handleWaitlist}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                  Join
                </button>
              </div>
            </div>
          )}

          {waitlistDone && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              You're on the waitlist! We'll notify you when a slot opens.
            </div>
          )}

          {/* Submit */}
          {!currentSlot?.isFull && (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total for {selectedDuration} days</p>
                  {price && <p className="text-2xl font-black text-indigo-600">{formatPrice(price)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Featured Listing</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">No payment until approved</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || uploading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 shadow-lg">
                <Sparkles className="w-4 h-4" />
                {uploading ? "Uploading poster..." : submitting ? "Submitting..." : "Request Promotion"}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                Payment collected after admin approval · Our team reviews within 24 hours
              </p>
            </div>
          )}

        </div>
      )}
    </main>
  );
}