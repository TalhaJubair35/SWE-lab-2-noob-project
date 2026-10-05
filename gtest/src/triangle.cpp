#include "triangle.h"

bool Triangle::isValid(int a, int b, int c) {
    if (a <= 0 || b <= 0 || c <= 0) {
        return false;
    }
    // Valid triangle rule: sum of any two sides must be strictly greater than the third
    return (a + b > c) && (a + c > b) && (b + c > a);
}

std::string Triangle::getType(int a, int b, int c) {
    if (!isValid(a, b, c)) {
        return "Invalid";
    }
    if (a == b && b == c) {
        return "Equilateral";
    }
    if (a == b || b == c || a == c) {
        return "Isosceles";
    }
    return "Scalene";
}
