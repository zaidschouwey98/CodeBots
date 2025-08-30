
import { TextureName } from "../spritesheet_atlas";

export type Item = {
    spriteName: TextureName,
    quantity: number
}

export type Recipe = {
    inputs: Item[],
    output: Item
}

export type CoreItem = {
    spriteName: TextureName
    currentGathered: number
    goal: number
}

export type CoreStep = {
    stepNumber: number,
    items: CoreItem[]
}

