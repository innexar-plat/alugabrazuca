"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import { api, resolveMediaUrl } from "@/lib/api";

interface SearchResult {
  id: string;
  title: string;
  country: string;
  state: string;
  city: string;
  neighborhood?: string;
  pricePerMonth: number;
  currency: string;
  listingType: string;
  roomSize: string;
  bedType: string;
  bathroomType: string;
  utilitiesIncluded: boolean;
  internetIncluded: boolean;
  isFurnished: boolean;
  availableFrom: string;
  minimumStay: number;
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  createdAt: string;
  photos: { url: string; thumbnailUrl: string }[];
  host: { id: string; firstName: string; isVerified: boolean };
}

interface SearchResponse {
  data: SearchResult[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface Suggestion {
  label: string;
  city: string;
  state: string;
  country: string;
}

export default function RoomsPage() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter state
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [listingType, setListingType] = useState(
    searchParams.get("listingType") || "",
  );
  const [isFurnished, setIsFurnished] = useState(
    searchParams.get("isFurnished") || "",
  );
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(
    searchParams.get("utilitiesIncluded") || "",
  );
  const [internetIncluded, setInternetIncluded] = useState(
    searchParams.get("internetIncluded") || "",
  );
  const [allowsPets, setAllowsPets] = useState(
    searchParams.get("allowsPets") || "",
  );
  const [allowsSmoking, setAllowsSmoking] = useState(
    searchParams.get("allowsSmoking") || "",
  );
  const [allowsCouples, setAllowsCouples] = useState(
    searchParams.get("allowsCouples") || "",
  );
  const [lgbtFriendly, setLgbtFriendly] = useState(
    searchParams.get("lgbtFriendly") || "",
  );
  const [hasParking, setHasParking] = useState(
    searchParams.get("hasParking") || "",
  );
  const [hasPool, setHasPool] = useState(searchParams.get("hasPool") || "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt",
  );
  const [order, setOrder] = useState(searchParams.get("order") || "desc");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    params.set("sortBy", sortBy);
    params.set("order", order);
    if (query) params.set("query", query);
    if (city) params.set("city", city);
    if (country) params.set("country", country);
    if (state) params.set("state", state);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (listingType) params.set("listingType", listingType);
    if (isFurnished) params.set("isFurnished", isFurnished);
    if (utilitiesIncluded) params.set("utilitiesIncluded", utilitiesIncluded);
    if (internetIncluded) params.set("internetIncluded", internetIncluded);
    if (allowsPets) params.set("allowsPets", allowsPets);
    if (allowsSmoking) params.set("allowsSmoking", allowsSmoking);
    if (allowsCouples) params.set("allowsCouples", allowsCouples);
    if (lgbtFriendly) params.set("lgbtFriendly", lgbtFriendly);
    if (hasParking) params.set("hasParking", hasParking);
    if (hasPool) params.set("hasPool", hasPool);
    return params;
  }, [
    page,
    sortBy,
    order,
    query,
    city,
    country,
    state,
    minPrice,
    maxPrice,
    listingType,
    isFurnished,
    utilitiesIncluded,
    internetIncluded,
    allowsPets,
    allowsSmoking,
    allowsCouples,
    lgbtFriendly,
    hasParking,
    hasPool,
  ]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const res = await api.get<SearchResponse>(
        `/listings/search?${params.toString()}`,
      );
      setResults(res.data);
      setMeta(res.meta);
    } catch {
      setResults([]);
      setMeta({ total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    const params = buildParams();
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [buildParams, router, pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleSuggestionSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await api.get<{ data: Suggestion[] }>(
        `/listings/suggestions?query=${encodeURIComponent(value)}`,
      );
      setSuggestions(res.data);
      setShowSuggestions(res.data.length > 0);
    } catch {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s: Suggestion) => {
    setCity(s.city);
    setState(s.state);
    setCountry(s.country);
    setQuery(s.label);
    setShowSuggestions(false);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setCity("");
    setCountry("");
    setState("");
    setMinPrice("");
    setMaxPrice("");
    setListingType("");
    setIsFurnished("");
    setUtilitiesIncluded("");
    setInternetIncluded("");
    setAllowsPets("");
    setAllowsSmoking("");
    setAllowsCouples("");
    setLgbtFriendly("");
    setHasParking("");
    setHasPool("");
    setSortBy("createdAt");
    setOrder("desc");
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newOrder] = value.split(":");
    setSortBy(newSortBy);
    setOrder(newOrder);
    setPage(1);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Search Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {t("title")}
          </h1>
          <p className="text-gray-500 mb-4">{t("subtitle")}</p>

          <form
            onSubmit={handleSearch}
            className="flex flex-wrap sm:flex-nowrap gap-2"
          >
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={query}
                onChange={(e) => handleSuggestionSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={t("placeholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="shrink-0 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {t("searchButton")}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
            >
              {t("filters")}
            </button>
          </form>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm overflow-visible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Row 1: Price, Room type, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("priceRange")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder={t("minPrice")}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder={t("maxPrice")}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("roomType")}
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">—</option>
                  <option value="private_room">Private Room</option>
                  <option value="shared_room">Shared Room</option>
                  <option value="entire_place">Entire Place</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("country")}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("city")}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Row 2: Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mt-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("amenities")}
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFurnished === "true"}
                      onChange={(e) =>
                        setIsFurnished(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("furnished")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={utilitiesIncluded === "true"}
                      onChange={(e) =>
                        setUtilitiesIncluded(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("utilitiesIncluded")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={internetIncluded === "true"}
                      onChange={(e) =>
                        setInternetIncluded(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("internetIncluded")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasParking === "true"}
                      onChange={(e) =>
                        setHasParking(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("hasParking")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPool === "true"}
                      onChange={(e) =>
                        setHasPool(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("hasPool")}
                  </label>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("rules")}
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowsPets === "true"}
                      onChange={(e) =>
                        setAllowsPets(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("petsAllowed")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowsSmoking === "true"}
                      onChange={(e) =>
                        setAllowsSmoking(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("smokingAllowed")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowsCouples === "true"}
                      onChange={(e) =>
                        setAllowsCouples(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("couplesAllowed")}
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lgbtFriendly === "true"}
                      onChange={(e) =>
                        setLgbtFriendly(e.target.checked ? "true" : "")
                      }
                      className="rounded border-gray-300"
                    />
                    {t("lgbtFriendly")}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={clearFilters}
                className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                {t("clearFilters")}
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setShowFilters(false);
                }}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t("applyFilters")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Results header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-gray-600 text-sm">
            {loading ? t("loading") : t("results", { count: meta.total })}
          </p>
          <select
            value={`${sortBy}:${order}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="createdAt:desc">{t("sortNewest")}</option>
            <option value="pricePerMonth:asc">{t("sortPriceLow")}</option>
            <option value="pricePerMonth:desc">{t("sortPriceHigh")}</option>
            <option value="viewCount:desc">{t("sortViews")}</option>
          </select>
        </div>

        {/* Listing grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-gray-900">
              {t("noResults")}
            </p>
            <p className="text-gray-500 mt-1">{t("noResultsDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {listing.photos[0] ? (
                      <img
                        src={resolveMediaUrl(
                          listing.photos[0].thumbnailUrl ||
                            listing.photos[0].url,
                        )}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {listing.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                        {t("featured")}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {listing.city}, {listing.state}, {listing.country}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(listing.pricePerMonth, listing.currency)}
                        {t("perMonth")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {listing.viewCount} {t("views")}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {listing.isFurnished && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          {t("furnished")}
                        </span>
                      )}
                      {listing.utilitiesIncluded && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {t("utilitiesIncluded")}
                        </span>
                      )}
                      {listing.internetIncluded && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          {t("internetIncluded")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t("previous")}
            </button>
            <span className="text-sm text-gray-600">
              {t("page")} {meta.page} {t("of")} {meta.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
              disabled={page >= meta.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
