#include <gtest/gtest.h>
#include "learnhub_core.h"

// ============================================================================
// 1. QUIZ GRADING ENGINE TESTS
// ============================================================================
TEST(QuizGraderTest, PerfectScorePasses) {
    QuizResult res = QuizGrader::evaluate(10, 10, 70);
    EXPECT_EQ(res.score, 100);
    EXPECT_TRUE(res.passed);
    EXPECT_EQ(res.correctCount, 10);
    EXPECT_EQ(res.totalQuestions, 10);
}

TEST(QuizGraderTest, ExactThresholdPasses) {
    // 7 out of 10 = 70% with 70% threshold -> PASS
    QuizResult res = QuizGrader::evaluate(10, 7, 70);
    EXPECT_EQ(res.score, 70);
    EXPECT_TRUE(res.passed);
}

TEST(QuizGraderTest, BelowThresholdFails) {
    // 6 out of 10 = 60% with 70% threshold -> FAIL
    QuizResult res = QuizGrader::evaluate(10, 6, 70);
    EXPECT_EQ(res.score, 60);
    EXPECT_FALSE(res.passed);
}

TEST(QuizGraderTest, ZeroScoreFails) {
    QuizResult res = QuizGrader::evaluate(5, 0, 70);
    EXPECT_EQ(res.score, 0);
    EXPECT_FALSE(res.passed);
}

TEST(QuizGraderTest, RoundingBehavior) {
    // 2 out of 3 = 66.666...% -> rounds to 67%
    QuizResult res = QuizGrader::evaluate(3, 2, 70);
    EXPECT_EQ(res.score, 67);
    EXPECT_FALSE(res.passed);

    // 2 out of 3 with 65% threshold -> PASS
    QuizResult res2 = QuizGrader::evaluate(3, 2, 65);
    EXPECT_EQ(res2.score, 67);
    EXPECT_TRUE(res2.passed);
}

TEST(QuizGraderTest, InvalidInputsThrowException) {
    // Total questions <= 0
    EXPECT_THROW(QuizGrader::evaluate(0, 0, 70), std::invalid_argument);
    EXPECT_THROW(QuizGrader::evaluate(-5, 0, 70), std::invalid_argument);

    // Correct count > total questions
    EXPECT_THROW(QuizGrader::evaluate(5, 6, 70), std::invalid_argument);

    // Negative correct count
    EXPECT_THROW(QuizGrader::evaluate(5, -1, 70), std::invalid_argument);

    // Passing score out of bounds
    EXPECT_THROW(QuizGrader::evaluate(5, 3, 105), std::invalid_argument);
    EXPECT_THROW(QuizGrader::evaluate(5, 3, -10), std::invalid_argument);
}

// ============================================================================
// 2. CERTIFICATE VERIFIER & TOKEN GENERATOR TESTS
// ============================================================================
TEST(CertificateVerifierTest, GenerateValidCodeFormat) {
    std::string code = CertificateVerifier::generateCode(1, 2, "7050b8");
    EXPECT_EQ(code, "LH-1-2-7050B8");
    EXPECT_TRUE(CertificateVerifier::validateCodeFormat(code));
}

TEST(CertificateVerifierTest, ValidateVariousValidFormats) {
    EXPECT_TRUE(CertificateVerifier::validateCodeFormat("LH-1-1-A1B2C3"));
    EXPECT_TRUE(CertificateVerifier::validateCodeFormat("LH-42-108-0F9E8D"));
    EXPECT_TRUE(CertificateVerifier::validateCodeFormat("LH-999-888-123456"));
}

TEST(CertificateVerifierTest, ValidateInvalidFormats) {
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat(""));
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat("LH-1-2"));               // Missing hex
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat("CERT-1-2-A1B2C3"));       // Wrong prefix
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat("LH-0-1-A1B2C3"));         // Invalid course 0
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat("LH-1-2-A1B2C"));          // Only 5 hex chars
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat("LH-1-2-A1B2C3D"));        // 7 hex chars
    EXPECT_FALSE(CertificateVerifier::validateCodeFormat("LH-1-2-ZZZZZZ"));         // Non-hex characters
}

TEST(CertificateVerifierTest, ParseCodeSuccessfully) {
    int courseId = 0;
    int studentId = 0;
    std::string hex;

    bool ok = CertificateVerifier::parseCode("LH-5-12-3D4E5F", courseId, studentId, hex);
    EXPECT_TRUE(ok);
    EXPECT_EQ(courseId, 5);
    EXPECT_EQ(studentId, 12);
    EXPECT_EQ(hex, "3D4E5F");
}

