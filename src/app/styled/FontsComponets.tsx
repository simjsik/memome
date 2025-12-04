'use client';
import localFont from "next/font/local";

export const Pretendard = localFont({
  src: [
    {
      path: '../fonts/Pretendard-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/Pretendard-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Pretendard-Light.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-pretendard',
});

