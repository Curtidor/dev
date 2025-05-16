# 🛒 Minecraft Auction System (Bedrock Edition – TypeScript Core)

This project is a fully modular **auction system** designed for Minecraft Bedrock Edition. It is written entirely in TypeScript with clean architecture, test coverage, and extensibility in mind.

> ⚠️ This repository contains **only the source TypeScript code**. It is not yet compiled into an actual Minecraft Behavior Pack. A separate BP/RP integration will come in a future version.

---

## 🔧 Project Overview

This system simulates a public marketplace where players can:

- List items for sale (first-come-first-serve model)
- Query listings by:
  - Category
  - Seller name
  - Price filters
- Eventually support bidding (stubbed for now)
- Persist and load listings via in-world dump entities

The backend uses a layered structure where **AuctionService** is the public API layer and all internal logic is abstracted away behind that interface.

---

## 🧠 Architecture Highlights

- **AuctionService** – Public-facing API that handles queries, purchases, and adding listings
- **AuctionStore** – Acts as the middle layer and manages category/seller indexes
- **AuctionDB** – The flat listing database (single source of truth)
- **CategoryTable / SparseIndexArray** – Optimized indexing structures to support high-speed lookups without memory waste

> This design favors **centralized data ownership** (listings live in one place) and **reference-based indexing**, which makes the system highly performant and memory-conscious for a limited platform like Bedrock.

---

## 🧪 Tests Included

This repo includes a complete test suite written in TypeScript and runnable via Node (with mocks for Minecraft's server API). Tests cover:

- `IndexArray`: sparse index behavior, reuse, removal edge cases
- `AuctionDB`: insertion, equality, and seller tracking
- `AuctionStore`: category/seller resolution
- `AuctionService`: high-level queries, price filters, and usage flows

---


---

## 📌 Roadmap

- [x] First-come-first-serve selling system
- [x] Full TypeScript test coverage
- [ ] Add bidding logic
- [ ] Integrate with Bedrock Behavior Pack as a full addon
- [ ] Public listing UI (ActionForm or ChestForm)
- [ ] Multi-user persistence and dump cleanup


---

## License

This project is currently using MIT

---



