import { StorageService } from './storage';
import type { UserProfile } from '../types';

export const REWARD_CONFIG = {
  POINTS_PER_ORDER_DAY: 20,
  REQUIRED_DAYS: 5,
  TARGET_POINTS: 100,
  DISCOUNT_PERCENT: 20,
};

export interface RewardStatus {
  points: number;
  daysCount: number;
  orderDates: string[];
  canRedeem: boolean;
  progressPercent: number;
  daysRemaining: number;
  statusText: string;
}

export const RewardsService = {
  /**
   * Retrieves the current user's reward points and 5-day streak status
   */
  getRewardStatus: (targetUserId?: string): RewardStatus => {
    const user = targetUserId 
      ? StorageService.getUsers().find(u => u.id === targetUserId) 
      : StorageService.getCurrentUser();

    const points = user?.rewardPoints ?? 0;
    const orderDates = user?.rewardStreakDays ?? [];
    const daysCount = Math.min(REWARD_CONFIG.REQUIRED_DAYS, orderDates.length);
    const canRedeem = points >= REWARD_CONFIG.TARGET_POINTS;
    const daysRemaining = Math.max(0, REWARD_CONFIG.REQUIRED_DAYS - daysCount);
    const progressPercent = Math.min(100, (daysCount / REWARD_CONFIG.REQUIRED_DAYS) * 100);

    let statusText = '';
    if (canRedeem) {
      statusText = `🎉 100 Points Milestone reached! Redeem 100 pts on your 6th order for 20% OFF!`;
    } else if (daysCount === 0) {
      statusText = `Place orders on 5 different days (20 pts each) to earn 100 points and 20% OFF on your 6th order!`;
    } else {
      statusText = `${daysCount} of 5 order days completed (${points} pts). Place orders on ${daysRemaining} more day${daysRemaining > 1 ? 's' : ''} to unlock 20% OFF!`;
    }

    return {
      points,
      daysCount,
      orderDates,
      canRedeem,
      progressPercent,
      daysRemaining,
      statusText,
    };
  },

  /**
   * Called when a customer finishes an order.
   * If the order is placed on a unique date in the current 5-day cycle, award 20 points.
   */
  awardOrderDayPoints: (
    _orderId: string, 
    orderDateIso: string, 
    targetUserId?: string
  ): { 
    awarded: boolean; 
    pointsAwarded: number; 
    newBalance: number; 
    daysCount: number; 
    unlockedMilestone: boolean;
    message: string;
  } => {
    let user = targetUserId 
      ? StorageService.getUsers().find(u => u.id === targetUserId) 
      : StorageService.getCurrentUser();

    if (!user) {
      // Fallback for guest/demo user
      const users = StorageService.getUsers();
      user = users[0];
    }

    if (!user) {
      return {
        awarded: false,
        pointsAwarded: 0,
        newBalance: 0,
        daysCount: 0,
        unlockedMilestone: false,
        message: 'No active user found to award points',
      };
    }

    // Extract calendar day in YYYY-MM-DD
    const orderDate = new Date(orderDateIso);
    const dateKey = !isNaN(orderDate.getTime()) 
      ? orderDate.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];

    const currentDates = [...(user.rewardStreakDays || [])];
    const currentPoints = user.rewardPoints || 0;
    const currentLifetime = user.totalLifetimePoints || 0;

    // Check if this date already counted in current cycle
    if (currentDates.includes(dateKey)) {
      return {
        awarded: false,
        pointsAwarded: 0,
        newBalance: currentPoints,
        daysCount: currentDates.length,
        unlockedMilestone: currentPoints >= REWARD_CONFIG.TARGET_POINTS,
        message: `Order recorded! Points for today (${dateKey}) were already awarded (+20 pts per unique day).`,
      };
    }

    // Award 20 points for this unique day
    const updatedDates = [...currentDates, dateKey];
    const newBalance = currentPoints + REWARD_CONFIG.POINTS_PER_ORDER_DAY;
    const newLifetime = currentLifetime + REWARD_CONFIG.POINTS_PER_ORDER_DAY;
    const unlockedMilestone = updatedDates.length >= REWARD_CONFIG.REQUIRED_DAYS || newBalance >= REWARD_CONFIG.TARGET_POINTS;

    const updatedUser: UserProfile = {
      ...user,
      rewardPoints: newBalance,
      rewardStreakDays: updatedDates,
      totalLifetimePoints: newLifetime,
    };

    StorageService.updateUser(updatedUser);

    return {
      awarded: true,
      pointsAwarded: REWARD_CONFIG.POINTS_PER_ORDER_DAY,
      newBalance,
      daysCount: updatedDates.length,
      unlockedMilestone,
      message: `⭐ +20 Reward Points earned! Day ${updatedDates.length} of 5 completed. ${
        unlockedMilestone ? '🎉 100 Points Milestone Reached! You can now use 20% OFF on your 6th order!' : ''
      }`,
    };
  },

  /**
   * Redeem 100 points for 20% offer on the food order
   */
  redeemPointsForOffer: (
    _orderNumber: string,
    targetUserId?: string
  ): { success: boolean; discountPercent: number; remainingPoints: number } => {
    let user = targetUserId 
      ? StorageService.getUsers().find(u => u.id === targetUserId) 
      : StorageService.getCurrentUser();

    if (!user) {
      const users = StorageService.getUsers();
      user = users[0];
    }

    if (!user || (user.rewardPoints || 0) < REWARD_CONFIG.TARGET_POINTS) {
      return {
        success: false,
        discountPercent: 0,
        remainingPoints: user?.rewardPoints || 0,
      };
    }

    const remainingPoints = (user.rewardPoints || 0) - REWARD_CONFIG.TARGET_POINTS;
    // Reset streak days so customer can begin earning towards next 100 pts milestone
    const updatedUser: UserProfile = {
      ...user,
      rewardPoints: remainingPoints,
      rewardStreakDays: [],
    };

    StorageService.updateUser(updatedUser);

    return {
      success: true,
      discountPercent: REWARD_CONFIG.DISCOUNT_PERCENT,
      remainingPoints,
    };
  },

  /**
   * Evaluator Demo Tool: Simulate adding orders on previous days
   */
  simulateAddOrderDay: (targetUserId?: string): RewardStatus => {
    let user = targetUserId 
      ? StorageService.getUsers().find(u => u.id === targetUserId) 
      : StorageService.getCurrentUser();

    if (!user) {
      user = StorageService.getUsers()[0];
    }
    if (!user) return RewardsService.getRewardStatus();

    const currentDates = [...(user.rewardStreakDays || [])];
    const offset = currentDates.length + 1;
    const simDate = new Date();
    simDate.setDate(simDate.getDate() - (6 - offset));
    const dateKey = simDate.toISOString().split('T')[0];

    if (!currentDates.includes(dateKey)) {
      currentDates.push(dateKey);
    } else {
      currentDates.push(`2026-10-${10 + currentDates.length}`);
    }

    const newPoints = (user.rewardPoints || 0) + REWARD_CONFIG.POINTS_PER_ORDER_DAY;
    const updatedUser: UserProfile = {
      ...user,
      rewardPoints: newPoints,
      rewardStreakDays: currentDates,
      totalLifetimePoints: (user.totalLifetimePoints || 0) + REWARD_CONFIG.POINTS_PER_ORDER_DAY,
    };

    StorageService.updateUser(updatedUser);
    return RewardsService.getRewardStatus(user.id);
  },

  /**
   * Evaluator Demo Tool: Instantly set 5 days & 100 points for immediate 20% discount testing
   */
  simulateSet100Points: (targetUserId?: string): RewardStatus => {
    let user = targetUserId 
      ? StorageService.getUsers().find(u => u.id === targetUserId) 
      : StorageService.getCurrentUser();

    if (!user) {
      user = StorageService.getUsers()[0];
    }
    if (!user) return RewardsService.getRewardStatus();

    const simulatedDates = [
      '2026-10-25',
      '2026-10-27',
      '2026-10-29',
      '2026-10-31',
      '2026-11-01',
    ];

    const updatedUser: UserProfile = {
      ...user,
      rewardPoints: 100,
      rewardStreakDays: simulatedDates,
      totalLifetimePoints: Math.max(100, (user.totalLifetimePoints || 0) + 100),
    };

    StorageService.updateUser(updatedUser);
    return RewardsService.getRewardStatus(user.id);
  },

  /**
   * Reset rewards to 0 for demo fresh start
   */
  resetRewards: (targetUserId?: string): RewardStatus => {
    let user = targetUserId 
      ? StorageService.getUsers().find(u => u.id === targetUserId) 
      : StorageService.getCurrentUser();

    if (!user) {
      user = StorageService.getUsers()[0];
    }
    if (!user) return RewardsService.getRewardStatus();

    const updatedUser: UserProfile = {
      ...user,
      rewardPoints: 0,
      rewardStreakDays: [],
    };

    StorageService.updateUser(updatedUser);
    return RewardsService.getRewardStatus(user.id);
  }
};
