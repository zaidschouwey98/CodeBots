
import { TextureName } from "../spritesheet_atlas";

export type Item = {
    spriteName: TextureName,
    quantity: number
}

export type Recipe = {
    inputs: Item[],
    output: Item
}

