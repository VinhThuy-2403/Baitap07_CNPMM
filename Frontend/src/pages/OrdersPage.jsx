import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../redux/orderSlice";
import {
  Camera, ArrowLeft, Package, ChevronRight,
  Clock, Loader2,
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const STATUS_CONFIG = {
  pending: { label: "Đơn hàng mới", color: "bg-blue-500/20 text-blue-400", dot: "bg-blue-400" },
  confirmed: { label: "Đã xác nhận", color: "bg-green-500/20 text-green-400", dot: "bg-green-400" },
  preparing: { label: "Đang chuẩn bị", color: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-400" },
  shipping: { label: "Đang giao hàng", color: "bg-purple-500/20 text-purple-400", dot: "bg-purple-400" },
  delivered: { label: "Đã giao thành công", color: "bg-green-500/20 text-green-400", dot: "bg-green-500" },
  cancelled: { label: "Đã hủy", color: "bg-red-500/20 text-red-400", dot: "bg-red-400" },
  cancel_requested: { label: "Yêu cầu hủy", color: "bg-orange-500/20 text-orange-400", dot: "bg-orange-400" },
};

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Mới" },
  { value: "confirmed", label: "Xác nhận" },
  { value: "preparing", label: "Chuẩn bị" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, pagination, isLoading } = useSelector((state) => state.order);
  const { token } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    dispatch(fetchOrders({ page, limit: 10, status: activeTab }));
  }, [token, page, activeTab]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
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
          <span className="text-gray-400 text-sm">/ Đơn hàng của tôi</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-yellow-400" />
          Đơn hàng của tôi
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveTab(tab.value); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Chưa có đơn hàng nào</p>
            <button
              onClick={() => navigate("/home")}
              className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold mt-4 hover:bg-yellow-500 transition-colors"
            >
              Mua hàng ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-gray-800 rounded-2xl p-5 cursor-pointer hover:bg-gray-750 hover:border-yellow-400/30 border border-transparent transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">
                        Đơn #{order.id}
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100";
                        }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </div>
                    <span className="text-yellow-400 font-bold">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 rounded-xl disabled:opacity-40 hover:bg-gray-700 text-sm"
            >
              ← Trước
            </button>
            <span className="px-4 py-2 text-gray-400 text-sm">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-gray-800 rounded-xl disabled:opacity-40 hover:bg-gray-700 text-sm"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}