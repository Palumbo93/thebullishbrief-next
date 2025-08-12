#!/bin/bash

# Script to regenerate database types while preserving custom aliases

echo "🔄 Regenerating database types..."

# Generate types from Supabase
npx supabase gen types typescript --project-id potsdvyvpwuycgocpivf > src/lib/database.types.ts

echo "✅ Database types regenerated successfully!"
echo "📝 Custom type aliases are preserved in src/lib/database.aliases.ts"
echo "💡 Remember to import types from database.aliases.ts, not database.types.ts"
