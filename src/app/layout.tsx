import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppSideBar from "@/components/AppSideBar";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";


import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apni Farming Dashboard",
  icons: {
    icon: '/logo.png', // or .ico, .svg
  },
  description: "Admin dashboard for managing farming operations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
 
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex safe-area-wrapper`}
      >
        <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
              <SidebarProvider defaultOpen={defaultOpen}>

      

        
        <AppSideBar />
        <main className="w-full">
          <NavBar />
          
         <ReactQueryProvider>
  {children}
   <ToastContainer position="top-right" autoClose={3000} />
</ReactQueryProvider>
          
         
        </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
