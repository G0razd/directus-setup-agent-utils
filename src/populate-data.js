/**
 * Populate Data Script
 * Populates Directus collections with demo data from core package
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DirectusClient } from "./lib/client.js";
import { logger } from "./lib/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Demo data - will match the frontend's demo data structure
const demoCourses = [
  {
    name: "Mathematics 101",
    slug: "math-101",
    description: "Introduction to Algebra and Geometry",
    category: "algebra",
    difficulty: "beginner",
    xp_reward: 100,
    is_premium: false,
    is_published: true,
    order: 1,
  },
  {
    name: "English Fundamentals",
    slug: "english-101",
    description: "Reading and writing skills",
    category: "word-problems",
    difficulty: "beginner",
    xp_reward: 100,
    is_premium: false,
    is_published: true,
    order: 2,
  },
  {
    name: "Science Basics",
    slug: "science-101",
    description: "Physics and Chemistry fundamentals",
    category: "arithmetic",
    difficulty: "beginner",
    xp_reward: 150,
    is_premium: true,
    price: 9.99,
    is_published: true,
    order: 3,
  },
  {
    name: "Programming 101",
    slug: "programming-101",
    description: "Learn to code",
    category: "geometry",
    difficulty: "advanced",
    xp_reward: 200,
    is_premium: true,
    price: 14.99,
    is_published: true,
    order: 4,
  },
];

const demoLessons = [
  {
    name: "Introduction to Algebra",
    slug: "intro-algebra",
    description: "<h2>Algebra Basics</h2><p>Learn variables and equations</p>",
    content: "<h2>Algebra Basics</h2><p>Learn variables and equations</p>",
    video_url: "https://www.youtube.com/watch?v=xvFZjo5PgG0",
    xp_reward: 50,
    order: 1,
    is_published: true,
    is_free_preview: true,
    course_name: "Mathematics 101",
  },
  {
    name: "Solving Linear Equations",
    slug: "linear-equations",
    description: "<h2>Linear Equations</h2><p>Master equation solving</p>",
    content: "<h2>Linear Equations</h2><p>Master equation solving</p>",
    video_url: "https://example.com/linear.mp4",
    xp_reward: 75,
    order: 2,
    is_published: true,
    is_free_preview: false,
    course_name: "Mathematics 101",
  },
];

const demoProblems = [
  {
    type: "multiple_choice",
    question: "What is 2x + 3 = 11? Solve for x.",
    correct_answer: "4",
    difficulty: "easy",
    xp_reward: 25,
    order: 1,
    lesson_name: "Introduction to Algebra",
    options: ["2", "3", "4", "5"],
  },
  {
    type: "exact_answer",
    question: "Solve: x - 5 = 10",
    correct_answer: "15",
    difficulty: "easy",
    xp_reward: 30,
    order: 2,
    lesson_name: "Introduction to Algebra",
  },
];

const demoAiPrompts = [
  {
    name: "Lesson Generation",
    slug: "lesson-generation",
    category: "lesson_generation",
    system_prompt:
      "You are an expert educational content creator. Create engaging, clear lesson content for students. Focus on breaking down complex concepts into digestible pieces.",
    context:
      "Used for generating lesson content with structured educational approach. Include learning objectives, key concepts, and real-world examples.",
    is_active: true,
  },
  {
    name: "Problem Creator",
    slug: "problem-creator",
    category: "problem_creation",
    system_prompt:
      "You are an expert problem writer. Create problems that test understanding and encourage critical thinking. Provide clear, fair questions with multiple difficulty levels.",
    context:
      "Used for generating problems for lessons. Include multiple choice, exact answer, and true/false formats.",
    is_active: true,
  },
  {
    name: "Student Tutor",
    slug: "student-tutor",
    category: "student_assistance",
    system_prompt:
      "You are a patient, encouraging tutor. Help students understand concepts by asking guiding questions and providing hints rather than direct answers. Be supportive and clear.",
    context:
      "Used for providing student assistance. Never give direct answers in exam mode.",
    is_active: true,
  },
];

async function populateCourses(client) {
  logger.info("📚 Populating courses...");

  try {
    const created = await client.createItems("courses", demoCourses);
    logger.success(`✅ Created ${created.length} courses`);

    // Return mapping of course names to IDs
    const courseMap = {};
    created.forEach((course) => {
      courseMap[course.name] = course.id;
    });
    return courseMap;
  } catch (error) {
    logger.error(`Failed to populate courses: ${error.message}`);
    throw error;
  }
}

async function populateLessons(client, courseMap) {
  logger.info("📖 Populating lessons...");

  try {
    // Map course names to IDs
    const lessonsWithIds = demoLessons.map((lesson) => {
      const courseId = courseMap[lesson.course_name];
      if (!courseId) {
        throw new Error(`Course "${lesson.course_name}" not found`);
      }
      const { course_name, ...lessonData } = lesson;
      return {
        ...lessonData,
        course_id: courseId,
      };
    });

    const created = await client.createItems("lessons", lessonsWithIds);
    logger.success(`✅ Created ${created.length} lessons`);

    // Return mapping of lesson names to IDs
    const lessonMap = {};
    created.forEach((lesson) => {
      lessonMap[lesson.name] = lesson.id;
    });
    return lessonMap;
  } catch (error) {
    logger.error(`Failed to populate lessons: ${error.message}`);
    throw error;
  }
}

async function populateProblems(client, lessonMap) {
  logger.info("❓ Populating problems...");

  try {
    // Map lesson names to IDs
    const problemsWithIds = demoProblems.map((problem) => {
      const lessonId = lessonMap[problem.lesson_name];
      if (!lessonId) {
        throw new Error(`Lesson "${problem.lesson_name}" not found`);
      }
      const { lesson_name, ...problemData } = problem;
      return {
        ...problemData,
        lesson_id: lessonId,
      };
    });

    const created = await client.createItems("problems", problemsWithIds);
    logger.success(`✅ Created ${created.length} problems`);
    return created;
  } catch (error) {
    logger.error(`Failed to populate problems: ${error.message}`);
    throw error;
  }
}

async function populateAiPrompts(client) {
  logger.info("🤖 Populating AI prompts...");

  try {
    const created = await client.createItems("ai_prompts", demoAiPrompts);
    logger.success(`✅ Created ${created.length} AI prompts`);
    return created;
  } catch (error) {
    logger.error(`Failed to populate AI prompts: ${error.message}`);
    throw error;
  }
}

async function main() {
  const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
  const accessToken = process.env.DIRECTUS_SETUP_TOKEN;

  if (!accessToken) {
    logger.error("DIRECTUS_SETUP_TOKEN not set in environment");
    process.exit(1);
  }

  logger.section("Populating Directus Collections");

  const client = new DirectusClient(directusUrl, accessToken);

  // Test connection
  const connected = await client.testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Check if collections exist
    const collections = await client.getCollections();
    const collectionNames = collections.map((c) => c.collection);

    const requiredCollections = [
      "courses",
      "lessons",
      "problems",
      "ai_prompts",
    ];
    const missing = requiredCollections.filter(
      (c) => !collectionNames.includes(c)
    );

    if (missing.length > 0) {
      logger.error(`Missing collections: ${missing.join(", ")}`);
      logger.info("Run setup:collections first");
      process.exit(1);
    }

    // Populate in order
    const courseMap = await populateCourses(client);
    const lessonMap = await populateLessons(client, courseMap);
    await populateProblems(client, lessonMap);
    await populateAiPrompts(client);

    logger.section("Data Population Summary");
    logger.success("✅ All data populated successfully!");
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
