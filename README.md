# SmartInventory — Project Reference

Gateway-Oriented, Database-per-Service microservices architecture built with ASP.NET Core.

## Live URLs (Online — Render)

These stay the same unless a service is deleted/recreated on Render.

| Service | URL |
|---|---|
| Gateway | https://smartinventory-gateway.onrender.com |
| Product Service (direct) | https://smartinventory-productservice.onrender.com |
| Order Service (direct) | https://smartinventory-orderservice.onrender.com |
| Inventory Service (direct) | https://smartinventory-inventoryservice.onrender.com |

**Through the Gateway (what a real client should use):**
```
/api/product/...        -> Product Service
/api/order/...           -> Order Service
/api/inventory/...       -> Inventory Service
```

**Note:** Free tier services "sleep" after inactivity. First request after sleeping can take 30-50 seconds. Open the direct links a few minutes before a demo to "wake them up," starting with Product Service (Order and Inventory both call it).

## Local Development URLs

| Service | HTTPS | HTTP |
|---|---|---|
| Product Service | https://localhost:7018 | http://localhost:5023 |
| Gateway | https://localhost:7226 | http://localhost:5139 |
| Order Service | https://localhost:7084 | http://localhost:5xxx |
| Inventory Service | https://localhost:7xxx | http://localhost:5xxx |

**Scalar API docs (interactive, local only):**
- Product Service: `/scalar/v1`
- Order Service: `/scalar/v1`
- Inventory Service: `/scalar/v1`

## How to Run Locally

1. Open `SmartInventory.slnx` in Visual Studio.
2. Right-click the Solution -> **Configure Startup Projects** -> **Multiple startup projects** -> set all four projects (`Gateway`, `ProductService`, `OrderService`, `InventoryService`) to **Start**.
3. Click **Start (Run)** - four console windows should open, one per service.
4. Go to any service's `/scalar/v1` URL to test it directly with full CRUD.

**Note:** Local services normally call the *deployed* Product Service (Render) for cross-service lookups, since `appsettings.json` points there by default - not the local one. This is fine for testing; it means local Order/Inventory Service writes involve the real online MongoDB via Product Service lookups.

## Architecture

```
Browser / Frontend
        |
        v
   Gateway (YARP reverse proxy - no business logic, just routing)
        |
   +----+--------------------+-------------------+
   |                         |                    |
Product Service        Order Service       Inventory Service
   |                         |                    |
MongoDB (ProductDB)    MongoDB (OrderDB)   MongoDB (InventoryDB)
                             |                    |
                             +--> calls Product Service (real name/price)
                                                   +--> calls Product Service (real name, for alerts)
```

- **Gateway**: routes `/api/product/*`, `/api/order/*`, `/api/inventory/*` to the matching service. Configured in `SmartInventory.Gateway/appsettings.json` under `ReverseProxy`.
- **Product Service**: owns product catalog (name, description, price, category).
- **Order Service**: owns orders. Calls Product Service via `ProductServiceClient` (HttpClient) to fetch real name/price before saving - customers never send price directly, preventing tampering.
- **Inventory Service**: owns stock levels per product (`StockQuantity`, `ReorderThreshold`). Calls Product Service the same way to get product names for low-stock alerts.
- Each service is independently deployable - Database-per-Service pattern, matching the report's Section 2.2.

## Service Endpoints Summary

**Product Service** (`/api/product`): GET all, GET by id, POST, PUT, DELETE

**Order Service** (`/api/order`):
- `POST /api/order` - create order (looks up real prices via Product Service, calculates total, status defaults to Pending)
- `GET /api/order/{id}` - get one order
- `GET /api/order/customer/{customerId}` - get all orders for a customer
- `PUT /api/order/{id}/status` - update order status
- `DELETE /api/order/{id}`

**Inventory Service** (`/api/inventory`):
- `POST /api/inventory` - create a stock record for a product
- `GET /api/inventory/{productId}` - current stock level
- `GET /api/inventory/{productId}/available?quantity=N` - check if enough stock exists
- `POST /api/inventory/reserve` - reduce stock (order placed)
- `POST /api/inventory/release` - restore stock (order cancelled / compensating transaction)
- `PUT /api/inventory/update` - manual stock adjustment (restock, damage, etc.)
- `GET /api/inventory/alerts` - products at or below reorder threshold

## Deployment Notes (Render)

Each service is deployed separately as a **Web Service** using a **hand-written Dockerfile** (not Visual Studio's "Container Support" feature - that adds Docker tooling to the local dev environment too and causes Docker Desktop errors when running locally without Docker installed).

| Setting | All services |
|---|---|
| Root Directory | `SmartInventory.<ServiceName>` |
| Dockerfile Path | `Dockerfile` |
| Docker Build Context Directory | `.` |
| Instance Type | Free |

**Environment Variables (Product/Order/Inventory Service):**
- `MongoDbSettings__ConnectionString` - MongoDB Atlas connection string (kept out of `appsettings.json`/GitHub via `.gitignore`)
- `MongoDbSettings__DatabaseName` - `SmartInventory_ProductDB` / `SmartInventory_OrderDB` / `SmartInventory_InventoryDB`
- `ASPNETCORE_URLS` - `http://+:8080`

**Environment Variables (Gateway):**
- `ASPNETCORE_URLS` - `http://+:8080`

When a service gets a new Render URL, update the matching `Address` field in `SmartInventory.Gateway/appsettings.json` under `ReverseProxy:Clusters`, then push and redeploy the Gateway.

**Resilience note:** Cross-service calls (Order -> Product, Inventory -> Product) can fail with 502 if the target service is asleep (cold start). `GetLowStockAlertsAsync` wraps each Product Service call in try/catch so one unavailable product doesn't crash the whole alerts endpoint.

## Database

MongoDB Atlas, single free M0 cluster, three separate databases (one per service, per the Database-per-Service pattern):
- `SmartInventory_ProductDB` -> `Products` collection
- `SmartInventory_OrderDB` -> `Orders` collection
- `SmartInventory_InventoryDB` -> `Inventories` collection

Connection strings are **not** committed to GitHub - each service's `appsettings.json` is excluded via `.gitignore` (one line per service, since a single wildcard rule accidentally caught the Gateway's `appsettings.json` too during setup - worth remembering).

## Frontend

Plain HTML/CSS/JS in `SmartInventory.Frontend/`. Fetches from the Gateway's Product endpoint, with client-side search and full CRUD (Create/Edit/Delete) wired to the Gateway. Not yet deployed - planned as the last step, after Auth Service.

## Still to build

- **Auth Service** - login, JWT, role-based access (Admin/Staff/Customer)
- Gateway route protection using Auth
- Order/Inventory frontend UI
- Input validation (e.g. price > 0)
- Unit tests
- Frontend deployment

## Repo

https://github.com/sagorsutra/SmartInventory
