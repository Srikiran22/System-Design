# 40 — Enterprise architecture, business process and governance

## Enterprise architecture connects business intent to change

Enterprise architecture (EA) describes the business, information, application, technology and operating structures needed to move from a current state to a target capability. Its unit of analysis is broader than one application. It deals with portfolios, capabilities, value streams, standards, shared platforms, integration, risk and transformation roadmaps.

## The TOGAF method

The TOGAF Standard, 10th Edition organizes fundamental content around core concepts, Architecture Development Method (ADM), techniques, applying the ADM, architecture content and EA capability/governance. Series guides extend application. A corrigendum was applied in May 2025 according to the publisher page. [S126]

Use ADM as a disciplined cycle: establish architecture capability and principles; define architecture vision and scope; develop business, data, application and technology views; identify opportunities and solutions; plan migration; govern implementation; and manage change. Tailor iteration and deliverables to the organization's decision needs.

## Capability and value-stream analysis

- **Capability map:** what the organization must be able to do, independent of the current org chart or software catalog.
- **Value stream:** how stakeholder value moves from need to outcome across stages and handoffs.
- **Business process:** the ordered activities, decisions, events, roles and information that realize work.
- **Operating model:** how people, processes, technology, governance and partners coordinate.
- **Application portfolio:** systems supporting capabilities and value streams, with lifecycle, ownership, risk and cost.

This analysis prevents “modernize the application” from being mistaken for “improve the business outcome.”

## BPMN

OMG BPMN 2.0.2 is intended for stakeholders who design, manage and realize business processes while being precise enough for process-model translation. It represents events, tasks, gateways, flows, pools, lanes, messages, timers and exception paths. [S127]

A BPMN diagram should define process start/end semantics, owners, message flows, subprocess behavior, exception handling, compensation, timing and data objects. Avoid decorative flowcharts that omit waiting, rework, retries and manual decision paths.

## Architecture governance

Governance is the allocation of decision rights and enforcement mechanisms—not a committee that approves every line of code. Define: principles and standards; architecture roles; decision thresholds; exception process; risk acceptance authority; review cadence; reference architectures; data and interface ownership; technology lifecycle policy; and conformance evidence.

Use the lightest mechanism that controls the risk. A highly regulated safety-critical system needs stronger baselines and evidence than an internal prototype. Governance should make constraints visible and decisions faster, not create queues that bypass engineering teams.

## Legacy modernization

Begin with capability criticality, business process dependency, data ownership, operational risk, technology obsolescence, security exposure and total lifecycle cost. Alternatives include retain, encapsulate, rehost, replatform, refactor, replace, retire and progressively strangler-migrate. “Rewrite” is not a strategy until coexistence, migration, reconciliation, rollback and service continuity are designed.

## Data and integration architecture

EA must assign data ownership, master/reference data policy, integration patterns, API/event standards, classification, retention, lineage and quality responsibilities. A shared integration platform can reduce duplication but can also become a central bottleneck or single failure domain. Federated data ownership requires common semantic, security and quality contracts. [S140]

## Architecture review questions

- Which business capabilities and value streams change?
- Which systems of record and data owners are affected?
- What is the transition state, not just target-state drawing?
- Which teams operate and fund each capability?
- What is the business case and how are benefits measured?
- Which regulations, vendor contracts and legacy interfaces constrain the roadmap?
- What is the sunset plan for duplicate systems and transitional integrations?
