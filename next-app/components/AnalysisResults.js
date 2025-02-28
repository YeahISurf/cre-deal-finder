import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  Collapse,
  Divider,
  SimpleGrid,
  Stack,
  Icon
} from '@chakra-ui/react';

SyntaxHighlighter.registerLanguage('json', json);

// Helper function to extract keywords from text
function extractKeywordsFromText(text) {
  if (!text) return [];
  
  // Common keywords to look for in real estate listings
  const keywordPatterns = [
    // Seller motivation keywords
    { pattern: /motivated\s+seller/i, category: 'seller', keyword: 'motivated seller' },
    { pattern: /must\s+sell/i, category: 'seller', keyword: 'must sell' },
    { pattern: /price\s+reduced/i, category: 'seller', keyword: 'price reduced' },
    { pattern: /urgent\s+sale/i, category: 'seller', keyword: 'urgent sale' },
    { pattern: /relocating/i, category: 'seller', keyword: 'relocating' },
    { pattern: /distressed/i, category: 'seller', keyword: 'distressed' },
    { pattern: /quick\s+sale/i, category: 'seller', keyword: 'quick sale' },
    { pattern: /below\s+market\s+value/i, category: 'seller', keyword: 'below market value' },
    
    // Transaction complexity keywords
    { pattern: /deferred\s+maintenance/i, category: 'transaction', keyword: 'deferred maintenance' },
    { pattern: /below\s+market/i, category: 'transaction', keyword: 'below market' },
    { pattern: /complex\s+deal/i, category: 'transaction', keyword: 'complex deal' },
    { pattern: /legal\s+issues/i, category: 'transaction', keyword: 'legal issues' },
    { pattern: /title\s+issues/i, category: 'transaction', keyword: 'title issues' },
    { pattern: /foreclosure/i, category: 'transaction', keyword: 'foreclosure' },
    { pattern: /bankruptcy/i, category: 'transaction', keyword: 'bankruptcy' },
    { pattern: /tenant\s+issues/i, category: 'transaction', keyword: 'tenant issues' },
    
    // Property characteristics keywords
    { pattern: /value[\s-]add/i, category: 'property', keyword: 'value-add' },
    { pattern: /below\s+market\s+rents/i, category: 'property', keyword: 'below market rents' },
    { pattern: /good\s+location/i, category: 'property', keyword: 'good location' },
    { pattern: /upside\s+potential/i, category: 'property', keyword: 'upside potential' },
    { pattern: /renovation/i, category: 'property', keyword: 'renovation opportunity' },
    { pattern: /development\s+potential/i, category: 'property', keyword: 'development potential' },
    { pattern: /prime\s+location/i, category: 'property', keyword: 'prime location' },
    { pattern: /high\s+demand\s+area/i, category: 'property', keyword: 'high demand area' }
  ];
  
  // Find all matching keywords in the text
  const foundKeywords = [];
  keywordPatterns.forEach(({ pattern, keyword }) => {
    if (pattern.test(text)) {
      foundKeywords.push(keyword);
    }
  });
  
  return foundKeywords;
}

function ScoreCard({ title, score = 0, className = '' }) {
  // Default to 0 if score is undefined
  const safeScore = typeof score === 'number' ? score : 0;
  
  // Determine color scheme based on score
  let colorScheme;
  if (safeScore >= 7) {
    colorScheme = {
      bg: 'green.50',
      border: 'green.200',
      text: 'green.800'
    };
  } else if (safeScore >= 4) {
    colorScheme = {
      bg: 'yellow.50',
      border: 'yellow.200',
      text: 'yellow.800'
    };
  } else {
    colorScheme = {
      bg: 'red.50',
      border: 'red.200',
      text: 'red.800'
    };
  }
  
  // Determine styling based on className
  const isHighlighted = className.includes('border-primary-100');
  const hasShadow = className.includes('shadow');
  
  return (
    <Box
      p={5}
      bg={colorScheme.bg}
      borderRadius="2xl"
      textAlign="center"
      transition="all 0.2s"
      backdropFilter="blur(4px)"
      boxShadow={hasShadow ? 'md' : 'sm'}
      borderWidth={isHighlighted ? "2px" : "1px"}
      borderStyle="solid"
      borderColor={isHighlighted ? "primary.100" : colorScheme.border}
    >
      <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="medium" mb={1} isTruncated>
        {title}
      </Text>
      <Text fontSize={{ base: '2xl', sm: '3xl' }} fontWeight="semibold" color={colorScheme.text}>
        {safeScore.toFixed(1)}
      </Text>
      <Text fontSize="xs" mt={1} color="gray.500" fontWeight="medium">
        out of 10
      </Text>
    </Box>
  );
}

