import { ReactNode } from "react";
import NavBar from "../components/NavBar";
import StatusBox from "../components/StatusBox";
import UsageLimit from "../components/UsageLimit";
import LoginBox from "../login/LoginBox";

type LayoutProps = {
    children: ReactNode;
};

export default function ProviderClient({ children }: LayoutProps) {
    return (
        <>
            <LoginBox />
            <StatusBox />
            <UsageLimit />
            <NavBar />
            {children}
        </>
    );
}