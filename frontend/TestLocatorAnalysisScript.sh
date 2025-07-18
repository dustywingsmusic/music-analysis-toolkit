#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Test Locator Analysis Script ===${NC}"

# Create output directory
mkdir -p analysis-results

# Load exclusions from .gitignore
GITIGNORE_EXCLUSIONS=""
if [ -f "../.gitignore" ]; then
    echo -e "${YELLOW}Loading exclusions from .gitignore file...${NC}"
    while IFS= read -r line; do
        # Skip empty lines and comments
        if [[ -n "$line" && ! "$line" =~ ^\s*# ]]; then
            # Remove leading/trailing whitespace
            line=$(echo "$line" | sed -e 's/^\s*//' -e 's/\s*$//')
            # Convert paths to grep-compatible patterns
            pattern=$(echo "$line" | sed 's/\//\\\//g')
            # Add to exclusions with OR operator
            if [[ -z "$GITIGNORE_EXCLUSIONS" ]]; then
                GITIGNORE_EXCLUSIONS="$pattern"
            else
                GITIGNORE_EXCLUSIONS="$GITIGNORE_EXCLUSIONS\|$pattern"
            fi
        fi
    done < "../.gitignore"
    echo -e "Loaded $(echo "$GITIGNORE_EXCLUSIONS" | grep -o "\|" | wc -l) exclusion patterns from .gitignore"
fi

# Get the script filename for exclusion
SCRIPT_NAME=$(basename "$0")

# Standard exclusions
STANDARD_EXCLUSIONS="/reports/\|/test-results/\|/node_modules/\|/analysis-results/\|${SCRIPT_NAME}"

# Function to normalize test IDs by removing common dynamic patterns
normalize_testid() {
    local testid="$1"
    # Replace common dynamic patterns with a standardized form
    # Examples: 
    # - data-testid="user-123" -> data-testid="user-*"
    # - data-testid="item-abc-456" -> data-testid="item-*"
    echo "$testid" | \
        # Match IDs with dash followed by numbers or letters
        sed -E 's/([a-zA-Z]+-)[0-9a-zA-Z-]+/\1*/g' | \
        # Match IDs with dollar-sign variables
        sed -E 's/\$\{[^}]+\}/*/'  | \
        # Match regex patterns in tests
        sed -E 's/\^|\$|\\.|\+|\*|\?|\[.*\]|\(.*\)//g'
}

# Function to extract data-testid values from files
extract_testids() {
    local dir="$1"
    grep -r "data-testid=" "$dir" 2>/dev/null | \
    grep -v "$STANDARD_EXCLUSIONS" | \
    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
    awk -F: '{ print $1 ":\t" $0 }' | \
    grep -v '^$'
}

# Function to extract data-testid values from files (just the IDs)
extract_testids_only() {
    local dir="$1"
    {
        # Extract from double quotes
        grep -r "data-testid=" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        sed -n 's/.*data-testid="\([^"]*\)".*/\1/p'

        # Extract from single quotes
        grep -r "data-testid=" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        sed -n "s/.*data-testid='\([^']*\)'.*/\1/p"
    } | grep -v '^$' | sort -u
}

# Function to extract getByTestId/findByTestId/queryByTestId references
extract_test_queries() {
    local dir="$1"
    grep -r -E "(getByTestId|findByTestId|queryByTestId|getAllByTestId|findAllByTestId|queryAllByTestId)" "$dir" 2>/dev/null | \
    grep -v "$STANDARD_EXCLUSIONS" | \
    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
    awk -F: '{ print $1 ":\t" $0 }' | \
    grep -v '^$'
}

# Function to extract getByTestId/findByTestId/queryByTestId references (just the IDs)
extract_test_queries_only() {
    local dir="$1"
    grep -r -E "(getByTestId|findByTestId|queryByTestId|getAllByTestId|findAllByTestId|queryAllByTestId)" "$dir" 2>/dev/null | \
    grep -v "$STANDARD_EXCLUSIONS" | \
    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
    sed -n 's/.*\(getByTestId\|findByTestId\|queryByTestId\|getAllByTestId\|findAllByTestId\|queryAllByTestId\)(\s*['"'"'"`]\([^'"'"'"`]*\)['"'"'"`].*/\2/p' | \
    grep -v '^$' | sort -u
}

# Function to extract Playwright locators
extract_playwright_locators() {
    local dir="$1"
    {
        # Extract data-testid locators from Playwright
        grep -r "getByTestId\|locator.*data-testid" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        awk -F: '{ print $1 ":\t" $0 }'

        grep -r "locator.*data-testid" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        awk -F: '{ print $1 ":\t" $0 }'

        # Extract other common locators
        grep -r -E "page\.locator|test\.locator" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        awk -F: '{ print $1 ":\t" $0 }'
    } | grep -v '^$'
}

# Function to extract Playwright locators (just the IDs)
extract_playwright_locators_only() {
    local dir="$1"
    {
        # Extract data-testid locators from Playwright
        grep -r "getByTestId\|locator.*data-testid" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        sed -n 's/.*getByTestId(\s*['"'"'"`]\([^'"'"'"`]*\)['"'"'"`].*/\1/p'

        grep -r "locator.*data-testid" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        sed -n 's/.*data-testid=\s*['"'"'"`]\([^'"'"'"`]*\)['"'"'"`].*/\1/p'

        # Extract other common locators
        grep -r -E "page\.locator|test\.locator" "$dir" 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
        sed -n 's/.*locator(\s*['"'"'"`]\([^'"'"'"`]*\)['"'"'"`].*/\1/p'
    } | grep -v '^$' | sort -u
}

# Function to check if testid exists in source files
check_testid_in_src() {
    local testid="$1"
    if [[ -z "$testid" ]]; then
        return 1
    fi
    # Use -q for quiet mode - just return status
    grep -q -r "data-testid=[\"']${testid}[\"']" ../src/ 2>/dev/null
    return $?
}

# Function to check if testid exists in test files
check_testid_in_tests() {
    local testid="$1"
    grep -r -E "(getByTestId|findByTestId|queryByTestId|getAllByTestId|findAllByTestId|queryAllByTestId|getByTestId).*[\"']${testid}[\"']" . 2>/dev/null | \
    grep -v "$STANDARD_EXCLUSIONS" | \
    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
    grep -v '^$' >/dev/null
}

echo -e "${YELLOW}Extracting test identifiers from tests directory...${NC}"

# Extract all test identifiers used in tests
echo "Extracting React Testing Library queries..."
RTL_QUERIES=$(extract_test_queries ".")

echo "Extracting Playwright locators..."
PLAYWRIGHT_LOCATORS=$(extract_playwright_locators ".")

# Combine all test identifiers
ALL_TEST_IDS=$(echo -e "$RTL_QUERIES\n$PLAYWRIGHT_LOCATORS" | grep -v '^$' | sort -u)

# Extract regexp test patterns (getByTestId with regex)
echo "Extracting regex test patterns..."
REGEX_PATTERNS=$(grep -r -E "(getByTestId|findByTestId|queryByTestId|getAllByTestId|findAllByTestId|queryAllByTestId).*\/(.*)\/" . 2>/dev/null | \
    grep -v "$STANDARD_EXCLUSIONS" | \
    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
    sed -n 's/.*\(getByTestId\|findByTestId\|queryByTestId\|getAllByTestId\|findAllByTestId\|queryAllByTestId\)(\s*\/\([^/]*\)\/.*/\2/p' | \
    grep -v '^$' | sort -u)

echo "Found $(echo "$REGEX_PATTERNS" | wc -l) regex test patterns"

echo -e "${YELLOW}Extracting data-testid values from src directory...${NC}"

# Extract all data-testid values from source with locations
SRC_TESTIDS_WITH_LOCATIONS=$(extract_testids "../src/")

# Extract all data-testid values from source (just the IDs)
SRC_TESTIDS=$(extract_testids_only "../src/")

# Debug information
echo -e "Found $(echo "$SRC_TESTIDS" | grep -v '^$' | wc -l) data-testid values in source files"
echo -e "Found $(echo "$ALL_TEST_IDS" | grep -v '^$' | wc -l) test IDs in test files"

# Extract all test identifiers with locations
RTL_QUERIES_WITH_LOCATIONS=$(extract_test_queries ".")
PLAYWRIGHT_LOCATORS_WITH_LOCATIONS=$(extract_playwright_locators ".")

# Function to find common tags and their locations
find_common_tags() {
    echo "# Common test IDs found in both source and test files" > analysis-results/common-testids.txt
    echo "# Generated on: $(date)" >> analysis-results/common-testids.txt
    echo "# Note: Reports folder is excluded from analysis" >> analysis-results/common-testids.txt
    echo "" >> analysis-results/common-testids.txt

    echo "## Static Test IDs" >> analysis-results/common-testids.txt
    echo "" >> analysis-results/common-testids.txt

    common_testids_count=0

    # First extract just the test IDs for comparison
    ALL_TEST_IDS_ONLY=$(extract_test_queries_only ".")
    ALL_TEST_IDS_ONLY+="\n$(extract_playwright_locators_only ".")\n"

    while IFS= read -r testid; do
        if [[ -n "$testid" ]]; then
            # Check if this testid exists in source files
            if grep -q "data-testid=[\"']${testid}[\"']" ../src/ 2>/dev/null; then
                echo "### Test ID: $testid" >> analysis-results/common-testids.txt
                echo "" >> analysis-results/common-testids.txt

                echo "#### Source files:" >> analysis-results/common-testids.txt
                grep -r "data-testid=[\"']${testid}[\"']" ../src/ 2>/dev/null | \
                    awk -F: '{ print "- " $1 }' | sort -u >> analysis-results/common-testids.txt
                echo "" >> analysis-results/common-testids.txt

                echo "#### Test files:" >> analysis-results/common-testids.txt
                grep -r -E "(getByTestId|findByTestId|queryByTestId|getAllByTestId|findAllByTestId|queryAllByTestId|getByTestId).*[\"']${testid}[\"']" . 2>/dev/null | \
                    grep -v "$STANDARD_EXCLUSIONS" | \
                    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
                    awk -F: '{ print "- " $1 }' | sort -u >> analysis-results/common-testids.txt
                echo "" >> analysis-results/common-testids.txt

                ((common_testids_count++))
            fi
        fi
    done <<< "$(echo -e "$ALL_TEST_IDS_ONLY" | sort -u | grep -v '^$')"

    # Now look for dynamic IDs
    echo "## Dynamic Test ID Patterns" >> analysis-results/common-testids.txt
    echo "These are test IDs that use patterns or may be dynamically generated" >> analysis-results/common-testids.txt
    echo "" >> analysis-results/common-testids.txt

    dynamic_count=0

    # Process regex patterns from tests
    while IFS= read -r pattern; do
        if [[ -n "$pattern" ]]; then
            # Look for potential matches in src
            normalized_pattern=$(normalize_testid "$pattern")

            # Convert pattern to a grep-compatible regex
            grep_pattern=$(echo "$pattern" | sed 's/\\\\/.*//')

            # Find potential matches in source
            potential_matches=$(grep -r "data-testid=" ../src/ 2>/dev/null | \
                grep -E "data-testid=[\"'][^\"']*${grep_pattern}[^\"']*[\"']" | \
                grep -v "$STANDARD_EXCLUSIONS" | \
                if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi)

            if [[ -n "$potential_matches" ]]; then
                echo "### Pattern: $pattern" >> analysis-results/common-testids.txt
                echo "" >> analysis-results/common-testids.txt

                echo "#### Potential matching source files:" >> analysis-results/common-testids.txt
                echo "$potential_matches" | \
                    awk -F: '{ print "- " $1 " (" $2 ")" }' | sort -u >> analysis-results/common-testids.txt
                echo "" >> analysis-results/common-testids.txt

                echo "#### Test files using this pattern:" >> analysis-results/common-testids.txt
                grep -r -E "(getByTestId|findByTestId|queryByTestId|getAllByTestId|findAllByTestId|queryAllByTestId|getByTestId).*[/]${pattern}[/]" . 2>/dev/null | \
                    grep -v "$STANDARD_EXCLUSIONS" | \
                    if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi | \
                    awk -F: '{ print "- " $1 }' | sort -u >> analysis-results/common-testids.txt
                echo "" >> analysis-results/common-testids.txt

                ((dynamic_count++))
                ((common_testids_count++))
            fi
        fi
    done <<< "$(echo -e "$REGEX_PATTERNS" | sort -u | grep -v '^$')"

    # Look for template literals and dynamic patterns
    echo "### Other dynamic patterns detected:" >> analysis-results/common-testids.txt
    echo "" >> analysis-results/common-testids.txt

    # Find potential template literals in source
    template_literals=$(grep -r "data-testid=\`" ../src/ 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi)

    if [[ -n "$template_literals" ]]; then
        echo "#### Template literals in source:" >> analysis-results/common-testids.txt
        echo "$template_literals" | \
            awk -F: '{ print "- " $1 " (" $2 ")" }' | sort -u >> analysis-results/common-testids.txt
        echo "" >> analysis-results/common-testids.txt
        ((dynamic_count++))
        ((common_testids_count++))
    fi

    # Find variable interpolation in source
    var_interpolation=$(grep -r -E "data-testid=[\"'].*\$\{.*\}.*[\"']" ../src/ 2>/dev/null | \
        grep -v "$STANDARD_EXCLUSIONS" | \
        if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then grep -v "$GITIGNORE_EXCLUSIONS"; else cat; fi)

    if [[ -n "$var_interpolation" ]]; then
        echo "#### Variable interpolation in source:" >> analysis-results/common-testids.txt
        echo "$var_interpolation" | \
            awk -F: '{ print "- " $1 " (" $2 ")" }' | sort -u >> analysis-results/common-testids.txt
        echo "" >> analysis-results/common-testids.txt
        ((dynamic_count++))
        ((common_testids_count++))
    fi

    echo "Found $dynamic_count dynamic test ID patterns" >> analysis-results/common-testids.txt

    # Return the count as an exit code for the caller
    echo $common_testids_count
}

echo -e "${YELLOW}Finding common test IDs between source and test files...${NC}"
common_testids_count=$(find_common_tags)

echo -e "${YELLOW}Analyzing missing locators...${NC}"

# Check for test IDs used in tests but not found in src
echo "# Test IDs used in tests but NOT found in src" > analysis-results/missing-in-src.txt
echo "# Generated on: $(date)" >> analysis-results/missing-in-src.txt
echo "# Note: Reports folder is excluded from analysis" >> analysis-results/missing-in-src.txt
echo "# Note: This excludes regex patterns which are analyzed separately" >> analysis-results/missing-in-src.txt
echo "" >> analysis-results/missing-in-src.txt

missing_in_src_count=0
while IFS= read -r testid; do
    if [[ -n "$testid" ]]; then
        # Skip if this looks like a regex pattern (contains regex special chars)
        if [[ ! "$testid" =~ [\^\$\.\+\*\?\[\]\(\)\{\}\|] ]]; then
            if ! check_testid_in_src "$testid"; then
                echo "$testid" >> analysis-results/missing-in-src.txt
                ((missing_in_src_count++))
            fi
        fi
    fi
done <<< "$ALL_TEST_IDS"

echo -e "${YELLOW}Analyzing unused test IDs...${NC}"

# Check for data-testid values in src but not used in tests
echo "# data-testid values in src but NOT used in tests" > analysis-results/unused-in-tests.txt
echo "# Generated on: $(date)" >> analysis-results/unused-in-tests.txt
echo "# Note: Reports folder is excluded from analysis" >> analysis-results/unused-in-tests.txt
echo "" >> analysis-results/unused-in-tests.txt

unused_in_tests_count=0
while IFS= read -r testid; do
    if [[ -n "$testid" ]]; then
        if ! check_testid_in_tests "$testid"; then
            echo "$testid" >> analysis-results/unused-in-tests.txt
            ((unused_in_tests_count++))
        fi
    fi
done <<< "$SRC_TESTIDS"

# Generate summary report
echo "# Test Locator Analysis Summary" > analysis-results/summary.txt
echo "# Generated on: $(date)" >> analysis-results/summary.txt
echo "# Note: Reports folder is excluded from analysis" >> analysis-results/summary.txt
echo "" >> analysis-results/summary.txt
echo "## Statistics:" >> analysis-results/summary.txt
echo "- Total test IDs used in tests: $(echo "$ALL_TEST_IDS" | grep -c .)" >> analysis-results/summary.txt
echo "- Total data-testid values in src: $(echo "$SRC_TESTIDS" | grep -c .)" >> analysis-results/summary.txt
echo "- Common test IDs (found in both src and tests): $common_testids_count" >> analysis-results/summary.txt
echo "- Test IDs missing in src: $missing_in_src_count" >> analysis-results/summary.txt
echo "- Test IDs unused in tests: $unused_in_tests_count" >> analysis-results/summary.txt
echo "" >> analysis-results/summary.txt
echo "## Exclusions:" >> analysis-results/summary.txt
echo "- Standard exclusions: tests/reports, tests/test-results, tests/node_modules, tests/analysis-results, ${SCRIPT_NAME}" >> analysis-results/summary.txt
if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then
    echo "- Also excluding patterns from .gitignore:" >> analysis-results/summary.txt
    cat ../.gitignore | grep -v "^#" | grep -v "^$" | sed 's/^/  - /' >> analysis-results/summary.txt
fi
echo "" >> analysis-results/summary.txt
echo "## Files generated:" >> analysis-results/summary.txt
echo "- missing-in-src.txt: Test IDs used in tests but not found in src" >> analysis-results/summary.txt
echo "- unused-in-tests.txt: data-testid values in src but not used in tests" >> analysis-results/summary.txt
echo "- common-testids.txt: Test IDs found in both src and test files with their locations" >> analysis-results/summary.txt
echo "" >> analysis-results/summary.txt
echo "## Dynamic IDs Analysis:" >> analysis-results/summary.txt
echo "The script attempts to detect and match dynamic test IDs such as:" >> analysis-results/summary.txt
echo "- Regex patterns in tests (e.g., getByTestId(/item-\d+/))" >> analysis-results/summary.txt
echo "- Template literals in source (e.g., data-testid=\`item-${id}\`)" >> analysis-results/summary.txt
echo "- Variable interpolation (e.g., data-testid=\"item-${id}\")" >> analysis-results/summary.txt
echo "These are reported in the common-testids.txt file under 'Dynamic Test ID Patterns'" >> analysis-results/summary.txt

# Display results
echo -e "${GREEN}=== Analysis Complete ===${NC}"
echo -e "${YELLOW}Results saved to analysis-results/ directory:${NC}"
echo -e "  📄 missing-in-src.txt: ${RED}$missing_in_src_count${NC} test IDs used in tests but not found in src"
echo -e "  📄 unused-in-tests.txt: ${RED}$unused_in_tests_count${NC} data-testid values in src but not used in tests"
echo -e "  📄 common-testids.txt: ${GREEN}$common_testids_count${NC} test IDs found in both src and test files"
echo -e "  📄 summary.txt: Complete analysis summary"

echo -e "\n${GREEN}Summary:${NC}"
echo -e "  Total test IDs in tests: $(echo "$ALL_TEST_IDS" | grep -c .)"
echo -e "  Total data-testid in src: $(echo "$SRC_TESTIDS" | grep -c .)"
echo -e "  Common test IDs: ${GREEN}$common_testids_count${NC}"
echo -e "  (includes both static and dynamic test IDs)"
echo -e "  Missing in src: ${RED}$missing_in_src_count${NC}"
echo -e "  Unused in tests: ${RED}$unused_in_tests_count${NC}"
echo -e "  ${YELLOW}📁 Excluded folders: reports, test-results, node_modules, analysis-results${NC}"
echo -e "  ${YELLOW}📄 Also excluding this script (${SCRIPT_NAME})${NC}"
if [[ -n "$GITIGNORE_EXCLUSIONS" ]]; then
    echo -e "  ${YELLOW}📝 Also excluding patterns from .gitignore file${NC}"
fi

if [ $missing_in_src_count -gt 0 ]; then
    echo -e "\n${RED}⚠️  Some test IDs are missing from src files!${NC}"
fi

if [ $unused_in_tests_count -gt 0 ]; then
    echo -e "\n${YELLOW}💡 Some data-testid values in src are not being tested!${NC}"
fi

echo -e "\n${GREEN}✅ Analysis complete! Check the analysis-results/ directory for detailed reports.${NC}"