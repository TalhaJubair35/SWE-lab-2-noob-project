#include <gtest/gtest.h>
#include "calculator.h"

TEST(CalculatorTest, Addition) {
    Calculator calc;
    EXPECT_EQ(calc.add(2, 3), 5);
    EXPECT_EQ(calc.add(10, 20), 30);
    EXPECT_EQ(calc.add(-2, -3), -5);
}

TEST(CalculatorTest, Subtraction) {
    Calculator calc;
    EXPECT_EQ(calc.subtract(10, 5), 5);
    EXPECT_EQ(calc.subtract(5, 10), -5);
    EXPECT_EQ(calc.subtract(5, 5), 0);
}

TEST(CalculatorTest, Multiplication) {
    Calculator calc;
    EXPECT_EQ(calc.multiply(5, 4), 20);
    EXPECT_EQ(calc.multiply(-5, 4), -20);
    EXPECT_EQ(calc.multiply(10, 0), 0);
}

TEST(CalculatorTest, Division) {
    Calculator calc;
    EXPECT_DOUBLE_EQ(calc.divide(10, 2), 5.0);
    EXPECT_DOUBLE_EQ(calc.divide(9, 3), 3.0);
    EXPECT_DOUBLE_EQ(calc.divide(-10, 2), -5.0);
}

TEST(CalculatorTest, DivisionByZero) {
    Calculator calc;
    EXPECT_THROW(calc.divide(10, 0), std::invalid_argument);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
