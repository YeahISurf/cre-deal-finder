import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme.js'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
