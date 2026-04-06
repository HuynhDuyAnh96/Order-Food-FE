'use client';
import { useState, useEffect, useCallback } from 'react';
import { getApiBaseOrThrow } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IngredientType {
  id: string;
  name: string;
  avg_kg_per_basket: number;
  created_at: string;
}

export interface InventoryReceipt {
  id: string;
  ingredient_type_id: string;
  ingredient_name: string;
  raw_weight_kg: number;
  price_per_kg: number;
  total_cost: number;
  received_at: string;
  note?: string;
}

export interface ProcessingBatch {
  id: string;
  receipt_id: string;
  ingredient_type_id: string;
  ingredient_name: string;
  input_weight_kg: number;
  output_baskets: number;
  waste_percent: number;
  cost_per_basket: number;
  processed_at: string;
  note?: string;
}

export interface RecipeCostItem {
  name: string;
  cost_amount: number;
  note?: string;
}

export interface RecipeCost {
  id: string;
  ingredient_type_id: string;
  ingredient_name: string;
  items: RecipeCostItem[];
  total_cost_per_basket: number;
  updated_at: string;
}

export interface SessionUsage {
  ingredient_type_id: string;
  ingredient_name: string;
  planned_baskets: number;
  used_baskets: number;
  wasted_baskets: number;
}

export interface EveningSession {
  id: string;
  date: string;
  status: 'open' | 'closed';
  usage: SessionUsage[];
  note?: string;
  opened_at: string;
  closed_at?: string;
}

export interface StockSummaryItem {
  ingredient_type_id: string;
  ingredient_name: string;
  available_baskets: number;
  total_cost_per_basket: number;
}

export interface StockSummary {
  items: StockSummaryItem[];
  updated_at: string;
}

// ── Hook: Stock Overview ──────────────────────────────────────────────────────

export function useStockSummary() {
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getApiBaseOrThrow();
      const [stockRes, typesRes] = await Promise.all([
        window.fetch(`${base}/inventory/stock`),
        window.fetch(`${base}/inventory/ingredient-types`),
      ]);
      const stockJson = await stockRes.json();
      const typesJson = await typesRes.json();
      if (stockJson.success) setStock(stockJson.data);
      if (typesJson.success) setIngredientTypes(typesJson.data ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stock, ingredientTypes, loading, error, refetch: fetch };
}

// ── Hook: Ingredient Detail ───────────────────────────────────────────────────

export function useIngredientDetail(ingredientTypeId: string) {
  const [ingredientType, setIngredientType] = useState<IngredientType | null>(null);
  const [receipts, setReceipts] = useState<InventoryReceipt[]>([]);
  const [batches, setBatches] = useState<ProcessingBatch[]>([]);
  const [recipeCost, setRecipeCost] = useState<RecipeCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!ingredientTypeId) return;
    setLoading(true);
    setError(null);
    try {
      const base = getApiBaseOrThrow();
      const [typesRes, receiptsRes, batchesRes, rcRes] = await Promise.all([
        window.fetch(`${base}/inventory/ingredient-types`),
        window.fetch(`${base}/inventory/receipts?ingredient_type_id=${ingredientTypeId}`),
        window.fetch(`${base}/inventory/batches?ingredient_type_id=${ingredientTypeId}`),
        window.fetch(`${base}/inventory/recipe-costs/${ingredientTypeId}`),
      ]);
      const typesJson = await typesRes.json();
      const receiptsJson = await receiptsRes.json();
      const batchesJson = await batchesRes.json();
      const rcJson = await rcRes.json();

      if (typesJson.success) {
        const found = (typesJson.data as IngredientType[]).find(t => t.id === ingredientTypeId);
        if (found) setIngredientType(found);
      }
      if (receiptsJson.success) setReceipts(receiptsJson.data ?? []);
      if (batchesJson.success) setBatches(batchesJson.data ?? []);
      if (rcJson.success) setRecipeCost(rcJson.data ?? null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [ingredientTypeId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { ingredientType, receipts, batches, recipeCost, loading, error, refetch: fetchAll };
}

// ── Hook: Sessions ────────────────────────────────────────────────────────────

export function useSessions() {
  const [sessions, setSessions] = useState<EveningSession[]>([]);
  const [currentSession, setCurrentSession] = useState<EveningSession | null>(null);
  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const base = getApiBaseOrThrow();
      const [sessRes, curRes, typesRes] = await Promise.all([
        window.fetch(`${base}/inventory/sessions?limit=30`),
        window.fetch(`${base}/inventory/sessions/current`),
        window.fetch(`${base}/inventory/ingredient-types`),
      ]);
      const sessJson = await sessRes.json();
      const curJson = await curRes.json();
      const typesJson = await typesRes.json();

      if (sessJson.success) setSessions(sessJson.data ?? []);
      if (curJson.success) setCurrentSession(curJson.data ?? null);
      if (typesJson.success) setIngredientTypes(typesJson.data ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { sessions, currentSession, ingredientTypes, loading, error, refetch: fetchAll };
}

// ── API helpers ───────────────────────────────────────────────────────────────

export async function apiCreateIngredientType(name: string, avgKgPerBasket: number) {
  const base = getApiBaseOrThrow();
  const res = await window.fetch(`${base}/inventory/ingredient-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, avg_kg_per_basket: avgKgPerBasket }),
  });
  return res.json();
}

export async function apiCreateReceipt(data: {
  ingredient_type_id: string;
  raw_weight_kg: number;
  price_per_kg: number;
  note?: string;
}) {
  const base = getApiBaseOrThrow();
  const res = await window.fetch(`${base}/inventory/receipts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiCreateBatch(data: {
  receipt_id: string;
  input_weight_kg: number;
  output_baskets: number;
  note?: string;
}) {
  const base = getApiBaseOrThrow();
  const res = await window.fetch(`${base}/inventory/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpsertRecipeCost(data: {
  ingredient_type_id: string;
  items: RecipeCostItem[];
}) {
  const base = getApiBaseOrThrow();
  const res = await window.fetch(`${base}/inventory/recipe-costs`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiOpenSession(data: {
  date: string;
  usage: { ingredient_type_id: string; ingredient_name: string; planned_baskets: number; used_baskets: number; wasted_baskets: number }[];
  note?: string;
}) {
  const base = getApiBaseOrThrow();
  const res = await window.fetch(`${base}/inventory/sessions/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiCloseSession(sessionId: string, data: {
  usage: { ingredient_type_id: string; ingredient_name: string; planned_baskets: number; used_baskets: number; wasted_baskets: number }[];
  note?: string;
}) {
  const base = getApiBaseOrThrow();
  const res = await window.fetch(`${base}/inventory/sessions/${sessionId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
