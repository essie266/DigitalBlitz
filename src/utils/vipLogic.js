// vipLogic.js - Logic to determine task rewards and limits based on VIP level

export function getVipStats(level) {
  const stats = {
    1: { reward: 1.5, tasks: 5 },
    2: { reward: 2.0, tasks: 7 },
    3: { reward: 3.0, tasks: 10 },
    4: { reward: 4.5, tasks: 15 },
    5: { reward: 6.0, tasks: 20 },
  };
  return stats[level] || stats[1];
}
