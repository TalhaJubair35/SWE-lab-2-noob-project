# 🧪 Google Test (GTest) Test Harness — CSE 3206

This directory contains a complete, production-grade **Google Test (GTest)** unit testing suite for:
1. **LearnHub Core Business Algorithms** (`learnhub_core.h`, `learnhub_core.cpp`, `test_learnhub.cpp`)
2. **Lab 5 Demonstration Example: Calculator** (`calculator.h`, `calculator.cpp`, `test_calculator.cpp`)
3. **Lab 5 In-Lab Task: StudentGrade** (`student_grade.h`, `student_grade.cpp`, `test_student_grade.cpp`)
4. **Lab 5 Homework Assignment: Triangle Program** (`triangle.h`, `triangle.cpp`, `test_triangle.cpp`)
5. **Lab 5 Section 4: Bug-Finding Activity Demonstration** (`test_triangle_defect.cpp`)

---

## ⚡ Quick Start: Run Everything in 1 Command

```bash
cd gtest
./run_tests.sh
```

Or using `make`:
```bash
make test          # Runs all normal unit test suites
make test-learnhub # Runs LearnHub core algorithm tests
make test-lab5     # Runs Calculator, StudentGrade, and Triangle tests
make test-defect   # Demonstrates the Lab 5 Bug-Finding Activity
```

---

## 📁 Project Structure

```text
gtest/
├── include/
│   ├── learnhub_core.h          # LearnHub: Grading, Certs, Ratings, Progress
│   ├── calculator.h             # Lab 5 Part 1: Calculator class
│   ├── student_grade.h          # Lab 5 Part 2: StudentGrade class
│   └── triangle.h               # Lab 5 Part 3: Triangle class
├── src/
│   ├── learnhub_core.cpp        # C++ implementation of LearnHub algorithms
│   ├── calculator.cpp           # Calculator implementation
│   ├── student_grade.cpp        # StudentGrade implementation
│   └── triangle.cpp             # Triangle implementation
├── tests/
│   ├── test_learnhub.cpp        # 16 Unit tests for LearnHub core logic
│   ├── test_calculator.cpp      # 5 Unit tests for Calculator
│   ├── test_student_grade.cpp   # 5 Unit tests for StudentGrade
│   ├── test_triangle.cpp        # 9 Unit tests for Triangle (All Lab 5 inputs)
│   └── test_triangle_defect.cpp # Lab 5 Bug-Finding Activity demonstration
├── bin/                         # Compiled test binaries (auto-generated)
├── googletest/                  # Shallow-cloned Google Test library (auto-downloaded)
├── Makefile                     # Standard C++17 build configuration
├── run_tests.sh                 # Unified test execution script
└── README.md                    # This documentation
```

---

## 🔬 Test Suites Breakdown

### 1. LearnHub Core Algorithms (`test_learnhub.cpp`)
Verifies the four critical mathematical and transactional algorithms of the LearnHub e-learning platform:
- **`QuizGrader`**:
  - `PerfectScorePasses`: Validates 10/10 with 70% threshold yields 100% and `passed = true`.
  - `ExactThresholdPasses`: Validates 7/10 yields exactly 70% and passes.
  - `BelowThresholdFails`: Validates 6/10 (60%) fails under a 70% passing requirement.
  - `RoundingBehavior`: Validates 2/3 (66.67%) correctly rounds to 67%.
  - `InvalidInputsThrowException`: Validates exception handling for non-positive questions or out-of-range scores.
- **`CertificateVerifier`**:
  - `GenerateValidCodeFormat`: Validates deterministic synthesis (`LH-<courseId>-<studentId>-<HEX6>`).
  - `ValidateVariousValidFormats`: Regex validation for valid keys (`LH-1-1-A1B2C3`, `LH-42-108-0F9E8D`).
  - `ValidateInvalidFormats`: Rejects malformed strings (missing hex, invalid prefixes, out-of-bounds chars).
  - `ParseCodeSuccessfully`: Extracts course ID, student ID, and cryptographic token.
- **`ReviewAggregator`**:
  - `EmptyReviewsReturnsDefault`: Returns 0.0 stars for empty course enrollments.
  - `MixedDistributionAndPrecision`: Accurately computes weighted averages (e.g. 4.2 stars) and counts each star bucket from 1 to 5.
  - `OutOfRangeRatingThrowsException`: Rejects ratings $< 1$ or $> 5$.
