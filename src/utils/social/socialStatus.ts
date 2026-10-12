/** Local production tracker: has this piece been recorded / posted yet? */

export type SocialStatus = "none" | "recorded" | "posted";

export const SOCIAL_STATUSES: readonly { id: SocialStatus; label: string }[] = [
  { id: "none", label: "○ Not recorded" },
  { id: "recorded", label: "● Recorded" },
  { id: "posted", label: "✓ Posted" },
];

const STORE_KEY = "jlpt-trainer:social-status:v1";

function readAll(): Record<string, SocialStatus> {
  try {
    const raw = globalThis.localStorage?.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SocialStatus>) : {};
  } catch {
    return {};
  }
}

export function getSocialStatus(contentId: string): SocialStatus {
  return readAll()[contentId] ?? "none";
}

export function setSocialStatus(contentId: string, status: SocialStatus): void {
  const all = readAll();
  if (status === "none") delete all[contentId];
  else all[contentId] = status;
  try {
    globalThis.localStorage?.setItem(STORE_KEY, JSON.stringify(all));
  } catch {
    // private mode / quota
  }
}
