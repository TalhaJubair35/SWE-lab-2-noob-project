#ifndef TRIANGLE_H
#define TRIANGLE_H

#include <string>

class Triangle {
public:
    bool isValid(int a, int b, int c);
    std::string getType(int a, int b, int c);
};

#endif // TRIANGLE_H
