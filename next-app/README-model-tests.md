# OpenAI Model Testing for CRE Deal Finder

This directory contains scripts to test different OpenAI models (Claude and GPT) for property analysis in the CRE Deal Finder application. These tests are crucial for ensuring compatibility with different models and handling model-specific requirements.

## Model-Specific Requirements

Different OpenAI models have specific requirements that our application handles:

| Model | Parameter Requirements | Response Format | System Messages |
|-------|------------------------|-----------------|-----------------|
| o1 (Claude 3 Opus) | Uses `max_completion_tokens` | Supports `response_format: { type: "json_object" }` | Supports system role messages |
| o1-mini (Claude 3 Haiku) | Uses `max_completion_tokens` | Does NOT support response_format | Does NOT support system role messages |
| gpt-3.5-turbo | Uses `max_tokens` | Supports `response_format: { type: "json_object" }` | Supports system role messages |

Our test scripts verify that the application correctly handles these differences.

## Available Test Scripts

### Basic Tests
1. `test-models.js` - Tests all available models (o1, o1-mini, gpt-3.5-turbo) with a sample property listing
2. `run-model-tests.sh` - Shell script to run the tests with your API key as a command line argument

### Environment Variable Tests
3. `test-models-env.js` - Same as test-models.js but uses the OPENAI_API_KEY environment variable
4. `run-model-tests-env.sh` - Shell script that sets the environment variable and runs the tests

### Dotenv Tests
5. `test-models-dotenv.js` - Uses dotenv to load API key from .env file with additional configuration options
6. `run-model-tests-dotenv.sh` - Shell script that runs the dotenv version with optional command line API key

### Fixed and Improved Tests
7. `test-models-fixed.js` - Version with fixes for model-specific parameters
8. `test-models-improved.js` - Version with improved error handling
9. `test-models-final.js` - Final version with robust JSON parsing and comprehensive error handling
10. `run-fixed-tests.sh` - Shell script to run the fixed version
11. `run-improved-tests.sh` - Shell script to run the improved version
12. `run-final-tests.sh` - Shell script to run the final version

### Specific Model Tests
13. `test-opus-model.js` - Specific test for the o1 (Claude 3 Opus) model
14. `run-opus-test.sh` - Shell script to run the o1 model test
15. `test-model-simple.js` - Simplified test with minimal property description
16. `run-simple-test.sh` - Shell script to run the simplified test

## Running the Tests

### Prerequisites

- Node.js installed
- OpenAI API key with access to Claude models (o1, o1-mini) and GPT models
- Required npm packages: `node-fetch` and optionally `dotenv`

### Option 1: Using the Shell Script with Command Line Argument

```bash
cd next-app
./run-model-tests.sh YOUR_API_KEY
```

Replace `YOUR_API_KEY` with your actual OpenAI API key.

### Option 2: Using the Shell Script with Environment Variable

```bash
cd next-app
./run-model-tests-env.sh YOUR_API_KEY
```

This approach is more secure as it:
- Sets the API key as an environment variable
- Unsets the variable when the test is complete
- Doesn't expose the key in process listings

### Option 3: Running the Node.js Script Directly

```bash
cd next-app
npm install node-fetch  # If not already installed
node test-models.js YOUR_API_KEY
```

### Option 4: Using Environment Variable Manually

```bash
cd next-app
npm install node-fetch  # If not already installed
export OPENAI_API_KEY=your_api_key_here
node test-models-env.js
unset OPENAI_API_KEY  # Don't forget to unset when done
```

### Option 5: Using dotenv with .env File (Recommended for Development)

```bash
cd next-app
npm install node-fetch dotenv  # If not already installed
# Create a .env file with your configuration
echo "OPENAI_API_KEY=your_api_key_here" > .env
# Optional: Configure which model to test
echo "DEFAULT_MODEL=o1" >> .env
# Optional: Set API timeout
echo "API_TIMEOUT=30000" >> .env
# Run the tests
./run-model-tests-dotenv.sh
```

### Option 6: Using dotenv with Command Line API Key

```bash
cd next-app
npm install node-fetch dotenv  # If not already installed
./run-model-tests-dotenv.sh YOUR_API_KEY
```

## What the Tests Do

