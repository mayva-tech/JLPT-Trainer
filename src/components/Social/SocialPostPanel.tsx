import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  formatAllPosts,
  formatSocialPost,
  formatYoutubeFull,
  formatYoutubeTags,
  SOCIAL_PLATFORMS,
  type SocialChild,
  type SocialPlatform,
} from "../../utils/social/socialMeta";
import {
  buildSocialMetaForTarget,
  parentTocIdFor,
  type SocialTarget,
} from "../../utils/social/socialSources";
import {
  getSocialStatus,
  setSocialStatus,
  SOCIAL_STATUSES,
  type SocialStatus,
} from "../../utils/social/socialStatus";
import { charLength, copyText, TAGS_MAX, TITLE_MAX } from "../../utils/social/socialText";
import "./socialPost.css";

const CHILD_HEADING: Record<SocialChild["type"], string> = {
  "vocabulary-item": "One word",
  "grammar-item": "One pattern",
  "register-pair": "One pair",
};

function loadPlatform(storeKey: string, fallback: SocialPlatform): SocialPlatform {
  try {
    const saved = globalThis.localStorage?.getItem(storeKey);
    if (saved && SOCIAL_PLATFORMS.some((p) => p.id === saved)) return saved as SocialPlatform;
  } catch {
    // private mode
  }
  return fallback;
}

function Field({
  label,
  text,
  rows,
  copyLabel,
  copied,
  onCopy,
  count,
}: {
  label: string;
  text: string;
  rows: number;
  copyLabel: string;
  copied: string | null;
  onCopy: (label: string, text: string) => void;
  count?: number;
}) {
  return (
    <div className="social-field">
      <div className="social-field-head">
        <span>{label}</span>
        {count !== undefined ? (
          <span className={charLength(text) > count ? "social-count social-count--over" : "social-count"}>
            {charLength(text)}/{count}
          </span>
        ) : null}
        <button type="button" className="social-btn" onClick={() => onCopy(copyLabel, text)}>
          {copied === copyLabel ? "✓ Copied" : copyLabel}
        </button>
      </div>
      <textarea readOnly value={text} rows={rows} onFocus={(e) => e.currentTarget.select()} />
    </div>
  );
}

/**
 * Title, description, caption and hashtags for one piece of content, ready
 * to paste into YouTube, Shorts, TikTok and Reels. Used in the slide-over
 * panel (TOC / Player) and inline in the Shorts studio.
 */
