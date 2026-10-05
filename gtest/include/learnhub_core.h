#ifndef LEARNHUB_CORE_H
#define LEARNHUB_CORE_H

#include <string>
#include <vector>
#include <map>

// 1. Quiz Grading Engine
struct QuizResult {
    int score;             // Percentage 0-100
    bool passed;           // true if score >= passingScore
    int correctCount;
    int totalQuestions;
};

class QuizGrader {
public:
    static QuizResult evaluate(int totalQuestions, int correctCount, int passingScore);
};

// 2. Cryptographic Certificate Code Generator & Validator
class CertificateVerifier {
public:
    // Format: LH-<courseId>-<studentId>-<HEX6> (e.g. LH-1-3-A7F9B2)
    static std::string generateCode(int courseId, int studentId, const std::string& hexToken);
    static bool validateCodeFormat(const std::string& code);
    static bool parseCode(const std::string& code, int& outCourseId, int& outStudentId, std::string& outHex);
};

// 3. Course Review & Rating Aggregator
struct RatingSummary {
    double averageRating;               // Rounded to 1 decimal place
    int totalReviews;
    std::map<int, int> distribution;    // 1-star to 5-star counts
};

class ReviewAggregator {
public:
    static RatingSummary aggregate(const std::vector<int>& ratings);
};

// 4. Student Curriculum Progress Tracker
struct ProgressState {
    int completedLessons;
    int totalLessons;
    double percentage;                  // 0.0 to 100.0%
    bool isEligibleForCertificate;      // true strictly when completedLessons == totalLessons && totalLessons > 0
};

class ProgressTracker {
public:
    static ProgressState calculate(int completedLessons, int totalLessons);
};

#endif // LEARNHUB_CORE_H
