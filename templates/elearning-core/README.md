# E-Learning Core Template

Complete e-learning platform schema for Directus with block-based lesson builder, problem templating, and modular architecture.

## Features

- **Block-Based Lesson Builder**: Flexible content blocks (video, text, problem, interactive)
- **Problem Templating**: Dynamic word problems with variable substitution
- **Czech Language Support**: Built-in support for Czech language word problems
- **Course Categories**: Organize courses by subject/topic
- **User Groups**: Classes, cohorts, and study groups
- **Progress Tracking**: Lesson progress and course enrollments
- **Sort Fields**: Proper ordering on all collections

## Collections

### Core E-Learning
- `course_categories` - Course categories and organization
- `courses` - Top-level courses with metadata
- `lessons` - Individual lessons within courses
- `lesson_blocks` - M2M junction for lesson content blocks
- `blocks` - Reusable content blocks
- `problem_templates` - Problem templates with variable placeholders
- `problem_instances` - Generated problem instances
- `problem_attempts` - Student problem attempts

### User Management
- `user_groups` - Classes, cohorts, study groups
- `group_members` - M2M junction for group membership
- `course_enrollments` - User course enrollments
- `lesson_progress` - Lesson completion tracking

## Problem Templating

The problem templating system allows you to create dynamic word problems with variable substitution:

### Example Template

```json
{
  "question_template": "Anička má {x} jablek. Petr jí dal ještě {y} jablek. Kolik jablek má Anička celkem?",
  "answer_formula": "x + y",
  "variable_ranges": {
    "x": {"min": 1, "max": 50},
    "y": {"min": 1, "max": 50}
  }
}
```

### Variable Syntax

- Use `{x}`, `{y}`, `{z}` etc. in question templates
- Define ranges for each variable
- Formula uses JavaScript expressions

### Supported Operators

- Addition: `x + y`
- Subtraction: `x - y`
- Multiplication: `x * y`
- Division: `x / y`
- Combined: `x * y + z`

## Block Types

- **video**: Video content with HLS streaming
- **text**: Rich HTML text content
- **problem**: Problem exercises (linked to templates)
- **interactive**: Interactive activities
- **quiz**: Quiz questions
- **code**: Code exercises

## Installation

### Via Directus Template CLI

```bash
npx directus-template-cli apply \
  --directusUrl="http://localhost:8055" \
  --directusToken="your-token" \
  --templateLocation="./elearning-core" \
  --templateType="local"
```

### Via Abakus Directus Setup

```bash
cd scripts/directus-setup
node src/cli.js setup \
  --url="http://localhost:8055" \
  --token="your-token"
```

## Usage

### Creating a Course

1. Create a category (optional)
2. Create a course
3. Create lessons for the course
4. Create blocks (video, text, problems)
5. Link blocks to lessons via `lesson_blocks`

### Creating Problem Templates

1. Define question template with variables
2. Set answer formula
3. Define variable ranges
4. Add hints (optional)

### Generating Problem Instances

Problem instances are generated from templates with random values within defined ranges:

```javascript
// Template
question_template: "Petr má {x} korun a dostal {y} korun. Kolik má celkem?"
answer_formula: "x + y"
variable_ranges: {"x": {"min": 10, "max": 50}, "y": {"min": 5, "max": 30}}

// Generated Instance
generated_question: "Petr má 25 korun a dostal 15 korun. Kolik má celkem?"
variables: {"x": 25, "y": 15}
correct_answer: "40"
```

## Integration with Gamification

This template is designed to work seamlessly with the gamification module. When both are installed:

- Problem attempts can award XP
- Lesson completion triggers achievements
- Course completion adds to user stats

## Integration with Payment System

When payment/subscription modules are installed:

- Courses can be marked as premium
- Price field is used for checkout
- Enrollment requires active subscription

## Sample Data

The template includes sample data:

- 4 course categories (Matematika, Čeština, Přírodověda, Programování)
- 4 courses with Czech descriptions
- 5 lessons with block-based content
- 6 problem templates with Czech word problems
- 6 content blocks (text, video, problem, interactive)
- 2 user groups

## Schema Diagram

```
course_categories
    ↓
courses
    ↓
lessons ←→ lesson_blocks ←→ blocks
                               ↓
                    problem_templates
                               ↓
                    problem_instances
                               ↓
                    problem_attempts
                               
user_groups ←→ group_members

course_enrollments → courses
lesson_progress → lessons
```

## API Examples

### Fetch Course with Lessons and Blocks

```typescript
const course = await client.items('courses').readOne(1, {
  fields: ['*', 'lessons.*', 'lessons.lesson_blocks.block_id.*']
});
```

### Generate Problem Instance

```typescript
const template = await client.items('problem_templates').readOne(1);
const variables = generateRandomValues(template.variable_ranges);
const question = substituteVariables(template.question_template, variables);
const answer = evaluateFormula(template.answer_formula, variables);

await client.items('problem_instances').createOne({
  template_id: template.id,
  generated_question: question,
  variables: variables,
  correct_answer: answer.toString()
});
```

### Track Lesson Progress

```typescript
await client.items('lesson_progress').createOne({
  lesson_id: 1,
  user_id: 'user-uuid',
  watched_duration: 300,
  watch_percentage: 75,
  is_completed: false
});
```

## License

MIT

## Author

Abakus Akademie

## Related Templates

- **Gamification Module** - XP, achievements, leaderboards
- **Payment Module** - Payments, invoices, transactions
- **Subscription Module** - Plans, billing, renewals
- **Coupon Module** - Promo codes, discounts
