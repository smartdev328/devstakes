export type BillingPlan = {
  id: string;
  name: string;
  platform: string;
  price: number;
  description: string;
  price_id: string;
  duration: string;
  package: number;
  created_by: string;
  updated_by: string;
};

export type Feature = {
  id: string;
  feature_type: string;
  value: string;
  created_by: string;
  updated_by: string;
};

export type Package = {
  id: number;
  name: string;
  logo?: string;
  description: string | null;
  product_id: string;
  features: Feature[];
  billing_plans: BillingPlan[];
  addOns?: BillingPlan[];
};

export type PackageBillingPlan = {
  id: number;
  billing_plan: BillingPlan;
};
