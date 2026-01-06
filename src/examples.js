#!/usr/bin/env node

/**
 * Integration Test / AI Agent Example
 * Shows how an AI agent can use the directus-setup package
 * to create and manage content programmatically
 */

import { DirectusClient } from './lib/client.js';
import { logger } from './lib/logger.js';

async function exampleCreateLesson(client) {
  logger.section('Example: Creating a Lesson Programmatically');

  try {
    // 1. Get course first
    const courses = await client.getItems('courses', { limit: 1 });
    if (!courses.length) {
      logger.warn('No courses found. Run setup first.');
      return;
    }

    const course = courses[0];
    logger.info(`Using course: ${course.name}`);

    // 2. Create lesson with block-based content
    const lesson = {
      name: 'Advanced Topics',
      slug: 'advanced-topics',
      course_id: course.id,
      content: '<h2>Advanced Topics</h2><p>Deep dive into complex concepts</p>',
      video_url: 'https://example.com/video.mp4',
      xp_reward: 100,
      is_published: true,
      order: 3,
      blocks: [
        {
          type: 'text',
          content: 'Introduction to advanced topics...',
        },
        {
          type: 'video',
          url: 'https://youtube.com/watch?v=abc123',
        },
        {
          type: 'problem',
          problem_id: 1,
        },
      ],
    };

    const created = await client.createItem('lessons', lesson);
    logger.success(`✅ Created lesson: ${created.name}`);
    logger.info(`   ID: ${created.id}`);
    logger.info(`   Course: ${created.course_id}`);

    return created;
  } catch (error) {
    logger.error(`Failed: ${error.message}`);
  }
}

async function exampleCreateProblems(client, lessonId) {
  logger.section('Example: Creating Multiple Problems');

  try {
    const problems = [
      {
        lesson_id: lessonId,
        type: 'multiple_choice',
        question: 'What is the capital of France?',
        options: ['Paris', 'London', 'Berlin', 'Amsterdam'],
        correct_answer: 'Paris',
        difficulty: 'easy',
        xp_reward: 10,
        order: 1,
      },
      {
        lesson_id: lessonId,
        type: 'exact_answer',
        question: 'What is 5 + 3?',
        correct_answer: '8',
        difficulty: 'easy',
        xp_reward: 10,
        order: 2,
      },
    ];

    const created = await client.createItems('problems', problems);
    logger.success(`✅ Created ${created.length} problems`);
    return created;
  } catch (error) {
    logger.error(`Failed: ${error.message}`);
  }
}

async function exampleCreateAiPrompt(client) {
  logger.section('Example: Creating AI Prompt');

  try {
    const prompt = {
      name: 'Custom Instruction Prompt',
      slug: 'custom-instruction',
      category: 'lesson_generation',
      system_prompt: `You are a specialized tutor for advanced mathematics.
Focus on:
- Breaking down complex proofs
- Explaining multiple solution approaches
- Providing real-world applications`,
      context:
        'Used for generating advanced mathematics lessons with emphasis on proof techniques.',
      is_active: true,
    };

    const created = await client.createItem('ai_prompts', prompt);
    logger.success(`✅ Created prompt: ${created.name}`);
    return created;
  } catch (error) {
    logger.error(`Failed: ${error.message}`);
  }
}

async function exampleVerifyData(client) {
  logger.section('Example: Verifying Data Integrity');

  try {
    // Get all relationships
    const courses = await client.getItems('courses');
    const lessons = await client.getItems('lessons');
    const problems = await client.getItems('problems');

    logger.info(`📊 Statistics:`);
    logger.table({
      collections: [
        { name: 'Courses', count: courses.length },
        { name: 'Lessons', count: lessons.length },
        { name: 'Problems', count: problems.length },
      ],
    });

    // Verify relationships
    logger.info(`\n🔗 Relationships:`);
    for (const lesson of lessons) {
      const courseExists = courses.some((c) => c.id === lesson.course_id);
      logger.info(`  Lesson "${lesson.name}" → Course ${lesson.course_id}: ${courseExists ? '✅' : '❌'}`);
    }

    for (const problem of problems) {
      const lessonExists = lessons.some((l) => l.id === problem.lesson_id);
      logger.info(`  Problem "${problem.question.slice(0, 30)}..." → Lesson ${problem.lesson_id}: ${lessonExists ? '✅' : '❌'}`);
    }
  } catch (error) {
    logger.error(`Failed: ${error.message}`);
  }
}

async function main() {
  const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
  const accessToken = process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.error('DIRECTUS_SETUP_TOKEN not set');
    process.exit(1);
  }

  logger.section('🚀 Directus Setup - AI Agent Examples');

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Run examples
    const lesson = await exampleCreateLesson(client);
    if (lesson) {
      await exampleCreateProblems(client, lesson.id);
    }

    await exampleCreateAiPrompt(client);
    await exampleVerifyData(client);

    logger.section('✅ All Examples Completed');
    logger.success('The setup package is ready for AI agent integration!');
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
