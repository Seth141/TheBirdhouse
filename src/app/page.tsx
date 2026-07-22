import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { LiveCameraCard } from "@/components/home/LiveCameraCard";
import { StatsGrid } from "@/components/home/StatsGrid";
import { RecentMoments } from "@/components/home/RecentMoments";
import { TipCard } from "@/components/home/TipCard";
import { PlaylistCard } from "@/components/home/PlaylistCard";
import { DesktopInsights } from "@/components/home/DesktopInsights";
import { generateBirdTip } from "@/lib/tips/generateBirdTip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tip = await generateBirdTip();

  return (
    <>
      <Header variant="home" />
      <main className="flex-1 px-5 pb-10 pt-2 lg:px-0 lg:pb-14 lg:pt-4">
        <div className="space-y-6 lg:hidden">
          <Hero />
          <LiveCameraCard />
          <StatsGrid />
          <DesktopInsights />
          <RecentMoments />
          <TipCard tip={tip} />
          <PlaylistCard />
        </div>

        <div className="hidden lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-8 xl:gap-10">
          <div className="space-y-7">
            <Hero />
            <DesktopInsights />
            <RecentMoments />
          </div>
          <aside className="space-y-6 lg:sticky lg:top-36">
            <LiveCameraCard />
            <StatsGrid />
            <TipCard tip={tip} />
            <PlaylistCard />
          </aside>
        </div>
      </main>
    </>
  );
}
