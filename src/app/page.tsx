import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { LiveCameraCard } from "@/components/home/LiveCameraCard";
import { StatsGrid } from "@/components/home/StatsGrid";
import { RecentMoments } from "@/components/home/RecentMoments";
import { TipCard } from "@/components/home/TipCard";

export default function HomePage() {
  return (
    <>
      <Header variant="home" />
      <main className="flex-1 space-y-6 px-5 pb-8 pt-2">
        <Hero />
        <LiveCameraCard />
        <StatsGrid />
        <RecentMoments />
        <TipCard />
      </main>
    </>
  );
}
