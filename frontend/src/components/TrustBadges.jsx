import AnimateIn from "./AnimateIn";
import {
  ReturnBoxIcon,
  ShieldCheckIcon,
  SupportIcon,
  TruckIcon,
} from "./StoreIcons";

const badges = [
  {
    title: "Hàng chính hãng",
    description: "Nike, Adidas, Puma — nguồn gốc rõ ràng",
    Icon: ShieldCheckIcon,
  },
  {
    title: "Giao nhanh",
    description: "Toàn quốc 2–5 ngày, đóng gói cẩn thận",
    Icon: TruckIcon,
  },
  {
    title: "Tư vấn size giày",
    description: "Hỗ trợ chọn size giày miễn phí",
    Icon: SupportIcon,
  },
  {
    title: "Đổi trả 7 ngày",
    description: "Lỗi NSX — đổi mới, không tốn phí",
    Icon: ReturnBoxIcon,
  },
];

function TrustBadges() {
  return (
    <section className="home-trust pitch-pattern border-t border-slate-100/80 bg-gradient-to-b from-slate-50/90 to-white">
      <div className="page-container section-home !pb-0">
        <AnimateIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="sport-eyebrow">PitchZone promise</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Cam kết khi mua đồ bóng đá tại PitchZone
            </h2>
          </div>
        </AnimateIn>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
          {badges.map((badge, index) => (
            <AnimateIn key={badge.title} className="h-full" delay={index * 80}>
              <div className="home-trust-card">
                <span className="home-trust-icon">
                  <badge.Icon />
                </span>
                <p className="mt-4 text-sm font-bold text-slate-900">
                  {badge.title}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  {badge.description}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBadges;