import type { Tag } from "@/types/database";

const USER_ID = "00000000-0000-0000-0000-000000000001";

export const TAGS: Tag[] = [
  { id: "cccccccc-0000-0000-0000-000000000001", user_id: USER_ID, name: "Weekend build", color: "#34d399" },
  { id: "cccccccc-0000-0000-0000-000000000002", user_id: USER_ID, name: "Q2 2026", color: "#22d3ee" },
  { id: "cccccccc-0000-0000-0000-000000000003", user_id: USER_ID, name: "High margin", color: "#e879f9" },
  { id: "cccccccc-0000-0000-0000-000000000004", user_id: USER_ID, name: "Recurring", color: "#fbbf24" },
  { id: "cccccccc-0000-0000-0000-000000000005", user_id: USER_ID, name: "Need partner", color: "#f87171" },
  { id: "cccccccc-0000-0000-0000-000000000006", user_id: USER_ID, name: "Etsy SEO play", color: "#a78bfa" },
  { id: "cccccccc-0000-0000-0000-000000000007", user_id: USER_ID, name: "Whop launch", color: "#60a5fa" },
];

export async function GET() {
  return Response.json({ data: TAGS });
}

export async function POST(req: Request) {
  const body = await req.json() as { name: string; color?: string };
  return Response.json({
    data: {
      id: `tag_${Date.now()}`,
      user_id: USER_ID,
      name: body.name,
      color: body.color ?? "#34d399",
    },
  });
}
