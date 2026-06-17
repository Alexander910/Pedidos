import { MOCK_BUSINESSES } from "@/lib/mock-data";
import { BusinessCard } from "@/components/consumer/BusinessCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string; loc: string }>;
}) {
  const { q, loc } = await searchParams;
  
  // En un entorno real, aquí se haría una consulta a Firestore/Algolia
  const query = q?.toLowerCase() || "";
  
  const results = MOCK_BUSINESSES.filter(b => 
    b.name.toLowerCase().includes(query) || 
    b.tags.some(t => t.toLowerCase().includes(query)) ||
    b.category.toLowerCase().includes(query)
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex-1">
      <h1 className="text-3xl font-bold mb-2">
        Resultados para &quot;{q}&quot;
      </h1>
      {loc && <p className="text-muted-foreground mb-8">Cerca de: {loc}</p>}
      
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl text-muted-foreground">No encontramos resultados para tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
