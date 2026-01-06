/**
 * Example: How to add a new collection
 * This is a template for extending the schema
 */

// 1. Add collection definition to src/config/collections.json:
const newCollectionDefinition = {
  collection: 'users_progress',
  meta: {
    icon: 'trending_up',
    color: '#00FF00',
    note: 'User progress tracking',
  },
  fields: [
    {
      field: 'id',
      type: 'integer',
      schema: {
        is_primary_key: true,
        is_nullable: false,
      },
    },
    {
      field: 'user_id',
      type: 'string',
      schema: { is_nullable: false },
    },
    {
      field: 'course_id',
      type: 'integer',
      schema: { is_nullable: false },
    },
    {
      field: 'progress_percentage',
      type: 'integer',
      schema: { default_value: 0 },
    },
    {
      field: 'completed_lessons',
      type: 'json',
    },
  ],
};

// 2. Add demo data to populate-data.js:
const demoUserProgress = [
  {
    user_id: 'user-1',
    course_id: 2, // Mathematics 101
    progress_percentage: 45,
    completed_lessons: [1],
  },
  {
    user_id: 'user-1',
    course_id: 3, // English Fundamentals
    progress_percentage: 0,
    completed_lessons: [],
  },
];

// 3. Add population function:
async function populateUserProgress(client) {
  logger.info('📊 Populating user progress...');
  const created = await client.createItems('users_progress', demoUserProgress);
  logger.success(`✅ Created ${created.length} progress records`);
  return created;
}

// 4. Call in main populate sequence:
// await populateUserProgress(client);

// 5. Update verify-setup.js with validation:
const EXPECTED_COLLECTIONS = {
  // ... existing ...
  users_progress: ['id', 'user_id', 'course_id', 'progress_percentage'],
};

// 6. Run setup:
// pnpm --filter @abakus/directus-setup setup
