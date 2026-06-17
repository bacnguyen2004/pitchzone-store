import { useEffect, useState } from "react";

import { getActivePromotion, getBrands, getCategories, getProducts } from "../api/catalog";
import BrandStrip from "../components/BrandStrip";
import FeaturedCategories from "../components/FeaturedCategories";
import FeaturedProducts from "../components/FeaturedProducts";
import HeroBanner from "../components/HeroBanner";
import HomeCTA from "../components/HomeCTA";
import HomeDealsSection from "../components/HomeDealsSection";
import HomeIntro from "../components/HomeIntro";
import HomeQuickLinks from "../components/HomeQuickLinks";
import TrustBadges from "../components/TrustBadges";

function pickBestsellers(bestsellerList, newList, limit = 4) {
  const newIds = new Set(newList.map((product) => product.id));
  const unique = bestsellerList.filter((product) => !newIds.has(product.id));

  if (unique.length >= limit) {
    return unique.slice(0, limit);
  }

  const fillers = newList.filter(
    (product) => !unique.some((item) => item.id === product.id),
  );

  return [...unique, ...fillers].slice(0, limit);
}

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadHomeData() {
      setStatus("loading");

      try {
        const [categoryData, brandData, newProductData, bestsellerData, promotionData] =
          await Promise.all([
            getCategories(),
            getBrands(),
            getProducts({ ordering: "-created_at", page: 1 }),
            getProducts({ ordering: "-sales", page: 1 }),
            getActivePromotion().catch(() => null),
          ]);

        setCategories(categoryData);
        setBrands(brandData);

        const newList = newProductData.results || newProductData;
        const bestsellerList = bestsellerData.results || bestsellerData;

        setNewProducts(newList.slice(0, 4));
        setBestsellerProducts(pickBestsellers(bestsellerList, newList));
        setPromotion(promotionData);
        setStatus("success");
      } catch {
        setCategories([]);
        setBrands([]);
        setNewProducts([]);
        setBestsellerProducts([]);
        setPromotion(null);
        setStatus("error");
      }
    }

    loadHomeData();
  }, []);

  return (
    <main className="home-page">
      <div className="home-page-hero">
        <HeroBanner />
      </div>

      <div className="home-page-bridge">
        <HomeQuickLinks />
      </div>

      <div className="home-page-body">
        <HomeIntro
          categoryCount={categories.length}
          brandCount={brands.length}
        />
        <FeaturedCategories categories={categories} status={status} />
        <HomeDealsSection promotion={promotion} status={status} />
        <FeaturedProducts
          products={newProducts}
          status={status}
          eyebrow="Match day ready"
          title="Hàng mới về cửa hàng"
          description="Giày, áo đấu và phụ kiện vừa được nhập — sẵn sàng cho buổi tập và trận đấu tới"
          variant="new"
        />
        <FeaturedProducts
          id="bestsellers"
          products={bestsellerProducts}
          status={status}
          eyebrow="Top sellers"
          title="Hàng bán chạy"
          description="Những sản phẩm được khách PitchZone chọn nhiều nhất"
          variant="bestseller"
        />
        <BrandStrip brands={brands} status={status} />
        <HomeCTA />
        <TrustBadges />
      </div>
    </main>
  );
}

export default HomePage;