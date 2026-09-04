import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import { WishlistProvider } from "@/context/wishlist-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Noir & Gold — Women's Sarees & Suits",
    template: "%s | Noir & Gold",
  },
  description:
    "Discover exquisite handcrafted sarees and suits. Noir & Gold brings you the finest Indian ethnic wear — Banarasi, Kanjivaram, Chanderi, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
