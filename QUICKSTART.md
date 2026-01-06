# Quick Start - Directus Setup

## 1-Minute Setup

```bash
# Ensure .env has token configured
echo "DIRECTUS_SETUP_TOKEN=TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18" >> .env

# Run complete setup
pnpm --filter @abakus/directus-setup setup

# Verify everything worked
pnpm --filter @abakus/directus-setup verify
```

## What Gets Created

| Collection | Records | Purpose |
|-----------|---------|---------|
| **courses** | 4 | Mathematics, English, Science, Programming |
| **lessons** | 2+ | Lessons for each course |
| **problems** | 2+ | Problems for each lesson |
| **ai_prompts** | 3 | Lesson generation, problem creation, student tutor |

## Next Steps

1. **Start Directus admin**: http://localhost:8055
2. **Start web frontend**: `pnpm --filter @abakus/web dev`
3. **Open app**: http://localhost:3000
4. **Modify demo data** in Directus admin (browse collections)

## Troubleshooting

If setup fails:

```bash
# Check connection
pnpm --filter @abakus/directus-setup verify

# View logs with debug info
DEBUG=true pnpm --filter @abakus/directus-setup setup

# Re-create collections
pnpm --filter @abakus/directus-setup setup:collections

# Reset and start over
CONFIRM_CLEANUP=true pnpm --filter @abakus/directus-setup clean
pnpm --filter @abakus/directus-setup setup
```

## Token Info

Current token: `TE5cxoxQM_gk_HlTNn6Jtm7uonyZwg18`

Generated in Directus Settings → Access Tokens

The script uses this to dynamically generate JWT tokens on each run - no plaintext storage.

## Advanced Options

See [AGENT_GUIDE.md](./AGENT_GUIDE.md) for:
- Programmatic API
- Custom collections
- Block-based lesson structure
- AI agent integration
