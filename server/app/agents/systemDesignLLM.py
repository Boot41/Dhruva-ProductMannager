from __future__ import annotations

import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.core.config import get_settings


SYSTEM_PROMPT = """
You are a principal systems architect. Given product features, expected users, and geography,
produce a pragmatic, production-ready system design.

Strictly output clean markdown with these sections only:

# High-Level Architecture
- Overall architecture style (monolith, microservices, modular monolith) with rationale
- Data flow at a glance (ingress -> processing -> storage -> egress)

# Core Components
- List services/components with concise responsibilities
- For each, specify interfaces/APIs and key dependencies

# Data Storage & Models
- Primary databases and rationale (SQL/NoSQL/time-series/etc.)
- Key entities/tables/collections and relationships
- Indexing, partitioning/sharding strategy, and expected data volumes

# Traffic, Scale & Performance
- Estimated QPS/throughput and growth assumptions
- Latency budgets per critical path and how they are met (caching, async, batching)
- Caching layers (client, CDN, edge, server, DB) and eviction policies

# Geography & Multi-Region Strategy
- Where users are located and what this implies (CDN POPs, edge compute, data residency)
- Region selection, active-active/active-passive, failover/RTO/RPO
- Compliance considerations (GDPR/CCPA/data sovereignty) if relevant

# Reliability & Operations
- Observability (logs, metrics, traces, dashboards, alerts)
- Resiliency patterns (circuit breakers, retries with backoff, idempotency)
- Deployment strategy (CI/CD, blue/green or canary), infra-as-code

# Security & Compliance
- AuthN/AuthZ approach (OIDC, JWT, RBAC/ABAC)
- Secrets management, encryption in transit/at rest, key management
- Threat model notes and mitigations

# API Design
- External/internal APIs with example endpoints and payload shapes
- Versioning, pagination, error handling conventions

# Data Lifecycle
- Backups, retention, archival, GDPR delete
- Migrations and schema evolution strategy

# Cost Considerations
- Primary cost drivers and cost-control levers (autoscaling, storage tiers, cache hit rate)

# Phased Evolution
- MVP architecture
- Near-term scaling steps
- Longer-term refactors

Notes:
- Be concise but complete. Use bullet points, no prose outside sections above.
- Align recommendations with inputs and good engineering practices.
"""


def generate_system_design(
    features: str,
    expected_users: str,
    geography: str,
    *,
    constraints: Optional[str] = None,
    tech_stack: Optional[str] = None,
    temperature: float = 0.2,
) -> str:
    """Generate a structured system design given features, users, and geography.

    Uses Google Gemini via LangChain when an API key is present.
    """
    settings = get_settings()
    api_key = (settings.api_key or os.getenv("API_KEY") or os.getenv("GOOGLE_API_KEY"))
    if not api_key:
        raise RuntimeError(
            "API key is not set. Please set API_KEY or GOOGLE_API_KEY in your environment/.env."
        )

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=temperature,
        google_api_key=api_key,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            (
                "user",
                (
                    """
Inputs

Features:
{features}

Expected Users (types, scale, usage patterns):
{expected_users}

Geography (where users are, data residency, latency needs):
{geography}

Tech Stack (optional):
{tech_stack}

Constraints/Notes (optional):
{constraints}

Please produce the system design now.
"""
                ).strip(),
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    return chain.invoke(
        {
            "features": features.strip(),
            "expected_users": expected_users.strip(),
            "geography": geography.strip(),
            "tech_stack": (tech_stack or "N/A").strip(),
            "constraints": (constraints or "N/A").strip(),
        }
    )
