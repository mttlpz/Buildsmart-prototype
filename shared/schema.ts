import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, numeric, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyId: varchar("company_id"),
  onboardingStep: integer("onboarding_step").notNull().default(0),
  // 0 = new, 1 = pricelist done, 2 = fully setup (unlocked)
});

// ─── Companies ────────────────────────────────────────────────────────────────
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  region: text("region").notNull().default("NCR"),
  specialization: text("specialization").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Price Records ────────────────────────────────────────────────────────────
export const priceRecords = pgTable("price_records", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  code: text("code").notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category"),
  supplierName: text("supplier_name"),
  sourceType: text("source_type").notNull().default("uploaded"),
  region: text("region"),
  quarter: text("quarter"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Historical Price Records (for Market Intelligence trends) ─────────────
export const historicalPriceRecords = pgTable("historical_price_records", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  materialCategory: text("material_category").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quarter: text("quarter").notNull(),
  region: text("region"),
  sourceType: text("source_type"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

// ─── Material Rules ───────────────────────────────────────────────────────────
export const materialRules = pgTable("material_rules", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  scopeTemplate: text("scope_template").notNull(),
  materialCategory: text("material_category").notNull(),
  preferredMaterial: text("preferred_material").notNull(),
  priority: integer("priority").notNull().default(1),
  fallbackRule: text("fallback_rule").notNull().default("next_preferred"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Scope Templates ──────────────────────────────────────────────────────────
export const scopeTemplates = pgTable("scope_templates", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  name: text("name").notNull(),
  serviceSpecialization: text("service_specialization").notNull(),
  workItems: json("work_items").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Labor Rates ──────────────────────────────────────────────────────────────
export const laborRates = pgTable("labor_rates", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  region: text("region").notNull(),
  trade: text("trade").notNull(),
  ratePerDay: numeric("rate_per_day", { precision: 10, scale: 2 }).notNull(),
  productivityIndex: numeric("productivity_index", { precision: 4, scale: 2 }).notNull().default("1.00"),
  fallbackRule: text("fallback_rule").notNull().default("standard"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Pricing Strategies ───────────────────────────────────────────────────────
export const pricingStrategies = pgTable("pricing_strategies", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  tier: text("tier").notNull(),
  markupPct: numeric("markup_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  contingencyPct: numeric("contingency_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  overheadPct: numeric("overhead_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  profitMarginPct: numeric("profit_margin_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  sourcePriority: text("source_priority").array().notNull().default(sql`'{}'::text[]`),
  fallbackRule: text("fallback_rule"),
  warrantyTerms: text("warranty_terms"),
  paymentTerms: text("payment_terms"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Unit Conversions ─────────────────────────────────────────────────────────
export const unitConversions = pgTable("unit_conversions", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  materialCategory: text("material_category").notNull(),
  fromUnit: text("from_unit").notNull(),
  toUnit: text("to_unit").notNull(),
  conversionFactor: numeric("conversion_factor", { precision: 10, scale: 4 }).notNull(),
  wastagePct: numeric("wastage_pct", { precision: 5, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Supplier Discount Rules ──────────────────────────────────────────────────
// ruleType CHECK: 'Bulk discount' | 'Negotiated price' | 'Minimum order' | 'Preferred supplier'
export const supplierDiscountRules = pgTable("supplier_discount_rules", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  supplierName: text("supplier_name").notNull(),
  ruleType: text("rule_type").notNull(),
  discountPct: numeric("discount_pct", { precision: 5, scale: 2 }),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
  isHardExclusion: boolean("is_hard_exclusion").notNull().default(false),
  details: text("details"),
  isActive: boolean("is_active").notNull().default(true),
  referencedInQuotations: integer("referenced_in_quotations").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Quotations ───────────────────────────────────────────────────────────────
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  projectName: text("project_name").notNull(),
  clientName: text("client_name"),
  quotationType: text("quotation_type").notNull().default("quick"),
  tier: text("tier").notNull().default("Standard"),
  practicalTotal: numeric("practical_total", { precision: 12, scale: 2 }),
  standardTotal: numeric("standard_total", { precision: 12, scale: 2 }),
  premiumTotal: numeric("premium_total", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("draft"),
  breakdown: json("breakdown").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Insert Schemas ───────────────────────────────────────────────────────────
export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertPriceRecordSchema = createInsertSchema(priceRecords).omit({ id: true, createdAt: true });
export const insertHistoricalPriceRecordSchema = createInsertSchema(historicalPriceRecords).omit({ id: true, recordedAt: true });
export const insertMaterialRuleSchema = createInsertSchema(materialRules).omit({ id: true, createdAt: true });
export const insertScopeTemplateSchema = createInsertSchema(scopeTemplates).omit({ id: true, createdAt: true });
export const insertLaborRateSchema = createInsertSchema(laborRates).omit({ id: true, createdAt: true });
export const insertPricingStrategySchema = createInsertSchema(pricingStrategies).omit({ id: true, createdAt: true });
export const insertUnitConversionSchema = createInsertSchema(unitConversions).omit({ id: true, createdAt: true });
export const insertSupplierDiscountRuleSchema = createInsertSchema(supplierDiscountRules)
  .omit({ id: true, createdAt: true })
  .extend({
    ruleType: z.enum(["Bulk discount", "Negotiated price", "Minimum order", "Preferred supplier"]),
  });
export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPriceRecord = z.infer<typeof insertPriceRecordSchema>;
export type PriceRecord = typeof priceRecords.$inferSelect;
export type InsertHistoricalPriceRecord = z.infer<typeof insertHistoricalPriceRecordSchema>;
export type HistoricalPriceRecord = typeof historicalPriceRecords.$inferSelect;
export type InsertMaterialRule = z.infer<typeof insertMaterialRuleSchema>;
export type MaterialRule = typeof materialRules.$inferSelect;
export type InsertScopeTemplate = z.infer<typeof insertScopeTemplateSchema>;
export type ScopeTemplate = typeof scopeTemplates.$inferSelect;
export type InsertLaborRate = z.infer<typeof insertLaborRateSchema>;
export type LaborRate = typeof laborRates.$inferSelect;
export type InsertPricingStrategy = z.infer<typeof insertPricingStrategySchema>;
export type PricingStrategy = typeof pricingStrategies.$inferSelect;
export type InsertUnitConversion = z.infer<typeof insertUnitConversionSchema>;
export type UnitConversion = typeof unitConversions.$inferSelect;
export type InsertSupplierDiscountRule = z.infer<typeof insertSupplierDiscountRuleSchema>;
export type SupplierDiscountRule = typeof supplierDiscountRules.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;
