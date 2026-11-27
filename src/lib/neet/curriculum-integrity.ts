import type { CourseBundleInput } from "./curriculum-schemas";

export interface CompetencyGraphNode {
  id: string;
  prerequisites: readonly string[];
  relations?: readonly { targetId: string }[];
}

export interface CompetencySkillReference {
  source: string;
  skillIds: readonly string[];
}

export interface CurriculumReferenceInventory {
  competencies: readonly CompetencyGraphNode[];
  courses: readonly {
    slug: string;
    modules: readonly {
      slug: string;
      lessons: readonly { slug: string; skillIds: readonly string[] }[];
    }[];
  }[];
  labs: readonly { id: string; skillId: string }[];
  scenarios: readonly { id: string; skillId: string }[];
  capstone?: {
    milestones: readonly { id: string; skillIds: readonly string[] }[];
  } | null;
  roleProfiles: readonly { id: string; requiredLevels: Readonly<Record<string, number>> }[];
}

/**
 * Validate graph edges against the merged persisted + proposed competency set.
 * Cycle detection is deliberately separate so callers can return a cycle-specific error.
 */
export function validateCompetencyGraphReferences(
  existing: readonly CompetencyGraphNode[],
  incoming: readonly CompetencyGraphNode[],
): string[] {
  const errors: string[] = [];
  const incomingIds = new Set<string>();
  for (const node of incoming) {
    if (incomingIds.has(node.id)) {
      errors.push(`Competency ID "${node.id}" appears more than once in the update.`);
    }
    incomingIds.add(node.id);
  }

  const merged = new Map(existing.map((node) => [node.id, node]));
  for (const node of incoming) merged.set(node.id, node);
  const knownIds = new Set(merged.keys());

  for (const node of merged.values()) {
    for (const prerequisite of node.prerequisites) {
      if (!knownIds.has(prerequisite)) {
        errors.push(
          `Competency "${node.id}" references unknown prerequisite "${prerequisite}".`,
        );
      }
    }
    for (const relation of node.relations ?? []) {
      if (!knownIds.has(relation.targetId)) {
        errors.push(
          `Competency "${node.id}" references unknown related competency "${relation.targetId}".`,
        );
      }
    }
  }

  return [...new Set(errors)];
}

export function validateSkillReferences(
  knownCompetencyIds: ReadonlySet<string>,
  references: readonly CompetencySkillReference[],
): string[] {
  const errors: string[] = [];
  for (const reference of references) {
    if (reference.skillIds.length === 0) {
      errors.push(`${reference.source} must map to at least one competency.`);
      continue;
    }
    for (const skillId of reference.skillIds) {
      if (!knownCompetencyIds.has(skillId)) {
        errors.push(`${reference.source} references unknown competency "${skillId}".`);
      }
    }
  }
  return [...new Set(errors)];
}

export function validateRoleProfileReferences(
  knownCompetencyIds: ReadonlySet<string>,
  requiredLevels: Readonly<Record<string, number>>,
  source = "Role profile",
): string[] {
  return validateSkillReferences(
    knownCompetencyIds,
    Object.keys(requiredLevels).map((skillId) => ({
      source: `${source} requiredLevels`,
      skillIds: [skillId],
    })),
  );
}

export function validateCourseBundleReferences(
  bundle: CourseBundleInput,
  existingCompetencies: readonly CompetencyGraphNode[],
): string[] {
  const incomingCompetencies = bundle.competencies ?? [];
  const errors = validateCompetencyGraphReferences(existingCompetencies, incomingCompetencies);
  const knownIds = new Set([
    ...existingCompetencies.map((competency) => competency.id),
    ...incomingCompetencies.map((competency) => competency.id),
  ]);

  const skillReferences: CompetencySkillReference[] = [];
  for (const module of bundle.modules) {
    for (const lesson of module.lessons) {
      skillReferences.push({
        source: `Lesson "${bundle.course.slug}/${module.slug}/${lesson.slug}"`,
        skillIds: lesson.skillIds,
      });
    }
  }
  for (const lab of bundle.labs ?? []) {
    skillReferences.push({ source: `Lab "${lab.id}"`, skillIds: [lab.skillId] });
  }
  for (const scenario of bundle.scenarios ?? []) {
    skillReferences.push({ source: `Scenario "${scenario.id}"`, skillIds: [scenario.skillId] });
  }

  errors.push(...validateSkillReferences(knownIds, skillReferences));
  return [...new Set(errors)];
}

/** Find all curriculum objects that would become dangling if a competency were deleted. */
export function findCompetencyReferences(
  competencyId: string,
  inventory: CurriculumReferenceInventory,
): string[] {
  const references: string[] = [];

  for (const competency of inventory.competencies) {
    if (competency.id === competencyId) continue;
    if (competency.prerequisites.includes(competencyId)) {
      references.push(`competency "${competency.id}" prerequisite`);
    }
    if ((competency.relations ?? []).some((relation) => relation.targetId === competencyId)) {
      references.push(`competency "${competency.id}" relation`);
    }
  }

  for (const course of inventory.courses) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.skillIds.includes(competencyId)) {
          references.push(`lesson "${course.slug}/${module.slug}/${lesson.slug}"`);
        }
      }
    }
  }

  for (const lab of inventory.labs) {
    if (lab.skillId === competencyId) references.push(`lab "${lab.id}"`);
  }
  for (const scenario of inventory.scenarios) {
    if (scenario.skillId === competencyId) references.push(`scenario "${scenario.id}"`);
  }

  for (const milestone of inventory.capstone?.milestones ?? []) {
    if (milestone.skillIds.includes(competencyId)) {
      references.push(`capstone milestone "${milestone.id}"`);
    }
  }

  for (const role of inventory.roleProfiles) {
    if (Object.hasOwn(role.requiredLevels, competencyId)) {
      references.push(`role profile "${role.id}"`);
    }
  }

  return references;
}
