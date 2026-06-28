import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertPriceRecordSchema,
  insertMaterialRuleSchema,
  insertScopeTemplateSchema,
  insertLaborRateSchema,
  insertPricingStrategySchema,
  insertUnitConversionSchema,
  insertSupplierDiscountRuleSchema,
  insertQuotationSchema,
  insertHistoricalPriceRecordSchema,
} from "@shared/schema";
import { z } from "zod";

const DEMO_COMPANY_ID = "demo-company-001";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Onboarding status ──────────────────────────────────────────────────────
  app.get("/api/onboarding/status", async (_req, res) => {
    // In a real app this reads from session/user. Demo uses localStorage state.
    // Returns the demo company's setup status.
    const priceRecords = await storage.getPriceRecords(DEMO_COMPANY_ID);
    const materialRules = await storage.getMaterialRules(DEMO_COMPANY_ID);
    const pricingStrategies = await storage.getPricingStrategies(DEMO_COMPANY_ID);
    res.json({
      companyId: DEMO_COMPANY_ID,
      hasPricelist: priceRecords.length > 0,
      hasCompanyRules: materialRules.length > 0 || pricingStrategies.length > 0,
    });
  });

  // ── Price Records ──────────────────────────────────────────────────────────
  app.get("/api/price-records", async (_req, res) => {
    const records = await storage.getPriceRecords(DEMO_COMPANY_ID);
    res.json(records);
  });

  app.post("/api/price-records", async (req, res) => {
    const parsed = insertPriceRecordSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const record = await storage.createPriceRecord(parsed.data);
    res.json(record);
  });

  app.post("/api/price-records/bulk", async (req, res) => {
    const schema = z.array(insertPriceRecordSchema);
    const records = (req.body as any[]).map((r: any) => ({ ...r, companyId: DEMO_COMPANY_ID }));
    const parsed = schema.safeParse(records);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const created = await storage.createPriceRecordsBulk(parsed.data);

    // Also snapshot into historical records for trend tracking
    for (const r of parsed.data) {
      if (r.category && r.quarter) {
        await storage.createHistoricalPriceRecord({
          companyId: DEMO_COMPANY_ID,
          materialCategory: r.category,
          description: r.description,
          price: r.price,
          quarter: r.quarter,
          region: r.region ?? "NCR",
          sourceType: r.sourceType ?? "uploaded",
        });
      }
    }
    res.json(created);
  });

  // ── Historical Price Records ───────────────────────────────────────────────
  app.get("/api/historical-prices", async (_req, res) => {
    const records = await storage.getHistoricalPriceRecords(DEMO_COMPANY_ID);
    res.json(records);
  });

  // ── Material Rules ─────────────────────────────────────────────────────────
  app.get("/api/material-rules", async (_req, res) => {
    const rules = await storage.getMaterialRules(DEMO_COMPANY_ID);
    res.json(rules);
  });
  app.post("/api/material-rules", async (req, res) => {
    const parsed = insertMaterialRuleSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const rule = await storage.createMaterialRule(parsed.data);
    res.json(rule);
  });
  app.patch("/api/material-rules/:id", async (req, res) => {
    try {
      const rule = await storage.updateMaterialRule(Number(req.params.id), req.body);
      res.json(rule);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Scope Templates ────────────────────────────────────────────────────────
  app.get("/api/scope-templates", async (_req, res) => {
    const templates = await storage.getScopeTemplates(DEMO_COMPANY_ID);
    res.json(templates);
  });
  app.post("/api/scope-templates", async (req, res) => {
    const parsed = insertScopeTemplateSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const template = await storage.createScopeTemplate(parsed.data);
    res.json(template);
  });
  app.patch("/api/scope-templates/:id", async (req, res) => {
    try {
      const t = await storage.updateScopeTemplate(Number(req.params.id), req.body);
      res.json(t);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Labor Rates ────────────────────────────────────────────────────────────
  app.get("/api/labor-rates", async (_req, res) => {
    const rates = await storage.getLaborRates(DEMO_COMPANY_ID);
    res.json(rates);
  });
  app.post("/api/labor-rates", async (req, res) => {
    const parsed = insertLaborRateSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const rate = await storage.createLaborRate(parsed.data);
    res.json(rate);
  });
  app.patch("/api/labor-rates/:id", async (req, res) => {
    try {
      const r = await storage.updateLaborRate(Number(req.params.id), req.body);
      res.json(r);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Pricing Strategies ─────────────────────────────────────────────────────
  app.get("/api/pricing-strategies", async (_req, res) => {
    const strategies = await storage.getPricingStrategies(DEMO_COMPANY_ID);
    res.json(strategies);
  });
  app.post("/api/pricing-strategies", async (req, res) => {
    const parsed = insertPricingStrategySchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const strategy = await storage.upsertPricingStrategy(parsed.data);
    res.json(strategy);
  });

  // ── Unit Conversions ───────────────────────────────────────────────────────
  app.get("/api/unit-conversions", async (_req, res) => {
    const conversions = await storage.getUnitConversions(DEMO_COMPANY_ID);
    res.json(conversions);
  });
  app.post("/api/unit-conversions", async (req, res) => {
    const parsed = insertUnitConversionSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const c = await storage.createUnitConversion(parsed.data);
    res.json(c);
  });
  app.patch("/api/unit-conversions/:id", async (req, res) => {
    try {
      const c = await storage.updateUnitConversion(Number(req.params.id), req.body);
      res.json(c);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Supplier Discount Rules ────────────────────────────────────────────────
  app.get("/api/supplier-discount-rules", async (_req, res) => {
    const rules = await storage.getSupplierDiscountRules(DEMO_COMPANY_ID);
    res.json(rules);
  });
  app.post("/api/supplier-discount-rules", async (req, res) => {
    const parsed = insertSupplierDiscountRuleSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const rule = await storage.createSupplierDiscountRule(parsed.data);
    res.json(rule);
  });
  app.patch("/api/supplier-discount-rules/:id", async (req, res) => {
    try {
      const r = await storage.updateSupplierDiscountRule(Number(req.params.id), req.body);
      res.json(r);
    } catch (e: any) {
      if (e.message.startsWith("DEPENDENCY:")) return res.status(409).json({ error: e.message });
      res.status(400).json({ error: e.message });
    }
  });

  // ── Quotations ─────────────────────────────────────────────────────────────
  app.get("/api/quotations", async (_req, res) => {
    const quotations = await storage.getQuotations(DEMO_COMPANY_ID);
    res.json(quotations);
  });
  app.get("/api/quotations/:id", async (req, res) => {
    const q = await storage.getQuotation(Number(req.params.id));
    if (!q) return res.status(404).json({ error: "Not found" });
    res.json(q);
  });
  app.post("/api/quotations", async (req, res) => {
    const parsed = insertQuotationSchema.safeParse({ ...req.body, companyId: DEMO_COMPANY_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const q = await storage.createQuotation(parsed.data);
    res.json(q);
  });
  app.patch("/api/quotations/:id", async (req, res) => {
    try {
      const q = await storage.updateQuotation(Number(req.params.id), req.body);
      res.json(q);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  return httpServer;
}
