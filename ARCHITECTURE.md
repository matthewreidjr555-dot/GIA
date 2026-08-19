# GIA — Architecture & Product Requirements

Status: draft v1 · companion to `draft-flow.jsx` (UI prototype)

## 1. Product summary

GIA is a multiplayer software-building ecosystem. The unit of the product is the **project**,
not a feed or a profile. The central action is **JOIN BUILD**: users build alone, pull in known
collaborators, or discover builders and AI agents to work with in real time. AI is a first-class
participant, but the platform does not build or depend on a single foundation model — it
orchestrates whichever existing models (Claude, GPT, DeepSeek, Gemini, open-source, future
providers) fit a given task, with humans approving anything that matters.

Non-goals: this is not a social feed, not "another AI coding assistant," and not a wrapper
around one AI vendor.

## 2. Design principles

1. **Project-centered.** Every surface answers: what's being built, who's building it, who can
   help, what's left, what AI can do, what changed.
2. **Model-agnostic.** No AI provider is hard-coded into the app layer. Providers are
   interchangeable capabilities behind one interface.
3. **Humans stay in control.** AI proposes; humans approve merges, architecture decisions, and
   anything conversation-derived before it becomes a task or a code change.
4. **MVP first, no foundation-model bet.** Ship orchestration over existing models; use
   consented outcome data to improve routing/prompting over time, not to train a giant model
   from scratch.
5. **Contribution over title.** Track what was actually built (code, design, docs, tests, agents),
   not corporate roles.

## 3. Core data model

Field lists are the minimum needed to build the MVP; extend per-feature as needed.

### User
```
User {
  id, handle, name, email, avatar
  bio, city, timezone
  skills: string[]            // e.g. ["React", "Postgres"]
  connectedProviders: AIProviderCredential[]   // BYO API keys/OAuth for Claude/GPT/DeepSeek/...
  createdAt
}
```

### Project
```
Project {
  id, name, slug, tagline, description
  ownerId: User
  stack: string[]
  visibility: "public" | "unlisted" | "private"
  forkedFrom: ProjectId | null        // "inspired by" — see §7
  activeBuilderCap: number = 6        // configurable per project, default 6
  createdAt, updatedAt
}
```

### ProjectMembership (drives the 6-active-builder model)
```
ProjectMembership {
  id, projectId, userId
  state: "active" | "idle" | "historical"
  role: "builder" | "tester" | "investor"     // access tier, not a title
  joinedAt, leftAt
  contributionSummary: { commits, proposals, tasksClosed, agentsShipped }
}
```
Invariant enforced server-side: `count(state == "active") <= project.activeBuilderCap`.
When an active member goes idle/leaves, the next accepted join-request can move to active.
`historical` members are never deleted — they're the permanent contributor record.

### Branch / Proposal (Git-like, but proposal is the primary user-facing object)
```
Branch { id, projectId, name, baseBranchId, createdBy, createdAt }

Proposal {
  id, projectId, branchId, authorId
  title, description
  kind: "code" | "design" | "feature" | "docs" | "agent"
  status: "open" | "changes_requested" | "approved" | "merged" | "rejected"
  diffRef                       // pointer into VCS layer (see §12, git-backed initially)
  reviews: Review[]
}

Review { id, proposalId, reviewerId, verdict: "approve"|"request_changes"|"comment", body }
```
Contributors never write directly to `main`; everything lands via Proposal → review → merge,
mirroring GitHub's model but framed as "propose an alternative," not "open a PR," to match the
product's non-corporate tone.

### Task
```
Task {
  id, projectId, title, description
  status: "todo" | "in_progress" | "review" | "done"
  source: "human" | "ai_extracted"     // see §5.3
  assignee: UserId | AgentId | null
  linkedProposalId, linkedConversationItemId
}
```

### ProjectRelationship (connect projects — §8)
```
ProjectRelationship {
  id, fromProjectId, toProjectId
  kind: "integration" | "partnership" | "dependency" | "service" | "revenue" | "tech_collab" | "merger_interest"
  status: "proposed" | "accepted" | "declined" | "active"
  proposalNote
}
```

### PartnershipProposal (external company — §9)
```
PartnershipProposal {
  id, projectId, targetCompanyName
  problem, proposedSolution, prototypeUrl
  technicalIntegration, apiRequirements
  expectedUsers, businessModel, team, demoUrl, benefitsToCompany
  status: "draft" | "submitted" | "in_discussion" | "accepted" | "declined"
}
```
This object is a structured pitch artifact only. It never calls a third-party API on the user's
behalf beyond what that company's own public API/ToS permits — see §14 (compliance).

