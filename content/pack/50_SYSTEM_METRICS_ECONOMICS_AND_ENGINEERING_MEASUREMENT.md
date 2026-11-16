# 50 — System metrics, lifecycle economics and engineering measurement

## Measure system outcomes, not activity volume

Measurement should answer a decision question. Every metric needs definition, unit, boundary, data source, frequency, owner, threshold, interpretation and known failure modes. A metric without a decision or response is decoration.

## Metric layers

| Layer                   | Example measures                                                                        | Interpretation risk                                   |
| ----------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Mission/product outcome | task completion, conversion, service access, error impact, customer outcome             | outcomes may be influenced by external factors        |
| Quality attributes      | latency percentile, availability, recovery, accuracy, maintainability, interoperability | metrics are workload- and context-dependent           |
| Engineering flow        | lead time, deployment frequency, change failure rate, recovery time                     | turning measures into quotas distorts behavior        |
| Reliability             | failure rate, MTBF/MTTR, mission success, SLO attainment                                | averages hide distributions and common-cause effects  |
| Safety/security         | hazard exposure, control effectiveness, vulnerability age, incident severity            | counts do not equal risk; under-reporting is possible |
| Data quality            | completeness, accuracy, timeliness, consistency, lineage coverage                       | a scalar score can hide critical-field errors         |
| Cost/economics          | total cost of ownership, cost per transaction, unit economics, lifecycle support cost   | allocation assumptions and externalities matter       |
| Sustainability          | energy, compute, material use, repairability, lifecycle waste                           | system boundaries and measurement methods differ      |

## Quality attribute measurement

For each quality attribute define stimulus, environment, response and measurable threshold. “99.99% availability” is incomplete without service boundary, measurement window, valid requests, planned maintenance, dependencies, user experience and exclusions. “Sub-second” requires workload, data size, percentile, warm/cold state and geography. A single average often conceals tail latency.

## Engineering economics

Total lifecycle cost includes acquisition/design, implementation, integration, verification, deployment, operations, support, training, upgrades, downtime, compliance, suppliers, technical debt, migration and disposal. Initial purchase price is only one term. In some domains cost of failure or liability dominates; in others iteration speed and opportunity cost matter.

Compare alternatives with:

- NPV/discounted cash flow where timing and cash flow assumptions are meaningful.
- Cost-benefit analysis with uncertainty and externalities.
- Cost of delay and option value for staged decisions.
- Expected loss or scenario analysis for low-probability/high-consequence risks.
- Sensitivity analysis over demand, staffing, cloud prices, reliability and replacement intervals.
- Unit economics that connect infrastructure and support cost to delivered user/business value.

## Margins and reserves

A design margin is capacity reserved against uncertainty, growth, tolerance, aging or environmental variation. Margins should be explicit, owned and tracked. Overly small margins produce fragile designs; excessively large margins can create unnecessary cost and mass/power/space burden. Margin erosion should be visible across requirements, mass, power, thermal, memory, network, schedule and cost.

## Quantitative humility

Do not multiply rough estimates as though independent probabilities are known. Distinguish measured data, model output, expert judgment and assumption. State confidence intervals or ranges when possible. Use Monte Carlo or sensitivity analysis only when input distributions and dependencies are defensible. A more elaborate model can amplify false precision.

## Metrics governance

Before publishing an engineering dashboard define: audience; decision supported; metric formula; source system; sampling/aggregation; data latency; alert threshold; ownership; response; exclusions; manipulation risk; and review date. Retire metrics that no longer change decisions.
