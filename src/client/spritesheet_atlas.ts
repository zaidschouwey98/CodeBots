type Dimensions = {
    w: number;
    h: number;
};

export type TextureName =
    "grass" |
    "path_i" |
    "path_u" |
    "path_l_1" |
    "path_l_2" |
    "path_t" |
    "path_x" |
    "flower" |
    "furnace_off" |
    "furnace_on" |
    "workbench" |
    "core" |
    "stone" |
    "coal" |
    "copper" |
    "iron";

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

const atlas = generateAtlas("/sprites/spritesheet.png", {w: 4, h: 4}, {w: 16, h: 16}, [
    "grass",
    "flower",
    "path_i",
    "path_u",
    "path_l_1",
    "path_l_2",
    "path_t",
    "path_x",
    "furnace_off",
    "furnace_on",
    "workbench",
    "core",
    "stone",
    "coal",
    "copper",
    "iron",
]);

export default atlas;
