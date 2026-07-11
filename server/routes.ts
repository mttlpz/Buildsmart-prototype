import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { storage, DEMO_COMPANY_ID } from "./storage";
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

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, storedHash] = stored.split(":");
    if (!salt || !storedHash) return false;
    const hash = scryptSync(password, salt, 32).toString("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}

function requireAuth(req: Request, res: Response, next: () => void) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Auth ────────────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      company: z.object({
        name: z.string().min(1),
        company_address: z.string().optional().default(""),
        contact_number: z.string().optional().default(""),
        city: z.string().optional().default(""),
        region: z.string().optional().default("NCR"),
        project_sector: z.array(z.string()).optional(),
        company_role: z.string().optional(),
        specialization: z.array(z.string()).optional(),
        company_logo: z.string().optional(),
      }),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password, company } = parsed.data;

    const existing = await storage.getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "An account with this email already exists." });

    const companyRecord = await storage.createCompany({
      name: company.name,
      region: company.region ?? "NCR",
      specialization: company.specialization ?? [],
      companyAddress: company.company_address ?? "",
      contactNumber: company.contact_number ?? "",
      companyLogo: company.company_logo ?? null,
      city: company.city ?? "",
      projectSector: company.project_sector ?? null,
      companyRole: company.company_role ?? null,
    });

    const hashedPw = hashPassword(password);
    const createdUser = await storage.createUser({
      username: email,
      email,
      password: hashedPw,
      companyId: companyRecord.id,
    });
    const user = await storage.updateUserOnboarding(createdUser.id, 2);

    req.session.userId = user.id;
    req.session.companyId = companyRecord.id;

    res.json({
      user: { id: user.id, email: user.email, username: user.username, companyId: user.companyId, onboardingStep: user.onboardingStep },
      company: companyRecord,
    });
  });

  app.post("/api/auth/login", async (req, res) => {
    const schema = z.object({
      username: z.string(),
      password: z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request" });

    const { username, password } = parsed.data;
    const user = await storage.getUserByEmail(username) ?? await storage.getUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const valid = verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    req.session.userId = user.id;
    req.session.companyId = user.companyId;

    res.json({
      user: { id: user.id, email: user.email, username: user.username, companyId: user.companyId, onboardingStep: user.onboardingStep },
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ ok: true });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
    const user = await storage.getUser(req.session.userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    let companyName: string | undefined;
    if (user.companyId) {
      const company = await storage.getCompany(user.companyId);
      companyName = company?.name;
    }
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      companyId: user.companyId,
      onboardingStep: user.onboardingStep,
      companyName,
    });
  });

  app.patch("/api/users/onboarding-step", async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ error: "Unauthorized" });
    const schema = z.object({ step: z.number().int().min(0).max(2) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid step" });
    const user = await storage.updateUserOnboarding(req.session.userId, parsed.data.step);
    res.json({ onboardingStep: user.onboardingStep });
  });

  // ── Onboarding status ──────────────────────────────────────────────────────
  app.get("/api/onboarding/status", async (req, res) => {
    const companyId = req.session?.companyId || DEMO_COMPANY_ID;
    const priceRecords = await storage.getPriceRecords(companyId);
    const materialRules = await storage.getMaterialRules(companyId);
    const pricingStrategies = await storage.getPricingStrategies(companyId);
    res.json({
      companyId,
      hasPricelist: priceRecords.length > 0,
      hasCompanyRules: materialRules.length > 0 || pricingStrategies.length > 0,
    });
  });

  // Helper to get company ID from session or demo
  function getCompanyId(req: Request): string {
    return req.session?.companyId || DEMO_COMPANY_ID;
  }

  // ── Price Records ──────────────────────────────────────────────────────────
  app.get("/api/price-records", async (req, res) => {
    const records = await storage.getPriceRecords(getCompanyId(req));
    res.json(records);
  });

  app.post("/api/price-records", async (req, res) => {
    const parsed = insertPriceRecordSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const record = await storage.createPriceRecord(parsed.data);
    res.json(record);
  });

  app.post("/api/price-records/bulk", async (req, res) => {
    const cid = getCompanyId(req);
    const schema = z.array(insertPriceRecordSchema);
    const records = (req.body as any[]).map((r: any) => ({ ...r, companyId: cid }));
    const parsed = schema.safeParse(records);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const created = await storage.createPriceRecordsBulk(parsed.data);
    for (const r of parsed.data) {
      if (r.category && r.quarter) {
        await storage.createHistoricalPriceRecord({
          companyId: cid,
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
  app.get("/api/historical-prices", async (req, res) => {
    const records = await storage.getHistoricalPriceRecords(getCompanyId(req));
    res.json(records);
  });

  // ── Material Rules ─────────────────────────────────────────────────────────
  app.get("/api/material-rules", async (req, res) => {
    res.json(await storage.getMaterialRules(getCompanyId(req)));
  });
  app.post("/api/material-rules", async (req, res) => {
    const parsed = insertMaterialRuleSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createMaterialRule(parsed.data));
  });
  app.patch("/api/material-rules/:id", async (req, res) => {
    try { res.json(await storage.updateMaterialRule(Number(req.params.id), req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Scope Templates ────────────────────────────────────────────────────────
  app.get("/api/scope-templates", async (req, res) => {
    res.json(await storage.getScopeTemplates(getCompanyId(req)));
  });
  app.post("/api/scope-templates", async (req, res) => {
    const parsed = insertScopeTemplateSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createScopeTemplate(parsed.data));
  });
  app.patch("/api/scope-templates/:id", async (req, res) => {
    try { res.json(await storage.updateScopeTemplate(Number(req.params.id), req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Labor Rates ────────────────────────────────────────────────────────────
  app.get("/api/labor-rates", async (req, res) => {
    res.json(await storage.getLaborRates(getCompanyId(req)));
  });
  app.post("/api/labor-rates", async (req, res) => {
    const parsed = insertLaborRateSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createLaborRate(parsed.data));
  });
  app.patch("/api/labor-rates/:id", async (req, res) => {
    try { res.json(await storage.updateLaborRate(Number(req.params.id), req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Pricing Strategies ─────────────────────────────────────────────────────
  app.get("/api/pricing-strategies", async (req, res) => {
    res.json(await storage.getPricingStrategies(getCompanyId(req)));
  });
  app.post("/api/pricing-strategies", async (req, res) => {
    const parsed = insertPricingStrategySchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.upsertPricingStrategy(parsed.data));
  });

  // ── Unit Conversions ───────────────────────────────────────────────────────
  app.get("/api/unit-conversions", async (req, res) => {
    res.json(await storage.getUnitConversions(getCompanyId(req)));
  });
  app.post("/api/unit-conversions", async (req, res) => {
    const parsed = insertUnitConversionSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createUnitConversion(parsed.data));
  });
  app.patch("/api/unit-conversions/:id", async (req, res) => {
    try { res.json(await storage.updateUnitConversion(Number(req.params.id), req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // ── Supplier Discount Rules ────────────────────────────────────────────────
  app.get("/api/supplier-discount-rules", async (req, res) => {
    res.json(await storage.getSupplierDiscountRules(getCompanyId(req)));
  });
  app.post("/api/supplier-discount-rules", async (req, res) => {
    const parsed = insertSupplierDiscountRuleSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createSupplierDiscountRule(parsed.data));
  });
  app.patch("/api/supplier-discount-rules/:id", async (req, res) => {
    try {
      res.json(await storage.updateSupplierDiscountRule(Number(req.params.id), req.body));
    } catch (e: any) {
      if (e.message.startsWith("DEPENDENCY:")) return res.status(409).json({ error: e.message });
      res.status(400).json({ error: e.message });
    }
  });

  // ── Quotations ─────────────────────────────────────────────────────────────
  app.get("/api/quotations", async (req, res) => {
    res.json(await storage.getQuotations(getCompanyId(req)));
  });
  app.get("/api/quotations/:id", async (req, res) => {
    const q = await storage.getQuotation(Number(req.params.id));
    if (!q) return res.status(404).json({ error: "Not found" });
    res.json(q);
  });
  app.post("/api/quotations", async (req, res) => {
    const parsed = insertQuotationSchema.safeParse({ ...req.body, companyId: getCompanyId(req) });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await storage.createQuotation(parsed.data));
  });
  app.patch("/api/quotations/:id", async (req, res) => {
    try { res.json(await storage.updateQuotation(Number(req.params.id), req.body)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  return httpServer;
}
