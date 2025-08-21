export type TextureName = "grass" | "rock" | "grass_rock" | "grass_corner_rock" | "rock_corner_grass";

type EdgeName = "grass" | "rock";
export type Edge = [EdgeName, EdgeName];

export type Texture = {
    name: TextureName;
    weight: number;
    edges: Edge[];
    rotation: number;
};

export const getTextureAssetName = (name: TextureName) => `/sprites/${name}.png`;

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
        weight: 10,
        rotation: 0,
        edges: [
            ["grass", "grass"],
            ["grass", "grass"],
            ["grass", "grass"],
            ["grass", "grass"],
        ],
    },
    {
        name: "rock",
        weight: 10,
        rotation: 0,
        edges: [
            ["rock", "rock"],
            ["rock", "rock"],
            ["rock", "rock"],
            ["rock", "rock"]
        ],
    },
    {
        name: "grass_rock",
        weight: 10,
        rotation: 0,
        edges: [
            ["grass", "rock"],
            ["rock", "rock"],
            ["rock", "grass"],
            ["grass", "grass"],
        ],
    },
    {
        name: "grass_corner_rock",
        weight: 10,
        rotation: 0,
        edges: [
            ["grass", "rock"],
            ["rock", "grass"],
            ["grass", "grass"],
            ["grass", "grass"],
        ],
    },
    {
        name: "rock_corner_grass",
        weight: 10,
        rotation: 0,
        edges: [
            ["rock", "grass"],
            ["grass", "rock"],
            ["rock", "rock"],
            ["rock", "rock"],
        ],
    },
];

export default textures;
