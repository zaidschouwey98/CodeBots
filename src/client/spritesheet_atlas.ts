import {Assets, Spritesheet} from "pixi.js";

type Dimensions = {
    w: number;
    h: number;
};

export type TextureName =
    "grass_1" |
    "grass_2" |
    "grass_3" |
    "grass_4" |
    "path_i" |
    "path_u" |
    "path_l_1" |
    "path_l_2" |
    "path_t" |
    "path_x" |
    "furnace_off" |
    "furnace_on_1" |
    "furnace_on_2" |
    "furnace_on_3" |
    "workbench" |
    "crate" |
    "core" |
    "stone" |
    "coal" |
    "copper" |
    "iron" |
    "flower_1" |
    "flower_2" |
    "flower_3" |
    "stone_ore" |
    "coal_ore" |
    "copper_ore" |
    "copper_ingot" |
    "iron_ore" |
    "iron_ingot" |
    "wood_log" |
    "wood_plank" |
    "seed" |
    "pickaxe" |
    "shovel" |
    "axe" |
    "iron_rod" |
    "nail" |
    "iron_frame" |
    "iron_plate" |
    "reinforced_iron_plate" |
    "cement" |
    "concrete" |
    "codebot_1" |
    "codebot_2" |
    "codebot_3" |
    "codebot_4" |
    "tree_1" |
    "tree_2" |
    "tree_3" |
    "tree_4";

export const findTexture = (spriteSheets: Spritesheet[], texture: TextureName) => {
    return spriteSheets.find((spritesheet) => spritesheet.textures[texture])?.textures[texture];
};

const generateAtlas = (file: string, spriteAmount: Dimensions, assetDimensions: Dimensions, names: TextureName[]) => {
    return {
        meta: {
            image: file,
            format: "RGBA8888",
            size: {
                w: spriteAmount.w * assetDimensions.w,
                h: spriteAmount.h * assetDimensions.h,
            },
            scale: 1,
        },
        frames: names.reduce((acc, name, i) => {
            acc[name] = {
                frame: {
                    ...assetDimensions,
                    x: (i % spriteAmount.w) * assetDimensions.w,
                    y: Math.floor(i / spriteAmount.w) * assetDimensions.h,
                },
                sourceSize: assetDimensions,
                spriteSourceSize: {
                    ...assetDimensions,
                    x: 0,
                    y: 0,
                },
            };

            return acc;
        }, {}),
    };
};

const atlas = [
    generateAtlas("/assets/spritesheet.png", {w: 7, h: 7}, {w: 16, h: 16}, [
        "grass_1",
        "grass_2",
        "grass_3",
        "grass_4",
        "path_i",
        "path_u",
        "path_l_1",
        "path_l_2",
        "path_t",
        "path_x",
        "furnace_off",
        "furnace_on_1",
        "furnace_on_2",
        "furnace_on_3",
        "workbench",
        "crate",
        "core",
        "stone",
        "coal",
        "copper",
        "iron",
        "flower_1",
        "flower_2",
        "flower_3",
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
        "nail",
        "iron_frame",
        "iron_plate",
        "reinforced_iron_plate",
        "cement",
        "concrete",
        "codebot_1",
        "codebot_2",
        "codebot_3",
        "codebot_4",
    ]),
    generateAtlas("/assets/trees.png", {w: 2, h: 2}, {w: 16, h: 32}, [
        "tree_1",
        "tree_2",
        "tree_3",
        "tree_4",
    ]),
];

export const getSpritesheets = async () => {
    const spritesheetAssets = await Promise.all(atlas.map((atlas) => Assets.load({
        src: atlas.meta.image,
        data: {scaleMode: "nearest"},
    })));

    const spritesheets = spritesheetAssets.map((spritesheetAsset, i) => new Spritesheet(spritesheetAsset, atlas[i]));

    await Promise.all(spritesheets.map((spritesheet) => spritesheet.parse()));

    return spritesheets;
}
