import useApiRequest from "@/utils/fetch-controller";
import { apiEndpoints } from "./endpoints";

export function listUsers({ params }: { params: Record<string, string> }) {
  const res = useApiRequest({
    endpoint: apiEndpoints.users.base,
    queryKey: [
      "users",
      "list",
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join("&"),
    ],
    params,
  });
  return res;
}
