import { HeroSection } from "@/components/consumer/HeroSection";
import { BusinessCard } from "@/components/consumer/BusinessCard";
import { MOCK_BUSINESSES } from "@/lib/mock-data";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <HeroSection />
      
      <section className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Populares cerca de ti</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_BUSINESSES.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </section>
    </main>
  );
}
