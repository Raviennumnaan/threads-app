import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Threads",
  description: "A Nextjs 14 Meta Threads Application",
};

type AuthLayoutProps = { children: ReactNode };

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
