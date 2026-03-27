import React from "react";

export default function VIP() {
  const vipLevels = [
    { level: 1, minDeposit: 50, dailyTasks: 3, rewardRate: "1.2%" },
    { level: 2, minDeposit: 200, dailyTasks: 5, rewardRate: "1.5%" },
    { level: 3, minDeposit: 500, dailyTasks: 8, rewardRate: "2.0%" },
    { level: 4, minDeposit: 1000, dailyTasks: 10, rewardRate: "2.5%" },
    { level: 5, minDeposit: 2000, dailyTasks: 12, rewardRate: "3.0%" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">👑 VIP Levels</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vipLevels.map((vip) => (
          <div
            key={vip.level}
            className="border border-gray-200 rounded shadow p-4 bg-white space-y-2 transition hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-blue-700">VIP {vip.level}</h3>
            <p><strong>Min Deposit:</strong> ${vip.minDeposit}</p>
            <p><strong>Daily Tasks:</strong> {vip.dailyTasks}</p>
            <p><strong>Reward Rate:</strong> {vip.rewardRate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}