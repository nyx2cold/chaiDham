import { Geist, Geist_Mono, Figtree } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/navbar";
import Providers from "@/components/Providers";
import { CartProvider } from "@/context/cartContext";

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", figtree.variable)}
    >
      <body>
        <Providers>
          <CartProvider>
            <Navbar />
            {children}
            <Toaster theme="dark" richColors position="top-center" />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}
