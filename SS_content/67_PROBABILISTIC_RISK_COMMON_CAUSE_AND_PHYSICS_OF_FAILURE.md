# 67 — Probabilistic risk, common-cause failure and physics of failure

## Quantitative risk is a model, not a number detached from assumptions

Probabilistic Risk Assessment (PRA) develops scenarios that can lead to loss, models event combinations and dependencies, quantifies likelihood and consequence where feasible, analyzes uncertainty and communicates risk for decisions. NASA's PRA procedures guide addresses scenario development, data, dependency modeling, human reliability and risk-informed decisions [S203]. NASA's Bayesian handbook covers parameter estimation and combining evidence sources [S204].

## Fault trees and event trees

A fault tree is a top-down logical model of how a defined top event can occur through basic events and gates (AND, OR, voting and other modeled relations). An event tree follows initiating events through success/failure of safety functions to end states. A fault tree is not a complete accident model: its boundaries, dependencies, common-cause assumptions and basic-event probabilities determine what conclusions can be drawn. NASA's Fault Tree Handbook is a detailed aerospace reference [S132].

## Common-cause failure (CCF)

A CCF is multiple component failures attributable to a shared cause or coupling mechanism. Redundant components can fail together due to shared design defects, software, utilities, cooling, environment, maintenance, configuration, manufacturing batch, operator action, cybersecurity compromise or common data. The IAEA procedure document describes analysis of CCF in probabilistic safety assessment [S206].

Analyze independence rather than assuming it. Ask whether the channels share:

- requirements or software implementation;
- supplier, manufacturing process or component lot;
- power, cooling, network, clocks, identity, DNS or management plane;
- environmental exposure or physical route;
- maintenance procedure, operator or credentials;
- configuration, update mechanism or threat surface.

Diversity only helps when the failure mechanisms are sufficiently independent. Two replicas behind the same identity provider or routing control plane are not independent recovery paths.

## Bayesian evidence updating

Bayesian inference combines prior beliefs and likelihood of observed evidence to produce a posterior distribution. This is useful when failure data are sparse and expert, test, fleet and physics evidence must be integrated. Record priors, data source, likelihood model, population assumptions, censoring, exposure time and sensitivity. Bayesian updating does not manufacture information from no evidence.

## Physics of Failure (PoF)

PoF evaluates the physical mechanisms and stresses that can cause degradation or failure (thermal cycling, vibration, corrosion, fatigue, radiation, wear, electromigration, moisture, mechanical stress, etc.). NASA's 2024 methodology handbook provides PoF-based reliability assessment guidance [S207]. A model must be tied to failure mechanism, material/process assumptions, stress profile, test condition and uncertainty; do not extrapolate beyond its validated envelope.

## Reliability growth and FRACAS

Use failure definitions and scoring criteria; capture failures; analyze root causes; approve corrective actions; verify effectiveness; feed results into reliability models and design changes. Reliability growth curves are informative only with consistent failure counting, test exposure, fix verification and configuration control.

## Repairable systems and availability

Do not apply non-repairable lifetime formulas uncritically to repairable fleets. Define operating states, downtime, maintenance/logistics delays, spare availability, administrative delay, mission profile, repair policy and common dependencies. Availability may be approximated as MTBF/(MTBF+MTTR) only under appropriate assumptions; operational availability usually requires a broader supportability view.

## Uncertainty classes

Distinguish aleatory variability (inherent randomness) from epistemic uncertainty (limited knowledge). Propagate uncertainty through the model, identify dominant contributors, and report confidence/credible intervals or sensitivity, not a single point estimate alone. Preserve model limitations and known missing failure modes.

## Review checklist

- Is the loss/top event precisely defined?
- Are initiating events and end states complete enough for the decision?
- Are dependencies and CCF represented?
- Are probabilities based on relevant population and configuration data?
- Are test and fleet exposures comparable?
- Are human actions, software and latent conditions included where material?
- Does the analysis change the decision, and which assumptions could reverse it?
