import { ReactNode } from "react";
import NavBar from "../components/NavBar";
import StatusBox from "../components/StatusBox";
import UsageLimit from "../components/UsageLimit";
import GlobalLoadingWrap from "../components/GlobalLoading";
import RouteChangeListener from "../components/RouterListener";

type LayoutProps = {
    children: ReactNode;
};

export default function ProviderClient({ children }: LayoutProps) {
    return (
        <>
            <GlobalLoadingWrap />
            <RouteChangeListener></RouteChangeListener>
            <StatusBox />
            <UsageLimit />
            <NavBar />
            {children}
        </>
    );
}