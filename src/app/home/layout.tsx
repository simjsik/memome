import { ReactNode } from 'react';

type LayoutProps = {
    children: ReactNode;
};

export default function HomeLayout({ children }: LayoutProps) {
    return (
        { children }
    );
}