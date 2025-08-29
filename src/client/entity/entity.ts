import Observable from "../observer/observable";
import { AnimationName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { InventorySlot } from "../types/inventory";
import { Item } from "../types/item";
import { Interactable } from "../world/interactables/interactable";
import {INVENTORY_STACK_SIZE} from "../constants";

type EntityState = {
    posX: number;
    posY: number;
    cX: number;
    cY: number;
};

export abstract class Entity extends Observable<EntityState> {
    private static idCounter = 1;
    public id: string;
    private inventory: InventorySlot[];

    constructor() {
        super({
            posX: 0,
            posY: 0,
            cX: -1,
            cY: -1,
        });

        this.id = `entity_${Entity.idCounter++}`;
        this.inventory = Array.from({length: this.getInventorySize()}, () => null);
    }

    canAddItem(item: Item): number {
        const space = this.inventory.reduce((acc, slot) => {
            if (!slot) {
                return acc + INVENTORY_STACK_SIZE;
            }

            if (slot.type === item.type) {
                return acc + INVENTORY_STACK_SIZE - slot.amount;
            }

            return acc;
        }, 0);

        return Math.min(item.amount, space);
    }

    canRemoveItem(item: Item): number {
        const available = this.inventory.reduce((acc, slot) => {
            if (slot?.type === item.type) {
                return acc + slot.amount;
            }

            return acc;
        }, 0);

        return Math.min(item.amount, available);
    }

    addItem(item: Item): number {
        let remaining = item.amount;

        // fill existing stacks
        for (const slot of this.inventory) {
            if (remaining <= 0) break;
            if (!slot) continue;

            if (slot.type === item.type) {
                const canAdd = Math.min(INVENTORY_STACK_SIZE - slot.amount, remaining);
                slot.amount += canAdd;
                remaining -= canAdd;
            }
        }

        // fill empty slots
        for (let i = 0; i < this.inventory.length; i++) {
            if (remaining <= 0) break;

            if (!this.inventory[i]) {
                const toAdd = Math.min(INVENTORY_STACK_SIZE, remaining);
                this.inventory[i] = {type: item.type, amount: toAdd};
                remaining -= toAdd;
            }
        }

        return item.amount - remaining;
    }

    removeItem(item: Item): number {
        let remaining = item.amount;

        for (let i = 0; i < this.inventory.length; i++) {
            const slot = this.inventory[i];
            if (!slot) continue;

            if (slot.type === item.type) {
                const toRemove = Math.min(slot.amount, remaining);
                slot.amount -= toRemove;
                remaining -= toRemove;

                if (slot.amount === 0) {
                    this.inventory[i] = null;
                }

                if (remaining <= 0) break;
            }
        }

        return item.amount - remaining;
    }

    isEmpty(): boolean {
        return this.inventory.every((slot) => !slot);
    }

    set cX(newCX: number) {
        this.state.cX = newCX;
    }

    set cY(newCY: number) {
        this.state.cY = newCY;
    }

    get posX(): number {
        return this.state.posX;
    }

    get posY(): number {
        return this.state.posY;
    }

    get cX(): number {
        return this.state.cX;
    }

    get cY(): number {
        return this.state.cY;
    }

    set posX(newPosX: number) {
        this.state.posX = newPosX;
    }

    set posY(newPosY: number) {
        this.state.posY = newPosY;
    }

    abstract getSpeed(): number;

    abstract getAnimationName(): AnimationName;

    abstract isAnimated(): boolean;

    abstract getType(): EntityType;

    abstract getInventorySize(): number;

    interact(i: Interactable){

    }
}
