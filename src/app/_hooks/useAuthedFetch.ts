//useAuthedFetch は swrKey = [endpoint, token]（tokenが入る）
//usePublicFetch は swrKey = endpoint（tokenいらない）
//endpoint が null のときは 取得しない（SWRの仕様）

"use client";

import useSWR from "swr";
import { useSupabaseSession } from "@/app/_hooks/useSupabaseSession";

const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, 
    { headers: 
      { Authorization: token } 
    }
  );
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.status ?? `HTTP ${res.status}`);
  return json;
};

export function useAuthedFetch<T>(endpoint: string | null) {

  const { token, sessionLoading } = useSupabaseSession()  

  const swrKey =
  !sessionLoading && token && endpoint
    ? [endpoint, token]
    : null;

  const { data, error, isLoading, mutate } = useSWR(swrKey, fetcher);

  return {
    data: data as T | undefined,
    error,
    isLoading,
    mutate,
    sessionLoading,
    token,
  };
}