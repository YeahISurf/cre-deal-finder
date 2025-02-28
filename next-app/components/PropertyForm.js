import { useState, useEffect, useRef } from 'react';
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
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

// Sample properties with different characteristics to showcase variety
const SAMPLE_PROPERTIES = {
  retail: {
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
  },
  office: {
    name: 'Downtown Office Building',
    property_type: 'Office',
    location: 'Central Business District',
    price: '$12,500,000',
    description: `DISTRESSED ASSET - FORECLOSURE PENDING - Class B Office Building in CBD

Offering Summary
Sale Price: $12,500,000 (Below Replacement Cost)
Building Size: 75,000 SF
Price/SF: $166.67
Floors: 8
Year Built: 1992 (Renovated 2010)
Occupancy: 65%

Property Overview
Rare opportunity to acquire a Class B office building in the Central Business District at a significant discount to market value. The current owner is facing foreclosure and the lender has authorized a quick sale to avoid formal proceedings.

The property is experiencing tenant issues due to deferred maintenance on HVAC systems and elevators. Several tenants have indicated they may not renew leases unless these issues are addressed. The largest tenant (22% of GLA) has 14 months remaining on their lease.

Property Highlights
- Below market acquisition price (60% of replacement cost)
- Significant upside potential through capital improvements and lease-up
- Prime CBD location with excellent access to transit and amenities
- Structured parking with 2.5:1,000 SF ratio
- Opportunity to reposition as creative office space
- Potential for partial residential conversion on upper floors
- Legal issues with two tenants regarding maintenance obligations`
  },
  industrial: {
    name: 'Distribution Warehouse',
    property_type: 'Industrial',
    location: 'Airport Submarket',
    price: '$8,750,000',
    description: `VALUE-ADD INDUSTRIAL OPPORTUNITY - Modern Distribution Facility

Offering Summary
Sale Price: $8,750,000
Building Size: 125,000 SF
Price/SF: $70.00
Land Area: 6.5 Acres
Year Built: 2005
Clear Height: 28'
Occupancy: 100% (Single Tenant)

Property Overview
Exceptional opportunity to acquire a fully-leased modern distribution facility with significant value-add potential. The property is 100% occupied by a national logistics company with only 18 months remaining on their lease at approximately 20% below current market rates.

The tenant has expressed interest in renewing but requires dock door upgrades and additional trailer parking. The current owner lacks the capital for these improvements, creating an opportunity for a new investor to secure a long-term renewal at market rates.

Property Highlights
- 100% occupied with short-term below-market lease
- Excellent location near major airport with immediate access to interstate
- Modern facility with 28' clear heights and ESFR sprinkler system
- Expansion potential on excess land (1.5 acres)
- 22 dock-high doors with potential to add 8 more positions
- Minimal deferred maintenance with recent roof replacement (2020)
- Tenant willing to sign 10-year extension with property improvements`
  },
  multifamily: {
    name: 'Garden Apartment Complex',
    property_type: 'Multi-Family',
    location: 'Growing Suburban Submarket',
    price: '$22,500,000',
    description: `STABILIZED MULTI-FAMILY WITH UPSIDE - Garden-Style Apartment Community

Offering Summary
Sale Price: $22,500,000
Units: 150
Price Per Unit: $150,000
Year Built: 1998
Occupancy: 94%
Average Unit Size: 925 SF
Current Rents: $1.55/SF (15% Below Market)

Property Overview
Well-maintained garden-style apartment community in a high-growth suburban location. The property has been under the same ownership for 15 years and has been consistently well-maintained, but unit interiors are original and dated.

The current owner has implemented modest rent increases to maintain high occupancy, resulting in current in-place rents approximately 15% below market. A targeted value-add program to upgrade unit interiors would allow a new owner to achieve significant rent premiums.

Property Highlights
- Stable occupancy history above 92% for the past 5 years
- Proven rent growth in submarket of 5-7% annually
- Value-add opportunity through unit interior renovations
- Excellent school district driving strong rental demand
- Recent exterior improvements including new roofs and parking lot resurfacing
- Attractive assumable financing available (3.85% fixed, 7 years remaining)
- No deferred maintenance issues or major capital requirements`
  },
  mixeduse: {
    name: 'Downtown Mixed-Use Development',
    property_type: 'Mixed-Use',
    location: 'Urban Core',
    price: '$18,750,000',
    description: `TROPHY MIXED-USE ASSET - Retail/Residential in Emerging Urban District

Offering Summary
Sale Price: $18,750,000
Building Size: 65,000 SF
Price/SF: $288.46
Year Built: 2015
Occupancy: 92% (Retail), 96% (Residential)
Units: 42 Residential Units + 5 Retail Spaces

Property Overview
Exceptional opportunity to acquire a modern mixed-use development in a rapidly gentrifying urban neighborhood. The property features ground-floor retail with four floors of luxury apartments above. The building was developed by a prominent local developer who is now divesting to focus on other markets.

The retail component is 92% occupied with a curated mix of local businesses including a popular coffee shop, boutique fitness studio, and craft cocktail bar. The residential units are 96% occupied with minimal turnover and a waiting list for specific unit types.

Property Highlights
- Trophy asset in walkable urban neighborhood with strong demographics
- Modern construction with high-end finishes and energy-efficient systems
- Retail tenants on 5-7 year leases with annual escalations
- Residential units achieving premium rents with potential for further increases
- Rooftop amenity deck with city views and outdoor kitchen
- Secure parking garage with EV charging stations
- Opportunity to convert 2 vacant retail spaces to higher-value uses
- Seller financing available for qualified buyers`
  },
  hotel: {
    name: 'Boutique Hotel Property',
    property_type: 'Hospitality',
    location: 'Historic Downtown District',
    price: '$15,200,000',
    description: `BOUTIQUE HOTEL OPPORTUNITY - Historic Property with Modern Amenities

Offering Summary
Sale Price: $15,200,000
Keys: 78 Rooms
Price Per Key: $194,872
Year Built: 1925 (Renovated 2018)
Occupancy: 72%
ADR: $189
RevPAR: $136

Property Overview
Rare opportunity to acquire a fully renovated historic boutique hotel in a prime downtown location. This distinctive property was meticulously restored in 2018, preserving its architectural character while incorporating modern amenities and systems. The hotel operates as an independent property but could be branded under the right flag.

The current owner invested over $5.2M in the 2018 renovation, including all guest rooms, public spaces, and back-of-house areas. The property features a popular restaurant and rooftop bar that generate significant F&B revenue and are popular with both hotel guests and locals.

Property Highlights
- Architecturally significant building with irreplaceable character
- Comprehensive renovation completed in 2018 with minimal capex needs
- Strong weekend and seasonal performance with opportunity to improve weekday occupancy
- Popular F&B outlets generating 32% of total revenue
- Excellent guest reviews (4.7/5.0 average across platforms)
- Walking distance to convention center, sports venues, and entertainment districts
- Current management available to remain in place
- Seller motivated due to portfolio rebalancing strategy`
  },
  selfstorage: {
    name: 'Self-Storage Facility',
    property_type: 'Self-Storage',
    location: 'Suburban Growth Corridor',
    price: '$7,850,000',
    description: `STABILIZED SELF-STORAGE INVESTMENT - Modern Climate-Controlled Facility

Offering Summary
Sale Price: $7,850,000
Net Operating Income: $625,000
Cap Rate: 7.96%
Building Size: 82,500 SF
Units: 650
Occupancy: 91%
Year Built: 2017

Property Overview
Exceptional opportunity to acquire a modern, climate-controlled self-storage facility in a high-growth suburban corridor. The property was developed in 2017 and has achieved stabilized occupancy with minimal marketing expense due to its superior location and visibility.

The facility features a mix of climate-controlled and drive-up units with state-of-the-art security systems and property management software. The current owner has implemented systematic rate increases for existing tenants, resulting in steady NOI growth since stabilization.

Property Highlights
- Modern, institutional-quality construction with minimal maintenance requirements
- High-visibility location with excellent signage and street frontage
- Sophisticated security system with 24/7 monitoring and keypad access
- Fully automated management systems with online rentals and payments
- Strong historical occupancy with minimal concessions
- Additional land for potential phase II expansion (1.2 acres)
- Below market management fees (4% vs. industry standard 6%)
- Assumable debt at favorable terms (3.95%, 25-year amortization, 7 years remaining)`
  }
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
  const [selectedSample, setSelectedSample] = useState('retail');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const menuButtonRef = useRef();

  useEffect(() => {
    if (formType === 'sample') {
      setProperty(SAMPLE_PROPERTIES[selectedSample]);
    } else if (formType === 'manual' && Object.values(SAMPLE_PROPERTIES).some(sample => 
      JSON.stringify(property) === JSON.stringify(sample))) {
      // Only clear if currently showing a sample
      setProperty({
        name: '',
        property_type: '',
        location: '',
        price: '',
        description: ''
      });
    }
  }, [formType, selectedSample]);

  const handleSampleSelect = (sampleKey) => {
    setSelectedSample(sampleKey);
    setFormType('sample');
    onClose();
  };

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
          
          <Menu isOpen={isOpen} onClose={onClose} placement="bottom-end">
            <MenuButton
              as={Button}
              flex="1"
              py={3}
              borderRadius="0"
              variant="ghost"
              bg={formType === 'sample' ? 'primary.500' : 'gray.50'}
              color={formType === 'sample' ? 'white' : 'gray.800'}
              _hover={{
                bg: formType === 'sample' ? 'primary.400' : 'gray.100'
              }}
              onClick={onOpen}
              rightIcon={<ChevronDownIcon className="h-4 w-4" />}
              ref={menuButtonRef}
            >
              Use Sample
            </MenuButton>
            <Portal>
              <MenuList 
                zIndex={10} 
                boxShadow="lg" 
                borderRadius="xl" 
                p={2}
                borderColor="gray.200"
                minW="240px"
                maxH="400px"
                overflowY="auto"
              >
                <MenuItem 
                  onClick={() => handleSampleSelect('retail')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'retail' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Retail Strip Center</Text>
                    <Text fontSize="xs" color="gray.500">Motivated seller with price reduction</Text>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSampleSelect('office')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'office' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Downtown Office Building</Text>
                    <Text fontSize="xs" color="gray.500">Distressed asset with tenant issues</Text>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSampleSelect('industrial')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'industrial' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Distribution Warehouse</Text>
                    <Text fontSize="xs" color="gray.500">Value-add opportunity with lease expiration</Text>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSampleSelect('multifamily')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'multifamily' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Garden Apartment Complex</Text>
                    <Text fontSize="xs" color="gray.500">Stabilized property with upside potential</Text>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSampleSelect('mixeduse')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'mixeduse' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Downtown Mixed-Use Development</Text>
                    <Text fontSize="xs" color="gray.500">Trophy asset in emerging urban district</Text>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSampleSelect('hotel')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'hotel' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Boutique Hotel Property</Text>
                    <Text fontSize="xs" color="gray.500">Historic building with recent renovation</Text>
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleSampleSelect('selfstorage')}
                  borderRadius="md"
                  p={3}
                  _hover={{ bg: 'gray.100' }}
                  fontWeight={selectedSample === 'selfstorage' ? 'medium' : 'normal'}
                >
                  <Box>
                    <Text fontWeight="medium">Self-Storage Facility</Text>
                    <Text fontSize="xs" color="gray.500">Stabilized asset with expansion potential</Text>
                  </Box>
                </MenuItem>
              </MenuList>
            </Portal>
          </Menu>
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
