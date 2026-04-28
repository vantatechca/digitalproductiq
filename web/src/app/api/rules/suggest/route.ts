import { getPendingAiRules } from "@/lib/mock-data";

export async function POST() {
  return Response.json({
    data: { suggestions: getPendingAiRules() },
  });
}
