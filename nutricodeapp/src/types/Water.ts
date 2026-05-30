export type WaterLog = {
  milliliters: number;
  date: string; // formato: YYYY-MM-DD
  isCompleted: boolean;
  xpEarned: number;
};

export type CreateWaterLogDTO = {
  milliliters: number;
  date: string;
  isCompleted: boolean;
};