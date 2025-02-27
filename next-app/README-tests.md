# CRE Deal Finder Testing Suite

This directory contains test scripts for validating the CRE Deal Finder's property analysis and scoring functionality. The tests use the OpenAI API to analyze various property listings and verify that the scoring system works correctly.

## Test Files

- **test-comprehensive.js**: Tests a variety of property types with different characteristics to ensure the scoring system correctly identifies seller motivation, transaction complexity, and property characteristics.
- **test-edge-cases.js**: Tests edge cases such as very short descriptions, very long descriptions, conflicting signals, and unusual property types.
- **test-family-dollar.js**: Tests a specific Family Dollar property listing.
- **test-sample-property.js**: Tests the sample retail strip center property.
- **run-tests.sh**: Shell script to run the Next.js server and execute the tests (Linux/Mac).
- **run-tests.js**: JavaScript alternative to run the tests on any platform.

## Running the Tests

There are two ways to run the tests:

### Using the Shell Script (Linux/Mac)

1. Make sure you have Node.js and npm installed.
2. Install the required dependencies:
   ```
   npm install
   ```
3. Run the test script:
   ```
   ./run-tests.sh
   ```
4. Follow the prompts to select which tests to run.

### Using the JavaScript Runner (Windows/Any Platform)

1. Make sure you have Node.js and npm installed.
2. Install the required dependencies:
   ```
   npm install
   ```
3. Run the JavaScript test runner:
   ```
   node run-tests.js
   ```
4. Follow the prompts to select which tests to run.

Both scripts will:
1. Check if the Next.js server is already running on port 3003
2. Start the server if it's not running
3. Run the selected tests
4. Ask if you want to stop the server when done

## Test Cases

### Comprehensive Tests

The comprehensive tests include the following property types:

1. **Distressed Office Building**: Property with strong seller motivation signals
2. **Mixed-Use Portfolio**: Property with high transaction complexity
3. **Value-Add Apartment Complex**: Property with strong property characteristics
4. **Neighborhood Shopping Center**: Property with mixed signals
5. **Class A Office Building**: Property with minimal investment signals

### Edge Case Tests

The edge case tests include:

1. **Minimal Description Property**: Very short property description
2. **Extremely Detailed Property**: Very long and detailed property description
3. **Conflicting Signals Property**: Property with conflicting investment signals
4. **Neutral Property**: Property with no clear investment signals
5. **Self-Storage Facility**: Unusual property type

## Test Results

The tests will output:
- The model used for analysis
- Scores for each category (seller motivation, transaction complexity, property characteristics)
- Explanations for each score
- Keywords detected in each category
- Total weighted score
- Summary recommendation

At the end, a summary table will show the scores for all properties, and an analysis will check if the scores match expectations.

## API Key

The tests use the OpenAI API key provided in the test scripts. This key is only used for testing purposes and should not be used in production.
