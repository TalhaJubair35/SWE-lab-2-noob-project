#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "================================================================="
echo "   🎓 CSE 3206: Software Engineering Sessional"
echo "   🚀 Google Test (GTest) Test Harness — LearnHub & Lab 5"
echo "================================================================="

if [ ! -d "googletest" ]; then
    echo "📦 Google Test library not found locally. Cloning shallow repository..."
    git clone --depth 1 https://github.com/google/googletest.git googletest
fi

echo "🔨 Building all C++ Google Test test suites..."
make all

echo ""
echo "================================================================="
echo "1️⃣  RUNNING LEARNHUB CORE BUSINESS LOGIC SUITE"
echo "    - Quiz Grading Algorithm & Passing Thresholds"
echo "    - Cryptographic Certificate Key Format & Validator"
echo "    - Course Review Rating & 5-Star Distribution Engine"
echo "    - Student Curriculum Progress & Graduation Gatekeeper"
echo "================================================================="
./bin/test_learnhub

echo ""
echo "================================================================="
echo "2️⃣  RUNNING LAB 5 PART 1: CALCULATOR DEMONSTRATION"
echo "================================================================="
./bin/test_calculator

echo ""
echo "================================================================="
echo "3️⃣  RUNNING LAB 5 PART 2: STUDENT GRADE IN-LAB TASK"
echo "================================================================="
./bin/test_student_grade

echo ""
echo "================================================================="
echo "4️⃣  RUNNING LAB 5 PART 3: TRIANGLE HOMEWORK (9 TEST CASES)"
echo "================================================================="
./bin/test_triangle

echo ""
echo "================================================================="
echo "5️⃣  RUNNING LAB 5 SECTION 4: BUG-FINDING ACTIVITY DEMONSTRATION"
echo "================================================================="
./bin/test_triangle_defect

echo ""
echo "================================================================="
echo "✅ ALL GOOGLE TEST (GTEST) SUITES COMPILED & EXECUTED SUCCESSFULLY!"
echo "================================================================="
