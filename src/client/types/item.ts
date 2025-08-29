export const ITEM_TYPES = [
    "furnace",
    "workbench",
    "crate",
    "core",
    "stone_ore",
    "coal_ore",
    "copper_ore",
    "copper_ingot",
    "iron_ore",
    "iron_ingot",
    "wood_log",
    "wood_plank",
    "seed",
    "pickaxe",
    "shovel",
    "axe",
    "iron_rod",
    "iron_nail",
    "iron_frame",
    "iron_plate",
    "iron_reinforced_plate",
    "codebot_item",
    "cement",
    "concrete",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export type Item = {
    type: ItemType;
    amount: number;
};
