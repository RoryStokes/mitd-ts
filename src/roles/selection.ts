import {Role, Faction} from ".";

/** Calculates the total power of the roles in each faction
 * @param roles: The set of roles to compute the power for
 * @return A mapping of Faction to the total power of the roles in that faction
 */
export const power = (roles: Role[]): Partial<Record<Faction, number>> =>
  roles.reduce(
    (power, role) => ({
      ...power,
      [role.faction]: (power[role.faction] || 0) + role.power,
    }),
    {} as Partial<Record<Faction, number>>
  );

/** Checks the validity of a given set of Roles
 * @param roles: Set of Roles to validate
 * @return True if the set is valid, false otherwise
 */
export const isValid = (roles: Role[]): boolean =>
  roles.every((role) => role.isValid(roles));

/** Generates random valid set of Roles sampled with replacement, weighted according to roles.weight
 * @param pool: List of all available Roles to draw from
 * @param n: Number of Roles in generated set
 * @return List of Roles
 */
export const random = (pool: Role[], n: number): Role[] => {
  /** Sum of all weights for roles in pool */
  const totalWeight = pool.reduce((total, role) => total + role.weight, 0);

  /** Discrete cumulative density function for roles in the pool taking into account the weights.
   * i.e. cdf[i] is the sum of pool[j].weight / totalWeight for all j < i
   */
  const cdf = pool.reduce((cdf, role, i) => {
    cdf[i + 1] = cdf[i] + role.weight / totalWeight;
    return cdf;
  }, new Array(pool.length + 1).fill(0));

  while (true) {
    /** Random list of roles sampled with replacement, weighted according to roles.weight */
    const roles = new Array(n).fill(0).map((i) => {
      // Choose a point in the cdf
      const x = Math.random();

      // Select the role corresponding to that point
      const index = cdf.findIndex((weight) => weight > x) - 1;
      return pool[index];
    });

    if (isValid(roles)) {
      return roles;
    }
  }
};

const nSets = 100;

/** Computes the cumulative density function of the normal distribution with mean 0 and standard deviation 1 */
export const normalcdf = (x: number): number => {
  const z = x / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  const sign = z < 0 ? -1 : 1;
  return (1 / 2) * (1 + sign * erf);
};

/** Selects a set of Roles according to some balance heuristic. Sets are selected such that the
 *  heuristic will be distributed about 0 with standard deviation 1.
 * @param pool: List of all available Roles to draw from
 * @param n: Number of Roles in generated set
 * @param heuristic: Function mapping the power levels of the factions to a single number
 * @return List of Roles
 */
export const balanced = (
  pool: Role[],
  n: number,
  heuristic: (x: Partial<Record<Faction, number>>) => number
): Role[] => {
  /** List of nSets valid sets and their corresponding heuristic */
  const sets = new Array(nSets).fill(0).map((i) => {
    const set = random(pool, n);
    return {
      set,
      heuristic: heuristic(power(set)),
    };
  });

  /** Unique values taken by the heuristic */
  const heuristics = Array.from(new Set(sets.map((s) => s.heuristic))).sort((a, b) => a - b);

  /** Midpoints between the heuristic values of consecutive steps */
  const midpoints = heuristics.map((_, i, heuristics) =>
    i + 1 < heuristics.length ? (heuristics[i] + heuristics[i + 1]) / 2 : Infinity
  );

  const x = Math.random();

  const index = midpoints.findIndex((midpoint) => normalcdf(midpoint) >= x);
  const h = heuristics[index];
  const selected = sets.filter((set) => set.heuristic == h);

  return selected[Math.floor(Math.random() * selected.length)].set;
};
