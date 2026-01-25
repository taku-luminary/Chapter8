//useAuthedFetch は swrKey = [endpoint, token]（tokenが入る）
//usePublicFetch は swrKey = endpoint（tokenいらない）
//endpoint が null のときは 取得しない（SWRの仕様）

"use client";

import useSWR from "swr";

// token不要なので、fetcher は url だけ受け取ればOK
const fetcher = async (url: string) => {
  const res = await fetch(url);

  const json = (await res.json()) ;

  if (!res.ok) {
    throw new Error((json as any)?.status ?? `HTTP ${res.status}`);
  }
  return json;
};

export function usePublicFetch<T>(endpoint: string | null) {
  // endpoint が null なら SWR は取得しない
  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher);

  return {
    data: data as T | undefined,
    error,
    isLoading,
    mutate,
  };
}
