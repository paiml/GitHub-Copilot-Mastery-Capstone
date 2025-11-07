# Mutation Testing Strategy

## Overview

This directory contains mutation testing documentation and scripts for the Invoice Reconciliation
Engine. Following EXTREME TDD principles, we use mutation testing to verify that our test suite is
robust enough to catch bugs.

## What is Mutation Testing?

Mutation testing introduces small changes (mutations) to your source code and verifies that your
test suite catches these intentional bugs. If a test fails, the mutant is "killed" (good). If all
tests pass, the mutant "survived" (bad - indicates weak tests).

## Common Mutations to Test

### 1. Boundary Mutations

- Change `>` to `>=`
- Change `<` to `<=`
- Change `===` to `!==`

### 2. Arithmetic Mutations

- Change `+` to `-`
- Change `*` to `/`
- Change `++` to `--`

### 3. Logical Mutations

- Change `&&` to `||`
- Change `!condition` to `condition`
- Remove conditional logic

### 4. Return Value Mutations

- Change return values to null
- Change true to false
- Change numbers to 0

## Manual Mutation Testing Results

### base.ts Repository

#### Mutation 1: Change findById error message

**Mutation**: `Entity not found: ${id}` → `Entity missing: ${id}` **Result**: ✅ KILLED by test
"should return error when entity not found"

#### Mutation 2: Remove ID preservation in update

**Mutation**: Remove `id` from spread in line 57 **Result**: ✅ KILLED by test "should preserve ID
when updating"

#### Mutation 3: Change delete to no-op

**Mutation**: Comment out `this.data.delete(id)` **Result**: ✅ KILLED by test "should delete
existing entity"

#### Mutation 4: Change findAll filter logic from every() to some()

**Mutation**: `Object.entries(filter).every(...)` → `Object.entries(filter).some(...)` **Result**:
✅ KILLED by test "should filter entities by multiple properties"

#### Mutation 5: Skip UUID generation

**Mutation**: Set id to empty string instead of `crypto.randomUUID()` **Result**: ✅ KILLED by test
"should create multiple entities with unique IDs"

### invoice.ts Repository

#### Mutation 1: Change invoice number error message

**Mutation**: `Invoice not found: ${invoiceNumber}` → `Invoice missing: ${invoiceNumber}`
**Result**: ✅ KILLED by test "should return error when invoice number not found"

#### Mutation 2: Change findByCurrency to return all invoices

**Mutation**: Remove currency filter, return all **Result**: ✅ KILLED by test "should find invoices
by USD currency"

#### Mutation 3: Change pending status check to "completed"

**Mutation**: `invoice.status === "pending"` → `invoice.status === "completed"` **Result**: ✅
KILLED by test "should only return pending status, not other statuses"

#### Mutation 4: Return empty array in findPendingReconciliation

**Mutation**: Always return `Ok([])` **Result**: ✅ KILLED by test "should find multiple pending
invoices"

#### Mutation 5: Remove filter in findByInvoiceNumber

**Mutation**: Return first invoice instead of filtering **Result**: ✅ KILLED by test "should find
correct invoice among multiple invoices"

## Mutation Score

**Total Mutations**: 10 **Killed**: 10 **Survived**: 0 **Mutation Score**: 100%

## Automated Mutation Testing

To implement automated mutation testing with Deno, consider:

1. **Stryker4s** (if cross-compiling to JS)
2. **Custom mutation script** using Deno's file system APIs
3. **AST-based mutations** using TypeScript Compiler API

## Running Manual Mutation Tests

1. Make a specific mutation in source code
2. Run `deno task test`
3. Verify at least one test fails
4. Revert the mutation
5. Document results in this file

## Quality Standards

- **Mutation Score Target**: >90%
- **Critical Paths**: 100% mutation kill rate
- **Review Frequency**: After every significant feature

## Next Steps

1. Consider implementing automated mutation testing
2. Add more complex mutations (conditional boundary cases)
3. Test edge cases in matcher.ts with mutations
4. Verify error handling with null/undefined mutations
