// backend/src/controllers/auditAgent.controller.js
import prisma from "../lib/prisma.js";
import { Resend } from "resend";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// ─────────────────────────────────────────
// Helper: Call Groq with fallback
// ─────────────────────────────────────────
async function callGroq(messages, maxTokens = 600) {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of models) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.1, messages })
      });
      if (response.status === 429) continue;
      if (!response.ok) throw new Error(`Groq error: ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      if (err.message?.includes("429")) continue;
      throw err;
    }
  }
  throw new Error("All Groq models rate limited");
}

// ─────────────────────────────────────────
// Audit a single center
// ─────────────────────────────────────────
async function auditCenter(center, reviews) {
  const issues = [];
  const warnings = [];

  // ── Rule 1: No contact info ──
  if (!center.phone && !center.whatsapp && !center.email) {
    issues.push("No contact information provided");
  }

  // ── Rule 2: No description or too short ──
  if (!center.description || center.description.length < 50) {
    issues.push("Description missing or too short");
  }

  // ── Rule 3: No courses listed ──
  if (!center.courses || center.courses.length === 0) {
    warnings.push("No courses listed");
  }

  // ── Rule 4: Low rating with many reviews ──
  if (center.rating > 0 && center.rating < 2.5 && reviews.length >= 5) {
    issues.push(`Very low rating (${center.rating}/5) with ${reviews.length} reviews`);
  }

  // ── Rule 5: Suspicious review spike ──
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentReviews = reviews.filter(r => r.createdAt >= last7Days);
  const recentFiveStars = recentReviews.filter(r => r.rating === 5);
  if (recentFiveStars.length >= 5) {
    warnings.push(`Suspicious: ${recentFiveStars.length} five-star reviews in last 7 days`);
  }

  // ── Rule 6: All reviews same rating ──
  if (reviews.length >= 10) {
    const allSameRating = reviews.every(r => r.rating === reviews[0].rating);
    if (allSameRating) {
      warnings.push("All reviews have identical rating — possible manipulation");
    }
  }

  // ── Rule 7: No logo or image ──
  if (!center.logo && !center.image) {
    warnings.push("No logo or cover image uploaded");
  }

  // ── AI Analysis if enough reviews ──
  let aiInsight = null;
  if (GROQ_API_KEY && reviews.length >= 3) {
    try {
      const reviewSample = reviews.slice(0, 20)
        .map(r => `[${r.rating}★] "${r.comment.substring(0, 100)}"`)
        .join("\n");

      const text = await callGroq([
        {
          role: "system",
          content: "You are an institute quality auditor. Return valid JSON only. No markdown."
        },
        {
          role: "user",
          content: `Audit this training institute:
Name: ${center.name}
City: ${center.city}
Rating: ${center.rating}/5
Total Reviews: ${reviews.length}

Sample reviews:
${reviewSample}

Return ONLY this JSON:
{
  "quality_score": 0-100,
  "main_concern": "biggest issue in one sentence or null",
  "recommendation": "one actionable recommendation for the institute",
  "trust_level": "High/Medium/Low"
}`
        }
      ], 300);

      const clean = text.replace(/```json|```/g, "").trim();
      aiInsight = JSON.parse(clean);
    } catch {
      // Silent fail
    }
  }

  return {
    centerId: center.id,
    centerName: center.name,
    city: center.city,
    rating: center.rating,
    totalReviews: reviews.length,
    issues,
    warnings,
    aiInsight,
    status: issues.length > 0 ? "critical" : warnings.length > 0 ? "warning" : "healthy"
  };
}

// ─────────────────────────────────────────
// Send email report
// ─────────────────────────────────────────
async function sendAuditEmail(report) {
  const critical = report.centerReports.filter(r => r.status === "critical");
  const warnings = report.centerReports.filter(r => r.status === "warning");
  const healthy = report.centerReports.filter(r => r.status === "healthy");

  const criticalHtml = critical.map(c => `
    <div style="border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; background: #fef2f2; border-radius: 4px;">
      <strong style="color: #dc2626;">🚨 ${c.centerName}</strong> — ${c.city} (${c.rating}/5, ${c.totalReviews} reviews)<br/>
      <ul style="margin: 6px 0; padding-left: 20px; color: #7f1d1d;">
        ${c.issues.map(i => `<li>${i}</li>`).join("")}
      </ul>
      ${c.aiInsight ? `<em style="color: #6b7280; font-size: 12px;">AI: ${c.aiInsight.recommendation}</em>` : ""}
    </div>
  `).join("");

  const warningHtml = warnings.map(c => `
    <div style="border-left: 4px solid #f59e0b; padding: 12px; margin: 8px 0; background: #fffbeb; border-radius: 4px;">
      <strong style="color: #d97706;">⚠️ ${c.centerName}</strong> — ${c.city}<br/>
      <ul style="margin: 6px 0; padding-left: 20px; color: #78350f;">
        ${c.warnings.map(w => `<li>${w}</li>`).join("")}
      </ul>
    </div>
  `).join("");

  await resend.emails.send({
    from: "Inscovia Audit <onboarding@resend.dev>",
    to: ADMIN_EMAIL,
    subject: `📊 Weekly Audit Report — ${critical.length} Critical, ${warnings.length} Warnings`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">🤖 Inscovia Weekly Audit Report</h2>
        <p style="color: #6b7280;">Generated: ${new Date().toLocaleDateString("en-IN")}</p>

        <div style="display: flex; gap: 12px; margin: 20px 0;">
          <div style="flex: 1; background: #fef2f2; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #dc2626;">${critical.length}</div>
            <div style="color: #7f1d1d; font-size: 12px;">Critical</div>
          </div>
          <div style="flex: 1; background: #fffbeb; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #d97706;">${warnings.length}</div>
            <div style="color: #78350f; font-size: 12px;">Warnings</div>
          </div>
          <div style="flex: 1; background: #f0fdf4; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #16a34a;">${healthy.length}</div>
            <div style="color: #14532d; font-size: 12px;">Healthy</div>
          </div>
          <div style="flex: 1; background: #eff6ff; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #2563eb;">${report.totalCenters}</div>
            <div style="color: #1e3a8a; font-size: 12px;">Total</div>
          </div>
        </div>

        ${critical.length > 0 ? `
          <h3 style="color: #dc2626;">🚨 Critical Issues</h3>
          ${criticalHtml}
        ` : ""}

        ${warnings.length > 0 ? `
          <h3 style="color: #d97706;">⚠️ Warnings</h3>
          ${warningHtml}
        ` : ""}

        ${critical.length === 0 && warnings.length === 0 ? `
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="color: #16a34a; font-size: 16px;">✅ All institutes are healthy this week!</p>
          </div>
        ` : ""}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Inscovia AI Audit Agent · Next report in 7 days
        </p>
      </div>
    `
  });
}

