# Formance Stack: Financial Internet & Ledger Infrastructure

![Go](https://img.shields.io/badge/Language-Go-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square)
![Kafka](https://img.shields.io/badge/Messaging-Kafka%20%7C%20NATS-231F20?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Formance Stack** is a modular financial infrastructure platform designed to model, track, and execute programmable money flows at enterprise scale.

Developed and maintained by **[Mohit](https://github.com/Mohitgithub786)**.

---

## 🏛️ Core Architecture

- **Ledger Engine**: Immutable, programmable double-entry ledger that acts as the single source of truth for all internal balances and financial transactions.
- **Payments Orchestration**: Unified API abstraction layer connecting payment gateways, banks, and payment service providers.
- **Numscript DSL**: Domain-specific language and virtual machine for modeling multi-party financial transactions and automated money movements.
- **Event Gateway**: High-throughput asynchronous event bus supporting Kafka and NATS for distributed real-time ledger updates.

---

## 🛠️ Technology Stack

- **Backend:** Go (Golang) Microservices
- **Database:** PostgreSQL (Transactional ACID persistence)
- **Event Streaming:** Apache Kafka / NATS
- **API Gateway:** Traefik & RESTful OpenAPI schemas
- **Deployment:** Docker & Cloud-Native Kubernetes

---

## 🚀 Quick Start

### 1. Requirements
- Go 1.22+
- Docker & Docker Compose
- PostgreSQL 15+

### 2. Clone the Repository
```bash
git clone https://github.com/Mohitgithub786/formancestack.git
cd formancestack
```

### 3. Running Services
Start the core services using Docker Compose:
```bash
docker compose up -d
```

---

## 📄 License
This project is licensed under the MIT License.
