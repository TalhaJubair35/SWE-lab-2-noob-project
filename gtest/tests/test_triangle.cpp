#include <gtest/gtest.h>
#include "triangle.h"

// 1. Equilateral (5, 5, 5) -> "Equilateral"
TEST(TriangleTest, EquilateralTriangle) {
    Triangle t;
    EXPECT_TRUE(t.isValid(5, 5, 5));
    EXPECT_EQ(t.getType(5, 5, 5), "Equilateral");
}

// 2. Isosceles (5, 5, 3) -> "Isosceles"
TEST(TriangleTest, IsoscelesTriangle) {
    Triangle t;
    EXPECT_TRUE(t.isValid(5, 5, 3));
    EXPECT_EQ(t.getType(5, 5, 3), "Isosceles");
}

// 3. Scalene (4, 5, 6) -> "Scalene"
TEST(TriangleTest, ScaleneTriangle) {
    Triangle t;
    EXPECT_TRUE(t.isValid(4, 5, 6));
    EXPECT_EQ(t.getType(4, 5, 6), "Scalene");
}

// 4. Invalid triangle: sum of two sides less than third (1, 1, 5) -> "Invalid"
TEST(TriangleTest, InvalidTriangleSumLessThanThird) {
    Triangle t;
    EXPECT_FALSE(t.isValid(1, 1, 5));
    EXPECT_EQ(t.getType(1, 1, 5), "Invalid");
}

// 5. Boundary case: sum of two sides equals third (1, 2, 3) -> "Invalid"
TEST(TriangleTest, BoundaryCaseSumEqualsThirdOneTwoThree) {
    Triangle t;
    EXPECT_FALSE(t.isValid(1, 2, 3));
    EXPECT_EQ(t.getType(1, 2, 3), "Invalid");
}

// 6. Equal boundary case (2, 2, 4) -> "Invalid"
TEST(TriangleTest, EqualBoundaryCaseTwoTwoFour) {
    Triangle t;
    EXPECT_FALSE(t.isValid(2, 2, 4));
    EXPECT_EQ(t.getType(2, 2, 4), "Invalid");
}

// 7. Different order (3, 5, 4) -> "Scalene"
TEST(TriangleTest, DifferentOrderScalene) {
    Triangle t;
    EXPECT_TRUE(t.isValid(3, 5, 4));
    EXPECT_EQ(t.getType(3, 5, 4), "Scalene");
}

// 8. Zero side (0, 4, 4) -> "Invalid"
TEST(TriangleTest, ZeroSideInvalid) {
    Triangle t;
    EXPECT_FALSE(t.isValid(0, 4, 4));
    EXPECT_EQ(t.getType(0, 4, 4), "Invalid");
}

// 9. Negative side (-2, 4, 5) -> "Invalid"
TEST(TriangleTest, NegativeSideInvalid) {
    Triangle t;
    EXPECT_FALSE(t.isValid(-2, 4, 5));
    EXPECT_EQ(t.getType(-2, 4, 5), "Invalid");
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