function ExpandableSection({ title, content, keywords = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <Box 
      mb={4} 
      borderWidth="1px" 
      borderColor="gray.200" 
      borderRadius="xl" 
      overflow="hidden" 
      bg="white" 
      boxShadow="sm"
    >
      <Button
        width="full"
        p={{ base: 3, sm: 4 }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="gray.50"
        _hover={{ bg: "gray.100" }}
        transition="colors 0.2s"
        onClick={() => setIsExpanded(!isExpanded)}
        variant="ghost"
        borderRadius="0"
      >
        <Text fontSize={{ base: 'md', sm: 'lg' }} fontWeight="medium" color="gray.800" textAlign="left">
          {title}
        </Text>
        <Icon 
          as={isExpanded ? ChevronUpIcon : ChevronDownIcon} 
          boxSize={5} 
          color="gray.500" 
        />
      </Button>
      
      <Collapse in={isExpanded} animateOpacity>
        <Box p={{ base: 3, sm: 5 }}>
          <Text color="gray.700" mb={4} lineHeight="relaxed">
            {content}
          </Text>
          
          {keywords && keywords.length > 0 ? (
            <Box>
              <Text fontWeight="medium" color="gray.800" mb={2}>
                Keywords Detected:
              </Text>
              <Flex flexWrap="wrap" gap={2} overflowX="auto" pb={2}>
                {keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    px={3}
                    py={1}
                    bg="primary.50"
                    color="primary.600"
                    fontSize="sm"
                    borderRadius="full"
                  >
                    {keyword}
                  </Badge>
                ))}
              </Flex>
            </Box>
          ) : (
            <Text color="gray.500" fontStyle="italic">
              No relevant keywords detected for this category.
            </Text>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function AnalysisResults({ results }) {
  const [showRawJson, setShowRawJson] = useState(false);
  
  if (!results) return null;
  
  const { property, model_used, models_attempted, ...rawAnalysis } = results;
  
  // Extract explanations from the analysis string if available
  // This handles the case where the API returns a single analysis string instead of separate explanations
  const extractedExplanations = (() => {
    if (typeof rawAnalysis.analysis === 'string') {
      const analysis = rawAnalysis.analysis;
      
      // Try to extract explanations for each category from the analysis string
      // Using more flexible regex patterns to catch more variations
      const sellerMotivationMatch = analysis.match(/seller\s+motivation[:\.]?\s*([^\.]+\.)/i) || 
                                   analysis.match(/motivation[:\.]?\s*([^\.]+\.)/i) ||
                                   analysis.match(/seller[:\.]?\s*([^\.]+\.)/i);
      
      const transactionComplexityMatch = analysis.match(/transaction\s+complexity[:\.]?\s*([^\.]+\.)/i) || 
                                        analysis.match(/complexity[:\.]?\s*([^\.]+\.)/i) ||
                                        analysis.match(/transaction[:\.]?\s*([^\.]+\.)/i);
      
      const propertyCharacteristicsMatch = analysis.match(/property\s+characteristics[:\.]?\s*([^\.]+\.)/i) || 
                                          analysis.match(/characteristics[:\.]?\s*([^\.]+\.)/i) ||
                                          analysis.match(/property[:\.]?\s*([^\.]+\.)/i);
      
      return {
        sellerMotivation: sellerMotivationMatch ? sellerMotivationMatch[1].trim() : null,
        transactionComplexity: transactionComplexityMatch ? transactionComplexityMatch[1].trim() : null,
        propertyCharacteristics: propertyCharacteristicsMatch ? propertyCharacteristicsMatch[1].trim() : null,
        // If we couldn't extract specific explanations, use the full analysis for all categories
        fallback: analysis
      };
    }
    
    // Also check for analysis in other formats
    if (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object') {
      return {
        sellerMotivation: rawAnalysis.analysis.sellerMotivationExplanation || null,
        transactionComplexity: rawAnalysis.analysis.transactionComplexityExplanation || null,
        propertyCharacteristics: rawAnalysis.analysis.propertyCharacteristicsExplanation || null,
        fallback: JSON.stringify(rawAnalysis.analysis)
      };
    }
    
    return null;
  })();
  
  // Handle different API response formats
  // Create a normalized analysis object that works with both formats
  const analysis = {
    // Handle scores - adding support for nested score objects
    seller_motivation_score: rawAnalysis.seller_motivation_score || 
                             (rawAnalysis.scores && rawAnalysis.scores.sellerMotivation && typeof rawAnalysis.scores.sellerMotivation === 'object' ? rawAnalysis.scores.sellerMotivation.score : rawAnalysis.scores.sellerMotivation) || 
                             (rawAnalysis.scores && rawAnalysis.scores.seller_motivation && typeof rawAnalysis.scores.seller_motivation === 'object' ? rawAnalysis.scores.seller_motivation.score : rawAnalysis.scores.seller_motivation) || 
                             (rawAnalysis.seller_motivation && typeof rawAnalysis.seller_motivation === 'object' ? rawAnalysis.seller_motivation.score : rawAnalysis.seller_motivation) || 
                             (typeof rawAnalysis.sellerMotivation === 'number' ? rawAnalysis.sellerMotivation : 0),
    transaction_complexity_score: rawAnalysis.transaction_complexity_score || 
                                 (rawAnalysis.scores && rawAnalysis.scores.transactionComplexity && typeof rawAnalysis.scores.transactionComplexity === 'object' ? rawAnalysis.scores.transactionComplexity.score : rawAnalysis.scores.transactionComplexity) || 
                                 (rawAnalysis.scores && rawAnalysis.scores.transaction_complexity && typeof rawAnalysis.scores.transaction_complexity === 'object' ? rawAnalysis.scores.transaction_complexity.score : rawAnalysis.scores.transaction_complexity) || 
                                 (rawAnalysis.transaction_complexity && typeof rawAnalysis.transaction_complexity === 'object' ? rawAnalysis.transaction_complexity.score : rawAnalysis.transaction_complexity) || 
                                 (typeof rawAnalysis.transactionComplexity === 'number' ? rawAnalysis.transactionComplexity : 0),
    property_characteristics_score: rawAnalysis.property_characteristics_score || 
                                   (rawAnalysis.scores && rawAnalysis.scores.propertyCharacteristics && typeof rawAnalysis.scores.propertyCharacteristics === 'object' ? rawAnalysis.scores.propertyCharacteristics.score : rawAnalysis.scores.propertyCharacteristics) || 
                                   (rawAnalysis.scores && rawAnalysis.scores.property_characteristics && typeof rawAnalysis.scores.property_characteristics === 'object' ? rawAnalysis.scores.property_characteristics.score : rawAnalysis.scores.property_characteristics) || 
                                   (rawAnalysis.property_characteristics && typeof rawAnalysis.property_characteristics === 'object' ? rawAnalysis.property_characteristics.score : rawAnalysis.property_characteristics) || 
                                   (typeof rawAnalysis.propertyCharacteristics === 'number' ? rawAnalysis.propertyCharacteristics : 0),
    total_score: rawAnalysis.total_score || 
                rawAnalysis.totalWeightedScore ||
                (rawAnalysis.scores && rawAnalysis.scores.totalWeightedScore) || 
                (rawAnalysis.scores && rawAnalysis.scores.total_weighted_score) || 
                (typeof rawAnalysis.totalScore === 'number' ? rawAnalysis.totalScore : 0),
    
    // Handle explanations - adding support for nested explanation objects and extracted explanations
    seller_motivation_analysis: rawAnalysis.seller_motivation_analysis || 
                               (rawAnalysis.scores && rawAnalysis.scores.sellerMotivation && {
                                 explanation: rawAnalysis.scores.sellerMotivation.explanation,
                                 keywords: rawAnalysis.scores.sellerMotivation.keywords || 
                                          (rawAnalysis.keywords && rawAnalysis.keywords.sellerMotivation) || 
                                          extractKeywordsFromText(rawAnalysis.scores.sellerMotivation.explanation)
                               }) ||
                               (rawAnalysis.scores && rawAnalysis.scores.seller_motivation && {
                                 explanation: rawAnalysis.scores.seller_motivation.explanation,
                                 keywords: rawAnalysis.scores.seller_motivation.keywords || 
                                          (rawAnalysis.keywords && rawAnalysis.keywords.seller_motivation) || 
                                          extractKeywordsFromText(rawAnalysis.scores.seller_motivation.explanation)
                               }) ||
                               (rawAnalysis.explanations && { 
                                 explanation: rawAnalysis.explanations.seller_motivation,
                                 keywords: (rawAnalysis.keywords && rawAnalysis.keywords.seller_motivation) || 
                                          extractKeywordsFromText(rawAnalysis.explanations.seller_motivation)
                               }) ||
                               (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object' && {
                                 explanation: rawAnalysis.analysis.sellerMotivationExplanation,
                                 keywords: (rawAnalysis.keywords && rawAnalysis.keywords.sellerMotivation) || 
                                          extractKeywordsFromText(rawAnalysis.analysis.sellerMotivationExplanation)
                               }) ||
                               (extractedExplanations && {
                                 explanation: extractedExplanations.sellerMotivation || 
                                             "Seller Motivation: " + extractedExplanations.fallback,
                                 keywords: extractKeywordsFromText(extractedExplanations.sellerMotivation || extractedExplanations.fallback)
                               }) ||
                               (rawAnalysis.seller_motivation && {
                                 explanation: rawAnalysis.seller_motivation.explanation,
                                 keywords: rawAnalysis.seller_motivation.keywords || 
                                          extractKeywordsFromText(rawAnalysis.seller_motivation.explanation)
                               }) || { explanation: "No seller motivation detected in this listing.", keywords: [] },
    transaction_complexity_analysis: rawAnalysis.transaction_complexity_analysis || 
                                    (rawAnalysis.scores && rawAnalysis.scores.transactionComplexity && {
                                      explanation: rawAnalysis.scores.transactionComplexity.explanation,
                                      keywords: rawAnalysis.scores.transactionComplexity.keywords || 
                                               (rawAnalysis.keywords && rawAnalysis.keywords.transactionComplexity) || 
                                               extractKeywordsFromText(rawAnalysis.scores.transactionComplexity.explanation)
                                    }) ||
                                    (rawAnalysis.scores && rawAnalysis.scores.transaction_complexity && {
                                      explanation: rawAnalysis.scores.transaction_complexity.explanation,
                                      keywords: rawAnalysis.scores.transaction_complexity.keywords || 
                                               (rawAnalysis.keywords && rawAnalysis.keywords.transaction_complexity) || 
                                               extractKeywordsFromText(rawAnalysis.scores.transaction_complexity.explanation)
                                    }) ||
                                    (rawAnalysis.explanations && {
                                      explanation: rawAnalysis.explanations.transaction_complexity,
                                      keywords: (rawAnalysis.keywords && rawAnalysis.keywords.transaction_complexity) || 
                                               extractKeywordsFromText(rawAnalysis.explanations.transaction_complexity)
                                    }) ||
                                    (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object' && {
                                      explanation: rawAnalysis.analysis.transactionComplexityExplanation,
                                      keywords: (rawAnalysis.keywords && rawAnalysis.keywords.transactionComplexity) || 
                                               extractKeywordsFromText(rawAnalysis.analysis.transactionComplexityExplanation)
                                    }) ||
                                    (extractedExplanations && {
                                      explanation: extractedExplanations.transactionComplexity || 
                                                  "Transaction Complexity: " + extractedExplanations.fallback,
                                      keywords: extractKeywordsFromText(extractedExplanations.transactionComplexity || extractedExplanations.fallback)
                                    }) ||
                                    (rawAnalysis.transaction_complexity && {
                                      explanation: rawAnalysis.transaction_complexity.explanation,
                                      keywords: rawAnalysis.transaction_complexity.keywords || 
                                               extractKeywordsFromText(rawAnalysis.transaction_complexity.explanation)
                                    }) || { explanation: "No transaction complexity factors detected in this listing.", keywords: [] },
    property_characteristics_analysis: rawAnalysis.property_characteristics_analysis || 
                                      (rawAnalysis.scores && rawAnalysis.scores.propertyCharacteristics && {
                                        explanation: rawAnalysis.scores.propertyCharacteristics.explanation,
                                        keywords: rawAnalysis.scores.propertyCharacteristics.keywords || 
                                                 (rawAnalysis.keywords && rawAnalysis.keywords.propertyCharacteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.scores.propertyCharacteristics.explanation)
                                      }) ||
                                      (rawAnalysis.scores && rawAnalysis.scores.property_characteristics && {
                                        explanation: rawAnalysis.scores.property_characteristics.explanation,
                                        keywords: rawAnalysis.scores.property_characteristics.keywords || 
                                                 (rawAnalysis.keywords && rawAnalysis.keywords.property_characteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.scores.property_characteristics.explanation)
                                      }) ||
                                      (rawAnalysis.explanations && {
                                        explanation: rawAnalysis.explanations.property_characteristics,
                                        keywords: (rawAnalysis.keywords && rawAnalysis.keywords.property_characteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.explanations.property_characteristics)
                                      }) ||
                                      (rawAnalysis.analysis && typeof rawAnalysis.analysis === 'object' && {
                                        explanation: rawAnalysis.analysis.propertyCharacteristicsExplanation,
                                        keywords: (rawAnalysis.keywords && rawAnalysis.keywords.propertyCharacteristics) || 
                                                 extractKeywordsFromText(rawAnalysis.analysis.propertyCharacteristicsExplanation)
                                      }) ||
                                      (extractedExplanations && {
                                        explanation: extractedExplanations.propertyCharacteristics || 
                                                    "Property Characteristics: " + extractedExplanations.fallback,
                                        keywords: extractKeywordsFromText(extractedExplanations.propertyCharacteristics || extractedExplanations.fallback)
                                      }) ||
                                      (rawAnalysis.property_characteristics && {
                                        explanation: rawAnalysis.property_characteristics.explanation,
                                        keywords: rawAnalysis.property_characteristics.keywords || 
                                                 extractKeywordsFromText(rawAnalysis.property_characteristics.explanation)
                                      }) || { explanation: "No specific property characteristics detected in this listing.", keywords: [] },
    
    // Handle summary
    summary: rawAnalysis.summary || 
            rawAnalysis.analysis ||
            (rawAnalysis.explanations && rawAnalysis.explanations.overall_analysis) ||
            (rawAnalysis.analysis && rawAnalysis.analysis.overallAnalysis)
  };
  
  return (
    <Box>
      {property && (
        <Box mb={6}>
          <Heading as="h3" fontSize={{ base: "lg", sm: "xl" }} fontWeight="medium" mb={3} color="gray.900">
            {property.name || 'Unnamed Property'}
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} fontSize="sm">
            <Box p={3} bg="gray.50" borderRadius="lg">
              <Text as="span" fontWeight="medium" color="gray.700">Type: </Text>
              <Text as="span" color="gray.600">{property.property_type || 'N/A'}</Text>
            </Box>
            <Box p={3} bg="gray.50" borderRadius="lg">
              <Text as="span" fontWeight="medium" color="gray.700">Location: </Text>
              <Text as="span" color="gray.600">{property.location || 'N/A'}</Text>
            </Box>
            <Box p={3} bg="gray.50" borderRadius="lg">
              <Text as="span" fontWeight="medium" color="gray.700">Price: </Text>
              <Text as="span" color="gray.600">{property.price || 'N/A'}</Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}
      
      {model_used && (
        <Box 
          mb={6} 
          px={4} 
          py={3} 
          bg="blue.50" 
          borderWidth="1px" 
          borderColor="blue.100" 
          borderRadius="xl" 
          color="blue.700" 
          fontSize="sm"
        >
          <Text>
            <Text as="span" fontWeight="semibold">AI Model Used: </Text>
            {model_used}
          </Text>
          {models_attempted && models_attempted.length > 0 && (
            <Text mt={1}>
              <Text as="span" fontWeight="semibold">Models Attempted: </Text>
              {models_attempted.join(' → ')}
            </Text>
          )}
        </Box>
      )}
      
      <Box mb={8}>
        <Heading as="h3" fontSize={{ base: "lg", sm: "xl" }} fontWeight="medium" mb={4} color="gray.900">
          Scores
        </Heading>
        <Grid templateColumns={{ base: "repeat(2, 1fr)" }} gap={4} maxW="100%" overflow="hidden">
          <ScoreCard 
            title="Seller Motivation" 
            score={analysis.seller_motivation_score} 
          />
          <ScoreCard 
            title="Transaction Complexity" 
            score={analysis.transaction_complexity_score} 
          />
          <ScoreCard 
            title="Property Characteristic" 
            score={analysis.property_characteristics_score} 
          />
          <ScoreCard 
            title="TOTAL SCORE" 
            score={analysis.total_score} 
            className="shadow border-2 border-primary-100" 
          />
        </Grid>
      </Box>
      
      <Box mb={8}>
        <Heading as="h3" fontSize={{ base: "lg", sm: "xl" }} fontWeight="medium" mb={4} color="gray.900">
          Detailed Analysis
        </Heading>
        
        <ExpandableSection 
          title="Seller Motivation" 
          content={analysis.seller_motivation_analysis?.explanation || 
                  "Based on the property listing, the seller motivation score reflects factors such as price reductions, urgency language, and market positioning."}
          keywords={analysis.seller_motivation_analysis?.keywords || []}
        />
        
        <ExpandableSection 
          title="Transaction Complexity" 
          content={analysis.transaction_complexity_analysis?.explanation || 
                  "The transaction complexity score considers factors like property condition, tenant situation, financing requirements, and potential legal considerations."}
          keywords={analysis.transaction_complexity_analysis?.keywords || []}
        />
        
        <ExpandableSection 
          title="Property Characteristics" 
          content={analysis.property_characteristics_analysis?.explanation || 
                  "The property characteristics score evaluates location quality, building condition, tenant mix, and potential for value-add improvements."}
          keywords={analysis.property_characteristics_analysis?.keywords || []}
        />
      </Box>
      
      {analysis.summary && (
        <Box mb={8}>
          <Heading as="h3" fontSize={{ base: "lg", sm: "xl" }} fontWeight="medium" mb={4} color="gray.900">
            Investment Recommendation
          </Heading>
          <Box p={5} bg="primary.50" borderWidth="1px" borderColor="primary.100" borderRadius="xl">
            <Text color="gray.800" lineHeight="relaxed">{analysis.summary}</Text>
          </Box>
        </Box>
      )}
      
      <Flex justify="center">
        <Button
          variant="outline"
          size="sm"
          display="flex"
          alignItems="center"
          onClick={() => setShowRawJson(!showRawJson)}
          colorScheme="gray"
        >
          {showRawJson ? 'Hide' : 'Show'} Raw JSON
          <Icon 
            as={showRawJson ? ChevronUpIcon : ChevronDownIcon} 
            boxSize={4} 
            ml={1} 
          />
        </Button>
      </Flex>
      
      {showRawJson && (
        <Box mt={4} borderWidth="1px" borderRadius="xl" overflow="hidden">
          <SyntaxHighlighter language="json" style={docco} customStyle={{ margin: 0, borderRadius: '0.75rem' }}>
            {JSON.stringify(analysis, null, 2)}
          </SyntaxHighlighter>
        </Box>
      )}
    </Box>
  );
}
