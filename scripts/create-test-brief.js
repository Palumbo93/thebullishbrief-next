const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestBrief() {
  try {
    // First, unfeature any existing featured briefs
    await supabase
      .from('briefs')
      .update({ featured: false })
      .eq('featured', true);

    // Create test brief
    const { data, error } = await supabase
      .from('briefs')
      .insert({
        title: 'Sonic Strategy: Bridging Traditional Finance To The World\'s Fastest Blockchain',
        slug: 'sonic-strategy',
        subtitle: 'MicroStrategy proved with their 2,755% treasury gains, the bridge between traditional finance and crypto creates extraordinary opportunities.',
        content: `
          <h2>The Treasury Revolution</h2>
          <p>MicroStrategy proved with their 2,755% treasury gains, the bridge between traditional finance and crypto creates extraordinary opportunities. Sonic represents the next evolution: a blockchain 26,000x faster than Ethereum, with 90% developer revenue sharing, accessible through regulated markets.</p>
          
          <h2>The Sonic Advantage</h2>
          <p>Sonic represents the next evolution in blockchain technology. With speeds 26,000x faster than Ethereum and innovative developer revenue sharing, Sonic is positioned to revolutionize the industry.</p>
          
          <h2>Market Opportunity</h2>
          <p>The bridge between traditional finance and crypto creates extraordinary opportunities. Sonic's technology and market positioning make it a compelling investment opportunity.</p>
        `,
        sponsored: true,
        disclaimer: 'This is a sponsored brief. Please conduct your own research before making investment decisions.',
        featured_image_url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/landingpageassets/sonicstrategy/sonicstrategyheaderlogo-212px.webp',
        featured_image_alt: 'Sonic Strategy Logo',
        reading_time_minutes: 5,
        status: 'published',
        video_url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/landingpageassets/sonicstrategy/April%2017%20Sonic%20Final-.mov',
        show_cta: true,
        tickers: JSON.stringify([{"CSE":"SONC"},{"OTC":"SONCF"}]),
        widget_code: '<div class="tradingview-widget-container"><div id="tradingview_widget"></div></div>',
        investor_deck_url: 'https://example.com/sonic-strategy-deck.pdf',
        featured: true,
        company_name: 'Sonic Strategy',
        company_logo_url: 'https://potsdvyvpwuycgocpivf.supabase.co/storage/v1/object/public/websiteassets/landingpageassets/sonicstrategy/sonicstrategyheaderlogo-212px.webp'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test brief:', error);
      process.exit(1);
    }

    console.log('✅ Test brief created successfully!');
    console.log('📄 Brief ID:', data.id);
    console.log('🔗 Slug:', data.slug);
    console.log('⭐ Featured:', data.featured);
    console.log('📊 View at: /briefs/sonic-strategy');
    
  } catch (error) {
    console.error('Error creating test brief:', error);
    process.exit(1);
  }
}

createTestBrief(); 