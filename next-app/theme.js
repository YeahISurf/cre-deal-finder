import { extendTheme } from '@chakra-ui/react';

// Define a simple theme object with primary colors
const theme = extendTheme({
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0eefe',
      200: '#bae0fd',
      300: '#7cc8fb',
      400: '#36aaf4',
      500: '#0d96e6',
      600: '#0077c2',
      700: '#015fa0',
      800: '#065285',
      900: '#08426e',
    }
  }
});

export default theme;
