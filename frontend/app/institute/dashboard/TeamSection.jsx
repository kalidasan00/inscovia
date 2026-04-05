// app/institute/dashboard/TeamSection.jsx
"use client";
import { useState, useEffect } from "react";
import { Users, UserPlus, Mail, X, ChevronDown, Copy, Check, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const ROLE_LABELS = { OWNER: "Owner", MANAGER: "Manager", STAFF: "Staff" };
const ROLE_COLORS = {
  OWNER:   "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  STAFF:   "bg-green-100 text-green-700",
};

export default function TeamSection({ orgId, currentUserRole }) {
  const [members, setMembers]               = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail]       = useState("");
  const [inviteRole, setInviteRole]         = useState("STAFF");
  const [inviting, setInviting]             = useState(false);
  const [inviteResult, setInviteResult]     = useState(null); // { link, email }
  const [error, setError]                   = useState("");
  const [copied, setCopied]                 = useState(false);
  const [removingId, setRemovingId]         = useState(null);
  const [cancellingId, setCancellingId]     = useState(null);

  const canManage = ["OWNER", "MANAGER"].includes(currentUserRole);

  useEffect(() => {
    if (orgId) fetchMembers();
  }, [orgId]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/org/${orgId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMembers(data.members || []);
      setPendingInvites(data.pendingInvites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setError("");
    setInviteResult(null);
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/org/${orgId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteResult({ link: data.inviteLink, email: inviteEmail });
      setInviteEmail("");
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteResult?.link) return;
    navigator.clipboard.writeText(inviteResult.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!inviteResult?.link) return;
    const text = encodeURIComponent(
      `You're invited to join our institute on Inscovia! Click here to accept: ${inviteResult.link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    setRemovingId(memberId);
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/org/${orgId}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    if (!confirm("Cancel this invite?")) return;
    setCancellingId(inviteId);
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/org/invites/${inviteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const token = localStorage.getItem("instituteToken");
      const res = await fetch(`${API_URL}/org/${orgId}/members/${memberId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchMembers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-600" />
          Team
          {members.length > 0 && (
            <span className="text-xs font-medium text-gray-400">({members.length})</span>
          )}
        </h2>
        {canManage && (
          <button
            onClick={() => { setShowInviteForm(v => !v); setInviteResult(null); setError(""); }}
            className="flex items-center gap-1 text-accent text-xs font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Member
          </button>
        )}
      </div>

      {error && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && canManage && (
        <div className="mb-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-xs font-semibold text-indigo-800 mb-2">Invite by Email</p>
          <form onSubmit={handleInvite} className="space-y-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="member@email.com"
              required
              className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
            <div className="flex gap-2">
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
              </select>
              <button
                type="submit"
                disabled={inviting}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </form>

          {/* Invite Result — link + WhatsApp */}
          {inviteResult && (
            <div className="mt-3 p-3 bg-white border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700 mb-1.5">
                ✅ Invite sent to {inviteResult.email}
              </p>
              <p className="text-[10px] text-gray-500 mb-2">Share the link via WhatsApp or copy it:</p>
              <div className="flex gap-2">
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {/* WhatsApp icon */}
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-700">
                  {member.user?.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{member.user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{member.user?.email}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Role — editable by OWNER for non-owner members */}
                {currentUserRole === "OWNER" && member.role !== "OWNER" ? (
                  <div className="relative">
                    <select
                      value={member.role}
                      onChange={e => handleRoleChange(member.id, e.target.value)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full border-0 appearance-none pr-5 cursor-pointer ${ROLE_COLORS[member.role]}`}
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="STAFF">Staff</option>
                    </select>
                    <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                ) : (
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[member.role]}`}>
                    {ROLE_LABELS[member.role]}
                  </span>
                )}
                {/* Remove button — OWNER only, not self */}
                {currentUserRole === "OWNER" && member.role !== "OWNER" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removingId === member.id}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {removingId === member.id
                      ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pt-1">
                Pending Invites
              </p>
              {pendingInvites.map(invite => (
                <div key={invite.id} className="flex items-center gap-2.5 p-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{invite.email}</p>
                    <p className="text-[10px] text-gray-500">
                      Expires {new Date(invite.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[invite.role]}`}>
                      {ROLE_LABELS[invite.role]}
                    </span>
                    {canManage && (
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        disabled={cancellingId === invite.id}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === invite.id
                          ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <X className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {members.length === 0 && pendingInvites.length === 0 && (
            <div className="text-center py-4 border-2 border-dashed rounded-xl">
              <p className="text-xs text-gray-500">No team members yet</p>
              {canManage && (
                <button
                  onClick={() => setShowInviteForm(true)}
                  className="text-accent text-xs font-medium mt-1"
                >
                  Invite someone →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}