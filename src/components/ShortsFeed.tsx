import { useState, useCallback, useRef, useEffect } from 'react';
import { ShortsPlayer } from './ShortsPlayer';
import { ReplyModal } from './ReplyModal';
import { getFeedShortIds, shortsMap } from '../data/mockShorts';
import type { Short } from '../types';
import styles from './ShortsFeed.module.css';

const SWIPE_THRESHOLD_PX = 90;   // must move this much to count as a swipe
const WHEEL_THRESHOLD = 60;      // wheel delta to change video
const NAV_COOLDOWN_MS = 500;     // only one navigation per gesture / scroll

export function ShortsFeed() {
  const [index, setIndex] = useState(0);
  const [replyForShort, setReplyForShort] = useState<Short | null>(null);
  const [muted, setMuted] = useState(false);
  const [recordedReplyUrl, setRecordedReplyUrl] = useState<string | null>(null);
  const touchStartY = useRef<number | null>(null);
  const navCooldownUntil = useRef(0);
  const feedIds = getFeedShortIds();

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(feedIds.length - 1, i + 1));
  }, [feedIds.length]);

  const tryNavigate = useCallback((direction: 'prev' | 'next', fromButton = false) => {
    const now = Date.now();
    if (!fromButton && now < navCooldownUntil.current) return;
    if (!fromButton) navCooldownUntil.current = now + NAV_COOLDOWN_MS;
    if (direction === 'prev') goPrev();
    else goNext();
  }, [goPrev, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (dy < -SWIPE_THRESHOLD_PX) tryNavigate('next');
    else if (dy > SWIPE_THRESHOLD_PX) tryNavigate('prev');
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > WHEEL_THRESHOLD) tryNavigate('next');
    else if (e.deltaY < -WHEEL_THRESHOLD) tryNavigate('prev');
  };

  // Arrow keys on document so they work without focusing the feed (e.g. when swipe doesn't work on pad)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (replyForShort) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        tryNavigate('next');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        tryNavigate('prev');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [tryNavigate, replyForShort]);

  const openReply = useCallback((short: Short) => {
    setMuted(true);
    setReplyForShort(short);
  }, []);

  const closeReply = useCallback(() => {
    setReplyForShort(null);
  }, []);

  const handleRecorded = useCallback((videoUrl: string) => {
    setRecordedReplyUrl(videoUrl);
  }, []);

  const closeRecordedPreview = useCallback(() => {
    if (recordedReplyUrl) {
      URL.revokeObjectURL(recordedReplyUrl);
      setRecordedReplyUrl(null);
    }
  }, [recordedReplyUrl]);

  return (
    <div
      className={styles.feed}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      role="region"
      aria-label="Shorts feed"
    >
      <div
        className={styles.slider}
        style={{ transform: `translateY(-${index * 100}%)` }}
      >
        {feedIds.map((id, i) => {
          const short = shortsMap.get(id) as Short | undefined;
          if (!short) return null;
          return (
            <div key={short.id} className={styles.slide}>
              <ShortsPlayer
                short={short}
                isActive={i === index}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
                onReplyClick={() => openReply(short)}
              />
            </div>
          );
        })}
      </div>

      {/* Up / Down arrow buttons */}
      <div className={styles.arrows}>
        <button
          type="button"
          className={styles.arrowBtn}
          onClick={() => tryNavigate('prev', true)}
          disabled={index === 0}
          aria-label="Previous short"
        >
          ▲
        </button>
        <button
          type="button"
          className={styles.arrowBtn}
          onClick={() => tryNavigate('next', true)}
          disabled={index === feedIds.length - 1}
          aria-label="Next short"
        >
          ▼
        </button>
      </div>

      {/* Progress dots */}
      <div className={styles.dots}>
        {feedIds.map((_, i) => (
          <button
            key={i}
            type="button"
            className={styles.dot}
            aria-label={`Go to short ${i + 1}`}
            data-active={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {replyForShort && (
        <ReplyModal
          parentShort={replyForShort}
          onClose={closeReply}
          onRecorded={handleRecorded}
        />
      )}

      {/* Small playback of your 7s reply at bottom of phone frame */}
      {recordedReplyUrl && (
        <div className={styles.replyPreview}>
          <video
            src={recordedReplyUrl}
            autoPlay
            loop
            muted={false}
            playsInline
            className={styles.replyPreviewVideo}
          />
          <button
            type="button"
            className={styles.replyPreviewClose}
            onClick={closeRecordedPreview}
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
