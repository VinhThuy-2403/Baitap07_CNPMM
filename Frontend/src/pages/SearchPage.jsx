import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchProductsAPI } from "../services/authService";
import ProductCard from "../components/ProductCard";
import {
  Camera, Search, SlidersHorizontal, X,
  ChevronDown, ChevronUp, ArrowLeft,
} from "lucide-react";

const BRANDS = ["Canon", "Sony", "Nikon", "Fujifilm", "Khác"];
const CATEGORIES = ["DSLR", "Mirrorless", "Compact", "Phụ kiện"];
const PRICE_RANGES = [
  { label: "Dưới 5 triệu", min: 0, max: 5000000 },
  { label: "5 - 15 triệu", min: 5000000, max: 15000000 },
  { label: "15 - 30 triệu", min: 15000000, max: 30000000 },
  { label: "30 - 50 triệu", min: 30000000, max: 50000000 },
  { label: "Trên 50 triệu", min: 50000000, max: 999000000 },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "best_seller", label: "Bán chạy nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedBrands, setSelectedBrands] = useState(
    searchParams.get("brand") ? [searchParams.get("brand")] : []
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Results state
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mobile filter toggle
  const [showFilter, setShowFilter] = useState(false);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    brand: true, category: true, price: true, status: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sortBy,
        ...(keyword && { keyword }),
        ...(selectedBrands.length === 1 && { brand: selectedBrands[0] }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedPrice && { minPrice: selectedPrice.min, maxPrice: selectedPrice.max }),
        ...(isNew && { isNew: true }),
        ...(isBestSeller && { isBestSeller: true }),
        ...(isSale && { isSale: true }),
      };
      const res = await searchProductsAPI(params);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, selectedBrands, selectedCategory, selectedPrice, isNew, isBestSeller, isSale, sortBy, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Khi category từ URL thay đổi
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const kw = searchParams.get("keyword");
    if (kw) setKeyword(kw);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResults();
  };

  const handleReset = () => {
    setKeyword("");
    setSelectedBrands([]);
    setSelectedCategory("");
    setSelectedPrice(null);
    setIsNew(false);
    setIsBestSeller(false);
    setIsSale(false);
    setSortBy("newest");
    setPage(1);
  };

  const toggleBrand = (brand) => {
    setPage(1);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const activeFilterCount = [
    selectedBrands.length > 0,
    selectedCategory !== "",
    selectedPrice !== null,
    isNew, isBestSeller, isSale,
  ].filter(Boolean).length;

  // FILTER PANEL COMPONENT
  const FilterPanel = () => (
    <div className="space-y-1">

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded-xl mb-3 transition-colors"
        >
          <X className="w-4 h-4" />
          Xóa {activeFilterCount} bộ lọc
        </button>
      )}

      {/* Thương hiệu */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("brand")}
          className="w-full flex items-center justify-between p-4 text-white font-semibold"
        >
          <span>Thương hiệu</span>
          {openSections.brand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.brand && (
          <div className="px-4 pb-4 space-y-2">
            {BRANDS.map((b) => (
              <label key={b} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() => toggleBrand(b)}
                  className="w-4 h-4 accent-yellow-400 cursor-pointer"
                />
                <span className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                  {b}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Danh mục */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between p-4 text-white font-semibold"
        >
          <span>Danh mục</span>
          {openSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.category && (
          <div className="px-4 pb-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === ""}
                onChange={() => { setSelectedCategory(""); setPage(1); }}
                className="w-4 h-4 accent-yellow-400 cursor-pointer"
              />
              <span className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                Tất cả
              </span>
            </label>
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === c}
                  onChange={() => { setSelectedCategory(c); setPage(1); }}
                  className="w-4 h-4 accent-yellow-400 cursor-pointer"
                />
                <span className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                  {c}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Khoảng giá */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between p-4 text-white font-semibold"
        >
          <span>Khoảng giá</span>
          {openSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.price && (
          <div className="px-4 pb-4 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={selectedPrice === null}
                onChange={() => { setSelectedPrice(null); setPage(1); }}
                className="w-4 h-4 accent-yellow-400 cursor-pointer"
              />
              <span className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                Tất cả
              </span>
            </label>
            {PRICE_RANGES.map((r) => (
              <label key={r.label} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={selectedPrice?.label === r.label}
                  onChange={() => { setSelectedPrice(r); setPage(1); }}
                  className="w-4 h-4 accent-yellow-400 cursor-pointer"
                />
                <span className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Trạng thái */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("status")}
          className="w-full flex items-center justify-between p-4 text-white font-semibold"
        >
          <span>Trạng thái</span>
          {openSections.status ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openSections.status && (
          <div className="px-4 pb-4 space-y-2">
            {[
              { label: "Hàng mới", value: isNew, setter: setIsNew },
              { label: "Bán chạy", value: isBestSeller, setter: setIsBestSeller },
              { label: "Đang giảm giá", value: isSale, setter: setIsSale },
            ].map(({ label, value, setter }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => { setter(!value); setPage(1); }}
                  className="w-4 h-4 accent-yellow-400 cursor-pointer"
                />
                <span className="text-gray-300 text-sm group-hover:text-yellow-400 transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* NAVBAR */}
      <nav className="bg-black/90 backdrop-blur-md sticky top-0 z-50 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
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

          {/* Search bar trong navbar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex items-center bg-gray-800 rounded-xl px-3 py-2 gap-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm máy ảnh..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
              />
              {keyword && (
                <button type="button" onClick={() => setKeyword("")}>
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
          </form>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* FILTER - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-yellow-400" />
                Bộ lọc
              </h2>
              <FilterPanel />
            </div>
          </aside>

          {/* MAIN */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowFilter(true)}
                  className="lg:hidden flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-xl text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 text-yellow-400" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <p className="text-gray-400 text-sm">
                  {isLoading ? "Đang tìm..." : (
                    <>
                      Tìm thấy{" "}
                      <span className="text-white font-bold">
                        {pagination?.total || 0}
                      </span>{" "}
                      sản phẩm
                    </>
                  )}
                </p>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-gray-800 text-white text-sm px-3 py-2 rounded-xl outline-none border border-gray-700 focus:border-yellow-400"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBrands.map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs px-3 py-1 rounded-full"
                  >
                    {b}
                    <button onClick={() => toggleBrand(b)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedCategory && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedPrice && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
                    {selectedPrice.label}
                    <button onClick={() => setSelectedPrice(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {isNew && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
                    Hàng mới
                    <button onClick={() => setIsNew(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {isBestSeller && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
                    Bán chạy
                    <button onClick={() => setIsBestSeller(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {isSale && (
                  <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 text-xs px-3 py-1 rounded-full">
                    Đang giảm giá
                    <button onClick={() => setIsSale(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl h-72 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-600 text-sm mb-6">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={handleReset}
                  className="bg-yellow-400 text-black px-6 py-2 rounded-xl font-bold text-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 rounded-xl disabled:opacity-40 hover:bg-gray-700 text-sm transition-colors"
                >
                  ← Trước
                </button>
                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                        page === i + 1
                          ? "bg-yellow-400 text-black"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 bg-gray-800 rounded-xl disabled:opacity-40 hover:bg-gray-700 text-sm transition-colors"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {showFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowFilter(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Bộ lọc</h2>
              <button onClick={() => setShowFilter(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setShowFilter(false)}
              className="w-full mt-4 py-3 bg-yellow-400 text-black font-bold rounded-xl"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}