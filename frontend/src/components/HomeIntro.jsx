import AnimateIn from "./AnimateIn";

function HomeIntro({ categoryCount = 0, brandCount = 0 }) {
  const stats = [
    {
      value: categoryCount > 0 ? `${categoryCount}` : "6+",
      label: "Danh mục",
    },
    {
      value: brandCount > 0 ? `${brandCount}` : "5",
      label: "Thương hiệu",
    },
    { value: "2–5", label: "Ngày giao" },
  ];

  return (
    <AnimateIn className="page-container section-home !pb-0">
      <div className="home-intro-panel">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="home-kicker text-primary">PitchZone Store</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
              Đồ bóng đá chính hãng
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Giày, áo đấu, bóng và phụ kiện — chọn nhanh, giao tận tay, tư vấn
              size miễn phí.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4">
            {stats.map((item) => (
              <div key={item.label} className="home-stat-card">
                <p className="home-stat-value">{item.value}</p>
                <p className="home-stat-label">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimateIn>
  );
}

export default HomeIntro;