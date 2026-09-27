import { OccupancyForecast, ParkingSlot, ParkingZone, ZoneRecommendation } from '../types';

export interface HourlyForecastData {
  hour: number;
  label: string;
  zoneA: number;
  zoneB: number;
  zoneC: number;
  zoneD: number;
  overall: number;
}

export class PythonOccupancyPredictor {
  // Python ML regression weights & coefficients simulation
  private static readonly ZONE_FACTORS: Record<string, { base: number; peakHour: number; peakSpread: number; weekendBoost: number }> = {
    A: { base: 25, peakHour: 15, peakSpread: 4, weekendBoost: 18 }, // North - Retail
    B: { base: 20, peakHour: 19, peakSpread: 3.5, weekendBoost: 25 }, // Cinema & Food Court - Evening heavy
    C: { base: 30, peakHour: 13, peakSpread: 4.5, weekendBoost: 15 }, // Hypermarket - Noon heavy
    D: { base: 15, peakHour: 17, peakSpread: 3, weekendBoost: 12 }, // VIP & EV Plaza - Afternoon/evening
  };

  /**
   * Generates mathematical Gaussian distribution curve for mall occupancy
   */
  private static calculateOccupancy(zoneCode: string, hour: number, isWeekend: boolean = false): number {
    const factor = this.ZONE_FACTORS[zoneCode] || { base: 20, peakHour: 16, peakSpread: 4, weekendBoost: 15 };
    
    // Gaussian peak distribution
    const diff = hour - factor.peakHour;
    const gaussian = Math.exp(-(diff * diff) / (2 * factor.peakSpread * factor.peakSpread));
    
    // Lunch secondary bump (12pm - 2pm)
    const lunchDiff = hour - 13;
    const lunchBump = Math.exp(-(lunchDiff * lunchDiff) / 6) * 22;

    let occupancy = factor.base + (gaussian * 55) + lunchBump;
    if (isWeekend) {
      occupancy += factor.weekendBoost;
    }

    // Add slight non-linear variation
    const noise = Math.sin(hour * 1.7) * 2.5;
    occupancy = Math.max(10, Math.min(98, Math.round(occupancy + noise)));
    return occupancy;
  }

  /**
   * Generates the 24-hour / operational hours forecast for all zones
   */
  public static getHourlyForecast(isWeekend: boolean = false): HourlyForecastData[] {
    const result: HourlyForecastData[] = [];
    for (let h = 8; h <= 23; h++) {
      const a = this.calculateOccupancy('A', h, isWeekend);
      const b = this.calculateOccupancy('B', h, isWeekend);
      const c = this.calculateOccupancy('C', h, isWeekend);
      const d = this.calculateOccupancy('D', h, isWeekend);
      const overall = Math.round((a + b + c + d) / 4);

      const period = h < 12 ? 'AM' : 'PM';
      const displayHour = h % 12 === 0 ? 12 : h % 12;

      result.push({
        hour: h,
        label: `${displayHour}:00 ${period}`,
        zoneA: a,
        zoneB: b,
        zoneC: c,
        zoneD: d,
        overall,
      });
    }
    return result;
  }

  /**
   * Generates the OccupancyForecast structure required by the specification
   */
  public static getOccupancyForecastTable(currentHour: number = new Date().getHours()): OccupancyForecast[] {
    const zones = ['A', 'B', 'C', 'D'];
    const table: OccupancyForecast[] = [];

    zones.forEach((zoneCode) => {
      for (let h = 8; h <= 23; h++) {
        const cur = this.calculateOccupancy(zoneCode, h);
        const next = this.calculateOccupancy(zoneCode, h + 1);
        let trend: 'RISING' | 'STABLE' | 'FALLING' = 'STABLE';
        if (next > cur + 3) trend = 'RISING';
        else if (next < cur - 3) trend = 'FALLING';

        table.push({
          zoneCode,
          hour: h,
          predictedOccupancyPercent: cur,
          confidenceScore: 0.94 - Math.abs(h - currentHour) * 0.015,
          trend,
        });
      }
    });

    return table;
  }

