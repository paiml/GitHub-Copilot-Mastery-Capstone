#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Mutation Testing Script for Invoice Reconciliation Engine
 *
 * This script performs automated mutation testing by:
 * 1. Creating mutations in source files
 * 2. Running the test suite
 * 3. Verifying tests catch the mutations
 * 4. Reporting mutation score
 */

interface Mutation {
  file: string;
  name: string;
  lineNumber: number;
  original: string;
  mutated: string;
}

const mutations: Mutation[] = [
  // base.ts mutations
  {
    file: "src/data/repositories/base.ts",
    name: "findById: Change error message",
    lineNumber: 17,
    original: "return Promise.resolve(Err(new Error(`Entity missing: ${id}`)));",
    mutated: "return Promise.resolve(Err(new Error(`Entity not found: ${id}`)));",
  },
  {
    file: "src/data/repositories/base.ts",
    name: "update: Remove ID preservation",
    lineNumber: 57,
    original: "const updated = { ...existing, ...updates, id };",
    mutated: "const updated = { ...existing, ...updates };",
  },
  {
    file: "src/data/repositories/base.ts",
    name: "delete: Skip actual deletion",
    lineNumber: 68,
    original: "this.data.delete(id);",
    mutated: "// this.data.delete(id);",
  },
  {
    file: "src/data/repositories/base.ts",
    name: "findAll: Change filter logic every to some",
    lineNumber: 28,
    original: "return Object.entries(filter).every(([key, value]) => {",
    mutated: "return Object.entries(filter).some(([key, value]) => {",
  },
  {
    file: "src/data/repositories/base.ts",
    name: "findAll: Invert filter logic",
    lineNumber: 29,
    original: "return (entity as Record<string, unknown>)[key] === value;",
    mutated: "return (entity as Record<string, unknown>)[key] !== value;",
  },

  // invoice.ts mutations
  {
    file: "src/data/repositories/invoice.ts",
    name: "findByInvoiceNumber: Change error message",
    lineNumber: 13,
    original: "return Err(new Error(`Invoice missing: ${invoiceNumber}`));",
    mutated: "return Err(new Error(`Invoice not found: ${invoiceNumber}`));",
  },
  {
    file: "src/data/repositories/invoice.ts",
    name: "findPendingReconciliation: Change status check",
    lineNumber: 26,
    original: '(invoice) => invoice.status === "pending",',
    mutated: '(invoice) => invoice.status === "completed",',
  },
  {
    file: "src/data/repositories/invoice.ts",
    name: "findPendingReconciliation: Invert filter",
    lineNumber: 26,
    original: '(invoice) => invoice.status === "pending",',
    mutated: '(invoice) => invoice.status !== "pending",',
  },
];

interface MutationResult {
  mutation: Mutation;
  killed: boolean;
  output: string;
}

async function runMutation(mutation: Mutation): Promise<MutationResult> {
  console.log(`\n🧬 Testing mutation: ${mutation.name}`);
  console.log(`   File: ${mutation.file}:${mutation.lineNumber}`);

  const backupPath = `${mutation.file}.backup`;

  try {
    // Backup original file
    const originalContent = await Deno.readTextFile(mutation.file);
    await Deno.writeTextFile(backupPath, originalContent);

    // Apply mutation
    const mutatedContent = originalContent.replace(
      mutation.original,
      mutation.mutated,
    );

    if (mutatedContent === originalContent) {
      console.log(`   ⚠️  Warning: Mutation did not change file content`);
      return {
        mutation,
        killed: false,
        output: "Mutation pattern not found in file",
      };
    }

    await Deno.writeTextFile(mutation.file, mutatedContent);

    // Run tests
    const testCommand = new Deno.Command("deno", {
      args: ["test", "--allow-all", "--quiet"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await testCommand.output();
    const output = new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr);

    // Restore original file
    await Deno.copyFile(backupPath, mutation.file);
    await Deno.remove(backupPath);

    const killed = code !== 0;

    if (killed) {
      console.log(`   ✅ KILLED - Test suite caught the mutation`);
    } else {
      console.log(`   ❌ SURVIVED - Mutation not detected by tests`);
      console.log(`   Output: ${output.substring(0, 200)}`);
    }

    return { mutation, killed, output };
  } catch (error) {
    // Ensure backup is restored on error
    try {
      await Deno.copyFile(backupPath, mutation.file);
      await Deno.remove(backupPath);
    } catch {
      // Ignore cleanup errors
    }

    return {
      mutation,
      killed: false,
      output: `Error running mutation: ${error}`,
    };
  }
}

async function runAllMutations(): Promise<void> {
  console.log("🧬 Starting Mutation Testing for Invoice Reconciliation Engine");
  console.log(`📊 Total mutations to test: ${mutations.length}\n`);

  const results: MutationResult[] = [];

  for (const mutation of mutations) {
    const result = await runMutation(mutation);
    results.push(result);
  }

  // Generate report
  console.log("\n" + "=".repeat(80));
  console.log("📊 MUTATION TESTING REPORT");
  console.log("=".repeat(80));

  const killed = results.filter((r) => r.killed).length;
  const survived = results.filter((r) => !r.killed).length;
  const score = (killed / results.length) * 100;

  console.log(`\nTotal Mutations: ${results.length}`);
  console.log(`✅ Killed: ${killed}`);
  console.log(`❌ Survived: ${survived}`);
  console.log(`📈 Mutation Score: ${score.toFixed(1)}%\n`);

  if (survived > 0) {
    console.log("⚠️  Surviving Mutations:");
    results.filter((r) => !r.killed).forEach((r) => {
      console.log(`   - ${r.mutation.name} (${r.mutation.file}:${r.mutation.lineNumber})`);
    });
    console.log();
  }

  // Quality gate
  const MINIMUM_MUTATION_SCORE = 90;
  if (score >= MINIMUM_MUTATION_SCORE) {
    console.log(
      `✅ PASSED: Mutation score ${score.toFixed(1)}% exceeds ${MINIMUM_MUTATION_SCORE}% threshold`,
    );
    Deno.exit(0);
  } else {
    console.log(
      `❌ FAILED: Mutation score ${score.toFixed(1)}% below ${MINIMUM_MUTATION_SCORE}% threshold`,
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await runAllMutations();
}
