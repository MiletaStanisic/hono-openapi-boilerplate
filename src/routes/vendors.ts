import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorSchema, IdParamSchema, paginatedSchema } from "../schemas/common.js";
import { CreateVendorSchema, UpdateVendorSchema, VendorParamSchema, VendorQuerySchema, VendorSchema } from "../schemas/vendor.js";
import { createVendor, deleteVendor, getVendor, listVendors, updateVendor } from "../services/vendors.js";

const router = new OpenAPIHono();

// GET /events/:id/vendors
const listVendorsRoute = createRoute({
  method: "get",
  path: "/events/{id}/vendors",
  tags: ["Vendors"],
  summary: "List vendors for an event",
  request: { params: IdParamSchema, query: VendorQuerySchema },
  responses: {
    200: {
      description: "Paginated list of vendors",
      content: { "application/json": { schema: paginatedSchema(VendorSchema) } }
    }
  }
});

router.openapi(listVendorsRoute, (c) => {
  const { id } = c.req.valid("param");
  const query = c.req.valid("query");
  return c.json(listVendors(id, query), 200);
});

// POST /events/:id/vendors
const createVendorRoute = createRoute({
  method: "post",
  path: "/events/{id}/vendors",
  tags: ["Vendors"],
  summary: "Add vendor to event",
  request: {
    params: IdParamSchema,
    body: { required: true, content: { "application/json": { schema: CreateVendorSchema } } }
  },
  responses: {
    201: {
      description: "Created vendor",
      content: { "application/json": { schema: VendorSchema } }
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

// 201 is correct – explicit to satisfy strict typed handler
router.openapi(createVendorRoute, (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  return c.json(createVendor(id, body), 201);
});

// GET /events/:id/vendors/:vendorId
const getVendorRoute = createRoute({
  method: "get",
  path: "/events/{id}/vendors/{vendorId}",
  tags: ["Vendors"],
  summary: "Get vendor by ID",
  request: { params: VendorParamSchema },
  responses: {
    200: {
      description: "Vendor",
      content: { "application/json": { schema: VendorSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(getVendorRoute, (c) => {
  const { id, vendorId } = c.req.valid("param");
  const vendor = getVendor(id, vendorId);
  if (!vendor) return c.json({ code: "NOT_FOUND", message: "Vendor not found" }, 404);
  return c.json(vendor, 200);
});

// PUT /events/:id/vendors/:vendorId
const updateVendorRoute = createRoute({
  method: "put",
  path: "/events/{id}/vendors/{vendorId}",
  tags: ["Vendors"],
  summary: "Update vendor",
  request: {
    params: VendorParamSchema,
    body: { required: true, content: { "application/json": { schema: UpdateVendorSchema } } }
  },
  responses: {
    200: {
      description: "Updated vendor",
      content: { "application/json": { schema: VendorSchema } }
    },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(updateVendorRoute, (c) => {
  const { id, vendorId } = c.req.valid("param");
  const body = c.req.valid("json");
  const vendor = updateVendor(id, vendorId, body);
  if (!vendor) return c.json({ code: "NOT_FOUND", message: "Vendor not found" }, 404);
  return c.json(vendor, 200);
});

// DELETE /events/:id/vendors/:vendorId
const deleteVendorRoute = createRoute({
  method: "delete",
  path: "/events/{id}/vendors/{vendorId}",
  tags: ["Vendors"],
  summary: "Remove vendor from event",
  request: { params: VendorParamSchema },
  responses: {
    204: { description: "Deleted" },
    404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } }
  }
});

router.openapi(deleteVendorRoute, (c) => {
  const { id, vendorId } = c.req.valid("param");
  const deleted = deleteVendor(id, vendorId);
  if (!deleted) return c.json({ code: "NOT_FOUND", message: "Vendor not found" }, 404);
  return c.body(null, 204);
});

export { router as vendorsRouter };
