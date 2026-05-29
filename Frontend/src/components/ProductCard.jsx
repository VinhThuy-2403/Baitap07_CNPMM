import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react"; // Import icon Heart
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist } from "../redux/wishlistSlice";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Lấy danh sách wishlist từ Redux để kiểm tra xem sản phẩm này đã được thích chưa
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isLiked = wishlistItems.some((item) => item.id === product.id);

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null;

  const handleToggleHeart = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài thẻ div cha (tránh bị chuyển trang)
    dispatch(toggleWishlist(product));
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative"
    >
      {/* NÚT YÊU THÍCH (TRÁI TIM) - Đặt góc phải trên cùng */}
      <button
        onClick={handleToggleHeart}
        className={`absolute top-2 right-2 z-10 p-2 rounded-full backdrop-blur-sm transition-colors ${
          isLiked 
            ? "bg-red-50 text-red-500 hover:bg-red-100" 
            : "bg-black/20 text-white hover:bg-black/40 hover:text-red-400"
        }`}
      >
        <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
      </button>

      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400";
          }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isSale && discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
              MỚI
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-black text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
              BÁN CHẠY
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {product.brand} • {product.category}
        </span>
        <h3 className="font-semibold text-gray-800 mt-1 mb-2 line-clamp-2 text-sm">
          {product.name}
        </h3>
        
        {/* Lượt mua và đánh giá (Mô phỏng dữ liệu) */}
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
           <span>⭐ {product.reviewsCount || 0} Đánh giá</span>
           <span>•</span>
           <span>Đã bán {product.sold || 0}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {product.salePrice ? (
            <>
              <span className="text-yellow-500 font-bold text-base">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-gray-400 text-xs line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-yellow-500 font-bold text-base">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <button className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm rounded-xl transition-colors">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}