# 69 — Systems security, cyber resilience and supply-chain assurance

## Security engineering must shape the system

Systems security engineering integrates security objectives, threats, constraints, controls and evidence throughout the system lifecycle. NIST SP 800-160 Vol. 1 Rev. 1 provides the systems-security engineering foundation; Vol. 2 Rev. 1 covers cyber-resiliency engineering [S129, S211]. Security is not a perimeter feature added after architecture.

## Threat model the system, not only the application

Model assets, mission functions, trust boundaries, actors, interfaces, identities, data flows, control planes, suppliers, deployment, update mechanisms, operators and recovery paths. Threat modeling techniques (STRIDE, attack trees, misuse/abuse cases, PASTA, LINDDUN and system-theoretic methods) expose different classes of risk. Select methods by system type and risk; do not treat any one taxonomy as exhaustive.

## Secure development and supply chain

NIST SSDF 1.1 groups practices around preparing the organization, protecting software, producing well-secured software and responding to vulnerabilities [S212]. NIST SP 800-161 Rev. 1 Update 1 extends the concern to cybersecurity supply-chain risk management [S213]. Preserve provenance for source, build, artifact, dependencies, signing, release, deployment and updates. A Software Bill of Materials (SBOM) is useful but does not itself prove that components are safe, maintained or correctly configured.

## Cyber-resilience goals

NIST SP 800-160 Vol. 2 Rev. 1 presents cyber resilience as the ability to anticipate, withstand, recover from and adapt to adverse conditions, stresses, attacks and compromises [S211]. Design tactics can include segmentation, diversity, redundancy, least privilege, deception, adaptive response, recovery and reconstitution. Each tactic has cost and can introduce complexity or correlated failure.

## Zero trust and identity

NIST SP 800-207 frames zero trust around resources rather than implicit trust based on network location or ownership [S24]. Identity, device posture, authorization, policy enforcement and continuous evaluation should be explicit. Do not confuse “zero trust” with a product or an instruction to authenticate every packet; define policy decision/enforcement points, context, session lifetime, revocation, telemetry and failure behavior.

## Security assurance artifacts

Maintain a system threat model, asset inventory, trust-boundary diagrams, security requirements, secure architecture views, control mapping, SBOM/provenance, build/release controls, vulnerability-response plan, penetration/red-team results, exception register, incident-response playbooks and recovery evidence. Map controls to threats and mission consequences; avoid checklists with no trace to risk.

## Supply-chain review checklist

- Who develops, builds, signs, distributes, hosts and updates each component?
- Are build environments isolated, reproducible and access-controlled?
- Are dependencies pinned and monitored for vulnerabilities and maintainer abandonment?
- Can release artifacts be traced to source, build process and approver?
- Are secrets, signing keys and deployment credentials appropriately scoped and rotated?
- Can compromised components be revoked, isolated and rolled back?
- Are firmware, hardware, cloud services, model weights, datasets and agent tools included where relevant?
- Are supplier assurance claims supported by evidence and contract obligations?

## Failure patterns

Shared identity, DNS, secrets, deployment, update or management infrastructure can defeat apparent redundancy. A recovery process that requires the compromised identity plane is not an independent recovery path. A backup with no restore drill is an assumption, not evidence.
