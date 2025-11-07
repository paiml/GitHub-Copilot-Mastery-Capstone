#!/usr/bin/env -S deno run --allow-read
/**
 * HTML/CSS Linting Script
 *
 * Validates HTML structure and checks for common issues:
 * - Valid HTML structure
 * - Required meta tags
 * - Accessible links and buttons
 * - Proper semantic HTML
 */

import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";

interface LintIssue {
  file: string;
  line: number;
  severity: "error" | "warning";
  message: string;
}

const issues: LintIssue[] = [];

async function lintHTMLFile(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");

  // Check for required HTML structure
  if (!content.includes("<!DOCTYPE html>")) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "error",
      message: "Missing DOCTYPE declaration",
    });
  }

  if (!content.includes("<html")) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "error",
      message: "Missing <html> tag",
    });
  }

  if (!content.includes("lang=")) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "warning",
      message: "Missing lang attribute on <html> tag",
    });
  }

  // Check for required meta tags
  if (!content.includes("<meta charset=")) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "error",
      message: "Missing charset meta tag",
    });
  }

  if (!content.includes('<meta name="viewport"')) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "warning",
      message: "Missing viewport meta tag",
    });
  }

  if (!content.includes("<title>")) {
    issues.push({
      file: filePath,
      line: 1,
      severity: "error",
      message: "Missing <title> tag",
    });
  }

  // Check for accessibility issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for links without href
    if (line.includes("<a") && !line.includes("href=")) {
      issues.push({
        file: filePath,
        line: lineNum,
        severity: "warning",
        message: "Link without href attribute",
      });
    }

    // Check for images without alt
    if (line.includes("<img") && !line.includes("alt=")) {
      issues.push({
        file: filePath,
        line: lineNum,
        severity: "warning",
        message: "Image without alt attribute",
      });
    }

    // Check for inline styles (best practice warning)
    if (line.includes("style=") && !line.includes("<style")) {
      issues.push({
        file: filePath,
        line: lineNum,
        severity: "warning",
        message: "Inline style attribute found (prefer CSS classes)",
      });
    }
  });

  // Check for basic HTML tag matching (simplified)
  const openTags = content.match(/<(\w+)[^>]*>/g) || [];
  const closeTags = content.match(/<\/(\w+)>/g) || [];

  const selfClosingTags = ["meta", "link", "br", "hr", "img", "input"];
  const openTagNames = openTags
    .map((tag) => tag.match(/<(\w+)/)?.[1])
    .filter((tag): tag is string => !!tag && !selfClosingTags.includes(tag));

  const closeTagNames = closeTags
    .map((tag) => tag.match(/<\/(\w+)>/)?.[1])
    .filter((tag): tag is string => !!tag);

  const openCount: Record<string, number> = {};
  const closeCount: Record<string, number> = {};

  openTagNames.forEach((tag) => {
    openCount[tag] = (openCount[tag] || 0) + 1;
  });

  closeTagNames.forEach((tag) => {
    closeCount[tag] = (closeCount[tag] || 0) + 1;
  });

  // Check for mismatched tags
  Object.keys(openCount).forEach((tag) => {
    if (openCount[tag] !== (closeCount[tag] || 0)) {
      issues.push({
        file: filePath,
        line: 1,
        severity: "error",
        message: `Mismatched tags: ${openCount[tag]} <${tag}> but ${
          closeCount[tag] || 0
        } </${tag}>`,
      });
    }
  });
}

async function lintCSSInHTML(filePath: string): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");

  let inStyleBlock = false;
  lines.forEach((line, index) => {
    const lineNum = index + 1;

    if (line.includes("<style")) {
      inStyleBlock = true;
    }
    if (line.includes("</style>")) {
      inStyleBlock = false;
    }

    if (inStyleBlock) {
      // Check for basic CSS syntax issues
      if (line.includes("{") && !line.includes("}") && !lines[index + 1]?.trim()) {
        issues.push({
          file: filePath,
          line: lineNum,
          severity: "warning",
          message: "Empty CSS rule",
        });
      }

      // Check for !important overuse
      if (line.includes("!important")) {
        issues.push({
          file: filePath,
          line: lineNum,
          severity: "warning",
          message: "Avoid using !important (use specificity instead)",
        });
      }
    }
  });
}

async function main(): Promise<void> {
  console.log("🔍 Linting HTML/CSS files...\n");

  // Find all HTML files
  for await (
    const entry of walk(".", {
      exts: [".html"],
      skip: [/node_modules/, /\.git/, /dist/, /coverage/],
    })
  ) {
    console.log(`Checking ${entry.path}...`);
    await lintHTMLFile(entry.path);
    await lintCSSInHTML(entry.path);
  }

  // Report issues
  if (issues.length === 0) {
    console.log("\n✓ No HTML/CSS issues found!");
    Deno.exit(0);
  }

  console.log(`\n❌ Found ${issues.length} issue(s):\n`);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (errors.length > 0) {
    console.log(`ERRORS (${errors.length}):`);
    errors.forEach((issue) => {
      console.log(
        `  ${issue.file}:${issue.line} - ${issue.message}`,
      );
    });
    console.log();
  }

  if (warnings.length > 0) {
    console.log(`WARNINGS (${warnings.length}):`);
    warnings.forEach((issue) => {
      console.log(
        `  ${issue.file}:${issue.line} - ${issue.message}`,
      );
    });
    console.log();
  }

  // Only fail on errors, not warnings
  if (errors.length > 0) {
    console.log("❌ HTML/CSS linting failed");
    Deno.exit(1);
  } else {
    console.log("✓ HTML/CSS linting passed (warnings can be ignored)");
    Deno.exit(0);
  }
}

if (import.meta.main) {
  main();
}
