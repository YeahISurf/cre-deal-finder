# CRE Deal Finder Testing Suite

This directory contains test scripts for validating the CRE Deal Finder's property analysis and scoring functionality. The tests use the OpenAI API to analyze various property listings and verify that the scoring system works correctly.

> **Note:** For model-specific testing (o1, o1-mini, gpt-3.5-turbo), see the [README-model-tests.md](README-model-tests.md) file.

## Test Files

### Property Analysis Tests
- **test-comprehensive.js**: Tests a variety of property types with different characteristics to ensure the scoring system correctly identifies seller motivation, transaction complexity, and property characteristics.
- **test-edge-cases.js**: Tests edge cases such as very short descriptions, very long descriptions, conflicting signals, and unusual property types.
- **test-family-dollar.js**: Tests a specific Family Dollar property listing.
- **test-sample-property.js**: Tests the sample retail strip center property.

### Model-Specific Tests
- **test-models.js**: Basic test for all models (o1, o1-mini, gpt-3.5-turbo)
- **test-models-fixed.js**: Tests with fixes for model-specific parameters
- **test-models-final.js**: Final version with robust JSON parsing and error handling
- **test-opus-model.js**: Specific test for the o1 (Claude 3 Opus) model
- **test-model-simple.js**: Simplified test with minimal property description

### Test Runners
- **run-tests.sh**: Shell script to run the Next.js server and execute the tests (Linux/Mac).
- **run-tests.js**: JavaScript alternative to run the tests on any platform.
- **run-model-tests.sh**: Shell script to run model-specific tests
- **run-final-tests.sh**: Shell script to run the final version of model tests

## Running the Tests

There are multiple ways to run the tests:

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

### Running Model-Specific Tests

To test specific OpenAI models:

1. Make sure you have Node.js and npm installed.
2. Install the required dependencies:
   ```
   npm install node-fetch dotenv
   ```
3. Run the model tests with your API key:
   ```
   ./run-final-tests.sh YOUR_API_KEY
   ```
   
   Or use environment variables:
   ```
   ./run-model-tests-env.sh YOUR_API_KEY
   ```
   
   Or use dotenv:
   ```
   ./run-model-tests-dotenv.sh YOUR_API_KEY
   ```

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

### Model Tests

The model tests evaluate:

1. **Parameter Handling**: Ensuring each model uses the correct parameters
   - o1: Uses `max_completion_tokens` and supports response_format
   - o1-mini: Uses `max_completion_tokens` but no response_format or system messages
   - gpt-3.5-turbo: Uses standard parameters with `max_tokens`

2. **JSON Parsing**: Testing the system's ability to handle various JSON formats
   - Clean JSON responses
   - JSON with markdown code blocks
   - Improperly formatted JSON that needs cleanup

3. **Error Handling**: Testing the system's response to various error conditions
   - API errors
   - Timeout errors
   - JSON parsing errors

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

### Model Test Results

The model tests will additionally output:
- Raw JSON responses from each model
- Cleaned and parsed JSON
- Any issues detected with the responses
- A comparison table of all models tested
- Analysis of AI quality across models

## API Key Security

The tests use the OpenAI API key provided in the test scripts or environment variables. For security:

1. Never commit your API key to version control
2. Use environment variables when possible
3. Clear your command history after running tests with API keys
4. Consider using dotenv for local development

See the [README-model-tests.md](README-model-tests.md) file for more detailed information on API key handling.
