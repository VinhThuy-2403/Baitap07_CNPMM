import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";
import {
  fetchSaleProducts,
  fetchNewProducts,
  fetchBestSellerProducts,
} from "../redux/productSlice";
import ProductSection from "../components/ProductSection";
// import { Camera, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Camera, LogOut, User, ChevronLeft, ChevronRight, Search } from "lucide-react";
import TopProductsCarousel from "../components/TopProductsCarousel";
import AllProductsSection from "../components/AllProductsSection";
import { getTopBestSellerAPI, getTopMostViewedAPI } from "../services/authService";
import { useSelector, useDispatch } from "react-redux";
import { toggleCart, fetchCart } from "../redux/cartSlice";
import { ShoppingCart, Package } from "lucide-react";

const banners = [
  {
    id: 1,
    title: "Sony Alpha A7 IV",
    subtitle: "Mirrorless Full-frame 33MP — Đỉnh cao nhiếp ảnh",
    bg: "from-gray-900 via-gray-800 to-yellow-900",
    badge: "MỚI NHẤT",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600",
  },
  {
    id: 2,
    title: "Fujifilm X-T5",
    subtitle: "40.2MP APS-C — Thiết kế Retro đầy cá tính",
    bg: "from-gray-900 via-yellow-900 to-gray-800",
    badge: "GIẢM 10%",
    image: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=600",
  },
  {
    id: 3,
    title: "Canon EOS 90D",
    subtitle: "DSLR 32.5MP — Lựa chọn của chuyên gia",
    bg: "from-yellow-900 via-gray-900 to-gray-800",
    badge: "BÁN CHẠY",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600",
  },
];

const categories = [
  { name: "DSLR", icon: "📷", desc: "Máy ảnh phản xạ" },
  { name: "Mirrorless", icon: "🎥", desc: "Không gương lật" },
  { name: "Compact", icon: "📸", desc: "Nhỏ gọn tiện lợi" },
  { name: "Phụ kiện", icon: "🎒", desc: "Túi, chân máy, lens" },
];

