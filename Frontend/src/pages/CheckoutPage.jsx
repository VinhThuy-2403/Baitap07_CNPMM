import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder, clearOrderMsg } from "../redux/orderSlice";
import { fetchCart } from "../redux/cartSlice";
import {
  Camera, ArrowLeft, MapPin, Phone,
  User, Truck, CheckCircle, Loader2,
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading, error, successMsg, currentOrder } = useSelector(
    (state) => state.order
  );
  const { token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    shippingName: user?.name || "",
    shippingPhone: user?.phone || "",
    shippingAddress: user?.address || "",
    note: "",
  });
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    dispatch(fetchCart());
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createOrder(form));
    if (createOrder.fulfilled.match(result)) {
      setOrderSuccess(true);
    }
  };

  // Success screen
  if (orderSuccess && currentOrder) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-400 mb-2">
            Mã đơn hàng:{" "}
            <span className="text-yellow-400 font-bold">#{currentOrder.id}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Đơn hàng sẽ được xác nhận tự động sau 5 phút. Bạn có thể theo dõi
            trạng thái đơn hàng tại trang lịch sử mua hàng.
          </p>
          <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Phương thức:</span>
              <span className="text-white font-medium">COD - Thanh toán khi nhận</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tổng tiền:</span>
              <span className="text-yellow-400 font-bold">
                {formatPrice(currentOrder.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Giao đến:</span>
              <span className="text-white text-right max-w-[200px]">
                {currentOrder.shippingAddress}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-2xl transition-colors"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate("/home")}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-2xl transition-colors"
            >
              Tiếp tục mua
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-xl">
              <Camera className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold">
              LENS<span className="text-yellow-400">STORE</span>
            </span>
          </div>
          <span className="text-gray-400 text-sm">/ Thanh toán</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thanh toán đơn hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form thông tin */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Thông tin giao hàng */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  Thông tin giao hàng
                </h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tên */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Họ và tên người nhận
                    </label>
                    <input
                      type="text"
                      name="shippingName"
                      value={form.shippingName}
                      onChange={handleChange}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  {/* SĐT */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="shippingPhone"
                      value={form.shippingPhone}
                      onChange={handleChange}
                      required
                      placeholder="0909 123 456"
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Địa chỉ giao hàng
                    </label>
                    <textarea
                      name="shippingAddress"
                      value={form.shippingAddress}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Ghi chú (tuỳ chọn)
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ghi chú cho đơn hàng..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-yellow-400" />
                  Phương thức thanh toán
                </h2>
                <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                  <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-400">
                      COD - Thanh toán khi nhận hàng
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Thanh toán bằng tiền mặt khi nhận được hàng
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || items.length === 0}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-black font-bold rounded-2xl transition-colors text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang đặt hàng...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Xác nhận đặt hàng
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tóm tắt đơn */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 pb-4 border-b border-gray-700">
                Đơn hàng ({items.length} sản phẩm)
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto mb-4">
                {items.map((item) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          x{item.quantity}
                        </p>
                        <p className="text-yellow-400 text-xs font-bold mt-0.5">
                          {formatPrice(price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tạm tính:</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Phí vận chuyển:</span>
                  <span className="text-green-400">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="font-bold">Tổng cộng:</span>
                  <span className="text-yellow-400 font-black text-xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}