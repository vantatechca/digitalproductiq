export async function POST(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return Response.json({
    data: {
      scraper: name,
      status: "queued",
      run_id: `run_${Date.now()}`,
      message: `Scraper '${name}' queued for ad-hoc run.`,
    },
  });
}
