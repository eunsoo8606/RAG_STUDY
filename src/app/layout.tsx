import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KISA 불법스팸대응센터 지능형 AI 챗봇 시스템 | 한국인터넷진흥원",
  description: "정보통신망법 스팸 관련 법령 RAG 질의응답 및 이용정지 자율규제 소명 지원 5중 보안 AI 챗봇",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
