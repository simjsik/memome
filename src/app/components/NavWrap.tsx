import { getServerState, InstantSearchSSRProvider } from "react-instantsearch";
import NavBar from "./NavBar";
import SearchComponent from "./SearchComponent";



export default async function NavWrap({ children }) {
    const serverState = await getServerState(
        <SearchComponent />, { renderToString }
    );

    return (
        <>
            <NavBar></NavBar>
            <InstantSearchSSRProvider>
                {children}
                <SearchComponent />
            </InstantSearchSSRProvider>
        </>
    )
}
