export type Faction = "Civilian" | "Murderer";

/**
 * A game role
 * @param name: Printable name for the role
 * @param faction: Faction the role is aligned with (e.g. Civilian, Murderer)
 * @param weight: Relative probability of the role occuring (this will be modified by allowed roles and power distribution)
 * @param power: How much advantage (or disadvantage) this role confers to its faction
 * @param isValid: Is this role valid in the given Role set
 */
export type Role = {
    readonly name: string;
    readonly faction: Faction;
    readonly weight: number;
    readonly power: number;
  
    readonly isValid: (roles: Role[]) => boolean;
  };