### Agent (marketplace — §10)
```
Agent {
  id, creatorId, name, description
  supportedTech: string[]
  version, changelog: AgentVersion[]
  pricing: { model: "per_execution"|"credits"|"subscription", amount }
  stats: { executions, successRate, rating, projectsUsedIn }
}

AgentExecution {
  id, agentId, projectId, invokedBy, taskId
  input, output, cost, providerUsed, createdAt
}
```

### AI orchestration objects (§5)
```
ModelProvider { id, name, capabilities: string[], costProfile, authMode }

ModelInvocation {
  id, projectId, taskId
  providerId, promptGenerated, rawOutput
  humanEdited: boolean, accepted: boolean
  createdAt
}

ConversationItem {
  id, projectId, sourceConversationId
  kind: "casual" | "idea" | "suggestion" | "decision" | "requirement" | "task" | "question" | "bug"
  text, confidence, extractedAt
  promotedToTaskId: TaskId | null    // set once a human confirms it becomes a Task
}
```

### Contribution ledger (later — §11)
```
ContributorLedger {
  id, projectId, userId
  mechanism: "revenue_share" | "milestone_bonus" | "equity"   // equity requires legal review, §14
  amount/percent, vestingRule, status
}
```

## 4. System architecture (services)

```
                         ┌────────────────────┐
                         │   Web / Mobile UI   │
                         └─────────┬───────────┘
                                   │
                         ┌─────────▼───────────┐
                         │   API Gateway / BFF  │
                         └───┬───────┬─────┬────┘
             ┌───────────────┘       │     └───────────────┐
             │                       │                      │
   ┌─────────▼────────┐   ┌──────────▼─────────┐  ┌─────────▼──────────┐
   │ Identity & Auth   │   │  Project Service    │  │ Discovery / Search  │
   │ (accounts, OAuth) │   │ (files, tasks,      │  │ (projects, builders,│
   └───────────────────┘   │  branches, proposals)│  │  agents)            │
                            └──────────┬──────────┘  └─────────────────────┘
                                       │
              ┌────────────────────────┼─────────────────────────┐
              │                        │                         │
   ┌──────────▼─────────┐  ┌───────────▼───────────┐  ┌──────────▼──────────┐
   │ Realtime/Collab Svc │  │ Platform AI            │  │ Agent Marketplace &  │
   │ (chat, presence,    │  │ Orchestration Service  │  │ Billing/Metering Svc │
   │  WebRTC signaling)  │  │  - Model Router        │  └──────────────────────┘
   └──────────┬──────────┘  │  - Provider Adapters   │
              │             │  - Conversation Intel.  │
              │             │  - Prompt Generator      │
              │             │  - Project Memory Store  │
              │             └───────────┬─────────────┘
              └─────────────consent-gated stream────────┘
                                       │
                         ┌─────────────▼─────────────┐
                         │  External AI Providers      │
                         │  Claude / GPT / DeepSeek /   │
                         │  Gemini / OSS / future        │
                         └───────────────────────────┘
```

All services talk through the API gateway for client-facing calls and an internal event bus
(project.updated, conversation.item_extracted, proposal.opened, agent.executed, …) so the AI
orchestration service and search/discovery stay in sync without tight coupling.

## 5. AI orchestration layer (the differentiator)

### 5.1 Provider abstraction

No app code calls Claude/GPT/DeepSeek SDKs directly. Everything goes through one interface:

```ts
interface AIProvider {
  id: string;                          // "claude", "openai-gpt", "deepseek", ...
  capabilities: Capability[];          // e.g. ["code-gen", "reasoning", "long-context"]
  costProfile: { inputPer1k: number; outputPer1k: number };

  invoke(request: {
    task: TaskDescriptor;
    context: ProjectContext;           // trimmed, relevant slice — see §5.5
    prompt: string;
  }): Promise<ProviderResult>;
}
```
Adding a provider = writing one adapter implementing this interface + registering its
capabilities. Nothing else in the app changes.

### 5.2 Model Router

A capability registry + routing policy, not a model itself:

```
route(task) →
  1. classify task type (backend / frontend / requirements / testing / design / ...)
  2. look up providers whose capabilities match
  3. apply routing policy:
       - user's explicit pin (project settings: "backend always → DeepSeek"), else
       - platform AI's recommendation (based on capability fit + historical outcome data, §16), else
       - user picks manually at the point of use
  4. return provider + generated prompt
```
Users can always override: manual model selection is a first-class UI affordance, not a fallback.

### 5.3 Conversation → project intelligence pipeline

Consent-gated (recording/transcription requires explicit per-session opt-in from all
participants, not just the room owner):

