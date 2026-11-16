# 86 — Product-line engineering: commonality, variability and platform governance

## Product-line thinking

Product-line engineering develops a portfolio of related products from a managed set of shared core assets while explicitly managing permitted variation. It applies to hardware, software, systems, services and mixed product families. The objective is not maximum reuse; it is economically and technically justified reuse under controlled variation.

A product-line architecture separates what is common from what varies, identifies variation points, and specifies how product configurations are selected and verified. SEI material treats product-line engineering as a coordinated set of activities spanning domain understanding, requirements, architecture, component development, testing, integration and configuration management. [S251]

## Commonality and variability model

- **Commonality:** features, interfaces, processes, components or constraints shared by all or a defined subset of products.
- **Variability:** controlled differences among products, including optional, alternative, range-based, binding-time or deployment-specific choices.
- **Variation point:** an explicit location where a product family permits a choice or substitution.
- **Variant:** a selected realization of a product-line option.
- **Core asset:** reusable requirements, architecture, components, test assets, toolchains, production processes or documentation.

A variability model must be connected to product requirements and architecture. A feature that is “optional” in a sales configuration but has dependencies in safety software is not safely optional without explicit constraints.

## Product-line engineering workflow

1. Define the product family, market/mission segments and product boundaries.
2. Analyze common needs, domain rules, mandatory constraints and variation drivers.
3. Build a feature/variability model with dependencies, exclusions, cardinalities and configuration rules.
4. Derive product-line requirements and a reference architecture.
5. Define variation mechanisms (plug-ins, parameterization, compile-time options, hardware modules, process alternatives).
6. Assess each mechanism against quality attributes, safety/security boundaries, product cost and complexity.
7. Build core assets and verify them for the contexts in which they will be reused.
8. Generate product configurations and validate the selected combination for each product.
9. Maintain a compatibility matrix, variant-specific tests and configuration records.
10. Manage evolution of the family, including retirement of obsolete variants.

## Variability has a cost

Every option adds possible configurations, tests, documentation, training, operational support and failure combinations. If there are independent binary options, the theoretical configuration space can grow as \(2^n\), although constraints reduce the feasible set. The real burden includes interactions among variants, dependencies, supplier combinations, deployment environments and update paths.

A platform team should track:

- number of supported configurations and active variants;
- percentage of reused core assets and their change frequency;
- variant-specific defect rates;
- time to configure and validate a new product;
- cross-product regression escape rate;
- unsupported/unknown configurations in operation;
- variability debt (features with unclear ownership or unused options).

## Architectural patterns

- **Reference architecture:** common structural foundation with explicit extension points.
- **Feature model:** represents mandatory, optional, alternative and dependency relationships.
- **Software product line:** reusable requirements/architecture/components plus systematic product derivation.
- **Modular platform:** stable interfaces and capability modules, with versioned contracts.
- **Configurable product:** parameterization or deployment selection from a controlled feature set.

A modular monolith, microservice family or hardware modular design may implement a product line; the architecture style does not define product-line governance by itself.

## Failure modes

- false commonality: products appear similar but operational contexts differ materially;
- accidental variability: options are introduced without a business/mission need;
- combinatorial test explosion: every combination is assumed supported;
- hidden coupling: variant A silently requires variant B or a particular deployment;
- platform monoculture: common core defects affect every product;
- unmanaged divergence: product teams fork the platform and lose compatibility;
- reuse without assurance: component evidence is carried into a context where assumptions do not hold.

## Practical deliverable

Design a product-line architecture for three classes of autonomous inspection device. Produce a feature model with at least 15 features, explicit dependencies, a shared safety kernel, two optional sensors, multiple communication profiles, configuration rules, risk-based test selection and a variant support policy. Analyze the effect of one change to the shared update mechanism across all product variants.

## Source limitations

The core SEI product-line report is foundational and dates from 2001. Use it for modeling concepts and supplement it with current architecture, product governance and domain-specific assurance. [S251]
