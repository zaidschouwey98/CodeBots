import Observable from "../observer/observable";
import { AnimationName, TextureName } from "../spritesheet_atlas";
import { EntityType } from "../types/entity_type";
import { Interactable } from "../world/interactables/interactable";
import { Resource } from "../world/resources/resource";
import Tile from "../world/tile";
import { World } from "../world/world";

type EntityState = {
    posX: number;
    posY: number;
    cX: number;
    cY: number;
};

export abstract class Entity extends Observable<EntityState> {

    private static idCounter = 1;
    public id: string;
    private inventory: [];
    protected world: World;
    constructor(world:World) {

        let t: Observable<EntityState>;
        super({
            posX: 0,
            posY: 0,
            cX: -1,
            cY: -1,
        });
        this.world = world;
        this.id = `entity_${Entity.idCounter++}`;
    }

    interactWithTile(tile:Tile): boolean {
        if (tile && tile.content instanceof Resource) {
            // this.lastMineTime = 0;
            const resource = tile.content.mine();

            if (resource) {
                // Ressource épuisée

                // Ajouter la ressource à l'inventaire
                // this.addToInventory(resource);
                return true;
            }
            return true; // Coup porté mais ressource pas encore épuisée
        } else if (tile && tile.content instanceof Interactable) {
            // tile.content.interact();
        }

        return false;
    }

    abstract getSpeed(): number;

    abstract getAnimationName(): AnimationName;

    abstract isAnimated(): boolean;

    abstract getType(): EntityType;

    abstract getInventorySize(): number;

    interact(i: Interactable) {

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

    set cX(newCX: number) {
        this.state.cX = newCX;
    }

    set cY(newCY: number) {
        this.state.cY = newCY;
    }
}
