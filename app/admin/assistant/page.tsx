"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminAssistant from "@/components/admin/common/AdminAssistant";

type Recommendation = {
  title: string;
  description: string;
  href: string;
  action: string;
};

export default function AdminAssistantPage() {
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [featuredImages, setFeaturedImages] = useState(0);
  const [totalPoojas, setTotalPoojas] = useState(0);
  const [activePoojas, setActivePoojas] = useState(0);
  const [totalSevas, setTotalSevas] = useState(0);
  const [activeSevas, setActiveSevas] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [totalAaradhanes, setTotalAaradhanes] = useState(0);
  const [upcomingAaradhanes, setUpcomingAaradhanes] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch events from API
        const eventsResponse = await fetch("/api/events");
        const eventsResult = await eventsResponse.json();
        const events = eventsResult.success ? eventsResult.data : [];
        
        // Fetch stats from API
        const statsResponse = await fetch("/api/events/stats");
        const statsResult = await statsResponse.json();
        const stats = statsResult.success ? statsResult.data : { total: 0, upcoming: 0 };

        setTotalEvents(stats.total);
        setUpcomingEvents(stats.upcoming);

        const recs: Recommendation[] = [];

        // Event recommendations
        if (events.some((event: any) => event.status === "UPCOMING" && !event.location)) {
          recs.push({
            title: "Complete upcoming event details",
            description: "Some upcoming events are missing location information.",
            href: "/admin/events",
            action: "Review Events",
          });
        }

        // Placeholder recommendations for other modules (to be implemented)
        if (recs.length === 0) {
          recs.push({
            title: "All systems look healthy",
            description: "Your temple management is in great shape!",
            href: "/admin",
            action: "Go to Dashboard",
          });
        }

        setRecommendations(recs);
      } catch (error) {
        console.error("Error loading assistant data:", error);
        setRecommendations([
          {
            title: "Unable to load recommendations",
            description: "Please check your connection and try again.",
            href: "/admin",
            action: "Go to Dashboard",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Assistant"
        description="Get quick insights and recommended actions."
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border bg-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
        </div>
      ) : (
        <AdminAssistant
          totalEvents={totalEvents}
          upcomingEvents={upcomingEvents}
          totalImages={totalImages}
          featuredImages={featuredImages}
          totalPoojas={totalPoojas}
          activePoojas={activePoojas}
          totalSevas={totalSevas}
          activeSevas={activeSevas}
          totalBookings={totalBookings}
          pendingBookings={pendingBookings}
          completedBookings={completedBookings}
          totalAaradhanes={totalAaradhanes}
          upcomingAaradhanes={upcomingAaradhanes}
          recommendations={recommendations}
        />
      )}
    </div>
  );
}
