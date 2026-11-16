# 100 — Operational reliability objectives: SLI, SLO, error budgets and mission metrics

## Measure service as users experience it

Operational reliability objectives convert user expectations and mission needs into measurable indicators. Google SRE distinguishes service level indicators (SLIs), objectives (SLOs) and agreements (SLAs). An SLI is a quantitative measure of service behavior; an SLO sets the target; an SLA specifies commitments and consequences. [S274]

A server-up metric may not capture whether users can complete a task. Measure successful user-visible requests, task completion, end-to-end latency, freshness, durability or mission throughput where those represent the service outcome.

## Build good SLIs

For each SLI, specify:

- user or mission journey represented;
- event population and denominator;
- success/failure definition;
- measurement location;
- aggregation window and percentile/rate;
- exclusions and data-quality conditions;
- source of telemetry and missing-data behavior.

Common SLI categories include availability, latency, throughput, correctness, durability, freshness, capacity, recovery and task completion. For storage, durability and data integrity may be as important as availability. [S274]

## SLOs and budgets

An SLO is not a promise of perfection. A target should balance risk, user expectations, cost, complexity and pace of change. For services using a time-window or event-based error budget, the remaining budget is the allowed failure fraction within the chosen measurement period. A 99.9% objective has a 0.1% error budget under the same definition; it does not mean every error is equally consequential.

Error budgets can align product and operations teams on when to slow changes, invest in reliability or accept risk. Google's SRE guidance frames reliability as a risk-management problem and warns that extreme reliability can impose nonlinear resource and opportunity costs without improving users' real experience. [S275]

## Do not export the SRE model blindly

An error budget can help manage a software service where risk tolerance is explicitly chosen. It is not a substitute for safety constraints or regulatory requirements. A nuclear protection function, aircraft control channel, medical device alarm or industrial interlock may have mandatory risk criteria that cannot be relaxed merely because a budget remains. In such systems, service-level objectives complement—but do not replace—hazard analysis, safety assurance, proof/test evidence and operating limits.

## Decompose system-level reliability

A mission thread may depend on multiple services, networks, operators, power, identity, data, suppliers and physical subsystems. End-to-end success is not the same as any one component's uptime. Include common dependencies and correlated failures, degraded modes, time constraints and recovery. Service-level objectives should connect to mission-effectiveness measures.

## Operational control loop

1. define user/mission outcome;
2. select and instrument SLIs;
3. establish SLOs with users and risk owners;
4. define alerting and error-budget policy;
5. monitor trends and error-budget burn;
6. investigate incidents and correct systemic causes;
7. review whether objectives and measurement remain relevant after product changes.

## Practical deliverable

Create SLOs for a hospital scheduling and emergency dispatch platform. Define end-to-end success, p95/p99 latency, data freshness, durability and recovery. Show how one dependency outage affects mission throughput, and explain which service SLOs are flexible and which safety/privacy requirements are not.

## Source limitations

Google SRE is practitioner literature about online services. Its methods need adaptation for CPS, regulated, safety-critical and mission systems. [S274, S275]
