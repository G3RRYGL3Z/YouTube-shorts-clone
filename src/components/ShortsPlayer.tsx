import { useRef, useEffect, useState } from 'react';
import type { Short } from '../types';
import styles from './ShortsPlayer.module.css';

interface ShortsPlayerProps {
  short: Short;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onReplyClick: () => void;
  onLike?: () => void;
  liked?: boolean;
}

export function ShortsPlayer({
  short,
  isActive,
  muted,
  onToggleMute,
  onReplyClick,
  onLike,
  liked = false,
}: ShortsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);
  const clipBoundsRef = useRef<{ start: number; end: number } | null>(null);
  const [likedState, setLikedState] = useState(liked);
  const likeCount = short.likeCount + (likedState && !liked ? 1 : 0) - (liked && !likedState ? 1 : 0);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isActive) {
      containerRef.current.classList.add(styles.active);
    } else {
      containerRef.current.classList.remove(styles.active);
    }
  }, [isActive]);

  // Clip segment: resolve start/end (negative start = seconds from end)
  const clipStart = short.clipStartSeconds;
  const clipEnd = short.clipEndSeconds;
  const hasClip = clipStart != null || clipEnd != null;

  // Play when active, pause when not; apply clip segment and loop
  useEffect(() => {
    const video = videoElRef.current;
    if (!video || !short.videoUrl) return;

    const applyClip = () => {
      const d = video.duration;
      if (!isFinite(d) || d <= 0) return;
      const start =
        clipStart != null
          ? clipStart >= 0
            ? clipStart
            : Math.max(0, d + clipStart)
          : 0;
      const end = clipEnd != null && clipEnd > 0 ? clipEnd : d;
      video.currentTime = start;
      clipBoundsRef.current = { start, end };
    };

    const onLoadedMetadata = () => {
      applyClip();
    };

    const onTimeUpdate = () => {
      const bounds = clipBoundsRef.current;
      if (!bounds || !hasClip) return;
      if (video.currentTime >= bounds.end - 0.1) {
        video.currentTime = bounds.start;
      }
    };

    const onEnded = () => {
      if (!hasClip) return;
      const bounds = clipBoundsRef.current;
      if (bounds) video.currentTime = bounds.start;
      video.play().catch(() => {});
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    if (video.readyState >= 1) applyClip();

    if (isActive) {
      if (video.readyState >= 1) applyClip();
      video.play().catch(() => {});
    } else {
      video.pause();
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [isActive, short.videoUrl, hasClip, clipStart, clipEnd]);

  // When user unmutes, ensure video plays (required by some browsers for sound)
  useEffect(() => {
    if (!muted && isActive) {
      videoElRef.current?.play().catch(() => {});
    }
  }, [muted, isActive]);

  const handleLike = () => {
    setLikedState((p) => !p);
    onLike?.();
  };

  const hasVideo = short.videoUrl && short.videoUrl.length > 0;

  return (
    <div className={styles.wrapper} data-active={isActive}>
      <div ref={containerRef} className={styles.videoContainer}>
        {hasVideo ? (
          <video
            ref={videoElRef}
            src={short.videoUrl}
            poster={short.thumbnailUrl || undefined}
            loop
            muted={muted}
            playsInline
            className={styles.video}
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{
              background: `linear-gradient(135deg, hsl(${(short.id.length * 37) % 360}, 45%, 25%) 0%, hsl(${(short.id.length * 37 + 40) % 360}, 50%, 15%) 100%)`,
            }}
          >
            <span className={styles.placeholderLabel}>Short</span>
            <span className={styles.placeholderTitle}>{short.title}</span>
            <span className={styles.placeholderDuration}>{short.durationSeconds}s</span>
          </div>
        )}
      </div>

      {/* Right action bar */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.avatarWrap}
          aria-label="Creator profile"
        >
          <img
            src={short.creator.avatarUrl}
            alt=""
            className={styles.avatar}
          />
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <span className={styles.actionIcon}>{muted ? '🔇' : '🔊'}</span>
          <span className={styles.actionCount}>{muted ? 'Off' : 'On'}</span>
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={handleLike}
          aria-label="Like"
        >
          <span className={styles.actionIcon}>{likedState ? '❤️' : '🤍'}</span>
          <span className={styles.actionCount}>{formatCount(likeCount)}</span>
        </button>
        <button type="button" className={styles.actionBtn} aria-label="Comments">
          <span className={styles.actionIcon}>💬</span>
          <span className={styles.actionCount}>{formatCount(short.commentCount)}</span>
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onReplyClick}
          aria-label="Reply with 7s"
        >
          <span className={styles.actionIcon}>🎬</span>
          <span className={styles.actionCount}>{short.replyCount}</span>
          <span className={styles.actionLabel}>Reply</span>
        </button>
        <button type="button" className={styles.actionBtn} aria-label="Share">
          <span className={styles.actionIcon}>↗️</span>
          <span className={styles.actionCount}>Share</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className={styles.bottom}>
        <div className={styles.creatorRow}>
          <span className={styles.handle}>{short.creator.handle}</span>
        </div>
        <p className={styles.title}>{short.title}</p>
        {short.musicLabel && (
          <p className={styles.music}>♫ {short.musicLabel}</p>
        )}
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
