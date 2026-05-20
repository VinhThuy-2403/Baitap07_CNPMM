import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById, cancelOrder, clearOrderMsg } from "../redux/orderSlice";
import {
  Camera, ArrowLeft, Package, MapPin,
  Phone, User, Clock, Loader2, X, CheckCircle,
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const STATUS_CONFIG = {
  pending: { label: "Đơn hàng mới", color: "text-blue-400", bg: "bg-blue-400" },
  confirmed: { label: "Đã xác nhận", color: "text-green-400", bg: "bg-green-400" },
  preparing: { label: "Đang chuẩn bị hàng", color: "text-yellow-400", bg: "bg-yellow-400" },
  shipping: { label: "Đang giao hàng", color: "text-purple-400", bg: "bg-purple-400" },
  delivered: { label: "Đã giao thành công", color: "text-green-400", bg: "bg-green-500" },
  cancelled: { label: "Đã hủy", color: "text-red-400", bg: "bg-red-400" },
  cancel_requested: { label: "Yêu cầu hủy đơn", color: "text-orange-400", bg: "bg-orange-400" },
};

const STEPS = ["pending", "confirmed", "preparing", "shipping", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, isLoading, error, successMsg } = useSelector(
    (state) => state.order
  );
  const { token } = useSelector((state) => state.auth);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    dispatch(fetchOrderById(id));
    return () => dispatch(clearOrderMsg());
  }, [id, token]);

  const handleCancel = async () => {
    const result = await dispatch(cancelOrder(id));
    if (cancelOrder.fulfilled.match(result)) {
      setShowCancelConfirm(false);
      dispatch(fetchOrderById(id));
    }
  };

  const canCancel = currentOrder &&
    ["pending", "confirmed", "preparing"].includes(currentOrder.status);

  const currentStepIndex = currentOrder
    ? STEPS.indexOf(currentOrder.status)
    : -1;

  if (isLoading && !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (!currentOrder) return null;

  const statusCfg = STATUS_CONFIG[currentOrder.status];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
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
          <span className="text-gray-400 text-sm">/ Đơn #{currentOrder.id}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Messages */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{successMsg}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-gray-400 text-sm mb-1">Mã đơn hàng</p>
              <h1 className="text-2xl font-bold">#{currentOrder.id}</h1>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">Trạng thái</p>
              <span className={`font-bold text-lg ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Đặt lúc {formatDate(currentOrder.createdAt)}
          </p>
        </div>

        {/* Progress tracker */}
        {!["cancelled", "cancel_requested"].includes(currentOrder.status) && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="font-bold mb-6">Theo dõi đơn hàng</h2>
            <div className="relative">
              {/* Line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-700" />
              <div
                className="absolute top-4 left-4 h-0.5 bg-yellow-400 transition-all duration-500"
                style={{
                  width: currentStepIndex >= 0
                    ? `${(currentStepIndex / (STEPS.length - 1)) * 100}%`
                    : "0%",
                }}
              />

              <div className="relative flex justify-between">
                {STEPS.map((step, i) => {
                  const cfg = STATUS_CONFIG[step];
                  const isDone = currentStepIndex >= i;
                  const isCurrent = currentStepIndex === i;
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 w-16">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                          isDone
                            ? "bg-yellow-400"
                            : "bg-gray-700 border-2 border-gray-600"
                        } ${isCurrent ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800" : ""}`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-black" />
                        ) : (
                          <span className="text-gray-500 text-xs font-bold">{i + 1}</span>
                        )}
                      </div>
                      <p className={`text-xs text-center leading-tight ${
                        isDone ? "text-yellow-400" : "text-gray-500"
                      }`}>
                        {cfg.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancel requested */}
        {currentOrder.status === "cancel_requested" && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
            <p className="text-orange-400 font-medium">
              ⚠️ Yêu cầu hủy đơn hàng đã được gửi đến shop. Vui lòng chờ shop xác nhận.
            </p>
            {currentOrder.cancelRequestedAt && (
              <p className="text-orange-300 text-xs mt-1">
                Yêu cầu lúc: {formatDate(currentOrder.cancelRequestedAt)}
              </p>
            )}
          </div>
        )}

        {/* Sản phẩm */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-400" />
            Sản phẩm đã đặt
          </h2>
          <div className="space-y-3">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-3 border-b border-gray-700 last:border-0 last:pb-0">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium line-clamp-2 text-sm">
                    {item.productName}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-yellow-400 font-bold text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatPrice(item.price)} / cái
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
            <span className="text-gray-400">Tổng cộng:</span>
            <span className="text-yellow-400 font-black text-xl">
              {formatPrice(currentOrder.totalAmount)}
            </span>
          </div>
        </div>

        {/* Thông tin giao hàng */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="font-bold mb-4">Thông tin giao hàng</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-white">{currentOrder.shippingName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-white">{currentOrder.shippingPhone}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-white">{currentOrder.shippingAddress}</span>
            </div>
            {currentOrder.note && (
              <div className="bg-gray-700 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">Ghi chú:</p>
                <p className="text-white text-sm">{currentOrder.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Thanh toán */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h2 className="font-bold mb-4">Thanh toán</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Phương thức:</span>
            <span className="text-white font-medium">COD - Thanh toán khi nhận</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400">Trạng thái:</span>
            <span className={`font-medium ${
              currentOrder.paymentStatus === "paid" ? "text-green-400" : "text-orange-400"
            }`}>
              {currentOrder.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </div>
        </div>

        {/* Nút hủy */}
        {canCancel && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            {currentOrder.status === "preparing"
              ? "Gửi yêu cầu hủy đơn"
              : "Hủy đơn hàng"}
          </button>
        )}
      </div>

      {/* Modal xác nhận hủy */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">
              {currentOrder.status === "preparing"
                ? "Gửi yêu cầu hủy đơn?"
                : "Xác nhận hủy đơn hàng?"}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {currentOrder.status === "preparing"
                ? "Shop đang chuẩn bị hàng. Yêu cầu hủy sẽ được gửi đến shop để xem xét."
                : "Bạn có chắc muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                Không
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
              >
                {isLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}