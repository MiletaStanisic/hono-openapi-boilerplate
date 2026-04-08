import { randomUUID } from "node:crypto";
import type { CreateVendorInput, UpdateVendorInput, Vendor } from "../schemas/vendor.js";
import type { Pagination } from "../schemas/common.js";
import { applySorting, applyPagination } from "../schemas/common.js";
import { vendors } from "../store/index.js";

export interface VendorFilter extends Pagination {
  status?: "pending" | "confirmed" | "cancelled";
  category?: "catering" | "av" | "photography" | "venue" | "transport" | "security" | "entertainment" | "other";
}

export function listVendors(eventId: string, query: VendorFilter) {
  let items = Array.from(vendors.values()).filter((v) => v.eventId === eventId);

  if (query.status) {
    items = items.filter((v) => v.status === query.status);
  }
  if (query.category) {
    items = items.filter((v) => v.category === query.category);
  }

  items = applySorting(items as unknown as Record<string, unknown>[], query.sortBy, query.sortOrder) as Vendor[];

  return applyPagination(items, query);
}

export function getVendor(eventId: string, vendorId: string): Vendor | undefined {
  const v = vendors.get(vendorId);
  return v?.eventId === eventId ? v : undefined;
}

export function createVendor(eventId: string, input: CreateVendorInput): Vendor {
  const now = new Date().toISOString();
  const vendor: Vendor = {
    id: randomUUID(),
    eventId,
    name: input.name,
    category: input.category,
    status: input.status ?? "pending",
    contractValue: input.contractValue ?? 0,
    paidAmount: input.paidAmount ?? 0,
    notes: input.notes,
    createdAt: now,
    updatedAt: now
  };
  vendors.set(vendor.id, vendor);
  return vendor;
}

export function updateVendor(eventId: string, vendorId: string, input: UpdateVendorInput): Vendor | undefined {
  const existing = vendors.get(vendorId);
  if (!existing || existing.eventId !== eventId) return undefined;

  const updated: Vendor = {
    ...existing,
    ...(input.name !== undefined && { name: input.name }),
    ...(input.category !== undefined && { category: input.category }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.contractValue !== undefined && { contractValue: input.contractValue }),
    ...(input.paidAmount !== undefined && { paidAmount: input.paidAmount }),
    ...(input.notes !== undefined && { notes: input.notes }),
    updatedAt: new Date().toISOString()
  };
  vendors.set(vendorId, updated);
  return updated;
}

export function deleteVendor(eventId: string, vendorId: string): boolean {
  const v = vendors.get(vendorId);
  if (!v || v.eventId !== eventId) return false;
  return vendors.delete(vendorId);
}
