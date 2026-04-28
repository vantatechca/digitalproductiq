import { TREND_KEYWORDS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const direction = url.searchParams.get("direction");
  let data = [...TREND_KEYWORDS];
  if (category && category !== "all") data = data.filter(k => k.category === category);
  if (direction && direction !== "all") data = data.filter(k => k.direction === direction);
  return Response.json({ data });
}