- **`ProgressTracker`**:
  - `PartialProgressNotEligible`: Progress $< 100\%$ denies certificate issuance.
  - `CompleteCurriculumEligibleForCertificate`: $100\%$ completion marks student as eligible for graduation.

---

### 2. Lab 5 Calculator Demonstration (`test_calculator.cpp`)
- `Addition`: Positive, negative, and large integer addition.
- `Subtraction`: Positive, negative, and zero results.
- `Multiplication`: Standard products and zero identity edge case ($10 \times 0 = 0$).
- `Division`: Double floating-point division using `EXPECT_DOUBLE_EQ`.
- `DivisionByZero`: Exception assertion using `EXPECT_THROW(calc.divide(10, 0), std::invalid_argument)`.

---

### 3. Lab 5 StudentGrade In-Lab Task (`test_student_grade.cpp`)
- `NormalMarksTotalAndAverage`: Validates total sum and arithmetic average ($80, 70, 90 \to 240, 80.0$).
- `AllMarksZero`: Validates lower bound ($0, 0, 0 \to 0, 0.0, \text{'F'})$.
- `FullMarks`: Validates upper bound ($100, 100, 100 \to 300, 100.0, \text{'A'})$.
- `GradeThresholdBoundaries`: Tests all letter grade thresholds ('A' $\ge 80$, 'B' $\ge 70$, 'C' $\ge 60$, 'D' $\ge 50$, 'F' $< 50$).
- `InvalidMarksException`: Rejects negative marks ($<0$) or overflow marks ($>100$).

---

### 4. Lab 5 Triangle Homework Assignment (`test_triangle.cpp`)
Implements all 9 test cases from page 8 of `Lab 5.pdf`:
1. `EquilateralTriangle`: $(5, 5, 5) \to \text{"Equilateral"}$
2. `IsoscelesTriangle`: $(5, 5, 3) \to \text{"Isosceles"}$
3. `ScaleneTriangle`: $(4, 5, 6) \to \text{"Scalene"}$
4. `DifferentOrderScalene`: $(3, 5, 4) \to \text{"Scalene"}$
5. `InvalidTriangleSumLessThanThird`: $(1, 1, 5) \to \text{"Invalid"}$
6. `BoundaryCaseSumEqualsThirdOneTwoThree`: $(1, 2, 3) \to \text{"Invalid"}$ (since $1 + 2 = 3$)
7. `EqualBoundaryCaseTwoTwoFour`: $(2, 2, 4) \to \text{"Invalid"}$ (since $2 + 2 = 4$)
8. `ZeroSideInvalid`: $(0, 4, 4) \to \text{"Invalid"}$
9. `NegativeSideInvalid`: $(-2, 4, 5) \to \text{"Invalid"}$

---

### 5. Lab 5 Bug-Finding Activity (`test_triangle_defect.cpp`)
Demonstrates the **Software Testing Cycle**:
```text
Write Code ──> Write Tests ──> Run Tests ──> Pass?
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                                  [Yes]                    [No]
                                    │                       │
                                Continue            Identify Failed Test
                                                            │
                                                    Locate Defective Line
                                                            │
                                                        Fix Code
                                                            │
                                                        Run Again
```
- **The Defect**: `if (a + b >= c)` instead of `if (a + b > c)`.
- **The Detection**: The test suite identifies that boundary degenerate inputs $(1, 2, 3)$ and $(2, 2, 4)$ pass as valid triangles when they should be rejected.
- **The Fix**: Strict inequality `(a + b > c)` restored, achieving $100\%$ green passing state.

---

## 💡 GTest Assertions Quick Reference

| Assertion | Behavior |
| :--- | :--- |
| `EXPECT_EQ(val1, val2)` | Non-fatal: Reports error if not equal, continues test |
| `ASSERT_EQ(val1, val2)` | Fatal: Reports error and immediately aborts the current test |
| `EXPECT_TRUE(condition)` | Checks whether condition evaluates to `true` |
| `EXPECT_FALSE(condition)` | Checks whether condition evaluates to `false` |
| `EXPECT_DOUBLE_EQ(v1, v2)` | Accurately compares floating-point numbers |
| `EXPECT_THROW(expr, type)` | Validates that an expected C++ exception is thrown |
