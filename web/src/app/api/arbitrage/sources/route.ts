import { ARBITRAGE_SOURCES } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const source_type = url.searchParams.get("source_type");
  const source_platform = url.searchParams.get("source_platform");
  const format = url.searchParams.get("format");
  let data = [...ARBITRAGE_SOURCES];
  if (source_type && source_type !== "all") data = data.filter(s => s.source_type === source_type);
  if (source_platform) data = data.filter(s => s.source_platform === source_platform);
  if (format) data = data.filter(s => s.format === format);
  data.sort((a, b) => (b.est_arbitrage_potential ?? 0) - (a.est_arbitrage_potential ?? 0));
  return Response.json({ data });
}
