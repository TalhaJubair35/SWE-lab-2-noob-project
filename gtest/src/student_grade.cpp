#include "student_grade.h"
#include <stdexcept>

int StudentGrade::total(int a, int b, int c) {
    if (a < 0 || b < 0 || c < 0 || a > 100 || b > 100 || c > 100) {
        throw std::invalid_argument("Marks must be between 0 and 100");
    }
    return a + b + c;
}

double StudentGrade::average(int a, int b, int c) {
    return total(a, b, c) / 3.0;
}

char StudentGrade::grade(double avg) {
    if (avg < 0.0 || avg > 100.0) {
        throw std::invalid_argument("Average marks out of valid range (0-100)");
    }
    if (avg >= 80.0) return 'A';
    if (avg >= 70.0) return 'B';
    if (avg >= 60.0) return 'C';
    if (avg >= 50.0) return 'D';
    return 'F';
}
