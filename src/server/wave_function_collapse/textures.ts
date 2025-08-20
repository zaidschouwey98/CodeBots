export type TextureName = "grass" | "rock" | "grass_rock" | "grass_corner_rock" | "rock_corner_grass";

type EdgeName = "grass" | "rock";
export type Edge = [EdgeName, EdgeName];

export type Texture = {
    name: TextureName;
    weight: number;
    edges: Edge[];
};

export const rotate = (texture: Texture, rotation: number) => {
    const newTexture = {...texture, edges: [...texture.edges]};

    for (let i = 0; i < rotation % texture.edges.length; ++i) {
        newTexture.edges.splice(0, 0, ...newTexture.edges.splice(newTexture.edges.length - 1, 1));
    }

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
        weight: 10,
        edges: [
            ["grass", "grass"],
            ["grass", "grass"],
            ["grass", "grass"],
            ["grass", "grass"],
        ],
    },
    {
        name: "rock",
        weight: 4,
        edges: [
            ["rock", "rock"],
            ["rock", "rock"],
            ["rock", "rock"],
            ["rock", "rock"]
        ],
    },
    {
        name: "grass_rock",
        weight: 4,
        edges: [
            ["grass", "rock"],
            ["rock", "rock"],
            ["rock", "grass"],
            ["grass", "grass"],
        ],
    },
    {
        name: "grass_corner_rock",
        weight: 4,
        edges: [
            ["grass", "rock"],
            ["rock", "grass"],
            ["grass", "grass"],
            ["grass", "grass"],
        ],
    },
    {
        name: "rock_corner_grass",
        weight: 4,
        edges: [
            ["rock", "grass"],
            ["grass", "rock"],
            ["rock", "rock"],
            ["rock", "rock"],
        ],
    },
];

export default textures;
