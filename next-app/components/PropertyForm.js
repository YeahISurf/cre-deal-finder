import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Textarea,
  Text,
  useColorModeValue,
  Spinner
} from '@chakra-ui/react';

const SAMPLE_PROPERTY = {
  name: 'Retail Strip Center',
  property_type: 'Retail',
  location: 'Suburban Location',
  price: '$3,950,000',
  description: `PRICE REDUCED - OWNER MUST SELL! Retail Strip Center in Prime Location

Offering Summary
Sale Price: $3,950,000 (Reduced from $4,200,000)
Building Size: 15,400 SF
Price/SF: $256.49
Lot Size: 1.2 Acres
Year Built: 1985
Occupancy: 78%

Property Overview
Excellent value-add opportunity in a rapidly developing area! This retail strip center is being offered at below market price due to owner's urgent need to liquidate assets. The current owner is relocating out of state and needs a quick closing.

The property shows significant deferred maintenance but has solid bones and excellent upside potential. Current rents are approximately 15% below market, providing immediate upside for a new owner willing to implement a basic renovation program and more active management.

Property Highlights
- Prime corner location with excellent visibility and traffic counts of 25,000+ vehicles per day
- Below market rents with opportunity to increase by 15-20% upon lease renewal
- Value-add opportunity through renovation and repositioning
- Motivated seller - bring all offers!
- Strong tenant mix with national credit tenant as anchor (5-year lease remaining)
- High-growth area with new development nearby
- Potential for additional pad site development`
};

export default function PropertyForm({ onSubmit, isSubmitting }) {
  const [formType, setFormType] = useState('manual');
  const [property, setProperty] = useState({
    name: '',
    property_type: '',
    location: '',
    price: '',
    description: ''
  });

  useEffect(() => {
    if (formType === 'sample') {
      setProperty(SAMPLE_PROPERTY);
    } else if (formType === 'manual' && JSON.stringify(property) === JSON.stringify(SAMPLE_PROPERTY)) {
      // Only clear if currently showing sample
      setProperty({
        name: '',
        property_type: '',
        location: '',
        price: '',
        description: ''
      });
    }
  }, [formType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProperty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(property);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={6}>
        <Flex 
          border="1px" 
          borderColor="gray.200" 
          borderRadius="xl" 
          overflow="hidden" 
          boxShadow="sm"
        >
          <Button
            flex="1"
            py={3}
            borderRadius="0"
            variant="ghost"
            bg={formType === 'manual' ? 'primary.500' : 'gray.50'}
            color={formType === 'manual' ? 'white' : 'gray.800'}
            _hover={{
              bg: formType === 'manual' ? 'primary.400' : 'gray.100'
            }}
            onClick={() => setFormType('manual')}
          >
            Enter Manually
          </Button>
          <Button
            flex="1"
            py={3}
            borderRadius="0"
            variant="ghost"
            bg={formType === 'sample' ? 'primary.500' : 'gray.50'}
            color={formType === 'sample' ? 'white' : 'gray.800'}
            _hover={{
              bg: formType === 'sample' ? 'primary.400' : 'gray.100'
            }}
            onClick={() => setFormType('sample')}
          >
            Use Sample
          </Button>
        </Flex>
      </Box>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4} mb={6}>
        <FormControl>
          <FormLabel htmlFor="name" fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Property Name
          </FormLabel>
          <Input
            id="name"
            name="name"
            value={property.name}
            onChange={handleInputChange}
            placeholder="Office Building"
            size="md"
            borderRadius="xl"
            borderColor="gray.300"
            _focus={{
              borderColor: "primary.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)"
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="property_type" fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Property Type
          </FormLabel>
          <Input
            id="property_type"
            name="property_type"
            value={property.property_type}
            onChange={handleInputChange}
            placeholder="Office, Retail, Industrial, etc."
            size="md"
            borderRadius="xl"
            borderColor="gray.300"
            _focus={{
              borderColor: "primary.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)"
            }}
          />
        </FormControl>
      </Grid>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={4} mb={6}>
        <FormControl>
          <FormLabel htmlFor="location" fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Location
          </FormLabel>
          <Input
            id="location"
            name="location"
            value={property.location}
            onChange={handleInputChange}
            placeholder="City, State"
            size="md"
            borderRadius="xl"
            borderColor="gray.300"
            _focus={{
              borderColor: "primary.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)"
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="price" fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Price
          </FormLabel>
          <Input
            id="price"
            name="price"
            value={property.price}
            onChange={handleInputChange}
            placeholder="$1,000,000"
            size="md"
            borderRadius="xl"
            borderColor="gray.300"
            _focus={{
              borderColor: "primary.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)"
            }}
          />
        </FormControl>
      </Grid>

      <FormControl mb={6}>
        <FormLabel htmlFor="description" fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
          Property Description
        </FormLabel>
        <Textarea
          id="description"
          name="description"
          value={property.description}
          onChange={handleInputChange}
          rows={10}
          placeholder="Paste the full property listing description here..."
          fontWeight="light"
          size="md"
          borderRadius="xl"
          borderColor="gray.300"
          _focus={{
            borderColor: "primary.400",
            boxShadow: "0 0 0 1px var(--chakra-colors-primary-400)"
          }}
        />
      </FormControl>

      <Button
        type="submit"
        width="full"
        bg="primary.500"
        _hover={{ bg: "primary.400" }}
        _active={{ bg: "primary.600" }}
        color="white"
        fontWeight="medium"
        borderRadius="xl"
        py={3}
        isDisabled={isSubmitting}
      >
        {isSubmitting ? (
          <Flex align="center" justify="center">
            <Spinner size="sm" color="white" mr={3} />
            <Text>Analyzing...</Text>
          </Flex>
        ) : 'Analyze Property'}
      </Button>
      
      {!isSubmitting && (
        <Text mt={3} fontSize="sm" textAlign="center" color="gray.500">
          Analysis runs the property through multiple AI models for optimal results
        </Text>
      )}
    </form>
  );
}
