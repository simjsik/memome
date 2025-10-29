import type { Metadata } from "next";
import { Viewport } from "next/dist/lib/metadata/types/extra-types";

export const metadata: Metadata = {
    title: "Memome",
    description: "Save to your text memory.",
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
};