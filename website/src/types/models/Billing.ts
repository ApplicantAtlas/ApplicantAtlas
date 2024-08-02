export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

export const SUBSCRIPTION_STATUS_VALUES: Record<SubscriptionStatus, string> = {
  active: 'Active',
  cancelled: 'Cancelled',
  paused: 'Paused',
};

export type PlanCycle = 'monthly' | 'six-months' | 'yearly';

export const PLAN_CYCLE_VALUES: Record<PlanCycle, string> = {
  monthly: 'Monthly',
  'six-months': 'Six Months',
  yearly: 'Yearly',
};

export type ObjectId = string;

export type Plan = {
  id?: ObjectId;
  name: string;
  billingCycleOptions: PlanCycleOptions;
  limits: PlanLimits;
  default: boolean;
};

export type PlanLimits = {
  maxEvents: number;
  maxMonthlyResponses: number;
  maxMonthlyPipelineRuns: number;
};

export type PlanCycleOptions = {
  cycle: PlanCycle;
  price: number;
};

export type Subscription = {
  id?: ObjectId;
  userId: ObjectId;
  planId: ObjectId;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  billingCycle: PlanCycle;
  nextUtilizationResetDate: Date;
  utilization: Utilization;
  limits: PlanLimits;
};

export type Utilization = {
  eventsCreated: number;
  responses: number;
  pipelineRuns: number;
};
