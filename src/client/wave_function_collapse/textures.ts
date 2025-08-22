import type {TextureName} from "../spritesheet_atlas";

export type EdgeName = "grass" | "path";
export type Edge = EdgeName[];

export type Texture = {
    names: TextureName[];
    weight: number;
    edges: Edge;
    rotation: number;
    overlays: {
        probability: number,
        names: TextureName[],
    }[];
};

export const rotate = (texture: Texture, rotation: number) => {
    const newTexture = {...texture, edges: [...texture.edges]};

    for (let i = 0; i < rotation % texture.edges.length; ++i) {
        newTexture.edges.splice(0, 0, ...newTexture.edges.splice(newTexture.edges.length - 1, 1));
    }

    newTexture.rotation = newTexture.rotation + rotation % texture.edges.length;

    return newTexture;
};

export const directions = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
};

const textures: Texture[] = [
    {
        names: ["grass_1", "grass_2", "grass_3", "grass_4"],
        weight: 100,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "grass",
            "grass",
        ],
        overlays: [
            {
                probability: 0.1,
                names: ["flower_1", "flower_2", "flower_3"],
            },
            {
                probability: 0.04,
                names: ["tree_1", "tree_2", "tree_3", "tree_4"],
            },
        ],
    },
    {
        names: ["path_i"],
        weight: 4,
        rotation: 0,
        edges: [
            "grass",
            "path",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_u"],
        weight: 2,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_l_1", "path_l_2"],
        weight: 3,
        rotation: 0,
        edges: [
            "path",
            "grass",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_t"],
        weight: 8,
        rotation: 0,
        edges: [
            "path",
            "path",
            "grass",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
    {
        names: ["path_x"],
        weight: 10,
        rotation: 0,
        edges: [
            "path",
            "path",
            "path",
            "path",
        ],
        overlays: [
            {
                probability: 0.4,
                names: ["iron"],
            }
        ],
    },
];

export default textures;
