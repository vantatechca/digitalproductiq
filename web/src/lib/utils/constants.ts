// HORIZONTAL — every digital product niche
export const CATEGORIES = [
  "productivity_systems",
  "design_assets",
  "business_templates",
  "education_courses",
  "ebooks_guides",
  "printables",
  "software_tools",
  "browser_extensions",
  "mobile_apps",
  "membership_communities",
  "coaching_consulting",
  "newsletters_paid",
  "ai_prompts_gpts",
  "web_themes_uikits",
  "video_content_courses",
  "audio_assets",
  "photography_stock",
  "fitness_wellness_digital",
  "crafts_patterns",
  "gaming_assets",
  "children_education",
  "finance_money",
  "real_estate_landlord",
  "careers_resumes",
  "social_media_creator",
  "wedding_event_planning",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  productivity_systems: "Productivity Systems",
  design_assets: "Design Assets",
  business_templates: "Business Templates",
  education_courses: "Education & Courses",
  ebooks_guides: "Ebooks & Guides",
  printables: "Printables",
  software_tools: "Software Tools",
  browser_extensions: "Browser Extensions",
  mobile_apps: "Mobile Apps",
  membership_communities: "Membership / Communities",
  coaching_consulting: "Coaching / Consulting",
  newsletters_paid: "Paid Newsletters",
  ai_prompts_gpts: "AI Prompts / GPTs",
  web_themes_uikits: "Web Themes / UI Kits",
  video_content_courses: "Video Content / Courses",
  audio_assets: "Audio Assets",
  photography_stock: "Photography / Stock",
  fitness_wellness_digital: "Fitness / Wellness (Digital)",
  crafts_patterns: "Crafts / Patterns",
  gaming_assets: "Gaming Assets",
  children_education: "Children Education",
  finance_money: "Finance / Money",
  real_estate_landlord: "Real Estate / Landlord",
  careers_resumes: "Careers / Resumes",
  social_media_creator: "Social Media / Creator",
  wedding_event_planning: "Wedding / Event Planning",
};

export const PRODUCT_FORMATS = [
  "notion_template","obsidian_vault","excel_sheet","google_sheet","airtable_base","clickup_template",
  "figma_kit","canva_template","adobe_template","procreate_brushes","photoshop_actions",
  "pdf_guide","pdf_workbook","pdf_planner_printable","ebook_epub","swipe_file",
  "video_course_self_paced","live_cohort_course","workshop_replay","mini_course",
  "saas_micro","saas_full","cli_tool","desktop_app","browser_extension","mobile_app",
  "discord_community","whop_community","telegram_group","newsletter_paid","membership_drip",
  "gpt","claude_project","prompt_pack","ai_agent","workflow_n8n","workflow_make",
  "theme_wordpress","theme_shopify","theme_framer","theme_webflow","tailwind_template","astro_template",
  "audio_pack","sample_pack","sound_effect_library","meditation_audio","asmr_pack",
  "photo_pack","preset_pack","lut_pack","3d_model_pack","blender_asset",
  "svg_cut_file","sewing_pattern","crochet_pattern","crossstitch_pattern","printable_wall_art",
  "unity_asset","unreal_asset","roblox_model","minecraft_mod_pack",
  "workbook_homeschool","flash_card_set","curriculum_pack",
  "budget_template","investing_calculator","real_estate_doc_pack",
  "resume_template","cover_letter_pack","interview_question_bank",
  "content_calendar","hook_library","viral_template_pack","linkedin_carousel_template",
  "service_package","done_for_you_audit","consulting_intake_pack",
] as const;
export type ProductFormat = (typeof PRODUCT_FORMATS)[number];

export const STATUSES = [
  "detected","reviewing","approved","declined","starred",
  "incubating","in_build","launched","archived",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  detected: "Detected",
  reviewing: "Reviewing",
  approved: "Approved",
  declined: "Declined",
  starred: "Starred",
  incubating: "Incubating",
  in_build: "In Build",
  launched: "Launched",
  archived: "Archived",
};

export const STATUS_COLORS: Record<Status, string> = {
  detected: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  reviewing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  declined: "bg-red-500/15 text-red-300 border-red-500/30",
  starred: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  incubating: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  in_build: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  launched: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  archived: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
};

export const BUILD_PATHS = [
  "build_from_scratch","license_plr_mrr","white_label",
  "arbitrage_flip","curate_collection","collab_creator",
] as const;
export type BuildPath = (typeof BUILD_PATHS)[number];

export const BUILD_PATH_LABELS: Record<BuildPath, string> = {
  build_from_scratch: "Build from Scratch",
  license_plr_mrr: "License PLR/MRR",
  white_label: "White Label",
  arbitrage_flip: "Arbitrage Flip",
  curate_collection: "Curate Collection",
  collab_creator: "Creator Collab",
};

export const TREND_DIRECTIONS = [
  "breakout","rising","stable","declining","flat",
] as const;
export type TrendDirection = (typeof TREND_DIRECTIONS)[number];

export const TREND_COLORS: Record<TrendDirection, string> = {
  breakout: "text-fuchsia-300",
  rising: "text-emerald-300",
  stable: "text-amber-300",
  declining: "text-red-300",
  flat: "text-zinc-400",
};

export const COMPLIANCE_FLAGS = ["green","amber","red"] as const;
export type ComplianceFlag = (typeof COMPLIANCE_FLAGS)[number];

export const RULE_TYPES = [
  "price","build_effort","category","format","competition",
  "ethics","revenue","trend","arbitrage","audience",
  "quality","platform","margin","novelty",
] as const;
export type RuleType = (typeof RULE_TYPES)[number];

export const RULE_DIRECTIONS = [
  "must_have","must_avoid","prefer","deprioritize",
] as const;
export type RuleDirection = (typeof RULE_DIRECTIONS)[number];

export const ARBITRAGE_SOURCE_TYPES = [
  "plr","mrr","white_label","cc0","public_domain","royalty_free","open_source",
] as const;
export type ArbitrageSourceType = (typeof ARBITRAGE_SOURCE_TYPES)[number];

export const ARBITRAGE_TYPE_LABELS: Record<ArbitrageSourceType, string> = {
  plr: "PLR (Private Label Rights)",
  mrr: "MRR (Master Resell Rights)",
  white_label: "White Label",
  cc0: "Creative Commons Zero",
  public_domain: "Public Domain",
  royalty_free: "Royalty Free",
  open_source: "Open Source",
};

export const PLATFORMS = [
  "etsy","gumroad","whop","creative_market","themeforest",
  "notion_marketplace","sellfy","payhip","lemon_squeezy",
  "beacons","stan_store","amazon_kdp","udemy","skillshare",
  "teachable","podia","kajabi","product_hunt","indie_hackers","appsumo",
  "reddit","tiktok","youtube","pinterest","twitter",
  "hacker_news","trends_vc","exploding_topics","google_trends",
  "idplr","plr_database","pixabay","gutenberg","github",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const SCORE_DIMENSIONS = [
  "trend","demand","competition","feasibility","revenue",
] as const;
export type ScoreDimension = (typeof SCORE_DIMENSIONS)[number];

// AI tier mapping
export const AI_TIERS = {
  tier1: { label: "Tier 1 — Bulk", models: ["deepseek-v3","qwen-2.5","kimi"], cost_per_1k_tokens: 0.0002 },
  tier2: { label: "Tier 2 — Structured", models: ["claude-haiku-4.5"], cost_per_1k_tokens: 0.005 },
  tier3: { label: "Tier 3 — Strategic", models: ["claude-sonnet-4.6"], cost_per_1k_tokens: 0.03 },
} as const;
