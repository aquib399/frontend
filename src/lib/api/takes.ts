import useApiRequest from "@/utils/fetch-controller";
import { apiEndpoints } from "./endpoints";

export function listTakes({ params }: { params: Record<string, string> }) {
  const res = useApiRequest({
    endpoint: apiEndpoints.takes.base,
    queryKey: [
      "takes",
      "list",
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&"),
    ],
    params,
  });
  return res;
}

export function createTake({ params }: { params: Record<string, string> }) {
  const res = useApiRequest({
    exact: false,
    method: "POST",
    endpoint: apiEndpoints.takes.base,
    queryKey: ["takes", "create"],
    params,
  });
  return res;
}

export function getSingleTake({
  params,
  take_id,
}: {
  params: Record<string, string>;
  take_id: string;
}) {
  const res = useApiRequest({
    method: "POST",
    endpoint: apiEndpoints.takes.getSingleTake(take_id),
    queryKey: [
      "takes",
      "getSingle",
      take_id,
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&"),
    ],
    params,
  });
  return res;
}
