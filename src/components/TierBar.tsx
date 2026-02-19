import { useTier } from '../context/TierContext';
import { TIER_LIMITS } from '../types';
import styles from './TierBar.module.css';

export function TierBar() {
  const { user } = useTier();
  const label = TIER_LIMITS[user.tier].label;
  const credits =
    user.replyCreditsRemaining === -1
      ? '∞'
      : String(user.replyCreditsRemaining);

  return (
    <div className={styles.bar}>
      <span className={styles.tier}>{label}</span>
      <span className={styles.credits}>
        {user.replyCreditsRemaining === -1 ? 'Unlimited replies' : `${credits} reply credits`}
      </span>
    </div>
  );
}
