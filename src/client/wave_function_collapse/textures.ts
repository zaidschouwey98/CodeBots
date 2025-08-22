import type {TextureName} from "../spritesheet_atlas";

export type EdgeName = "grass" | "path";
export type Edge = EdgeName[];

export type Texture = {
    name: TextureName;
    weight: number;
    edges: Edge;
    rotation: number;
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
        name: "grass",
        weight: 100,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "grass",
            "grass",
        ],
    },
    {
        name: "path_i",
        weight: 4,
        rotation: 0,
        edges: [
            "grass",
            "path",
            "grass",
            "path",
        ],
    },
    {
        name: "path_u",
        weight: 2,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "grass",
            "path",
        ],
    },
    {
        name: "path_l_1",
        weight: 3,
        rotation: 0,
        edges: [
            "path",
            "grass",
            "grass",
            "path",
        ],
    },
    {
        name: "path_l_2",
        weight: 3,
        rotation: 0,
        edges: [
            "grass",
            "grass",
            "path",
            "path",
        ],
    },
    {
        name: "path_t",
        weight: 8,
        rotation: 0,
        edges: [
            "path",
            "path",
            "grass",
            "path",
        ],
    },
    {
        name: "path_x",
        weight: 10,
        rotation: 0,
        edges: [
            "path",
            "path",
            "path",
            "path",
        ],
    },
];

export default textures;
