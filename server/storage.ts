import { randomUUID, randomBytes, scryptSync } from "crypto";
import type {
  User, InsertUser,
  Company, InsertCompany,
  PriceRecord, InsertPriceRecord,
  HistoricalPriceRecord, InsertHistoricalPriceRecord,
  MaterialRule, InsertMaterialRule,
  ScopeTemplate, InsertScopeTemplate,
  LaborRate, InsertLaborRate,
  PricingStrategy, InsertPricingStrategy,
  UnitConversion, InsertUnitConversion,
  SupplierDiscountRule, InsertSupplierDiscountRule,
  Quotation, InsertQuotation,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { companyId?: string }): Promise<User>;
  updateUserOnboarding(id: string, step: number, companyId?: string): Promise<User>;

  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Price Records
  getPriceRecords(companyId: string): Promise<PriceRecord[]>;
  createPriceRecord(record: InsertPriceRecord): Promise<PriceRecord>;
  createPriceRecordsBulk(records: InsertPriceRecord[]): Promise<PriceRecord[]>;

  // Historical Price Records
  getHistoricalPriceRecords(companyId: string): Promise<HistoricalPriceRecord[]>;
  createHistoricalPriceRecord(record: InsertHistoricalPriceRecord): Promise<HistoricalPriceRecord>;

  // Material Rules
  getMaterialRules(companyId: string): Promise<MaterialRule[]>;
  createMaterialRule(rule: InsertMaterialRule): Promise<MaterialRule>;
  updateMaterialRule(id: number, updates: Partial<MaterialRule>): Promise<MaterialRule>;

  // Scope Templates
  getScopeTemplates(companyId: string): Promise<ScopeTemplate[]>;
  createScopeTemplate(template: InsertScopeTemplate): Promise<ScopeTemplate>;
  updateScopeTemplate(id: number, updates: Partial<ScopeTemplate>): Promise<ScopeTemplate>;

  // Labor Rates
  getLaborRates(companyId: string): Promise<LaborRate[]>;
  createLaborRate(rate: InsertLaborRate): Promise<LaborRate>;
  updateLaborRate(id: number, updates: Partial<LaborRate>): Promise<LaborRate>;

  // Pricing Strategies
  getPricingStrategies(companyId: string): Promise<PricingStrategy[]>;
  upsertPricingStrategy(strategy: InsertPricingStrategy): Promise<PricingStrategy>;

  // Unit Conversions
  getUnitConversions(companyId: string): Promise<UnitConversion[]>;
  createUnitConversion(conversion: InsertUnitConversion): Promise<UnitConversion>;
  updateUnitConversion(id: number, updates: Partial<UnitConversion>): Promise<UnitConversion>;

  // Supplier Discount Rules
  getSupplierDiscountRules(companyId: string): Promise<SupplierDiscountRule[]>;
  createSupplierDiscountRule(rule: InsertSupplierDiscountRule): Promise<SupplierDiscountRule>;
  updateSupplierDiscountRule(id: number, updates: Partial<SupplierDiscountRule>): Promise<SupplierDiscountRule>;

  // Quotations
  getQuotations(companyId: string): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, updates: Partial<Quotation>): Promise<Quotation>;
}

