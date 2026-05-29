import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../redux/orderSlice";
import { fetchCart } from "../redux/cartSlice";
import { fetchProfile } from "../redux/authSlice";
import {
  Camera, ArrowLeft, MapPin, Phone,
  User, Truck, CheckCircle, Loader2,
  Tag, Gift, AlertCircle
} from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

// Danh sách mã khuyến mãi (Giả lập giống Backend)
const AVAILABLE_COUPONS = [
  { code: "DISCOUNT10", label: "Giảm 10%", percent: 10, minOrder: 2000000, desc: "Cho đơn từ 2.000.000đ" },
  { code: "DISCOUNT15", label: "Giảm 15%", percent: 15, minOrder: 5000000, desc: "Cho đơn từ 5.000.000đ" },
  { code: "DISCOUNT20", label: "Giảm 20%", percent: 20, minOrder: 10000000, desc: "Cho đơn từ 10.000.000đ" },
];

const POINT_VALUE = 1000; // 1 điểm = 10.000đ

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { user, token } = useSelector((state) => state.auth);
  const { isLoading, error, currentOrder } = useSelector((state) => state.order);

  const [form, setForm] = useState({
    shippingName: user?.name || "",
    shippingPhone: user?.phone || "",
    shippingAddress: user?.address || "",
    note: "",
  });
  
  // States cho tính năng Giảm giá & Điểm
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    dispatch(fetchCart());
    dispatch(fetchProfile());
  }, [token, dispatch]);

  // Cập nhật form khi user data được fetch
  useEffect(() => {
    if (user) {
      setForm({
        shippingName: user.name || "",
        shippingPhone: user.phone || "",
        shippingAddress: user.address || "",
        note: "",
      });
    }
  }, [user]);

  // --- LOGIC TÍNH TOÁN REAL-TIME TẠI FRONTEND ---
  const calculations = useMemo(() => {
    let subTotal = total;
    let couponDiscount = 0;
    let pointsDiscount = 0;
    let finalTotal = subTotal;

    // 1. Tính giảm giá Coupon
    if (selectedCoupon && subTotal >= selectedCoupon.minOrder) {
      couponDiscount = (subTotal * selectedCoupon.percent) / 100;
      finalTotal -= couponDiscount;
    }

    // 2. Tính giảm giá từ Điểm (1 điểm = 10,000đ)
    if (pointsToUse > 0) {
      pointsDiscount = pointsToUse * POINT_VALUE;
      if (pointsDiscount >= finalTotal) {
         pointsDiscount = finalTotal; // Không giảm quá số tiền còn lại
         finalTotal = 0;
      } else {
         finalTotal -= pointsDiscount;
      }
    }

    return { subTotal, couponDiscount, pointsDiscount, finalTotal };
  }, [total, selectedCoupon, pointsToUse]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value < 0) return;
    // Không cho nhập quá số điểm đang có
    if (user?.points && value > user.points) {
        setPointsToUse(user.points);
    } else {
        setPointsToUse(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Gắn thêm dữ liệu giảm giá vào form gửi lên Backend
    const orderData = {
        ...form,
        discountCode: selectedCoupon?.code || null,
        pointsToUse: pointsToUse || 0
    };

    const result = await dispatch(createOrder(orderData));
    if (createOrder.fulfilled.match(result)) {
      setOrderSuccess(true);
    }
  };

  // --- MÀN HÌNH ĐẶT HÀNG THÀNH CÔNG ---
  if (orderSuccess && currentOrder) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-400 mb-2">
            Mã đơn hàng: <span className="text-yellow-400 font-bold">#{currentOrder.id}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Đơn hàng sẽ được xác nhận tự động sau 5 phút.
          </p>
          <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm border-b border-gray-700 pb-2">
              <span className="text-gray-400">Tiền hàng:</span>
              <span className="text-white">{formatPrice(currentOrder.totalAmount)}</span>
            </div>
            
            {currentOrder.discountPercent > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Mã giảm ({currentOrder.discountPercent}%):</span>
                  <span>- {formatPrice((currentOrder.totalAmount * currentOrder.discountPercent)/100)}</span>
                </div>
            )}
            
            {currentOrder.pointsDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Dùng điểm ({currentOrder.pointsUsed} điểm):</span>
                  <span>- {formatPrice(currentOrder.pointsDiscount)}</span>
                </div>
            )}

            <div className="flex justify-between text-sm pt-2">
              <span className="text-gray-400">Thực trả:</span>
              <span className="text-yellow-400 font-bold text-lg">
                {formatPrice(currentOrder.finalAmount)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/orders")} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-2xl transition-colors">
              Xem đơn hàng
            </button>
            <button onClick={() => navigate("/home")} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-2xl transition-colors">
              Tiếp tục mua
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MÀN HÌNH CHÍNH CHECKOUT ---
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
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
          <span className="text-gray-400 text-sm hidden sm:block">/ Thanh toán</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thanh toán đơn hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN & KHUYẾN MÃI */}
          <div className="lg:col-span-2 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" /> Họ và tên
                    </label>
                    <input type="text" name="shippingName" value={form.shippingName} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Số điện thoại
                    </label>
                    <input type="tel" name="shippingPhone" value={form.shippingPhone} onChange={handleChange} required placeholder="0909 123 456" className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-400 transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Địa chỉ giao hàng
                    </label>
                    <textarea name="shippingAddress" value={form.shippingAddress} onChange={handleChange} required rows={2} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-400 transition-colors resize-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Ghi chú (tuỳ chọn)</label>
                    <textarea name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Ghi chú cho đơn hàng..." className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white text-sm focus:border-yellow-400 transition-colors resize-none" />
                  </div>
                </div>
              </div>

              {/* TÍNH NĂNG MỚI: MÃ KHUYẾN MÃI (COUPON) */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-yellow-400" />
                  Mã khuyến mãi
                </h2>
                
                {total < 2000000 ? (
                   <p className="text-sm text-gray-400 mb-4 bg-gray-700/50 p-3 rounded-xl border border-gray-600/50 flex items-center gap-2">
                     <AlertCircle className="w-4 h-4 text-orange-400" />
                     Mua thêm <strong>{formatPrice(2000000 - total)}</strong> để áp dụng được mã giảm giá.
                   </p>
                ) : (
                   <p className="text-sm text-green-400 mb-4 font-medium">Bạn đã đủ điều kiện áp dụng mã khuyến mãi!</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   {AVAILABLE_COUPONS.map(coupon => {
                       const isEligible = total >= coupon.minOrder;
                       const isSelected = selectedCoupon?.code === coupon.code;
                       
                       return (
                           <div 
                              key={coupon.code}
                              onClick={() => isEligible ? setSelectedCoupon(isSelected ? null : coupon) : null}
                              className={`border rounded-xl p-3 relative transition-all ${
                                  !isEligible ? "border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed" :
                                  isSelected ? "border-yellow-400 bg-yellow-400/10 cursor-pointer shadow-[0_0_10px_rgba(250,204,21,0.2)]" :
                                  "border-gray-600 bg-gray-700 hover:border-yellow-400/50 cursor-pointer"
                              }`}
                           >
                               {isSelected && (
                                   <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">
                                       ĐÃ CHỌN
                                   </div>
                               )}
                               <h3 className={`font-bold ${isSelected ? "text-yellow-400" : "text-white"}`}>{coupon.label}</h3>
                               <p className="text-xs text-gray-400 mt-1">{coupon.desc}</p>
                           </div>
                       )
                   })}
                </div>
              </div>

              {/* TÍNH NĂNG MỚI: ĐIỂM TÍCH LŨY */}
              <div className="bg-gray-800 rounded-2xl p-6">
                <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-400" />
                  Sử dụng điểm tích lũy
                </h2>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50">
                    <div>
                        <p className="text-sm text-gray-300">Điểm hiện có của bạn: <span className="font-bold text-yellow-400 text-lg">{user?.points || 0} điểm</span></p>
                        <p className="text-xs text-gray-400 mt-1">1 điểm = {formatPrice(POINT_VALUE)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input 
                           type="number" 
                           min="0" 
                           max={user?.points || 0}
                           value={pointsToUse}
                           onChange={handlePointsChange}
                           disabled={!user?.points || user?.points === 0}
                           className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-center font-bold focus:border-yellow-400 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-400">điểm</span>
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
                    <p className="font-semibold text-yellow-400">COD - Thanh toán khi nhận hàng</p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 sticky top-24 shadow-xl border border-gray-700/50">
              <h3 className="font-bold text-lg mb-4 pb-4 border-b border-gray-700">
                Tóm tắt đơn hàng ({items.length} sản phẩm)
              </h3>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto mb-4 custom-scrollbar pr-2">
                {items.map((item) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-xl" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium line-clamp-2">{item.product.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5">SL: {item.quantity}</p>
                        <p className="text-white text-xs font-bold mt-0.5">{formatPrice(price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BẢNG TÍNH TIỀN REAL-TIME */}
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tổng tiền hàng:</span>
                  <span className="text-white font-medium">{formatPrice(calculations.subTotal)}</span>
                </div>
                
                {calculations.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Mã giảm ({selectedCoupon.percent}%):</span>
                    <span className="font-medium">- {formatPrice(calculations.couponDiscount)}</span>
                  </div>
                )}

                {calculations.pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Dùng điểm ({pointsToUse} điểm):</span>
                    <span className="font-medium">- {formatPrice(calculations.pointsDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Phí vận chuyển:</span>
                  <span className="text-gray-300">Miễn phí</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-700 border-dashed">
                  <span className="font-bold text-lg text-white">Thực trả:</span>
                  <div className="text-right">
                     <span className="text-yellow-400 font-black text-2xl block">
                       {formatPrice(calculations.finalTotal)}
                     </span>
                     {(calculations.couponDiscount > 0 || calculations.pointsDiscount > 0) && (
                         <span className="text-gray-500 text-xs line-through block mt-0.5">
                            Gốc: {formatPrice(calculations.subTotal)}
                         </span>
                     )}
                  </div>
                </div>
              </div>
              
              {/* Button Submit Form được dời ra ngoài Form để đặt ở cuối tóm tắt (Dùng thuộc tính form) */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isLoading || items.length === 0}
                className="w-full mt-6 py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/30 disabled:text-gray-500 text-black font-bold rounded-xl transition-all text-lg flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Xác nhận đặt hàng</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}