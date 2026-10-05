#include <gtest/gtest.h>
#include "student_grade.h"

TEST(StudentGradeTest, NormalMarksTotalAndAverage) {
    StudentGrade sg;
    EXPECT_EQ(sg.total(80, 70, 90), 240);
    EXPECT_DOUBLE_EQ(sg.average(80, 70, 90), 80.0);
    EXPECT_EQ(sg.grade(sg.average(80, 70, 90)), 'A');
}

TEST(StudentGradeTest, AllMarksZero) {
    StudentGrade sg;
    EXPECT_EQ(sg.total(0, 0, 0), 0);
    EXPECT_DOUBLE_EQ(sg.average(0, 0, 0), 0.0);
    EXPECT_EQ(sg.grade(0.0), 'F');
}

TEST(StudentGradeTest, FullMarks) {
    StudentGrade sg;
    EXPECT_EQ(sg.total(100, 100, 100), 300);
    EXPECT_DOUBLE_EQ(sg.average(100, 100, 100), 100.0);
    EXPECT_EQ(sg.grade(100.0), 'A');
}

TEST(StudentGradeTest, GradeThresholdBoundaries) {
    StudentGrade sg;
    EXPECT_EQ(sg.grade(80.0), 'A');
    EXPECT_EQ(sg.grade(79.9), 'B');
    EXPECT_EQ(sg.grade(70.0), 'B');
    EXPECT_EQ(sg.grade(69.9), 'C');
    EXPECT_EQ(sg.grade(60.0), 'C');
    EXPECT_EQ(sg.grade(59.9), 'D');
    EXPECT_EQ(sg.grade(50.0), 'D');
    EXPECT_EQ(sg.grade(49.9), 'F');
}

TEST(StudentGradeTest, InvalidMarksException) {
    StudentGrade sg;
    EXPECT_THROW(sg.total(-5, 80, 90), std::invalid_argument);
    EXPECT_THROW(sg.total(80, 105, 90), std::invalid_argument);
    EXPECT_THROW(sg.total(80, 70, 150), std::invalid_argument);
    EXPECT_THROW(sg.grade(-1.0), std::invalid_argument);
    EXPECT_THROW(sg.grade(105.0), std::invalid_argument);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