export const DEMO_COMPANY_ID = "demo-company-001";
export const ADMIN_EMAIL = "admin@buildsmart.com";
export const ADMIN_PASSWORD = "admin123";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private companies = new Map<string, Company>();
  private priceRecords: PriceRecord[] = [];
  private historicalPriceRecords: HistoricalPriceRecord[] = [];
  private materialRules: MaterialRule[] = [];
  private scopeTemplates: ScopeTemplate[] = [];
  private laborRates: LaborRate[] = [];
  private pricingStrategies: PricingStrategy[] = [];
  private unitConversions: UnitConversion[] = [];
  private supplierDiscountRules: SupplierDiscountRule[] = [];
  private quotations: Quotation[] = [];
  private idCounter = 1;

  constructor() {
    this.seedAdmin();
  }

  private seedAdmin() {
    const company: Company = {
      id: DEMO_COMPANY_ID,
      name: "BuildSmart Demo Co.",
      region: "NCR",
      specialization: [],
      companyAddress: "",
      contactNumber: "",
      companyLogo: null,
      city: "",
      projectSector: null,
      companyRole: null,
      createdAt: this.now(),
    };
    this.companies.set(company.id, company);

    const admin: User = {
      id: randomUUID(),
      username: ADMIN_EMAIL,
      email: ADMIN_EMAIL,
      password: hashPassword(ADMIN_PASSWORD),
      companyId: company.id,
      onboardingStep: 0,
    };
    this.users.set(admin.id, admin);
  }

  private nextId() { return this.idCounter++; }
  private now() { return new Date(); }

  // Users
  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return [...this.users.values()].find(u => u.username === username);
  }
  async getUserByEmail(email: string) {
    return [...this.users.values()].find(u => u.email === email || u.username === email);
  }
  async createUser(data: InsertUser & { companyId?: string }): Promise<User> {
    const user: User = {
      id: randomUUID(),
      username: data.username,
      email: data.email ?? null,
      password: data.password,
      companyId: data.companyId ?? null,
      onboardingStep: 0,
    };
    this.users.set(user.id, user);
    return user;
  }
  async updateUserOnboarding(id: string, step: number, companyId?: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, onboardingStep: step, companyId: companyId ?? user.companyId };
    this.users.set(id, updated);
    return updated;
  }

  // Companies
  async getCompany(id: string) { return this.companies.get(id); }
  async createCompany(data: InsertCompany): Promise<Company> {
    const company: Company = {
      id: randomUUID(),
      name: data.name,
      region: data.region ?? "NCR",
      specialization: data.specialization ?? [],
      companyAddress: data.companyAddress ?? "",
      contactNumber: data.contactNumber ?? "",
      companyLogo: data.companyLogo ?? null,
      city: data.city ?? "",
      projectSector: data.projectSector ?? null,
      companyRole: data.companyRole ?? null,
      createdAt: this.now(),
    };
    this.companies.set(company.id, company);
    return company;
  }

  // Price Records
  async getPriceRecords(companyId: string) {
    return this.priceRecords.filter(r => r.companyId === companyId && r.isActive);
  }
  async createPriceRecord(data: InsertPriceRecord): Promise<PriceRecord> {
    const r: PriceRecord = {
      ...data,
      id: this.nextId(),
      createdAt: this.now(),
      isActive: data.isActive ?? true,
      category: data.category ?? null,
      supplierName: data.supplierName ?? null,
      sourceType: data.sourceType ?? "uploaded",
      region: data.region ?? null,
      quarter: data.quarter ?? null,
    };
    this.priceRecords.push(r);
    return r;
  }
  async createPriceRecordsBulk(records: InsertPriceRecord[]): Promise<PriceRecord[]> {
    return Promise.all(records.map(r => this.createPriceRecord(r)));
  }

  // Historical Price Records
  async getHistoricalPriceRecords(companyId: string) {
    return this.historicalPriceRecords.filter(r => r.companyId === companyId);
  }
  async createHistoricalPriceRecord(data: InsertHistoricalPriceRecord): Promise<HistoricalPriceRecord> {
    const r: HistoricalPriceRecord = {
      ...data,
      id: this.nextId(),
      recordedAt: this.now(),
      region: data.region ?? null,
      sourceType: data.sourceType ?? null,
    };
    this.historicalPriceRecords.push(r);
    return r;
  }

  // Material Rules
  async getMaterialRules(companyId: string) {
    return this.materialRules.filter(r => r.companyId === companyId);
  }
  async createMaterialRule(data: InsertMaterialRule): Promise<MaterialRule> {
    const r: MaterialRule = { ...data, id: this.nextId(), createdAt: this.now(), isActive: data.isActive ?? true, priority: data.priority ?? 1, fallbackRule: data.fallbackRule ?? "next_preferred" };
    this.materialRules.push(r);
    return r;
  }
  async updateMaterialRule(id: number, updates: Partial<MaterialRule>): Promise<MaterialRule> {
    const idx = this.materialRules.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Not found");
    this.materialRules[idx] = { ...this.materialRules[idx], ...updates };
    return this.materialRules[idx];
  }

  // Scope Templates
  async getScopeTemplates(companyId: string) {
    return this.scopeTemplates.filter(r => r.companyId === companyId);
  }
  async createScopeTemplate(data: InsertScopeTemplate): Promise<ScopeTemplate> {
    const r: ScopeTemplate = { ...data, id: this.nextId(), createdAt: this.now(), isActive: data.isActive ?? true, workItems: data.workItems ?? [] };
    this.scopeTemplates.push(r);
    return r;
  }
  async updateScopeTemplate(id: number, updates: Partial<ScopeTemplate>): Promise<ScopeTemplate> {
    const idx = this.scopeTemplates.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Not found");
    this.scopeTemplates[idx] = { ...this.scopeTemplates[idx], ...updates };
    return this.scopeTemplates[idx];
  }

  // Labor Rates
  async getLaborRates(companyId: string) {
    return this.laborRates.filter(r => r.companyId === companyId);
  }
  async createLaborRate(data: InsertLaborRate): Promise<LaborRate> {
    const r: LaborRate = { ...data, id: this.nextId(), createdAt: this.now(), isActive: data.isActive ?? true, productivityIndex: data.productivityIndex ?? "1.00", fallbackRule: data.fallbackRule ?? "standard" };
    this.laborRates.push(r);
    return r;
  }
  async updateLaborRate(id: number, updates: Partial<LaborRate>): Promise<LaborRate> {
    const idx = this.laborRates.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Not found");
    this.laborRates[idx] = { ...this.laborRates[idx], ...updates };
    return this.laborRates[idx];
  }

  // Pricing Strategies
  async getPricingStrategies(companyId: string) {
    return this.pricingStrategies.filter(r => r.companyId === companyId);
  }
  async upsertPricingStrategy(data: InsertPricingStrategy): Promise<PricingStrategy> {
    const existing = this.pricingStrategies.find(r => r.companyId === data.companyId && r.tier === data.tier);
    if (existing) {
      const idx = this.pricingStrategies.indexOf(existing);
      this.pricingStrategies[idx] = { ...existing, ...data };
      return this.pricingStrategies[idx];
    }
    const r: PricingStrategy = {
      ...data, id: this.nextId(), createdAt: this.now(),
      isActive: data.isActive ?? true,
      markupPct: data.markupPct ?? "0",
      contingencyPct: data.contingencyPct ?? "0",
      overheadPct: data.overheadPct ?? "0",
      profitMarginPct: data.profitMarginPct ?? "0",
      sourcePriority: data.sourcePriority ?? [],
      fallbackRule: data.fallbackRule ?? null,
      warrantyTerms: data.warrantyTerms ?? null,
      paymentTerms: data.paymentTerms ?? null,
    };
    this.pricingStrategies.push(r);
    return r;
  }

  // Unit Conversions
  async getUnitConversions(companyId: string) {
    return this.unitConversions.filter(r => r.companyId === companyId);
  }
  async createUnitConversion(data: InsertUnitConversion): Promise<UnitConversion> {
    const r: UnitConversion = { ...data, id: this.nextId(), createdAt: this.now(), isActive: data.isActive ?? true, wastagePct: data.wastagePct ?? "0" };
    this.unitConversions.push(r);
    return r;
  }
  async updateUnitConversion(id: number, updates: Partial<UnitConversion>): Promise<UnitConversion> {
    const idx = this.unitConversions.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Not found");
    this.unitConversions[idx] = { ...this.unitConversions[idx], ...updates };
    return this.unitConversions[idx];
  }

  // Supplier Discount Rules
  async getSupplierDiscountRules(companyId: string) {
    return this.supplierDiscountRules.filter(r => r.companyId === companyId);
  }
  async createSupplierDiscountRule(data: InsertSupplierDiscountRule): Promise<SupplierDiscountRule> {
    const r: SupplierDiscountRule = {
      ...data, id: this.nextId(), createdAt: this.now(),
      isActive: data.isActive ?? true,
      referencedInQuotations: data.referencedInQuotations ?? 0,
      discountPct: data.discountPct ?? null,
      minOrderAmount: data.minOrderAmount ?? null,
      isHardExclusion: data.isHardExclusion ?? false,
      details: data.details ?? null,
    };
    this.supplierDiscountRules.push(r);
    return r;
  }
  async updateSupplierDiscountRule(id: number, updates: Partial<SupplierDiscountRule>): Promise<SupplierDiscountRule> {
    const idx = this.supplierDiscountRules.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Not found");
    if (updates.isActive === false && this.supplierDiscountRules[idx].referencedInQuotations > 0) {
      throw new Error("DEPENDENCY: Rule is referenced in active quotations");
    }
    this.supplierDiscountRules[idx] = { ...this.supplierDiscountRules[idx], ...updates };
    return this.supplierDiscountRules[idx];
  }

  // Quotations
  async getQuotations(companyId: string) {
    return this.quotations.filter(q => q.companyId === companyId);
  }
  async getQuotation(id: number) {
    return this.quotations.find(q => q.id === id);
  }
  async createQuotation(data: InsertQuotation): Promise<Quotation> {
    const q: Quotation = {
      ...data, id: this.nextId(), createdAt: this.now(), updatedAt: this.now(),
      clientName: data.clientName ?? null,
      practicalTotal: data.practicalTotal ?? null,
      standardTotal: data.standardTotal ?? null,
      premiumTotal: data.premiumTotal ?? null,
      status: data.status ?? "draft",
      breakdown: data.breakdown ?? {},
      tier: data.tier ?? "Standard",
      quotationType: data.quotationType ?? "quick",
    };
    this.quotations.push(q);
    return q;
  }
  async updateQuotation(id: number, updates: Partial<Quotation>): Promise<Quotation> {
    const idx = this.quotations.findIndex(q => q.id === id);
    if (idx === -1) throw new Error("Not found");
    this.quotations[idx] = { ...this.quotations[idx], ...updates, updatedAt: this.now() };
    return this.quotations[idx];
  }
}

export const storage = new MemStorage();
