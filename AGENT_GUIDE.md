# Directus Setup Scripts - AI Agent Guide

## Overview

The `@abakus/directus-setup` package provides a complete, automated solution for setting up and managing Directus collections and data. It's designed to be easily used by AI agents with minimal configuration.

## Key Features

✅ **Automatic JWT Token Generation** - No need to save tokens; they're generated dynamically
✅ **JSON-Driven Architecture** - All collections defined in `collections.json`
✅ **Idempotent** - Safe to run multiple times
✅ **Comprehensive Error Handling** - Clear error messages for debugging
✅ **Complete Audit Trail** - Backup and verify capabilities
✅ **Role-Based Security** - Respects Directus permissions

## Architecture

### Authentication Flow

```
Access Token (from settings)
    ↓
DirectusAuth.getToken()
    ↓
HTTP POST /auth/login
    ↓
JWT Token (valid for 15 minutes, auto-refreshes)
    ↓
All API requests authenticated
```

### Collection Structure

Collections are defined in `src/config/collections.json`:
- **courses** - Course metadata and structure
- **lessons** - Individual lessons within courses (supports block-based content)
- **problems** - Problem sets for lessons
- **ai_prompts** - System prompts for AI-powered features

### Data Flow

```
Demo Data (in populate-data.js)
    ↓
populateCourses()
    ↓
populateLessons() [references courses via course_id]
    ↓
populateProblems() [references lessons via lesson_id]
    ↓
populateAiPrompts() [standalone]
```

## Environment Setup

### 1. Generate Access Token

In Directus admin panel:
1. **Settings** → **Access Tokens**
2. Click **Create Token**
3. Name: `Setup Bot`
4. Ensure role has permissions for:
   - Collections (read, create, update)
   - Items (read, create, update, delete)
5. Copy the token

### 2. Set Environment Variable

Add to `.env` at project root:
```bash
DIRECTUS_SETUP_TOKEN=<your-token-here>
DIRECTUS_URL=http://localhost:8055
```

## Usage

### Complete Setup (Recommended)

```bash
pnpm --filter @abakus/directus-setup setup
```

This runs all steps automatically:
1. ✅ Creates collections (if not exist)
2. ✅ Populates with demo data
3. ✅ Verifies setup
4. ✅ Shows summary

### Individual Commands

```bash
# Create collections only
pnpm --filter @abakus/directus-setup setup:collections

# Populate data only
pnpm --filter @abakus/directus-setup setup:data

# Verify current state
pnpm --filter @abakus/directus-setup verify

# Backup to JSON files
pnpm --filter @abakus/directus-setup backup

# Delete all data (requires CONFIRM_CLEANUP=true)
pnpm --filter @abakus/directus-setup clean
```

## For AI Agents

### Programmatic Usage

```javascript
import { DirectusClient } from '@abakus/directus-setup';

const client = new DirectusClient(
  'http://localhost:8055',
  process.env.DIRECTUS_SETUP_TOKEN
);

// Test connection
await client.testConnection();

// Get collections
const collections = await client.getCollections();

// Create item
await client.createItem('courses', {
  name: 'New Course',
  slug: 'new-course',
  description: '...',
});

// Get items
const courses = await client.getItems('courses');

// Verify relationships
const lessons = await client.getItems('lessons');
const courses = await client.getItems('courses');
```

### Extending Collections

To add a new collection or modify existing ones:

1. **Edit `src/config/collections.json`** - Add collection definition
2. **Run setup** - `pnpm --filter @abakus/directus-setup setup:collections`
3. **Populate** - `pnpm --filter @abakus/directus-setup setup:data`

### Block-Based Lesson Structure

The `lessons` collection supports a flexible `blocks` JSON field for custom content:

```javascript
{
  name: "Lesson Title",
  content: "...",
  blocks: [
    {
      type: "text",
      content: "Introduction text..."
    },
    {
      type: "video",
      url: "https://youtube.com/..."
    },
    {
      type: "problem",
      problem_id: 123
    },
    {
      type: "custom",
      data: { ... }
    }
  ]
}
```

## Troubleshooting

### 403 Forbidden
**Problem:** "Access Denied" error
**Solution:**
1. Check token has correct role
2. Verify role has collection permissions
3. Re-generate token with full permissions

### 401 Unauthorized
**Problem:** "Invalid Token" error
**Solution:**
1. Token expired or invalid
2. Generate new token in admin panel
3. Update DIRECTUS_SETUP_TOKEN in .env

### Connection Failed
**Problem:** "ECONNREFUSED" error
**Solution:**
1. Ensure Directus is running: `docker-compose up`
2. Check DIRECTUS_URL is correct
3. Try: `curl http://localhost:8055/api/server/info`

### Data Not Created
**Problem:** Collections exist but no data
**Solution:**
1. Run: `pnpm --filter @abakus/directus-setup setup:data`
2. Check for FK constraint errors in logs
3. Verify collection relationships

## Best Practices for AI Agents

1. **Always test connection first**
   ```javascript
   await client.testConnection();
   ```

2. **Check collections exist before populating**
   ```javascript
   const collections = await client.getCollections();
   ```

3. **Use transaction-like approach** - Create in dependency order:
   - Courses (no dependencies)
   - Lessons (depends on courses)
   - Problems (depends on lessons)
   - Prompts (no dependencies)

4. **Handle rate limits** - Add delays between bulk operations:
   ```javascript
   for (const course of courses) {
     await client.createItem('courses', course);
     await new Promise(r => setTimeout(r, 100)); // 100ms delay
   }
   ```

5. **Verify before proceeding**
   ```javascript
   await client.request('GET', `/api/items/courses?limit=1`);
   ```

6. **Log all operations** - Use provided logger:
   ```javascript
   import { logger } from '@abakus/directus-setup';
   logger.info('Creating item...');
   ```

## Backup Strategy

Backups are stored in `scripts/directus-setup/backups/` with timestamp:
```
backups/
├── courses_2024-01-06T10-30-45-123Z.json
├── lessons_2024-01-06T10-30-45-234Z.json
├── problems_2024-01-06T10-30-45-345Z.json
└── ai_prompts_2024-01-06T10-30-45-456Z.json
```

Each backup contains:
- Collection name
- Export timestamp
- Total record count
- Full data array

## Security Notes

⚠️ **IMPORTANT**:
- Tokens are generated dynamically, never stored
- .env file is gitignored
- All changes are logged in Directus audit trail
- No data is copied or modified locally
- Respects Directus role-based permissions

## Related Documentation

- [Directus API Reference](../docs/DIRECTUS_API_REFERENCE.md)
- [Collection Schema Details](../docs/DIRECTUS_SCHEMA.md)
- [MCP Guide](../docs/DIRECTUS_MCP_GUIDE.md)

## Support

For issues:
1. Check error message in logs
2. Run `pnpm --filter @abakus/directus-setup verify`
3. Check Directus admin panel for collection status
4. Review token permissions in Settings → Access Tokens
