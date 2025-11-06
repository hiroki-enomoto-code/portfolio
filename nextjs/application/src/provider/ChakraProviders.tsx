
"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps
} from "@/components/ui/color-mode"

export function ChakraProviders(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider 
        {...props}
        disableTransitionOnChange={false}
        enableSystem={false}
        defaultTheme="light"
      />
    </ChakraProvider>
  )
}