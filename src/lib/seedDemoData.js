import { STORAGE_KEYS } from './constants';

const DEMO_OWNER = {
  id: 'owner@rootrivercafe.com',
  name: 'Alex Rivera',
  email: 'owner@rootrivercafe.com',
  password: 'Owner1234',
  role: 'owner',
  businessId: 'lr-root-cafe',
};

const SEED_REVIEWS = [
  {
    id: 'lr-root-cafe-seed-1',
    businessId: 'lr-root-cafe',
    userId: 'sam@example.com',
    userName: 'Sam W.',
    rating: 5,
    comment: 'Hands down the best coffee spot downtown. The brunch plates are incredible and the staff always remembers your name.',
    createdAt: '2026-04-12T09:32:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-2',
    businessId: 'lr-root-cafe',
    userId: 'taylor@example.com',
    userName: 'Taylor M.',
    rating: 5,
    comment: 'Used the RIVER10 deal and got 10% off my eggs benedict. Absolutely worth it — the patio is gorgeous in the morning.',
    createdAt: '2026-04-22T08:17:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-3',
    businessId: 'lr-root-cafe',
    userId: 'morgan@example.com',
    userName: 'Morgan L.',
    rating: 4,
    comment: 'Great atmosphere and solid food. Gets a little busy on weekends but worth the wait.',
    createdAt: '2026-05-03T10:45:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-4',
    businessId: 'lr-root-cafe',
    userId: 'casey@example.com',
    userName: 'Casey R.',
    rating: 5,
    comment: "The locally roasted coffee is something else. I've been coming here every morning for two months.",
    createdAt: '2026-05-10T07:58:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-5',
    businessId: 'lr-root-cafe',
    userId: 'jamie@example.com',
    userName: 'Jamie K.',
    rating: 4,
    comment: 'Love the vibe. Would be 5 stars if they had more seating inside.',
    createdAt: '2026-05-18T11:23:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-6',
    businessId: 'lr-root-cafe',
    userId: 'riley@example.com',
    userName: 'Riley D.',
    rating: 3,
    comment: 'Good coffee, service was a bit slow on a Tuesday morning. Still a nice spot overall.',
    createdAt: '2026-05-27T09:01:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-7',
    businessId: 'lr-root-cafe',
    userId: 'avery@example.com',
    userName: 'Avery S.',
    rating: 5,
    comment: 'Best brunch in Little Rock. The smoked salmon benedict is a must-try. Already planning my next visit.',
    createdAt: '2026-06-05T10:15:00.000Z',
  },
  {
    id: 'lr-root-cafe-seed-8',
    businessId: 'lr-root-cafe',
    userId: 'quinn@example.com',
    userName: 'Quinn B.',
    rating: 4,
    comment: 'Lovely patio seating. The oat milk latte was excellent. Definitely coming back.',
    createdAt: '2026-06-14T08:42:00.000Z',
  },
];

const SEED_REDEMPTIONS = [
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-01@example.com', timestamp: '2026-04-08T08:12:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-02@example.com', timestamp: '2026-04-11T09:44:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'taylor@example.com', timestamp: '2026-04-21T07:55:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-03@example.com', timestamp: '2026-04-30T10:22:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-04@example.com', timestamp: '2026-05-02T08:30:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'morgan@example.com', timestamp: '2026-05-06T09:15:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-05@example.com', timestamp: '2026-05-09T07:48:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'casey@example.com', timestamp: '2026-05-12T08:05:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-06@example.com', timestamp: '2026-05-16T10:33:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-07@example.com', timestamp: '2026-05-21T09:20:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'jamie@example.com', timestamp: '2026-05-25T08:50:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-08@example.com', timestamp: '2026-05-29T07:40:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-09@example.com', timestamp: '2026-06-03T10:10:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'avery@example.com', timestamp: '2026-06-07T08:25:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-10@example.com', timestamp: '2026-06-11T09:55:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'quinn@example.com', timestamp: '2026-06-15T07:35:00.000Z' },
  { businessId: 'lr-root-cafe', code: 'RIVER10', userId: 'user-11@example.com', timestamp: '2026-06-20T10:45:00.000Z' },
];

const SEED_FAVORITES = {
  'sam@example.com': ['lr-root-cafe', 'lr-soma-books'],
  'taylor@example.com': ['lr-root-cafe', 'lr-soma-books'],
  'morgan@example.com': ['lr-root-cafe'],
  'casey@example.com': ['lr-root-cafe', 'lr-makers-lab'],
  'jamie@example.com': ['lr-root-cafe', 'lr-greendoor-spa'],
  'avery@example.com': ['lr-root-cafe', 'lr-midtown-stage'],
  'quinn@example.com': ['lr-root-cafe'],
  'user-04@example.com': ['lr-root-cafe'],
  'user-07@example.com': ['lr-root-cafe', 'lr-riverfront-bike'],
};

export function seedDemoData() {
  try {
    const existingAccounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.authAccounts) || '[]');
    if (!existingAccounts.some((a) => a.email === DEMO_OWNER.email)) {
      localStorage.setItem(STORAGE_KEYS.authAccounts, JSON.stringify([...existingAccounts, DEMO_OWNER]));
    }
  } catch {}

  try {
    const existingReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
    const existingIds = new Set(existingReviews.map((r) => r.id));
    const newReviews = SEED_REVIEWS.filter((r) => !existingIds.has(r.id));
    if (newReviews.length > 0) {
      localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify([...newReviews, ...existingReviews]));
    }
  } catch {}

  try {
    const existingRedemptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.dealRedemptions) || '[]');
    if (existingRedemptions.length === 0) {
      localStorage.setItem(STORAGE_KEYS.dealRedemptions, JSON.stringify(SEED_REDEMPTIONS));
    }
  } catch {}

  try {
    const existingFavorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '{}');
    let changed = false;
    for (const [userId, businessIds] of Object.entries(SEED_FAVORITES)) {
      if (!existingFavorites[userId]) {
        existingFavorites[userId] = businessIds;
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(existingFavorites));
    }
  } catch {}
}
