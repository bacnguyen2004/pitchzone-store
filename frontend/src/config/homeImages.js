import bannerBoots from "../assets/banner-slide-1.jpg";
import bannerBall from "../assets/banner-slide-2.jpg";
import bannerAction from "../assets/banner-slide-3.jpg";
import categoryAccessories from "../assets/category-accessories.jpg";
import categoryBalls from "../assets/category-balls.jpg";
import categoryFootballBoots from "../assets/category-football-boots.jpg";
import categoryJerseys from "../assets/category-jerseys.jpg";
import categoryShorts from "../assets/category-shorts.jpg";
import categorySocks from "../assets/category-socks.jpg";

/** Ảnh danh mục local — mỗi file khớp đúng loại sản phẩm bóng đá */
export const homeImages = {
  banner: {
    boots: bannerBoots,
    jerseys: bannerBall,
    stadium: bannerAction,
  },
  category: {
    "football-boots": categoryFootballBoots, // giày đá bóng trên cỏ
    clothing: categoryJerseys, // quần áo bóng đá
    jerseys: categoryJerseys, // áo đấu bóng đá
    shorts: categoryShorts, // quần short thể thao
    socks: categorySocks, // giày + tất trên sân
    balls: categoryBalls, // bóng trên sân cỏ
    accessories: categoryAccessories, // ống đồng / đồ bảo hộ
  },
};