TEST(CertificateVerifierTest, InvalidGenerationThrows) {
    EXPECT_THROW(CertificateVerifier::generateCode(0, 1, "A1B2C3"), std::invalid_argument);
    EXPECT_THROW(CertificateVerifier::generateCode(1, -1, "A1B2C3"), std::invalid_argument);
    EXPECT_THROW(CertificateVerifier::generateCode(1, 1, "SHORT"), std::invalid_argument);
}

// ============================================================================
// 3. COURSE REVIEW & RATING AGGREGATOR TESTS
// ============================================================================
TEST(ReviewAggregatorTest, EmptyReviewsReturnsDefault) {
    std::vector<int> empty;
    RatingSummary s = ReviewAggregator::aggregate(empty);
    EXPECT_DOUBLE_EQ(s.averageRating, 0.0);
    EXPECT_EQ(s.totalReviews, 0);
    EXPECT_EQ(s.distribution[5], 0);
}

TEST(ReviewAggregatorTest, UniformReviews) {
    std::vector<int> ratings = { 5, 5, 5, 5 };
    RatingSummary s = ReviewAggregator::aggregate(ratings);
    EXPECT_DOUBLE_EQ(s.averageRating, 5.0);
    EXPECT_EQ(s.totalReviews, 4);
    EXPECT_EQ(s.distribution[5], 4);
    EXPECT_EQ(s.distribution[1], 0);
}

TEST(ReviewAggregatorTest, MixedDistributionAndPrecision) {
    // Ratings: 5, 4, 4, 3, 5 -> Sum = 21 / 5 = 4.2
    std::vector<int> ratings = { 5, 4, 4, 3, 5 };
    RatingSummary s = ReviewAggregator::aggregate(ratings);
    EXPECT_DOUBLE_EQ(s.averageRating, 4.2);
    EXPECT_EQ(s.totalReviews, 5);
    EXPECT_EQ(s.distribution[5], 2);
    EXPECT_EQ(s.distribution[4], 2);
    EXPECT_EQ(s.distribution[3], 1);
    EXPECT_EQ(s.distribution[2], 0);
    EXPECT_EQ(s.distribution[1], 0);
}

TEST(ReviewAggregatorTest, OutOfRangeRatingThrowsException) {
    EXPECT_THROW(ReviewAggregator::aggregate({ 5, 0, 4 }), std::invalid_argument);
    EXPECT_THROW(ReviewAggregator::aggregate({ 6, 5 }), std::invalid_argument);
    EXPECT_THROW(ReviewAggregator::aggregate({ -1 }), std::invalid_argument);
}

// ============================================================================
// 4. PROGRESS TRACKER & CERTIFICATE ELIGIBILITY TESTS
// ============================================================================
TEST(ProgressTrackerTest, ZeroLessonsEnrolled) {
    ProgressState state = ProgressTracker::calculate(0, 0);
    EXPECT_DOUBLE_EQ(state.percentage, 0.0);
    EXPECT_FALSE(state.isEligibleForCertificate);
}

TEST(ProgressTrackerTest, PartialProgressNotEligible) {
    ProgressState state = ProgressTracker::calculate(2, 5);
    EXPECT_DOUBLE_EQ(state.percentage, 40.0);
    EXPECT_FALSE(state.isEligibleForCertificate);
    EXPECT_EQ(state.completedLessons, 2);
    EXPECT_EQ(state.totalLessons, 5);
}

TEST(ProgressTrackerTest, CompleteCurriculumEligibleForCertificate) {
    // 5 out of 5 lessons completed -> 100% and ELIGIBLE
    ProgressState state = ProgressTracker::calculate(5, 5);
    EXPECT_DOUBLE_EQ(state.percentage, 100.0);
    EXPECT_TRUE(state.isEligibleForCertificate);
}

TEST(ProgressTrackerTest, InvalidProgressThrowsException) {
    // Completed cannot exceed total
    EXPECT_THROW(ProgressTracker::calculate(6, 5), std::invalid_argument);
    // Negative values
    EXPECT_THROW(ProgressTracker::calculate(-1, 5), std::invalid_argument);
    EXPECT_THROW(ProgressTracker::calculate(2, -5), std::invalid_argument);
}

// ============================================================================
// TEST RUNNER MAIN
// ============================================================================
int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
