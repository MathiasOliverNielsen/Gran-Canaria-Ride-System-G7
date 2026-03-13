"use client"
import { createContext, useContext, useState } from "react"

type HeaderConfig = {
  position: 'sticky' | 'fixed';
  color: 'white' | 'black';
}

const HeaderContext = createContext<{
  header: HeaderConfig
  setHeader: (h: HeaderConfig) => void
}>({
  header: {
    color: "black",
    position: 'sticky'
  },
  setHeader: () => {}
})

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<HeaderConfig>({
    position: 'sticky',
    color: 'black'
  })

  return (
    <HeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeaderContext = () => useContext(HeaderContext)