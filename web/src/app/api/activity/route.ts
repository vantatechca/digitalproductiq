import { getRecentActivity } from "@/lib/mock-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "25", 10);
  return Response.json({ data: getRecentActivity(limit) });
}
