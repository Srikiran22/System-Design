# 11 — Product impact and organizational design

## Architecture changes product behavior

Architecture changes what users experience, what the business can promise, how quickly teams learn, what it costs to serve a customer, and how safely the product can evolve.

| Design property         | Product/business consequence                                                        |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Low tail latency        | Faster task completion; fewer timeouts and abandoned workflows                      |
| High availability       | Users complete critical work when needed; trust is protected                        |
| Consistent data         | Fewer duplicate orders, incorrect balances, stale entitlements, support escalations |
| Graceful degradation    | Critical tasks survive partial outages, optional features may be reduced            |
| Modifiability           | New features/policy changes without broad regression                                |
| Security/privacy        | Trust, safer integrations, lower exposure and incident cost                         |
| Accessibility/usability | More users complete tasks accurately and independently                              |
| Scalability             | Growth/spikes without runaway latency or cost                                       |
| Observability           | Faster diagnosis, shorter customer-impacting incidents                              |
| Deployability           | Controlled experimentation and faster feedback                                      |
| Cost efficiency         | Better margins/pricing flexibility; lower unit costs                                |
| Sustainability          | Lower resource use and long-term operating impact                                   |

Do not infer revenue improvement from an architecture metric without evidence. Connect it through an explicit causal chain and measure product outcomes.

## Product quality chains

Positive example: `architecture boundary → independent change → fewer coordination steps → shorter release lead time → faster customer feedback → better product adaptation`.

Counterexample: `more services → theoretical independent deployment → more on-call, service discovery, contract, network and data coordination → slower cross-team changes if ownership is weak`.

Actual effect depends on team boundaries, operating maturity, change patterns, and workload.

## Team and architecture alignment

**Conway's Law** is the observation that system designs tend to reflect the communication structures of the organizations that create them. Treat it as a useful hypothesis, not a deterministic law. Research contains supportive and qualified results [S31].

Align business capability ownership, team cognitive load, dependencies, end-to-end user outcomes, platform-team responsibilities, APIs/data/schema ownership, and incident response. A service boundary requiring constant coordination across six teams is not autonomous. A shared platform can reduce duplication or become a central bottleneck.

## Product decision questions

- Which journey matters most and what does failure cost?
- Which features differentiate the product and which are commodity?
- What is the cost of delay versus added robustness?
- Which behavior can degrade and which must remain correct?
- What does a slow/unavailable dependency do to the whole workflow?
- Does the design support experimentation without compromising integrity/privacy?
- Can support explain and resolve problems without engineering intervention?
- What is cost per successful user outcome, not only cloud spend?

## Total cost of ownership

Consider initial development and migration; infrastructure/data-transfer; observability/CI/CD/security/license costs; on-call, incident and support toil; onboarding/cognitive load; change/testing/integration costs; downtime, fraud, data loss, compliance exposure; exit and vendor lock-in.

A lower monthly cloud bill can be worse if it raises failure risk, support burden, or engineering change cost.

## Architecture-to-product review

For each major decision write: user/business outcome; technical mechanism; metric testing mechanism; product metric testing outcome; costs/negative side effects; owner/review date. Example: a read replica must specify which journey improves, tolerated staleness, p95 target, replica-lag threshold, and behavior when replica falls behind.

## Real-world caution

Shopify preserved one deployable application while enforcing module boundaries; Uber's service decomposition introduced discovery, contract, latency, and resilience problems [S16, S32]. Architecture is a product and organizational decision, not just a code organization preference.