The test scripts perform comprehensive validation of our model integration:

1. **Model Testing**: Test each model (o1, o1-mini, gpt-3.5-turbo) with a sample property listing
2. **Parameter Validation**: Verify that each model receives the correct parameters:
   - o1: Uses `max_completion_tokens` and `response_format`
   - o1-mini: Uses `max_completion_tokens` without `response_format` or system messages
   - gpt-3.5-turbo: Uses standard parameters with `max_tokens`
3. **Response Analysis**: Analyze the results for each model, checking:
   - Whether scores are properly calculated (not zero)
   - Whether explanations are provided for each category
   - Whether relevant keywords are detected
4. **JSON Handling**: Test the system's ability to handle various JSON formats:
   - Clean JSON responses
   - JSON with markdown code blocks
   - Improperly formatted JSON that needs cleanup
5. **Error Handling**: Test the system's response to various error conditions:
   - API errors
   - Timeout errors
   - JSON parsing errors
6. **Results Comparison**: Generate a summary table comparing the performance of each model

## Test Output

The tests produce detailed output to help diagnose issues:

```
========== ANALYZING PROPERTY WITH MODEL: Claude 3 Opus (o1) ==========

Raw response: {
  "seller_motivation_score": 9.5,
  "seller_motivation_explanation": "The listing shows extremely strong seller motivation...",
  "seller_motivation_keywords": ["price drastically reduced", "owner must sell immediately", "bankruptcy", "urgent need to liquidate assets"],
  
  "transaction_complexity_score": 7.0,
  "transaction_complexity_explanation": "The transaction has moderate complexity...",
  "transaction_complexity_keywords": ["month-to-month leases", "65% occupied", "proof of funds required"],
  
  "property_characteristics_score": 8.5,
  "property_characteristics_explanation": "The property shows strong value-add potential...",
  "property_characteristics_keywords": ["below market rents", "cosmetic updates needed", "25% below market rates"],
  
  "total_score": 8.5
}

Scores:
Seller Motivation: 9.5
Transaction Complexity: 7.0
Property Characteristics: 8.5
Total Score: 8.5

Explanations:
Seller Motivation: The listing shows extremely strong seller motivation...
Transaction Complexity: The transaction has moderate complexity...
Property Characteristics: The property shows strong value-add potential...

Keywords:
Seller Motivation: price drastically reduced,owner must sell immediately,bankruptcy,urgent need to liquidate assets
Transaction Complexity: month-to-month leases,65% occupied,proof of funds required
Property Characteristics: below market rents,cosmetic updates needed,25% below market rates

✅ No issues detected
```

## Security Note

After running the tests, remember to remove your API key from your command history:

```bash
history -c  # This will clear your command history
```

Or you can edit your history file manually:
- `~/.bash_history` (for Bash)
- `~/.zsh_history` (for Zsh)

For maximum security, consider using environment variables or dotenv for API key management:

```bash
# Using environment variables (more secure)
export OPENAI_API_KEY=your_api_key_here
node test-models-env.js
unset OPENAI_API_KEY  # Important: unset when done

# Using dotenv (convenient for development)
echo "OPENAI_API_KEY=your_api_key_here" > .env
node test-models-dotenv.js
```

## Troubleshooting

If you encounter any issues:

1. **API Key Problems**:
   - Make sure your API key is valid and has access to the required models
   - Verify your account has sufficient quota
   - Check that the API key is correctly passed to the script

2. **Model Access Issues**:
   - Not all accounts have access to o1 and o1-mini models
   - If you don't have access to Claude models, the tests will fail with a 404 error
   - You can modify the tests to only test models you have access to

3. **JSON Parsing Errors**:
   - If you see "Failed to parse response" errors, check the raw response
   - The final test script includes automatic JSON cleanup for common issues
   - You can modify the cleanup logic if you encounter specific formatting problems

4. **Package Installation**:
   - Ensure you have the required Node.js packages installed:
     ```bash
     npm install node-fetch dotenv
     ```
   - Check that you're using a compatible Node.js version (14+ recommended)

5. **Directory Issues**:
   - Make sure you're in the correct directory (next-app) when running the scripts
   - Check that the script files have execute permissions:
     ```bash
     chmod +x run-final-tests.sh
     ```