```
live audio/video/chat + project files + code + existing requirements + history
  → speech-to-text / multimodal transcription
  → conversation understanding
  → intent extraction, classified as:
       casual | idea | suggestion | decision | requirement | task | question | bug
  → ConversationItem records (confidence-scored, NOT auto-applied)
  → human reviews a proposed batch ("3 decisions, 2 tasks detected — confirm?")
  → confirmed items become Task / requirement records
  → prompt generation for the selected/recommended model
  → model invocation
  → human approval of output
  → project update (task closed, proposal opened, doc updated)
```
Key constraint from the spec: **not every sentence is an instruction.** The classifier's job is
precision on "decision" and "task" categories; casual chat should mostly land as noise, and the
UI should make it trivial to dismiss a wrong extraction.

### 5.4 Multi-model collaboration & conflict surfacing

When more than one provider is invoked for related sub-tasks (e.g., Claude on frontend,
DeepSeek reviewing backend), the orchestration service diffs their outputs/recommendations. On
disagreement it does not silently pick one — it renders both positions with tradeoffs and routes
to a human decision point (a Proposal-like object: "Two models recommend different approaches").

### 5.5 Project memory

A per-project context store (structured facts + embeddings) holding: goals, architecture
decisions, design-system tokens, coding standards, accepted/rejected proposals, prior AI
outputs, and contributor notes. Every provider invocation pulls a relevance-ranked slice of this
store rather than the user re-explaining the project each time. This is the component most worth
treating as genuinely proprietary — it's what makes routing/prompting improve over time (§16),
independent of which foundation model wins the model war.

## 6. Contribution & version-control system

- Contributors work in **Branches**; direct writes to a project's main line are not allowed past
  the owner.
- A **Proposal** wraps a branch with intent (title/description/kind) so non-code contributions
  (a design alternative, an onboarding rewrite, a new agent) fit the same review lifecycle as
  code.
- Owner (or delegated reviewers) can review, request changes, compare against main, reject, or
  approve+merge. Full history is preserved — merges don't rewrite past state.
- Underlying VCS: back this with real Git initially (one repo per project) rather than inventing
  a bespoke version-control model. `Branch`/`Proposal` are a product-layer wrapper around Git
  branches/PRs so tooling (diffing, merge, blame) is inherited, not rebuilt.

## 7. "Inspired by" (forking without auto-collaboration)

Creating a new project from an existing one:
- Copies structure/description as a starting point (like a GitHub fork), but
- **Does not** add the creator as a contributor to the original, and
- **Does not** add the original owner as a contributor to the new project.
- New project stores `forkedFrom` and renders "INSPIRED BY: {original}" with attribution.
- License/attribution terms come from the original project's declared license (a required field
  on `Project`, defaulting to something explicit, not "all rights reserved by default with no
  label" — undecided license is itself a footgun worth flagging back to the user before build).

## 8. Connecting independent projects

`ProjectRelationship` records typed, bidirectional-visible links between projects that remain
independently owned (integration, partnership, dependency, service, revenue relationship, tech
collaboration, merger interest). Proposing a connection is symmetric to proposing to join a
build: the target owner accepts/declines. The discovery UI should render this as a graph (already
implied by "the platform should visualize these relationships" in the spec) — worth a dedicated
project-relationship graph view in a later phase, not MVP.

## 9. External company partnerships

`PartnershipProposal` is a structured pitch object (problem, solution, prototype, technical
integration, API requirements, expected users, business model, team, demo, benefits to the
company) that a builder assembles and can share/export. The platform's job stops at making this
easy to construct and present — it does not call the target company's API on the builder's
behalf, does not claim any relationship exists until the company confirms, and never works around
another company's stated ToS/permissions. This is a proposal/CRM object, not an integration
runtime.

## 10. Agent marketplace & economics

- Agents are versioned, rated, priced (`per_execution | credits | subscription`), and track
  `executions / successRate / rating / projectsUsedIn`.
- `AgentExecution` records cost, provider used, and output per invocation for billing and
  auditability.
- Revenue split: platform fee + creator payout, net of underlying model provider cost. This needs
  a real payments/metering service (Stripe Connect-style split payouts are the standard shape)
  — not MVP-critical, but the schema above should exist from day one so agent usage is metered
  even before payouts go live.

## 11. Realtime collaboration (voice/video/chat)

- Chat: standard per-project message log (already modeled in the prototype).
- Voice/video: WebRTC, SFU-backed (e.g., LiveKit/mediasoup-class infra) for group calls with
  screen share; signaling through the Realtime/Collab service.
