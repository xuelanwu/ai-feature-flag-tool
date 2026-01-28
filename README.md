# AI Feature Flag Tool

A lightweight feature flag management system with an approval workflow and AI-assisted risk analysis. The tool is designed to support gradual rollouts, safer releases, and cross-team visibility when introducing new features.

Live demo: [https://ai-feature-flag-tool.vercel.app/](https://ai-feature-flag-tool.vercel.app/)

---

## Overview

This project models how feature flags are commonly handled in real engineering teams:

- Engineers **submit feature flags** alongside context such as scope, rollout percentage, and code changes
- Each submission goes through a **pending approval** stage
- Approved flags can be **activated / deactivated** from a management console
- An AI-powered risk analysis (Gemini) provides an early signal on potential rollout or rollback risks based on the submission content

The goal is not to be a full replacement for tools like Harness or LaunchDarkly, but to explore the core concepts behind feature flag lifecycle management in a practical system.

---

## Key Concepts

### Feature Flags

A feature flag represents a runtime-controlled switch that application code can query to decide whether a feature should be enabled for a given user or percentage of traffic.

Typical usage in application code:

- Frontend or backend code calls a flag evaluation API
- The API returns `true` or `false` based on flag state, rollout percentage, and targeting rules
- Code paths are gated accordingly

This project focuses on **flag definition, approval, and state management**, rather than SDK-level integrations.

### Rollout Percentage

Each flag includes an initial rollout percentage (e.g. 10%). In real systems, this would be used to enable the feature for a subset of users to reduce blast radius.

In this project, rollout percentage is stored and surfaced in the UI to reflect intended rollout strategy, and can be extended to user-based evaluation logic.

### Approval Flow

Flags move through the following lifecycle:

1. **Submitted** – engineer provides metadata and context
2. **Pending approval** – visible to reviewers
3. **Approved / Rejected** – decision recorded
4. **Active / Inactive** – approved flags can be toggled on or off

Authentication and role-based access control are intentionally kept minimal to focus on system behavior.

---

## AI Risk Analysis

When a flag is submitted, the backend calls a Gemini-powered risk analyzer that:

- Reviews the description and code change summary
- Assigns a risk score
- Highlights potentially risky keywords or missing rollback considerations

The output is advisory and meant to simulate how teams might integrate AI to assist (not replace) human reviewers.

---

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS

### Backend

- FastAPI (Python)
- SQLAlchemy
- SQLite (for local and demo usage)
- Gemini API for AI risk analysis

### Infrastructure

- Docker & docker-compose for local development
- Deployed frontend on Vercel

---

## Running Locally

### Prerequisites

- Docker & Docker Compose
- Node.js (if running frontend separately)
- Python 3.10+

### Environment Variables

Create a `.env` file in `backend/`

### Start with Docker Compose

```
docker-compose up --build
```

This will start both the backend API and frontend.

---


## Notes & Limitations

- Authentication and authorization are intentionally simplified
- Rollout percentage is stored but not fully implemented as user-based hashing
- The system focuses on workflow clarity rather than production-scale performance

---

## Future Ideas

- User or service targeting rules
- Environment-specific flags (dev / staging / prod)
- Audit logs and change history
- SDK-style client for easier integration into apps

---

## License

MIT

