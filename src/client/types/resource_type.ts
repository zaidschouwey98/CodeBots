export enum ResourceType {
    WOOD,
    STONE,
    IRON,
    COPPER,
    COAL,
};

export const RESOURCE_TYPES = Object.keys(ResourceType)
    .filter(key => isNaN(Number(key)))
    .map(key => key.toLowerCase());
