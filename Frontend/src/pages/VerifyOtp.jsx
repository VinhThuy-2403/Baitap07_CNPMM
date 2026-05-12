import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { verifyOtpUser, clearError } from "../redux/authSlice";

export default function VerifyOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, registerEmail } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    dispatch(clearError());
    const result = await dispatch(
      verifyOtpUser({ email: registerEmail, otp })
    );
    if (verifyOtpUser.fulfilled.match(result)) {
      setSuccessMsg("Kích hoạt thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-3xl font-bold text-gray-800">Xác nhận OTP</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Nhập mã OTP đã được gửi đến
          </p>
          {registerEmail && (
            <p className="text-purple-600 font-medium text-sm mt-1">
              {registerEmail}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm text-center">{successMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                dispatch(clearError());
                setOtp(e.target.value);
              }}
              placeholder="Nhập mã 6 số"
              maxLength={6}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-lg transition text-sm"
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>

        {/* Back */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Chưa nhận được mã?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-purple-600 hover:underline font-medium"
          >
            Đăng ký lại
          </button>
        </p>
      </div>
    </div>
  );
}