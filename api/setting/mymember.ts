// app/api/setting/member.ts
import { authedFetch } from "../account/authAPI";


export type MeResponse = {
  id?: string;
  email?: string;
  name?: string;
  profileImg?: string;
};

export function apiGetMe(token: string) {
  return authedFetch<MeResponse>("/api/v1/member", token, "GET");
}
