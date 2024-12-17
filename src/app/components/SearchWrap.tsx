import { renderToString } from 'react-dom/server';
import {
    InstantSearch,
    InstantSearchServerState,
    InstantSearchSSRProvider,
    getServerState,
    SearchBox,
    Hits,
    Pagination,
} from 'react-instantsearch';
import { history } from 'instantsearch.js/es/lib/routers/index.js';
import singletonRouter from 'next/router';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';
import { searchClient } from '@/app/api/algolia';
import { GetServerSideProps } from 'next';

type SearchPageProps = {
    serverState?: InstantSearchServerState;
    serverUrl: URL;
};

export default function SearchPage({ serverState, serverUrl }: SearchPageProps) {
    return (
        <div className='search_wrap'>
            <InstantSearchSSRProvider {...serverState}>
                <InstantSearch
                    searchClient={searchClient}
                    indexName="YourIndexName"
                    routing={{
                        router: createInstantSearchRouterNext({ singletonRouter, serverUrl }),
                    }}
                >
                    <SearchBox />
                    <Hits />
                    <Pagination />
                </InstantSearch>
            </InstantSearchSSRProvider>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost:3000';
    const serverUrl = `${protocol}://${host}${req.url}`;

    const serverState = await getServerState(
        <SearchPage serverUrl={new URL(serverUrl)} />,
        { renderToString }
    );

    return {
        props: {
            serverState,
            serverUrl,
        },
    };
}