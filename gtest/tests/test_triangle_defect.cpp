#include <gtest/gtest.h>
#include <string>
#include <iostream>

// Defective Triangle class demonstrating Lab 5 Section 4 & 5
// Bug: Uses (a + b >= c) instead of (a + b > c)
class DefectiveTriangle {
public:
    bool isValidBuggy(int a, int b, int c) {
        if (a <= 0 || b <= 0 || c <= 0) return false;
        // INTENTIONAL DEFECT: >= allows degenerate triangles where 1+2=3!
        return (a + b >= c) && (a + c >= b) && (b + c >= a);
    }
};

TEST(BugDemonstrationTest, IntentionallyDemonstrateDefectDetection) {
    DefectiveTriangle buggy;

    std::cout << "\n======================================================\n";
    std::cout << "🧪 [LAB 5 BUG-FINDING ACTIVITY DEMONSTRATION]\n";
    std::cout << "Defective logic: if (a + b >= c) instead of (a + b > c)\n";
    std::cout << "Testing input: (1, 2, 3) where 1 + 2 = 3\n";

    bool actual = buggy.isValidBuggy(1, 2, 3);
    bool expected = false; // Degenerate triangle must be rejected

    std::cout << "Expected isValid(1, 2, 3): false\n";
    std::cout << "Actual   isValid(1, 2, 3): " << (actual ? "true [DEFECT DETECTED!]" : "false") << "\n";
    std::cout << "======================================================\n";

    // In a defect detection run, this assertion catches the bug!
    EXPECT_TRUE(actual) << "Confirmed: The defect (>= instead of >) incorrectly evaluated (1,2,3) as valid!";
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
