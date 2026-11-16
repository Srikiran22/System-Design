# 60 — Sustainable systems engineering and lifecycle assessment

## Sustainability belongs inside system requirements

Environmental impact is generated across the lifecycle: raw materials, manufacturing, transport, installation, operation, maintenance, upgrades and end-of-life. A product can reduce energy during use while increasing materials, water, e-waste or supply-chain impacts elsewhere. Sustainability analysis must declare the boundary, functional unit, lifecycle stages, impact categories and assumptions.

## Life-cycle assessment (LCA) logic

A conventional LCA process has four connected elements:

1. Goal and scope: decision purpose, functional unit, system boundary, allocation rules, geography and time horizon.
2. Life-cycle inventory (LCI): inputs and outputs—materials, energy, water, transport, emissions, waste and process data.
3. Life-cycle impact assessment (LCIA): translate inventory into selected impact categories using a documented method.
4. Interpretation: identify hotspots, sensitivity, uncertainty, data gaps, limitations and improvement options.

Comparisons are meaningful only when functional units and boundaries are comparable. “Per model call”, “per user”, “per transaction” or “per trained model” may produce very different rankings. Include workload quality and service outcome; minimizing energy per low-quality answer or failed transaction is not an improvement.

## AI and ICT environmental impact

ITU-T L.1801 (February 2026) applies life-cycle assessment to AI systems and also addresses second- and higher-order effects from AI use. This distinction matters: the system’s direct footprint is not the same as the societal or sector-level effects enabled by its use. [S173]

For AI workloads consider:

- Training and fine-tuning compute, repeated experiments and discarded runs.
- Inference volume, model size, context length, retrieval and orchestration overhead.
- Accelerator utilization, idle capacity, batching and latency/quality targets.
- Data center electricity and cooling assumptions, location and energy mix.
- Data storage, replication, retention and network transfer.
- Hardware manufacturing, embodied impacts, refresh and end-of-life.
- User behavior and demand rebound: lower unit cost can increase total consumption.
- The counterfactual: what process or system is replaced, and what additional activity is created?

Use measured telemetry where available, disclose provider estimate assumptions, and do not attribute a generic carbon number to an AI call without context.

## Circular design and maintainability

Circularity includes reduction, reuse, repair, refurbishment, remanufacture and recycling. Design choices include replaceable batteries, modular components, accessible fasteners, repair manuals, spare part availability, software support duration, material identification, take-back pathways and secure data sanitization. NIST’s workshop report identifies reuse, repair and recycling challenges for electronics, solar panels and batteries. [S174]

A circularity claim should identify what is actually reused/repaired/recycled, at what rate, with what quality loss, logistics and energy, and which downstream material stream receives it. “Recyclable” does not mean it is collected or recycled in practice.

## Sustainable architecture trade-offs

- Centralization can reduce duplicated idle capacity but increase network transport and concentration risk.
- Edge processing can lower communication and latency but introduce additional hardware, maintenance and e-waste.
- Longer hardware life can reduce embodied impact but may increase operating energy or security-support risk.
- Replication improves availability but increases storage and transfer costs.
- More observability can improve reliability but generate data/compute/storage overhead.
- A larger model may improve one quality metric but increase energy, latency and cost; smaller models, caching or deterministic workflows may be better.

Do not optimize one lifecycle phase while exporting impact to another. Evaluate trade-offs at the system boundary and report uncertainty.

## Minimum sustainable-design brief

- Product/mission outcome and functional unit.
- Lifecycle boundary and included/excluded processes.
- Material, energy, water, transport and data assumptions.
- Expected service life, repairability and support window.
- Energy and emissions measures per useful outcome.
- Hardware refresh, reuse, recycling and disposal plan.
- Data retention, compute demand and model/service efficiency.
- Sensitivity and uncertainty analysis.
- Rebound or higher-order effects.
- Owner, review cadence and evidence source.

## Practice

Compare two architectures for a regional AI translation service: central inference versus smaller regional edge models. Define functional units and boundaries; include hardware, energy, cooling, network traffic, latency, quality, failure recovery, hardware replacement and user demand. Show which assumptions could reverse the result.

## Sources

[S139, S152, S169, S173, S174]