- The AI conversation pipeline (§5.3) taps this stream only with explicit, per-session consent
  from every participant — this needs to be enforced at the infra level (no transcription
  pipeline subscribes to a room that hasn't opted in), not just a UI checkbox.

## 12. Reputation & profiles

Profiles surface demonstrated work only: projects, contributions (by kind), skills/stack, agents
created and their performance, collaboration history, reviews. No follower counts, no feed of
posts — "show what you build" is a data-model constraint (the profile query literally has no
access to a content/post table), not just a design choice.

## 13. Fundraising & contributor economics (secondary, later)

Both explicitly out of MVP per the spec. Flag now because they carry legal weight: any
equity/revenue-share/securities-like feature needs counsel review before it ships, regardless of
engineering readiness. Keep `ContributorLedger` and funding objects schema-ready but feature-flagged
off until that review happens.

## 14. Compliance & trust constraints (cross-cutting)

- Partnership proposals and project-to-project integrations must operate strictly within target
  APIs' published terms — no scraping/bypassing restrictions.
- Consent gating on AI observation of live conversations is a hard requirement, not a nice-to-have.
- Equity/investment/revenue-share features are legally gated (§13).
- Model-agnostic architecture means users can bring their own provider credentials — those
  credentials need per-user encrypted storage and must never cross project boundaries without
  explicit sharing.

## 15. MVP scope → architecture mapping

| Spec MVP item | Backing component | Status vs. `draft-flow.jsx` |
|---|---|---|
| User accounts | Identity & Auth service | UI mocked (`AuthSheet`), no real backend |
| Developer profiles | Profile service (read model over User + contributions) | Not built |
| Project creation | Project service | UI mocked (`PromptScreen`), no persistence |
| Project discovery | Discovery/Search service | UI mocked (`DiscoverScreen`) with static data |
| JOIN BUILD | ProjectMembership + request/accept flow | UI mocked (`requestJoin`, `JoinRequestToast`) |
| 6-active-builder cap | `activeBuilderCap` invariant, server-enforced | UI reflects the concept (`RosterSheet`) but not enforced |
| Project workspace | Project service (files/tasks/branches) | Only a fake CRM preview (`BuildPage`) exists |
| Basic Git/version control | Git-backed Branch/Proposal layer | Not built |
| AI provider connections | Provider abstraction + credential storage | Not built |
| Platform AI orchestration | Orchestration service + Model Router | Not built |
| Basic audio/video | Realtime/Collab service (WebRTC) | UI mocked (`VideoPage`/`VideoFocus`), no real media |
| Live chat | Realtime/Collab service | UI mocked (`ChatPage`), no persistence/real-time transport |
| Conversation → task extraction | Conversation Intelligence pipeline | Not built |
| Contributor history | ProjectMembership historical records | UI mocked (`RosterSheet` idle/active split) |

Read straight: **the prototype is a faithful UI skeleton for roughly a third of the MVP list**
(discovery, join, workspace shell, roster, chat/video surfaces) and **has no backend for any of
it**. The other two-thirds (auth, git, AI orchestration, conversation intelligence, real
realtime transport) don't exist yet in any form.

## 16. Phased roadmap

**Phase 0 (done):** Click-through UI prototype (`draft-flow.jsx`) proving the interaction model.

**Phase 1 — MVP (spec's list):** Real accounts, project CRUD + discovery, JOIN BUILD with
enforced active-builder cap, Git-backed workspace, provider-abstraction AI connections (BYO
keys), first cut of the orchestration service (routing only — conversation intelligence can start
as manual "summarize this conversation" rather than always-on), real chat, basic WebRTC
video/voice, contributor history.

**Phase 2:** Always-on (consent-gated) conversation intelligence, multi-model comparison/conflict
surfacing, agent marketplace (creation + usage, metering only — no payouts yet), project-to-project
connections + relationship graph, "inspired by" forking.

**Phase 3:** Agent monetization/payouts, external company partnership proposal tooling, deployment
integrations (web/mobile hosting, CI), advanced reputation, and — only after legal review —
fundraising and contributor economics.

**Ongoing (per §16 of the spec, "most important AI development principle"):** log the full
`conversation → extracted item → generated prompt → selected model → output → human edit →
accepted/rejected → code change → test result → outcome` chain (with consent) from Phase 1
onward. This is the training signal for improving routing and prompt generation later — it should
be instrumented from day one even though nothing consumes it until Phase 2+.

## 17. Open questions for you

1. **License default** for projects (needed before "inspired by" attribution means anything).
2. **VCS choice** — real Git per project (recommended, §6) vs. a custom lightweight model — any
   constraint pushing away from Git (e.g., non-code projects like pure design work)?
3. **Realtime infra** — self-hosted SFU (LiveKit/mediasoup) vs. a managed provider (Twilio/Daily/
   LiveKit Cloud) for the MVP voice/video, given team size and timeline?
4. **First two providers** to wire into the Model Router for Phase 1 (spec mentions Claude,
   ChatGPT, DeepSeek, Gemini, OSS — doesn't need to be all five on day one).
5. **Stack** for the actual product build (the prototype is React + Tailwind; confirms the
   frontend direction, but backend language/framework and hosting aren't decided yet).