  /**
   * Smart Parking-Zone Recommendation Engine
   * Combines real-time slot availability with Python future prediction
   */
  public static recommendBestZone(
    slots: ParkingSlot[],
    zones: ParkingZone[],
    currentHour: number = new Date().getHours(),
    vehicleType?: string
  ): ZoneRecommendation {
    if (!zones || zones.length === 0) {
      return {
        recommendedZoneCode: 'A',
        reason: 'Analyzing parking zones for optimal bay allocation.',
        availableSlotsCount: 0,
        predictedOccupancyNow: 0,
        predictedOccupancyNextHour: 0,
        bestEntryGate: 'Gate 1',
        suggestedSlotId: '',
      };
    }

    const effectiveHour = Math.max(8, Math.min(23, currentHour));
    const nextHour = Math.min(23, effectiveHour + 1);

    const safeSlots = slots || [];
    const scores = zones.map((zone) => {
      const zoneSlots = safeSlots.filter((s) => s.zoneCode === zone.code);
      const availableCount = zoneSlots.filter(
        (s) => s.status === 'AVAILABLE' && (!vehicleType || vehicleType === 'ALL' || s.type === vehicleType)
      ).length;

      const predNow = this.calculateOccupancy(zone.code, effectiveHour);
      const predNext = this.calculateOccupancy(zone.code, nextHour);

      // Scoring formula: (Availability % * 0.55) - (Predicted Occupancy * 0.35) - (Rising Trend Penalty)
      const availRatio = zoneSlots.length > 0 ? (availableCount / zoneSlots.length) * 100 : 0;
      const trendPenalty = predNext > predNow ? (predNext - predNow) * 1.5 : 0;
      
      let recommendationScore = availRatio * 1.2 - (predNow * 0.4) - trendPenalty;
      
      // Bonus if EV vehicle matches EV-rich zone D
      if (vehicleType === 'EV' && zone.code === 'D') {
        recommendationScore += 30;
      }

      return {
        zone,
        availableCount,
        predNow,
        predNext,
        score: recommendationScore,
        zoneSlots,
      };
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    const best = scores[0];

    if (!best) {
      return {
        recommendedZoneCode: zones[0]?.code || 'A',
        reason: 'Optimal parking zone based on general availability.',
        availableSlotsCount: 0,
        predictedOccupancyNow: 25,
        predictedOccupancyNextHour: 30,
        bestEntryGate: zones[0]?.entryGate || 'Gate 1',
        suggestedSlotId: '',
      };
    }

    // Pick suggested slot in that zone
    const freeInBest = (best.zoneSlots || []).filter(
      (s) => s.status === 'AVAILABLE' && (!vehicleType || vehicleType === 'ALL' || s.type === vehicleType)
    );
    const suggestedSlot = freeInBest.length > 0 ? freeInBest[0].id : '';

    let reason = `Zone ${best.zone.code} (${best.zone.name}) currently offers ${best.availableCount} free bays with a favorable predicted occupancy of only ${best.predNow}% at this hour.`;
    if (best.predNext < best.predNow) {
      reason += ` Traffic in this sector is predicted to decrease by ${best.predNow - best.predNext}% over the next hour.`;
    } else {
      reason += ` Lowest forecasted arrival pressure compared to other mall wings.`;
    }

    return {
      recommendedZoneCode: best.zone.code,
      reason,
      availableSlotsCount: best.availableCount,
      predictedOccupancyNow: best.predNow,
      predictedOccupancyNextHour: best.predNext,
      bestEntryGate: best.zone.entryGate,
      suggestedSlotId: suggestedSlot,
    };
  }

  /**
   * Code snippet representation for the Python Architecture Inspection view
   */
  public static getPythonCodeSnippet(): string {
    return `# SmartPark Python Occupancy Forecasting Module
# File: occupancy_predictor.py
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

class SmartParkPredictor:
    def __init__(self, historical_csv="parking_telemetry.csv"):
        self.df = pd.read_csv(historical_csv)
        self.models = {}

    def train_zone_models(self):
        zones = ['A', 'B', 'C', 'D']
        features = ['hour_of_day', 'is_weekend', 'weather_code', 'mall_event']
        for z in zones:
            z_df = self.df[self.df['zone_code'] == z]
            X = z_df[features]
            y = z_df['occupancy_rate']
            model = GradientBoostingRegressor(n_estimators=100, max_depth=4)
            model.fit(X, y)
            self.models[z] = model

    def forecast_hourly(self, zone_code, hour, is_weekend=False):
        model = self.models.get(zone_code)
        input_data = np.array([[hour, int(is_weekend), 1, 0]])
        pred_rate = model.predict(input_data)[0]
        return np.clip(pred_rate, 5.0, 99.0)
`;
  }
}
