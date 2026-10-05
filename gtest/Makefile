CXX ?= clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2 -Iinclude -isystem googletest/googletest/include -Igoogletest/googletest
LDFLAGS = -lpthread

BIN_DIR = bin
GTEST_SRC = googletest/googletest/src/gtest-all.cc

# Binaries
TARGET_LEARNHUB = $(BIN_DIR)/test_learnhub
TARGET_CALCULATOR = $(BIN_DIR)/test_calculator
TARGET_GRADE = $(BIN_DIR)/test_student_grade
TARGET_TRIANGLE = $(BIN_DIR)/test_triangle
TARGET_DEFECT = $(BIN_DIR)/test_triangle_defect

ALL_TARGETS = $(TARGET_LEARNHUB) $(TARGET_CALCULATOR) $(TARGET_GRADE) $(TARGET_TRIANGLE) $(TARGET_DEFECT)

.PHONY: all clean test test-learnhub test-lab5 test-defect check-gtest

all: check-gtest $(ALL_TARGETS)

check-gtest:
	@if [ ! -d "googletest" ]; then \
		echo "Downloading Google Test..."; \
		git clone --depth 1 https://github.com/google/googletest.git googletest; \
	fi
	@mkdir -p $(BIN_DIR)

$(TARGET_LEARNHUB): src/learnhub_core.cpp tests/test_learnhub.cpp | check-gtest
	$(CXX) $(CXXFLAGS) $(GTEST_SRC) $^ $(LDFLAGS) -o $@

$(TARGET_CALCULATOR): src/calculator.cpp tests/test_calculator.cpp | check-gtest
	$(CXX) $(CXXFLAGS) $(GTEST_SRC) $^ $(LDFLAGS) -o $@

$(TARGET_GRADE): src/student_grade.cpp tests/test_student_grade.cpp | check-gtest
	$(CXX) $(CXXFLAGS) $(GTEST_SRC) $^ $(LDFLAGS) -o $@

$(TARGET_TRIANGLE): src/triangle.cpp tests/test_triangle.cpp | check-gtest
	$(CXX) $(CXXFLAGS) $(GTEST_SRC) $^ $(LDFLAGS) -o $@

$(TARGET_DEFECT): tests/test_triangle_defect.cpp | check-gtest
	$(CXX) $(CXXFLAGS) $(GTEST_SRC) $^ $(LDFLAGS) -o $@

test: all
	@echo "\n========================================================"
	@echo "🧪 RUNNING ALL GOOGLE TEST SUITES FOR LEARN-HUB & LAB 5"
	@echo "========================================================"
	@./$(TARGET_LEARNHUB)
	@./$(TARGET_CALCULATOR)
	@./$(TARGET_GRADE)
	@./$(TARGET_TRIANGLE)

test-learnhub: $(TARGET_LEARNHUB)
	@./$(TARGET_LEARNHUB)

test-lab5: $(TARGET_CALCULATOR) $(TARGET_GRADE) $(TARGET_TRIANGLE)
	@./$(TARGET_CALCULATOR)
	@./$(TARGET_GRADE)
	@./$(TARGET_TRIANGLE)

test-defect: $(TARGET_DEFECT)
	@./$(TARGET_DEFECT)

clean:
	rm -rf $(BIN_DIR)
