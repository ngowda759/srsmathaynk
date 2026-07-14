import HomeClient from "@/components/home/HomeClient";
import { getTempleGalleryImages } from "@/lib/gallery";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  // Firebase has been removed - use default event date (15 days from now)
  const nextMajorEvent = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date;
  })();

  const nextEventName = "Sri Raghavendra Jayanthi";

  // Fetch gallery images on the server
  const gallery = getTempleGalleryImages();
  const lightboxImages = gallery.map((item) => ({
    src: item.image,
    alt: item.title,
    category: "festivals" as const,
  }));

  return <HomeClient 
    nextMajorEvent={nextMajorEvent} 
    nextEventName={nextEventName}
    galleryImages={lightboxImages} 
  />;
}
