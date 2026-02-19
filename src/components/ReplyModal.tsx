import { useState, useRef, useEffect } from 'react';
import { useTier } from '../context/TierContext';
import { getResponsesForShort } from '../data/mockShorts';
import type { Short } from '../types';
import { TIER_LIMITS } from '../types';
import styles from './ReplyModal.module.css';

const MAX_DURATION = 7;

interface ReplyModalProps {
  parentShort: Short;
  onClose: () => void;
  onRecorded: (videoUrl: string) => void;
}

export function ReplyModal({ parentShort, onClose, onRecorded }: ReplyModalProps) {
  const { user, canReply, useReplyCredit, setTier } = useTier();
  const [step, setStep] = useState<'check' | 'record' | 'success' | 'upgrade'>(
    canReply ? 'record' : 'upgrade'
  );
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const handleStartRecord = async () => {
    if (!canReply) {
      setStep('upgrade');
      return;
    }
    setCameraError(null);
    setStep('record');
    setRecording(true);
    setCountdown(MAX_DURATION);

    const countdownInterval = setInterval(() => {
      setCountdown((c) => {
        if (c === null || c <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return null;
        }
        return c - 1;
      });
    }, 1000);
    countdownIntervalRef.current = countdownInterval;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;

      const chunks: Blob[] = [];
      let mimeType = 'video/webm';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setRecording(false);
        useReplyCredit();
        setStep('success');
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        onRecorded(url);
      };

      recorder.start(1000);
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, MAX_DURATION * 1000);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Camera access needed');
      setRecording(false);
      setCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const creditsLabel =
    user.replyCreditsRemaining === -1
      ? 'Unlimited'
      : `${user.replyCreditsRemaining} left this month`;

  const responses = getResponsesForShort(parentShort.id);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {step === 'upgrade' && (
          <div className={styles.step}>
            <h2 className={styles.heading}>Reply with a 7s Short</h2>
            <p className={styles.text}>
              You’ve used all your free reply credits this month. Upgrade to post more 7-second responses and support creators.
            </p>
            <div className={styles.tiers}>
              {(['free', 'plus', 'creator'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={styles.tierCard}
                  data-selected={user.tier === t}
                  onClick={() => {
                    setTier(t);
                    setStep('record');
                  }}
                >
                  <span className={styles.tierName}>{TIER_LIMITS[t].label}</span>
                  <span className={styles.tierCredits}>
                    {TIER_LIMITS[t].replyCreditsPerMonth === -1
                      ? 'Unlimited'
                      : `${TIER_LIMITS[t].replyCreditsPerMonth} replies/mo`}
                  </span>
                </button>
              ))}
            </div>
            <p className={styles.monoNote}>
              Replies drive extra engagement — creators can earn a share of ad revenue on response Shorts.
            </p>
          </div>
        )}

        {step === 'record' && (
          <div className={styles.step}>
            <h2 className={styles.heading}>Reply with a 7s Short</h2>
            {responses.length > 0 && (
              <div className={styles.responseList}>
                <span className={styles.responseListTitle}>{responses.length} response{responses.length !== 1 ? 's' : ''} (7s)</span>
                {responses.slice(0, 3).map((r) => (
                  <div key={r.id} className={styles.responseItem}>
                    <img src={r.creator.avatarUrl} alt="" className={styles.responseAvatar} />
                    <div>
                      <span className={styles.responseHandle}>{r.creator.handle}</span>
                      <span className={styles.responseTitle}>{r.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className={styles.text}>
              Respond to &quot;{parentShort.title}&quot; with a 7-second video. Your reply appears under the original and can be monetized.
            </p>
            <p className={styles.credits}>Your credits: {creditsLabel}</p>
            {cameraError && (
              <p className={styles.errorText}>{cameraError}. Allow camera (and mic) to record.</p>
            )}
            {!recording ? (
              <button
                type="button"
                className={styles.recordBtn}
                onClick={handleStartRecord}
              >
                Start 7s recording
              </button>
            ) : (
              <div className={styles.recording}>
                <div className={styles.timer}>{countdown}s</div>
                <p className={styles.recordingLabel}>Recording…</p>
              </div>
            )}
          </div>
        )}

        {step === 'success' && (
          <div className={styles.step}>
            <h2 className={styles.heading}>Reply posted</h2>
            <p className={styles.text}>
              Your 7-second response is live. It’s linked to the original Short and counts toward reply engagement.
            </p>
            <p className={styles.monoNote}>
              In production: upload/record would run here; revenue share could apply to response views.
            </p>
            <button type="button" className={styles.recordBtn} onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {step === 'check' && (
          <div className={styles.step}>
            <button type="button" className={styles.recordBtn} onClick={() => setStep('record')}>
              Continue to record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
