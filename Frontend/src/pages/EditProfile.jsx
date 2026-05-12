import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { editProfileAPI } from "../services/authService";

import {
  User,
  Phone,
  MapPin,
  Camera,
  Save,
  LogOut,
} from "lucide-react";

const EditProfile = () => {
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatar: user?.avatar || "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await editProfileAPI(formData);

      alert("Cập nhật thông tin thành công!");
      console.log(response.data);
    } catch (error) {
      const serverError =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg;

      alert(serverError || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-36 relative">
          <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2">
            <div className="relative">
              <img
                src={
                  formData.avatar ||
                  "https://i.pravatar.cc/150?img=12"
                }
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />

              <button
                type="button"
                className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Chỉnh sửa hồ sơ
            </h2>

            <p className="text-gray-500 mt-2">
              Cập nhật thông tin cá nhân của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block text-left">
                Họ và tên
              </label>

              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nhập họ tên"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block text-left">
                Số điện thoại
              </label>

              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Nhập số điện thoại"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block text-left">
                Địa chỉ
              </label>

              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  placeholder="Nhập địa chỉ"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white py-3 rounded-xl font-semibold shadow-lg transition"
            >
              <Save size={18} />

              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-500 hover:bg-red-50 py-3 rounded-xl font-semibold transition"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;