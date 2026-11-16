# 09 — Security and threat modeling

## Security is an architectural quality

Security is not a gateway, WAF, or authentication library in isolation. It depends on boundaries, identities, data flows, privileges, supply chain, deployment, logging, recovery, and people. Place controls where they protect assets and threat paths.

## Core concepts

- **Confidentiality:** information is disclosed only to authorized parties.
- **Integrity:** data and operations cannot be improperly or silently altered.
- **Availability:** authorized users can use the system when needed.
- **Authentication:** establish who/what an actor is.
- **Authorization:** determine what an actor may do to which resource and under what conditions.
- **Auditability:** retain evidence for traceability and investigation.
- **Non-repudiation:** evidence supports attribution, within key-custody/process limits.
- **Least privilege:** grant minimum access needed for the job and time.
- **Zero trust:** do not infer trust solely from network location; evaluate identity, device, context, and policy.
- **Defense in depth:** layer preventive, detective, containment, and recovery controls.

## Threat-model workflow

1. Identify assets: credentials, personal data, payment details, source code, business records, availability, model outputs.
2. Draw architecture/data-flow diagrams with trust boundaries.
3. Identify actors: customer, employee, workload identity, partner, admin, attacker, automation, supplier.
4. Identify entry points and sensitive operations.
5. Use STRIDE as prompts: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.
6. Model abuse cases and attack paths, not only normal use cases.
7. Assess likelihood, impact, exploitability, exposure, detectability.
8. Select controls and assign owners.
9. Verify with tests, review, monitoring, exercises.
10. Revisit after architecture, data, threat, or business change.

## Security architecture controls

### Identity and authorization

- Separate human, workload, and machine identities.
- Prefer short-lived credentials and managed identity where suitable.
- Enforce authorization at resource/service boundary, not only in UI.
- Check tenant and object ownership on every sensitive operation.
- Use role/attribute/policy models that fit the domain; avoid broad administrator roles.
- Review privileges and remove stale access.

### Data protection

- Classify and minimize data collection.
- Encrypt in transit/at rest where applicable.
- Control keys, rotation, recovery, and separation of duties.
- Apply retention/deletion rules to primary stores, replicas, logs, backups, derived data.
- Prevent cross-tenant leakage in cache keys, analytics, exports, search indexes, logs.

### Application/API

- Validate input at trust boundaries; parameterize queries; use safe serialization.
- Apply rate limits and resource quotas.
- Authorize object access; prevent insecure direct object references.
- Avoid leaking secrets/internals in errors.
- Authenticate webhooks; protect against replay.
- Define idempotency, contract versioning, and safe rejection semantics.

### Platform/supply chain

- Harden images and build environments; scan dependencies and images.
- Track SBOM where useful; sign/verify artifacts; protect CI/CD credentials.
- Separate development, test, production.
- Restrict network paths and administrative control planes.
- Patch, rotate, and monitor infrastructure components.

## Security second defense

If preventive auth/authorization fails, detective monitoring and containment must limit harm: immutable audit events, anomaly detection, rate/volume alerts, rapid credential revocation, tenant isolation, emergency disable controls, tested recovery. A failover control must not bypass authorization.

## Security/availability trade-offs

Stronger checks can add latency; caching must not bypass revocation or policy freshness. Strict rate limits stop abuse but can harm legitimate burst traffic; segment by identity/operation. Fail-closed protects sensitive operations but may reduce availability; decide per risk. Break-glass access is a high-value attack path; make it temporary, approved, audited, and tested. More logging aids investigation but can expose private data; redact/minimize.

## Security review questions

- Where does untrusted input enter?
- Where does identity become authorization?
- Which component reads/writes each sensitive asset?
- What if a workload identity is compromised?
- Can one tenant affect another tenant's data/capacity?
- Can logs, traces, caches, backups, or support tools leak data?
- What if secrets management or the identity provider is unavailable?
- Can deployment credentials change production security controls?
- How quickly can access be revoked and evidence preserved?
- Has compromise recovery been rehearsed?

## Standards/frameworks to study

NIST Cybersecurity Framework 2.0, NIST SP 800-53, NIST SP 800-207 (Zero Trust Architecture), OWASP ASVS, OWASP Top 10, OWASP API Security Top 10, and applicable privacy/regulatory requirements. Verify current official publication and jurisdiction before asserting compliance. Links: [S23–S28].
