// app/institute/register/components/Step4OTP.jsx

export default function Step4OTP({ email, otp, onOtpChange, onSubmit, onResend, onBack, loading, timer, canResend }) {
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Code sent to <span className="font-semibold text-gray-800">{email}</span>
        </p>
      </div>

      <input
        type="text"
        value={otp}
        onChange={e => onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        className="w-full px-4 py-4 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
      />

      {timer > 0 && (
        <p className="text-center text-sm text-gray-500">
          Expires in <span className="font-semibold text-blue-600">{formatTime(timer)}</span>
        </p>
      )}

      <button type="button" onClick={onSubmit}
        disabled={loading || otp.length !== 6}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? "Verifying..." : "Verify & Register"}
      </button>

      <div className="text-center space-y-2">
        <button type="button" onClick={onResend} disabled={!canResend || loading}
          className="text-sm text-blue-600 font-medium disabled:text-gray-400">
          {canResend ? "Resend OTP" : "Resend after timer expires"}
        </button>
        <div>
          <button type="button" onClick={onBack} className="text-sm text-gray-500">← Back</button>
        </div>
      </div>
    </div>
  );
}