export function SocialPostBody({
  target: initialTarget,
  platformStoreKey = "jlpt-trainer:social-platform:v1",
  defaultPlatform = "universal",
  headerAction,
}: {
  target: SocialTarget;
  /** Each place remembers its own last tab (Shorts opens on Shorts). */
  platformStoreKey?: string;
  defaultPlatform?: SocialPlatform;
  /** Extra control in the header (the panel's ✕). */
  headerAction?: ReactNode;
}) {
  const [target, setTarget] = useState<SocialTarget>(initialTarget);
  const [platform, setPlatform] = useState<SocialPlatform>(() => loadPlatform(platformStoreKey, defaultPlatform));
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const meta = useMemo(() => buildSocialMetaForTarget(target), [target]);
  const parentId = useMemo(() => parentTocIdFor(target), [target]);
  const [status, setStatus] = useState<SocialStatus>("none");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (meta) setStatus(getSocialStatus(meta.contentId));
  }, [meta]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (label: string, text: string) => {
    const ok = await copyText(text);
    setFailed(!ok);
    setCopied(ok ? label : null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setCopied(null);
      setFailed(false);
    }, 1600);
  };

  const choosePlatform = (id: SocialPlatform) => {
    setPlatform(id);
    try {
      globalThis.localStorage?.setItem(platformStoreKey, id);
    } catch {
      // private mode
    }
  };

  const chooseStatus = (next: SocialStatus) => {
    if (!meta) return;
    setSocialStatus(meta.contentId, next);
    setStatus(next);
  };

  const post = meta ? formatSocialPost(meta, platform) : null;

  return (
    <>
      <header className="social-head">
        <div className="social-kicker">
          📣 Social post
          {meta?.badge ? <span className="social-badge">{meta.badge}</span> : null}
        </div>
        {headerAction}
        {meta ? (
          <>
            <h2 className="social-heading">{meta.heading}</h2>
            {meta.subheading ? (
              <div className="social-subheading" lang="ja">
                {meta.subheading}
              </div>
            ) : null}
          </>
        ) : (
          <h2 className="social-heading">No post for this item yet</h2>
        )}
      </header>

      {meta && post ? (
        <>
          <div className="social-row">
            {target.type !== "toc" && parentId ? (
              <button
                type="button"
                className="social-btn social-btn--ghost"
                onClick={() => setTarget({ type: "toc", id: parentId })}
              >
                ↑ Whole lesson
              </button>
            ) : null}
            <div className="social-status" role="group" aria-label="Production status">
              {SOCIAL_STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={status === s.id ? "social-chip social-chip--on" : "social-chip"}
                  aria-pressed={status === s.id}
                  onClick={() => chooseStatus(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="social-tabs" role="tablist" aria-label="Platform">
            {SOCIAL_PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={platform === p.id}
                className={platform === p.id ? "social-tab social-tab--on" : "social-tab"}
                onClick={() => choosePlatform(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="social-body">
            {platform === "youtube" ? (
              <>
                <Field label="Title" text={meta.title} rows={2} copyLabel="Copy Title" copied={copied} onCopy={copy} count={TITLE_MAX} />
                <Field label="Description" text={meta.youtubeDescription} rows={10} copyLabel="Copy Description" copied={copied} onCopy={copy} />
                <Field label="Hashtags" text={post.hashtags.join(" ")} rows={2} copyLabel="Copy Hashtags" copied={copied} onCopy={copy} />
                <Field
                  label="Tags (comma-separated)"
                  text={formatYoutubeTags(meta)}
                  rows={3}
                  copyLabel="Copy Tags"
                  copied={copied}
                  onCopy={copy}
                  count={TAGS_MAX}
                />
                <Field label="Full YouTube post" text={formatYoutubeFull(meta)} rows={4} copyLabel="Copy YouTube" copied={copied} onCopy={copy} />
              </>
            ) : (
              <>
                {post.title ? (
                  <Field label="Title" text={post.title} rows={2} copyLabel="Copy Title" copied={copied} onCopy={copy} count={TITLE_MAX} />
                ) : null}
                <Field
                  label={
                    platform === "universal"
                      ? "Universal post — Shorts · TikTok · Reels"
                      : platform === "youtube-shorts" && meta.shortsPost
                        ? "Description"
                        : "Caption"
                  }
                  text={post.body}
                  rows={9}
                  copyLabel={
                    platform === "universal"
                      ? "Copy Universal Post"
                      : platform === "youtube-shorts" && meta.shortsPost
                        ? "Copy Description"
                        : "Copy Caption"
                  }
                  copied={copied}
                  onCopy={copy}
                />
                <Field label="Hashtags" text={post.hashtags.join(" ")} rows={2} copyLabel="Copy Hashtags" copied={copied} onCopy={copy} />
              </>
            )}
            {meta.pinnedComment ? (
              <Field label="Pinned comment" text={meta.pinnedComment} rows={2} copyLabel="Copy Comment" copied={copied} onCopy={copy} />
            ) : null}
          </div>

          <div className="social-foot">
            <button type="button" className="social-btn social-btn--primary" onClick={() => copy("Copy All", formatAllPosts(meta))}>
              {copied === "Copy All" ? "✓ Copied" : "Copy All"}
            </button>
            {failed ? <span className="social-failed">Copy failed — select the text and copy it manually.</span> : null}
          </div>

          {meta.children && meta.children.length > 0 ? (
            <section className="social-children" aria-label="Single posts">
              <h3>{CHILD_HEADING[meta.children[0]!.type]} — post for a single item</h3>
              <div className="social-child-list">
                {meta.children.map((c) => (
                  <button
                    key={`${c.type}-${c.id}`}
                    type="button"
                    className="social-child"
                    onClick={() =>
                      setTarget({
                        type: c.type,
                        id: c.id,
                        parentTocId: target.type === "toc" ? target.id : undefined,
                      })
                    }
                  >
                    <span lang="ja">{c.label}</span>
                    <small>{c.sub}</small>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  );
}

/** Slide-over panel used from the Table of Contents and the Player bar. */
export function SocialPostPanel({ target, onClose }: { target: SocialTarget; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  // The player's shortcuts (Space, arrows, letters) must not fire behind the panel.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      event.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="social-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} className="social-panel" role="dialog" aria-modal="true" aria-label="Social post" tabIndex={-1}>
        <SocialPostBody
          target={target}
          headerAction={
            <button type="button" className="social-close" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          }
        />
      </div>
    </div>,
    document.body
  );
}