// ─────────────────────────────────────────
// POST /api/audit/run
// Run full audit on all centers
// ─────────────────────────────────────────
export const runAudit = async (req, res) => {
  try {
    console.log("🤖 Starting weekly audit...");

    // Fetch all centers
    const centers = await prisma.center.findMany({
      select: {
        id: true, name: true, city: true, state: true,
        rating: true, courses: true, phone: true,
        whatsapp: true, email: true, description: true,
        logo: true, image: true, slug: true,
        reviews: {
          select: {
            id: true, rating: true, comment: true,
            userEmail: true, createdAt: true
          }
        }
      }
    });

    // Audit each center
    const centerReports = [];
    for (const center of centers) {
      const report = await auditCenter(center, center.reviews);
      centerReports.push(report);
    }

    const critical = centerReports.filter(r => r.status === "critical");
    const warnings = centerReports.filter(r => r.status === "warning");
    const healthy = centerReports.filter(r => r.status === "healthy");

    const fullReport = {
      runAt: new Date(),
      totalCenters: centers.length,
      critical: critical.length,
      warnings: warnings.length,
      healthy: healthy.length,
      centerReports
    };

    // Save report to DB as a notification
    await prisma.notification.create({
      data: {
        title: `Weekly Audit: ${critical.length} Critical, ${warnings.length} Warnings`,
        message: JSON.stringify({
          totalCenters: centers.length,
          critical: critical.length,
          warnings: warnings.length,
          healthy: healthy.length,
          criticalCenters: critical.map(c => c.centerName),
          runAt: new Date()
        }),
        type: critical.length > 0 ? "ALERT" : warnings.length > 0 ? "WARNING" : "SUCCESS"
      }
    });

    // Send email only if issues found
    if ((critical.length > 0 || warnings.length > 0) && ADMIN_EMAIL && process.env.RESEND_API_KEY) {
      try {
        await sendAuditEmail(fullReport);
        console.log("✅ Audit email sent to", ADMIN_EMAIL);
      } catch (emailErr) {
        console.error("⚠️ Email failed:", emailErr.message);
      }
    }

    console.log(`✅ Audit complete: ${critical.length} critical, ${warnings.length} warnings, ${healthy.length} healthy`);

    res.json({
      success: true,
      summary: {
        totalCenters: centers.length,
        critical: critical.length,
        warnings: warnings.length,
        healthy: healthy.length,
        runAt: new Date()
      },
      centerReports
    });

  } catch (error) {
    console.error("❌ Audit error:", error);
    res.status(500).json({ error: "Audit failed" });
  }
};

// ─────────────────────────────────────────
// GET /api/audit/last
// Get last audit report from notifications
// ─────────────────────────────────────────
export const getLastAudit = async (req, res) => {
  try {
    const last = await prisma.notification.findFirst({
      where: {
        title: { startsWith: "Weekly Audit:" }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!last) {
      return res.json({ message: "No audit run yet", report: null });
    }

    res.json({
      runAt: last.createdAt,
      type: last.type,
      report: JSON.parse(last.message)
    });

  } catch (error) {
    res.status(500).json({ error: "Could not fetch last audit" });
  }
};