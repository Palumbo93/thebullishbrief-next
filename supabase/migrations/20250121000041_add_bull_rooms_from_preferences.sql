-- Migration: Add Bull Rooms based on user preferences
-- This migration creates bull rooms for each preference category with appropriate rules

-- Base rules that apply to all rooms
DO $$
DECLARE
    base_rules JSONB := '[
        {
            "title": "Respect the Room",
            "description": "Debate the trade, not the trader. Keep it civil even when you disagree."
        },
        {
            "title": "No Spam or Pumping", 
            "description": "Share plays and ideas, but no repetitive shills, spam links, or pump groups."
        },
        {
            "title": "Stay On-Topic",
            "description": "Keep discussion relevant to the room''s focus. Take unrelated topics elsewhere."
        }
    ]'::JSONB;
BEGIN

-- Investor Type Rooms
INSERT INTO bull_rooms (id, name, slug, topic, description, is_active, is_featured, sort_order, rules, created_at, updated_at) VALUES
-- Day Traders
(gen_random_uuid(), 'Day Traders', 'day-trader', 'Active daily trading and market moves.', 'For traders who operate on intraday moves, quick entries, and fast exits.', true, true, 100, base_rules, NOW(), NOW()),

-- Swing Traders  
(gen_random_uuid(), 'Swing Traders', 'swing-trader', 'Short to medium-term setups and plays.', 'Focused on trades lasting days to weeks, capturing medium-term market trends.', true, true, 102, base_rules, NOW(), NOW()),

-- Long-Term Investors
(gen_random_uuid(), 'Long-Term Investors', 'long-term', 'Buy-and-hold strategies and outlooks.', 'Investors building positions with a multi-year perspective.', true, true, 103, base_rules, NOW(), NOW()),

-- Diversified Portfolios
(gen_random_uuid(), 'Diversified Portfolios', 'diversified', 'Mixing strategies and managing balance.', 'For those blending multiple asset classes and strategies.', true, true, 104, base_rules, NOW(), NOW()),

-- Experience Level Rooms
-- Beginners
(gen_random_uuid(), 'Beginners', 'beginner', 'Learning the ropes and asking questions.', 'A space for new traders to learn, ask questions, and share early wins.', true, true, 200, base_rules, NOW(), NOW()),

-- Intermediate Traders
(gen_random_uuid(), 'Intermediate Traders', 'intermediate', 'Building skills and refining strategies.', 'For traders developing consistency and sharpening techniques.', true, true, 201, base_rules, NOW(), NOW()),

-- Experienced Traders
(gen_random_uuid(), 'Experienced Traders', 'experienced', 'Seasoned market participants sharing insights.', 'For traders with years of market experience and refined approaches.', true, true, 202, base_rules, NOW(), NOW()),

-- Market Veterans
(gen_random_uuid(), 'Market Veterans', 'veteran', 'Long-time traders with years in the markets.', 'For traders who have seen multiple cycles and market conditions.', true, true, 203, base_rules, NOW(), NOW()),

-- Risk Tolerance Rooms
-- Conservative (Snipers)
(gen_random_uuid(), 'Snipers', 'conservative', 'Conservative traders focused on low-risk, steady returns.', 'Calculated entries, precise exits, and disciplined capital preservation.', true, true, 300, base_rules, NOW(), NOW()),

-- Moderate (Strategists)
(gen_random_uuid(), 'Strategists', 'moderate', 'Moderate risk traders balancing growth and stability.', 'Balancing opportunity with caution for consistent growth.', true, true, 301, base_rules, NOW(), NOW()),

-- Aggressive (High Rollers)
(gen_random_uuid(), 'High Rollers', 'aggressive', 'Aggressive traders taking bigger positions for higher returns.', 'Bigger trades, bolder plays, and a willingness to push the limits.', true, true, 302, base_rules, NOW(), NOW()),

-- Speculative (Wildcards)
(gen_random_uuid(), 'Wildcards', 'speculative', 'Speculative traders pursuing high-volatility, high-reward plays.', 'Chasing moonshots and embracing market uncertainty.', true, true, 303, base_rules, NOW(), NOW());

END $$;

-- Add comment to track this migration
COMMENT ON TABLE bull_rooms IS 'Bull rooms added based on user preference categories - investor type, experience level, and risk tolerance';
