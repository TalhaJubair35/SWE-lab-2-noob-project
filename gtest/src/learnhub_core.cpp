#include "learnhub_core.h"
#include <stdexcept>
#include <cmath>
#include <sstream>
#include <iomanip>
#include <regex>

// 1. QuizGrader implementation
QuizResult QuizGrader::evaluate(int totalQuestions, int correctCount, int passingScore) {
    if (totalQuestions <= 0) {
        throw std::invalid_argument("Total questions must be greater than zero");
    }
    if (correctCount < 0 || correctCount > totalQuestions) {
        throw std::invalid_argument("Correct count must be between 0 and total questions");
    }
    if (passingScore < 0 || passingScore > 100) {
        throw std::invalid_argument("Passing score must be between 0 and 100");
    }

    int score = static_cast<int>(std::round((static_cast<double>(correctCount) / totalQuestions) * 100.0));
    bool passed = (score >= passingScore);

    return { score, passed, correctCount, totalQuestions };
}

// 2. CertificateVerifier implementation
std::string CertificateVerifier::generateCode(int courseId, int studentId, const std::string& hexToken) {
    if (courseId <= 0 || studentId <= 0) {
        throw std::invalid_argument("Course ID and Student ID must be positive integers");
    }
    if (hexToken.length() != 6) {
        throw std::invalid_argument("Hex token must be exactly 6 characters");
    }

    std::ostringstream oss;
    oss << "LH-" << courseId << "-" << studentId << "-";
    for (char c : hexToken) {
        oss << static_cast<char>(std::toupper(c));
    }
    return oss.str();
}

bool CertificateVerifier::validateCodeFormat(const std::string& code) {
    // Regex matching LH-<1+ digits>-<1+ digits>-<6 hex chars>
    const std::regex pattern(R"(^LH-[1-9]\d*-[1-9]\d*-[0-9A-Fa-f]{6}$)");
    return std::regex_match(code, pattern);
}

bool CertificateVerifier::parseCode(const std::string& code, int& outCourseId, int& outStudentId, std::string& outHex) {
    if (!validateCodeFormat(code)) {
        return false;
    }
    // Extract parts: LH-course-student-hex
    std::string s = code.substr(3); // Remove "LH-"
    std::size_t dash1 = s.find('-');
    std::size_t dash2 = s.find('-', dash1 + 1);

    if (dash1 == std::string::npos || dash2 == std::string::npos) {
        return false;
    }

    outCourseId = std::stoi(s.substr(0, dash1));
    outStudentId = std::stoi(s.substr(dash1 + 1, dash2 - dash1 - 1));
    outHex = s.substr(dash2 + 1);
    for (char& c : outHex) c = static_cast<char>(std::toupper(c));
    return true;
}

// 3. ReviewAggregator implementation
RatingSummary ReviewAggregator::aggregate(const std::vector<int>& ratings) {
    std::map<int, int> dist = { {1, 0}, {2, 0}, {3, 0}, {4, 0}, {5, 0} };
    if (ratings.empty()) {
        return { 0.0, 0, dist };
    }

    long long sum = 0;
    for (int r : ratings) {
        if (r < 1 || r > 5) {
            throw std::invalid_argument("Rating must be between 1 and 5 stars");
        }
        sum += r;
        dist[r]++;
    }

    double rawAvg = static_cast<double>(sum) / ratings.size();
    double roundedAvg = std::round(rawAvg * 10.0) / 10.0;

    return { roundedAvg, static_cast<int>(ratings.size()), dist };
}

// 4. ProgressTracker implementation
ProgressState ProgressTracker::calculate(int completedLessons, int totalLessons) {
    if (totalLessons < 0 || completedLessons < 0) {
        throw std::invalid_argument("Lesson counts cannot be negative");
    }
    if (completedLessons > totalLessons) {
        throw std::invalid_argument("Completed lessons cannot exceed total lessons");
    }

    if (totalLessons == 0) {
        return { 0, 0, 0.0, false };
    }

    double pct = (static_cast<double>(completedLessons) / totalLessons) * 100.0;
    double roundedPct = std::round(pct * 10.0) / 10.0;
    bool eligible = (completedLessons == totalLessons && totalLessons > 0);

    return { completedLessons, totalLessons, roundedPct, eligible };
}
