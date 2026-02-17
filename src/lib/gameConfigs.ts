// ============================================
// GAME CONFIGURATION - CapitalQuest
// ============================================

import type { RiskLevel } from './types';

export const GAME_CONFIG = {
  // --- Starting Values ---
  startingMoney: 1000,               // TODO: Set starting wallet amount (e.g., 100)
  goalAmount: 0,                  // TODO: Amount needed to win

  // --- Time Simulation ---
  startDate: {
    year: 2000,                      // TODO: Starting year
    month: 1,                     // TODO: Starting month (1-12)
    day: 1,                       // TODO: Starting day (1-31)
  },
  defaultGameSpeed: 10,            // TODO: Default speed multiplier
  daysPerTick: 1,                 // TODO: How many game days pass per tick

  // --- Tax Rates (as decimals, e.g., 0.15 = 15%) ---
  capitalGainsTaxRate: 0.15,         // TODO: Tax on investment profits
  flatWithdrawalTaxRate: 0.01,       // TODO: Flat tax on any withdrawal

  // --- Risk Multipliers ---
  // Higher = more volatile price swings
  riskMultipliers: {
    low: 0.2,                       // TODO: e.g., 0.5
    medium: 0.3,                    // TODO: e.g., 1.0
    high: 1.0,                      // TODO: e.g., 2.0
    extreme: 2.0,                   // TODO: e.g., 4.0
  } as Record<RiskLevel, number>,

  // --- Game Speed Options ---
  speedOptions: [
    { label: '1x', multiplier: 1 },  // TODO: e.g., { label: '1x', multiplier: 1 }
    { label: '2x', multiplier: 2 },  // TODO: e.g., { label: '2x', multiplier: 2 }
    { label: '5x', multiplier: 5 },  // TODO: e.g., { label: '5x', multiplier: 5 }
    { label: '10x', multiplier: 10 },  // TODO: e.g., { label: '10x', multiplier: 10 }
  ],

  // --- Tick Rate (real-time) ---
  tickIntervalMs: 1000,              // TODO: Milliseconds between ticks (e.g., 1000)
};

// ============================================
// ASSETS - Define your stocks, bonds, funds here
// ============================================

export const ASSETS_DATA = [
  // Add your assets
  {
    id: 'Apple',
    name: 'Apple Inc. (AAPL)',
    type: 'stock' as const,
    riskLevel: 'medium' as const,
    baseReturnRate: 0.15,
    volatility: 0.015,
    currentPrice: 230.00,
    priceHistory: [230.00],
  },
  {
    id: 'US-Treasury-Bonds',
    name: 'US 10-Year Treasury Bond',
    type: 'bond' as const,
    riskLevel: 'low' as const,
    baseReturnRate: 0.042,
    volatility: 0.002,
    currentPrice: 100.00,
    priceHistory: [100.0],
  },
  {
    id: 'S&P-500',
    name: 'Vanguard S&P 500 ETF (VOO)',
    type: 'fund' as const,
    riskLevel: 'medium' as const,
    baseReturnRate: 0.1,
    volatility: 0.01,
    currentPrice: 510.00,
    priceHistory: [510.00],
  },
  {
    id: 'Bitcoin-ETF',
    name: 'iShares Bitcoin Trust (IBIT)',
    type: 'crypto' as const,
    riskLevel: 'extreme' as const,
    baseReturnRate: 0.40,
    volatility: 0.06,
    currentPrice: 40.00,
    priceHistory: [40.00],
  },
  {
    id: 'NVIDIA',
    name: 'NVIDIA Corp (NVDA)',
    type: 'stock' as const,
    riskLevel: 'high' as const,
    baseReturnRate: 0.35,
    volatility: 0.035,
    currentPrice: 130.00,
    priceHistory: [130.00],
  },
];
