export async function GET() {
  return Response.json({
    data: [
      { name: "AI templates rising on Notion + ChatGPT prompt platforms", score: 0.86, niches: ["productivity_systems","ai_prompts_gpts"], evidence: ["Notion AI template count +84% YoY","GPT Store prompt packs +180%"] },
      { name: "Stoicism content surging across self-help + audio + printables", score: 0.78, niches: ["ebooks_guides","audio_assets","printables"], evidence: ["TikTok #stoicism 8.4B views","Etsy printable +22%","LibriVox downloads +14%"] },
      { name: "Tech-layoff content cluster: resumes + coaching + AI tools", score: 0.84, niches: ["careers_resumes","coaching_consulting","ai_prompts_gpts"], evidence: ["LinkedIn workforce report","r/cscareerquestions trending","AI Resume search +210%"] },
      { name: "n8n + Make.com + Claude/GPT API building automation product market", score: 0.74, niches: ["ai_prompts_gpts","software_tools"], evidence: ["n8n PH #1","Make.com user base +60%","API-first community on Whop"] },
      { name: "Aesthetic-driven printable trend: dark academia + maximalist + lo-fi botanical", score: 0.66, niches: ["design_assets","printables","photography_stock"], evidence: ["Pinterest aesthetic searches +200% YoY"] },
    ],
  });
}
