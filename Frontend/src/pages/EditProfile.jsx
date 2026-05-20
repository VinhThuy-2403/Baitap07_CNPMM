import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editProfileAPI, getProfileAPI } from "../services/authService";
import { User, Phone, MapPin, Camera, Save, LogOut, Loader2 } from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. CHẶN TRANG: Giống trang Cart, nếu không có token thì bay về trang đăng nhập
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // 2. LẤY DỮ LIỆU USER ĐỂ HIỂN THỊ
    // 2. LẤY DỮ LIỆU USER ĐỂ HIỂN THỊ
    const fetchUserProfile = async () => {
      try {
        const response = await getProfileAPI();
        
        // Log ra Console để bạn xem chính xác Backend đang gửi gì về
        console.log("Dữ liệu Profile từ Backend:", response);

        // Bóc tách dữ liệu thông minh (cover mọi trường hợp Backend trả về)
        let userData = {};
        if (response?.data?.user) {
          userData = response.data.user; // Trạng thái: { data: { user: {...} } }
        } else if (response?.data) {
          userData = response.data;      // Trạng thái: { data: {...} }
        } else if (response?.user) {
          userData = response.user;      // Trạng thái: { user: {...} }
        } else {
          userData = response;           // Trạng thái: Trả thẳng object
        }
        
        // Gán vào form (dự phòng các tên cột phổ biến trong DB)
        setFormData({
          name: userData.name || userData.fullName || userData.fullname || "",
          phone: userData.phone || userData.phoneNumber || userData.sdt || "",
          address: userData.address || "",
          avatar: userData.avatar || userData.avatarUrl || "",
        });
        
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
        // Nếu lỗi 401 do token hết hạn hoặc sai, đá về trang đăng nhập
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await editProfileAPI(formData);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      const serverError =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg;
      alert(serverError || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Màn hình loading khi đang fetch dữ liệu từ BE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
        
        {/* Header/Cover Image (Tone màu FE dự án: Clean & Modern) */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-40 relative">
          <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2">
            <div className="relative group">
              <img
                src={formData.avatar || "https://i.pravatar.cc/150?img=12"}
                alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-white"
              />
              <button
                type="button"
                className="absolute bottom-1 right-1 bg-gray-900 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition duration-300 transform group-hover:scale-110"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="pt-24 px-8 pb-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Hồ sơ của bạn
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Cập nhật thông tin cá nhân và chi tiết liên hệ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Chưa cập nhật..."
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Chưa cập nhật..."
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa chỉ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Chưa cập nhật..."
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu thông tin
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-red-600 py-3 rounded-xl font-semibold transition"
              >
                <LogOut size={18} />
                Đăng xuất
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;