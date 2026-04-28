-- Seed data: 1 owner, 20 marketplaces, ~30 sources, 15 starting golden rules

-- Owner user
insert into users (id, email, name, role, preferences, score_weights, daily_budget_usd) values
  ('00000000-0000-0000-0000-000000000001',
   'owner@digitalproductiq.local',
   'Owner',
   'owner',
   '{"skills":["copywriting","notion","figma","javascript"],"hours_per_week":15,"target_revenue_usd":5000,"niches_of_interest":["productivity_systems","ai_prompts_gpts","business_templates"],"ethical_lines":["no_mlm","no_get_rich_quick","no_unlicensed_resell"]}'::jsonb,
   '{"trend": 0.20, "demand": 0.25, "competition": 0.20, "feasibility": 0.15, "revenue": 0.20}'::jsonb,
   5.00)
on conflict (email) do nothing;

-- 20 marketplaces
insert into marketplaces (slug, name, url, primary_categories, takes_pct, scrape_frequency_minutes, notes) values
  ('etsy', 'Etsy', 'https://www.etsy.com', ARRAY['printables','design_assets','crafts_patterns','wedding_event_planning'], 6.5, 360, 'Massive digital downloads section'),
  ('gumroad', 'Gumroad', 'https://gumroad.com', ARRAY['ebooks_guides','design_assets','software_tools','ai_prompts_gpts'], 10.0, 360, 'Indie creator focus'),
  ('whop', 'Whop', 'https://whop.com', ARRAY['membership_communities','ai_prompts_gpts','software_tools'], 3.0, 720, 'Community + paid groups'),
  ('creative_market', 'Creative Market', 'https://creativemarket.com', ARRAY['design_assets','web_themes_uikits','photography_stock'], 40.0, 720, 'High-end design assets'),
  ('themeforest', 'ThemeForest', 'https://themeforest.net', ARRAY['web_themes_uikits','software_tools'], 50.0, 1440, 'Envato Marketplace'),
  ('notion_marketplace', 'Notion Marketplace', 'https://www.notion.so/templates', ARRAY['productivity_systems','business_templates'], 0, 720, 'Notion + Prototion templates'),
  ('sellfy', 'Sellfy', 'https://sellfy.com', ARRAY['ebooks_guides','design_assets'], 0, 1440, 'Creator storefronts'),
  ('payhip', 'Payhip', 'https://payhip.com', ARRAY['ebooks_guides','education_courses'], 5.0, 1440, 'Simple digital sales'),
  ('lemon_squeezy', 'Lemon Squeezy', 'https://www.lemonsqueezy.com', ARRAY['software_tools','saas_micro'], 5.0, 1440, 'Merchant of Record'),
  ('beacons', 'Beacons', 'https://beacons.ai', ARRAY['social_media_creator','coaching_consulting'], 9.0, 1440, 'Creator link-in-bio'),
  ('stan_store', 'Stan Store', 'https://stan.store', ARRAY['social_media_creator','coaching_consulting'], 0, 1440, 'Creator one-page store'),
  ('amazon_kdp', 'Amazon KDP', 'https://kdp.amazon.com', ARRAY['printables','ebooks_guides'], 30.0, 720, 'Low-content books'),
  ('udemy', 'Udemy', 'https://www.udemy.com', ARRAY['education_courses','video_content_courses'], 50.0, 720, 'Course marketplace'),
  ('skillshare', 'Skillshare', 'https://www.skillshare.com', ARRAY['education_courses','video_content_courses'], 0, 1440, 'Royalty pool'),
  ('teachable', 'Teachable', 'https://teachable.com', ARRAY['education_courses','live_cohort_course'], 0, 1440, 'Self-hosted creator schools'),
  ('podia', 'Podia', 'https://www.podia.com', ARRAY['education_courses','membership_communities'], 0, 1440, 'Creator platform'),
  ('kajabi', 'Kajabi', 'https://kajabi.com', ARRAY['education_courses','coaching_consulting'], 0, 1440, 'High-end creator suite'),
  ('product_hunt', 'Product Hunt', 'https://www.producthunt.com', ARRAY['software_tools','ai_prompts_gpts','mobile_apps'], 0, 720, 'Launch + discovery'),
  ('indie_hackers', 'Indie Hackers', 'https://www.indiehackers.com', ARRAY['software_tools','newsletters_paid'], 0, 720, 'Public revenue + milestones'),
  ('appsumo', 'AppSumo', 'https://appsumo.com', ARRAY['software_tools','saas_micro'], 30.0, 720, 'Lifetime deals')
on conflict (slug) do nothing;

-- 15 starter golden rules
insert into golden_rules (user_id, rule_type, direction, rule_text, conditions, weight, source) values
  ('00000000-0000-0000-0000-000000000001','price','prefer','Prefer ideas with median price between $19 and $79','{"min": 19, "max": 79}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','build_effort','prefer','Prefer builds under 20 hours','{"max_hours": 20}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','category','prefer','Prefer productivity_systems and ai_prompts_gpts','{"categories":["productivity_systems","ai_prompts_gpts"]}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','format','prefer','Prefer Notion templates and GPT packs','{"formats":["notion_template","gpt","prompt_pack"]}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','competition','must_have','Require at least 3 active competitors (proves demand)','{"min_competitors": 3}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','competition','must_avoid','Avoid markets with >500 saturated competitors and median price <$10','{"max_competitors": 500, "min_price": 10}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','ethics','must_avoid','Never recommend MLM, get-rich-quick, or unlicensed resells','{"keywords":["mlm","pyramid","get-rich-quick","unlicensed"]}'::jsonb, 2.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','revenue','must_have','Require est_monthly_revenue_low >= $500','{"min_revenue_low": 500}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','trend','prefer','Prefer rising or breakout trends','{"directions":["rising","breakout"]}'::jsonb, 1.5, 'manual'),
  ('00000000-0000-0000-0000-000000000001','arbitrage','prefer','When PLR/MRR sources exist, prefer arbitrage_flip path','{"build_paths":["arbitrage_flip","license_plr_mrr"]}'::jsonb, 0.8, 'manual'),
  ('00000000-0000-0000-0000-000000000001','audience','prefer','Prefer indie founders, creators, and small-business operators','{"audiences":["indie_founders","creators","small_business"]}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','quality','must_avoid','Decline ideas with composite_score < 35','{"min_composite": 35}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','platform','prefer','Prefer Etsy, Gumroad, Whop, Notion Marketplace','{"platforms":["etsy","gumroad","whop","notion_marketplace"]}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','margin','must_have','Require gross margin > 70%','{"min_margin": 0.7}'::jsonb, 1.0, 'manual'),
  ('00000000-0000-0000-0000-000000000001','novelty','deprioritize','Deprioritize clones of well-known templates without differentiation','{"min_diff_score": 0.5}'::jsonb, 0.7, 'manual')
on conflict do nothing;
