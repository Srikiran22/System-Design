# 37 — Cybersecurity architecture and systems security engineering

## Security is a system property

Security cannot be bolted onto a system at the end. Trust boundaries, identity, data flows, update channels, supplier dependencies, control-plane access, recovery and human workflows are architectural decisions. NIST SP 800-160 Vol. 1 frames systems security engineering as lifecycle engineering; NIST SP 800-207 describes zero-trust architecture; NIST CSF 2.0 structures organization-level cybersecurity risk management. [S23, S24, S129]

## Security engineering lifecycle

1. Identify assets, mission functions, stakeholders, adversaries, operating context and harm.
2. Classify information and define confidentiality, integrity, availability, privacy and safety requirements.
3. Model system boundaries, trust zones, identities, data flows, control planes, supply chains and external interfaces.
4. Identify threats, attack paths, vulnerabilities, preconditions, impact and plausible abuse cases.
5. Allocate security requirements to architecture, components, interfaces, people, processes and suppliers.
6. Implement preventive, detective, responsive and recovery controls.
7. Verify controls using reviews, tests, configuration checks, penetration testing and threat-informed exercises.
8. Operate with asset inventory, vulnerability management, logging, incident response, patching and recovery.
9. Reassess after architectural change, new integration, new threat intelligence, supplier change or incident.

## Threat modeling

A repeatable threat model starts with assets and security objectives, then maps data flows, processes, data stores, external entities and trust boundaries. Identify attacker goals, capabilities, access paths, assumptions and attack surface. STRIDE categories—spoofing, tampering, repudiation, information disclosure, denial of service and elevation of privilege—are one useful taxonomy, not a complete model of every domain. Attack trees, misuse cases, abuse stories, kill-chain analysis and privacy threat models can add other perspectives. [S154]

Each threat should record: asset; threat actor/capability; entry point; precondition; affected component; attack path; consequence; likelihood/uncertainty; existing control; mitigation owner; residual risk; and validation evidence. Avoid producing a list of threats without linking them to requirements and architecture changes.

## Zero trust is an architecture principle, not a product purchase

NIST SP 800-207 rejects implicit trust based only on network location or asset ownership. Access decisions should consider subject, device, resource, context and policy; authentication and authorization are distinct functions. A zero-trust design requires identity governance, device posture, policy decision/enforcement points, strong service identity, telemetry, segmentation and continuous evaluation. “Install a zero-trust platform” is not an architecture plan. [S24]

## Defense in depth

Use complementary controls across identity, endpoint, network, application, data, supply chain, monitoring and recovery. Defense layers should have independent failure modes and a clear owner. A web application firewall does not compensate for broken authorization; encryption does not prevent an authorized account from exporting data; immutable backups do not prevent corrupted data from being replicated before the clean recovery point is identified.

## Secure-by-design principles

- Make secure defaults the normal path; avoid optional security that must be remembered.
- Minimize attack surface, privilege and exposed interfaces.
- Separate administrative and data planes.
- Use explicit authorization at resource boundaries.
- Protect secrets, signing keys, build systems and update paths.
- Keep dependencies inventoried, pinned, reviewed and updated.
- Fail safely; do not silently weaken controls during outages.
- Log security-relevant events without exposing secrets or unnecessary personal data.
- Make vulnerabilities reportable and remediations supportable.
- Design recovery and incident response before deployment.

CISA's Secure by Design initiative emphasizes responsibility at the product/provider level; NIST SSDF structures secure software development practices. [S153, S155]

## Supply-chain and build security

The system boundary includes source repositories, developers' endpoints, CI runners, package registries, build artifacts, signing keys, dependency mirrors, container images, infrastructure-as-code, deployment credentials and suppliers. A trusted runtime can be compromised by an untrusted build path. Apply provenance, dependency scanning, signed artifacts, least-privilege CI, protected branches, reproducible or attestable builds where feasible, secrets isolation and controlled promotion between environments.

## Privacy and data protection

Minimize collection; define purpose and retention; classify and protect data; separate tenant data; control exports; propagate deletion requirements; protect backup and test datasets; and review telemetry for sensitive fields. Privacy requirements may conflict with forensic retention, legal holds, auditability and product analytics. Make the tradeoff explicit and consult applicable law/regulation.

## Cyber resilience

Assume prevention can fail. Define detection, containment, isolation, continuity, recovery, reconstitution and learning. A realistic exercise should test loss of identity infrastructure, compromise of update channels, ransomware affecting production and backup, compromised supplier, and data-integrity corruption—not only a simulated port scan. NIST SP 800-160 Vol. 2 is a systems-oriented cyber-resilience resource. [S130]

## Security architecture review

- Can every privileged path be named and justified?
- What happens if identity, DNS, time, secrets, logging or certificate services are unavailable?
- Are service-to-service calls authenticated and authorized at the resource boundary?
- Are tenant and environment boundaries real in the data plane and control plane?
- Can a compromised service access unrelated data or management capabilities?
- Can the organization identify vulnerable components and deployed versions?
- How are updates authenticated, staged, rolled back and monitored?
- What evidence proves backup confidentiality, integrity and restorability?
