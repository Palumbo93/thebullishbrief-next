-- Create AI Prompt Categories table
CREATE TABLE "public"."ai_prompt_categories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Create AI Prompts table
CREATE TABLE "public"."ai_prompts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "content" text NOT NULL,
    "category_id" uuid NOT NULL,
    "intended_llm" text NOT NULL,
    "original_credit" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Create Prompt Fields table
CREATE TABLE "public"."prompt_fields" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "prompt_id" uuid NOT NULL,
    "label" text NOT NULL,
    "placeholder" text NOT NULL,
    "required" boolean DEFAULT false,
    "field_type" text NOT NULL DEFAULT 'text',
    "options" text[],
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE "public"."ai_prompt_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_prompts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."prompt_fields" ENABLE ROW LEVEL SECURITY;

-- Create primary keys
ALTER TABLE "public"."ai_prompt_categories" ADD CONSTRAINT "ai_prompt_categories_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."ai_prompts" ADD CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."prompt_fields" ADD CONSTRAINT "prompt_fields_pkey" PRIMARY KEY ("id");

-- Create indexes
CREATE INDEX "idx_ai_prompt_categories_sort_order" ON "public"."ai_prompt_categories" ("sort_order");
CREATE INDEX "idx_ai_prompts_category_id" ON "public"."ai_prompts" ("category_id");
CREATE INDEX "idx_ai_prompts_created_at" ON "public"."ai_prompts" ("created_at" DESC);
CREATE INDEX "idx_prompt_fields_prompt_id" ON "public"."prompt_fields" ("prompt_id");
CREATE INDEX "idx_prompt_fields_sort_order" ON "public"."prompt_fields" ("sort_order");

-- Add foreign key constraints (after primary keys are created)
ALTER TABLE "public"."ai_prompts" 
ADD CONSTRAINT "ai_prompts_category_id_fkey" 
FOREIGN KEY ("category_id") REFERENCES "public"."ai_prompt_categories"("id") ON DELETE RESTRICT;

ALTER TABLE "public"."prompt_fields" 
ADD CONSTRAINT "prompt_fields_prompt_id_fkey" 
FOREIGN KEY ("prompt_id") REFERENCES "public"."ai_prompts"("id") ON DELETE CASCADE;

-- RLS Policies for ai_prompt_categories
CREATE POLICY "Allow public read access to ai_prompt_categories" ON "public"."ai_prompt_categories"
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert ai_prompt_categories" ON "public"."ai_prompt_categories"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ai_prompt_categories" ON "public"."ai_prompt_categories"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete ai_prompt_categories" ON "public"."ai_prompt_categories"
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for ai_prompts
CREATE POLICY "Allow public read access to ai_prompts" ON "public"."ai_prompts"
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert ai_prompts" ON "public"."ai_prompts"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ai_prompts" ON "public"."ai_prompts"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete ai_prompts" ON "public"."ai_prompts"
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for prompt_fields
CREATE POLICY "Allow public read access to prompt_fields" ON "public"."prompt_fields"
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert prompt_fields" ON "public"."prompt_fields"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update prompt_fields" ON "public"."prompt_fields"
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete prompt_fields" ON "public"."prompt_fields"
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample categories
INSERT INTO "public"."ai_prompt_categories" (
    "name",
    "description",
    "sort_order"
) VALUES 
(
    'Equity Research',
    'Comprehensive analysis frameworks for stock research and investment decisions',
    0
),
(
    'Market Analysis',
    'Tools for analyzing market trends, sentiment, and macroeconomic factors',
    1
),
(
    'Technical Analysis',
    'Chart analysis, indicators, and technical trading strategies',
    2
);

-- Insert sample data
INSERT INTO "public"."ai_prompts" (
    "title",
    "description", 
    "content",
    "category_id",
    "intended_llm",
    "original_credit"
) VALUES (
    'Elite Equity Research Analyst',
    'Comprehensive equity research framework used by top-tier investment funds for fundamental and macroeconomic analysis.',
    'ROLE:

Act as an elite equity research analyst at a top-tier investment fund.
Your task is to analyze a company using both fundamental and macroeconomic perspectives. Structure your response according to the framework below.

Input Section (Fill this in)

Stock Ticker / Company Name: [STOCK_TICKER]
Investment Thesis: [INVESTMENT_THESIS]
Goal: [GOAL]

Instructions:

Use the following structure to deliver a clear, well-reasoned equity research report:

1. **Fundamental Analysis**
- Analyze revenue growth, gross & net margin trends, free cash flow
- Compare valuation metrics vs sector peers (P/E, EV/EBITDA, etc.)
- Review insider ownership and recent insider trades

2. **Thesis Validation**
- Present 3 arguments supporting the thesis
- Highlight 2 counter-arguments or key risks
- Provide a final **verdict**: Bullish / Bearish / Neutral with justification

3. **Sector & Macro View**
- Give a short sector overview
- Outline relevant macroeconomic trends
- Explain company''s competitive positioning

4. **Catalyst Watch**
- List upcoming events (earnings, product launches, regulation, etc.)
- Identify both **short-term** and **long-term** catalysts

5. **Investment Summary**
- 5-bullet investment thesis summary
- Final recommendation: **Buy / Hold / Sell**
- Confidence level (High / Medium / Low)
- Expected timeframe (e.g. 6–12 months)

Formatting Requirements
- Use **markdown**
- Use **bullet points** where appropriate
- Be **concise, professional, and insight-driven**
- Do **not** explain your process just deliver the analysis',
    (SELECT "id" FROM "public"."ai_prompt_categories" WHERE "name" = 'Equity Research' LIMIT 1),
    'Claude 3.5 Sonnet',
    'The Bullish Brief Research Team'
);

-- Insert fields for the sample prompt
INSERT INTO "public"."prompt_fields" (
    "prompt_id",
    "label",
    "placeholder",
    "required",
    "field_type",
    "sort_order"
) VALUES 
(
    (SELECT "id" FROM "public"."ai_prompts" WHERE "title" = 'Elite Equity Research Analyst' LIMIT 1),
    'Stock Ticker / Company Name',
    'e.g., AAPL, Tesla Inc., NVDA',
    true,
    'text',
    0
),
(
    (SELECT "id" FROM "public"."ai_prompts" WHERE "title" = 'Elite Equity Research Analyst' LIMIT 1),
    'Investment Thesis',
    'e.g., Bullish on AI growth, Bearish on valuation concerns',
    true,
    'textarea',
    1
),
(
    (SELECT "id" FROM "public"."ai_prompts" WHERE "title" = 'Elite Equity Research Analyst' LIMIT 1),
    'Analysis Goal',
    'e.g., Long-term investment, Short-term trade, Risk assessment',
    true,
    'text',
    2
); 