const brands = ["Canon", "Sony", "Nikon", "Fujifilm"];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { sale, newProducts, bestSeller } = useSelector((state) => state.product);

  const [banner, setBanner] = useState(0);
  const [salePage, setSalePage] = useState(1);
  const [newPage, setNewPage] = useState(1);
  const [bestPage, setBestPage] = useState(1);

  const [topBestSeller, setTopBestSeller] = useState([]);
  const [topMostViewed, setTopMostViewed] = useState([]);
  const [topLoading, setTopLoading] = useState(true);

  const { count } = useSelector((state) => state.cart);

  useEffect(() => {
    if (token) dispatch(fetchCart());
  }, [token]);

  useEffect(() => {
    const fetchTop = async () => {
      setTopLoading(true);
      try {
        const [bestRes, viewRes] = await Promise.all([
          getTopBestSellerAPI(10),
          getTopMostViewedAPI(10),
        ]);
        setTopBestSeller(bestRes.data);
        setTopMostViewed(viewRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setTopLoading(false);
      }
    };
    fetchTop();
  }, []);

  // Auto slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products
  useEffect(() => {
    dispatch(fetchSaleProducts({ page: salePage, limit: 6 }));
  }, [salePage]);

  useEffect(() => {
    dispatch(fetchNewProducts({ page: newPage, limit: 6 }));
  }, [newPage]);

  useEffect(() => {
    dispatch(fetchBestSellerProducts({ page: bestPage, limit: 6 }));
  }, [bestPage]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-2 rounded-xl">
              <Camera className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold">
              LENS<span className="text-yellow-400">STORE</span>
            </span>
          </div>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => navigate(`/search?category=${c.name}`)}  
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search icon */}
          <button
            onClick={() => navigate("/search")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
          >
            <Search className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:block text-gray-300 text-sm">Tìm kiếm</span>
          </button>

          {/* Cart icon */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="relative flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:block text-gray-300 text-sm">Giỏ hàng</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>


          {/* User */}
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors text-sm"
          >
            <Package className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:block text-gray-300">Đơn hàng</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors text-sm"
            >
              <User className="w-4 h-4 text-yellow-400" />
              <span className="hidden sm:block text-gray-300">
                {user?.name || "Tài khoản"}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-xl transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Đăng xuất</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">

        {/* BANNER */}
        <div className="mt-6 relative rounded-3xl overflow-hidden h-72 md:h-96">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 bg-gradient-to-r ${b.bg} flex items-center transition-opacity duration-700 ${
                i === banner ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center justify-between w-full px-8 md:px-16">
                <div>
                  <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    {b.badge}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2">
                    {b.title}
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base max-w-xs">
                    {b.subtitle}
                  </p>
                  <button
                    onClick={() => navigate("/search")}
                    className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm"
                  >
                    Khám phá ngay
                  </button>
                </div>
                <img
                  src={b.image}
                  alt={b.title}
                  className="hidden md:block w-72 h-64 object-cover rounded-2xl opacity-80"
                />
              </div>
            </div>
          ))}

          {/* Banner controls */}
          <button
            onClick={() => setBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setBanner(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === banner ? "bg-yellow-400 w-6" : "bg-gray-500"
                }`}
              />
            ))}
          </div>
        </div>

        {/* DANH MỤC */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <div
              key={c.name}
              onClick={() => navigate(`/search?category=${c.name}`)}
              className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-5 text-center cursor-pointer transition-all hover:-translate-y-1 border border-gray-700 hover:border-yellow-400/50"
            >
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="font-bold text-white">{c.name}</div>
              <div className="text-gray-400 text-xs mt-1">{c.desc}</div>
            </div>
          ))}
        </div>

        {/* THƯƠNG HIỆU */}
        <div className="mt-10 bg-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-400 mb-4 text-center uppercase tracking-widest">
            Thương hiệu nổi bật
          </h2>
          <div className="flex justify-center gap-8 md:gap-16">
            {brands.map((b) => (
              <button
                key={b}
                className="text-xl md:text-2xl font-black text-gray-500 hover:text-yellow-400 transition-colors tracking-widest"
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* SẢN PHẨM KHUYẾN MÃI */}
        <ProductSection
          title="🔥 Khuyến mãi hot"
          products={sale.data}
          pagination={sale.pagination}
          onPageChange={setSalePage}
          isLoading={sale.isLoading}
        />

        {/* SẢN PHẨM MỚI */}
        <ProductSection
          title="✨ Mới nhất"
          products={newProducts.data}
          pagination={newProducts.pagination}
          onPageChange={setNewPage}
          isLoading={newProducts.isLoading}
        />

        {/* BÁN CHẠY */}
        <ProductSection
          title="🏆 Bán chạy nhất"
          products={bestSeller.data}
          pagination={bestSeller.pagination}
          onPageChange={setBestPage}
          isLoading={bestSeller.isLoading}
        />

        <div className="border-t border-gray-700/50 my-4" />

        <TopProductsCarousel
          title="Top 10 bán chạy nhất"
          icon="trending"
          products={topBestSeller}
          isLoading={topLoading}
        />

        <TopProductsCarousel
          title="Top 10 xem nhiều nhất"
          icon="eye"
          products={topMostViewed}
          isLoading={topLoading}
        />

        <div className="border-t border-gray-700/50 my-4" />

        <AllProductsSection />

      </div>

      {/* FOOTER */}
      <footer className="mt-16 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-yellow-400 p-1.5 rounded-lg">
                <Camera className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold">
                LENS<span className="text-yellow-400">STORE</span>
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Chuyên cung cấp máy ảnh và phụ kiện chính hãng từ các thương hiệu
              hàng đầu thế giới.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 text-gray-300">Danh mục</h4>
            {categories.map((c) => (
              <p key={c.name} className="text-gray-500 text-xs mb-2 hover:text-yellow-400 cursor-pointer">
                {c.name}
              </p>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 text-gray-300">Thương hiệu</h4>
            {brands.map((b) => (
              <p key={b} className="text-gray-500 text-xs mb-2 hover:text-yellow-400 cursor-pointer">
                {b}
              </p>
            ))}
          </div>
          <div>
            <h4 className="font-bold text-sm mb-3 text-gray-300">Liên hệ</h4>
            <p className="text-gray-500 text-xs mb-2">📍 TP. Hồ Chí Minh</p>
            <p className="text-gray-500 text-xs mb-2">📞 0909 123 456</p>
            <p className="text-gray-500 text-xs mb-2">✉️ lensstore@gmail.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 py-4 text-center text-gray-600 text-xs">
          © 2026 LensStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}