// backend/prisma/seedAptitude.js
// Run: node prisma/seedAptitude.js

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCSV(content) {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV line handling quoted fields
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length >= 10) {
      rows.push({
        question:    values[0],
        option_a:    values[1],
        option_b:    values[2],
        option_c:    values[3],
        option_d:    values[4],
        answer:      values[5]?.toUpperCase(),
        explanation: values[6],
        topic:       values[7],
        subtopic:    values[8],
        difficulty:  values[9]?.toUpperCase(),
      });
    }
  }
  return rows;
}

async function main() {
  console.log("🌱 Starting aptitude questions seed...");

  // Path to your CSV file
  const csvPath = path.join(__dirname, "aptitude_questions.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found at:", csvPath);
    console.log("👉 Copy aptitude_questions_500.csv to backend/prisma/aptitude_questions.csv");
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);

  console.log(`📊 Found ${rows.length} questions in CSV`);

  // Clear existing questions (optional — comment out to append instead)
  const existing = await prisma.aptitudeQuestion.count();
  if (existing > 0) {
    console.log(`⚠️  Found ${existing} existing questions. Skipping duplicates...`);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      // Validate required fields
      if (!row.question || !row.answer || !row.topic || !row.subtopic) {
        skipped++;
        continue;
      }

      // Validate answer is A, B, C, or D
      if (!["A", "B", "C", "D"].includes(row.answer)) {
        skipped++;
        continue;
      }

      // Validate difficulty
      const difficulty = ["EASY", "MEDIUM", "HARD"].includes(row.difficulty)
        ? row.difficulty
        : "EASY";

      await prisma.aptitudeQuestion.create({
        data: {
          question:    row.question,
          optionA:     row.option_a,
          optionB:     row.option_b,
          optionC:     row.option_c,
          optionD:     row.option_d,
          answer:      row.answer,
          explanation: row.explanation || "",
          topic:       row.topic,
          subtopic:    row.subtopic,
          difficulty:  difficulty,
          isActive:    true,
        },
      });
      created++;

      if (created % 50 === 0) {
        console.log(`✅ Seeded ${created} questions...`);
      }
    } catch (err) {
      errors++;
      console.error(`Error on row: ${row.question?.slice(0, 30)}...`, err.message);
    }
  }

  console.log("\n🎉 Seed complete!");
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors:  ${errors}`);

  // Show summary by topic
  const summary = await prisma.aptitudeQuestion.groupBy({
    by: ["topic"],
    _count: { id: true },
  });
  console.log("\n📊 Questions by topic:");
  summary.forEach(s => console.log(`   ${s.topic}: ${s._count.id}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());