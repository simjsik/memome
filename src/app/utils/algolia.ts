import { liteClient as algoliasearch } from 'algoliasearch/lite';

// 환경 변수에서 App ID와 API Key 가져오기
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY as string;

if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_API_KEY) {
  throw new Error("Algolia 환경 변수가 설정되지 않았습니다.");
}

// Algolia 클라이언트 초기화
export const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
