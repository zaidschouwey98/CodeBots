import Interpreter from "codebotsinterpreter";
import CustomBuiltins from "../interpreter/custom_builtins";
import {Entity} from "./entity";
import type {AnimationName, TextureName} from "../spritesheet_atlas";
import {EntityType} from "../types/entity_type";
import { CODEBOT_SPEED, CODEBOT_INVENTORY_SIZE } from "../constants";
import { Position } from "../types/position";

export class Codebot extends Entity {
    private customBuiltins: CustomBuiltins;
    private program: string;
    private isRunning: boolean;
    private error: string|null;
    private target: Position|null;
    private onTargetReached: (() => void)|null;
    private static interpreter = new Interpreter();

    constructor(){
        super();
        this.program = "";
        this.isRunning = false;
        this.error = null;
        this.customBuiltins = new CustomBuiltins(this);
        this.target = null;
        this.onTargetReached = null;
    }

    getType(): EntityType {
        return EntityType.CODEBOT;
    }

    getAnimationName(): AnimationName {
        if (this.hasError()) {
            return "codebot_error";
        }

        return "codebot";
    }

    setProgram(program: string) {
        this.program = program;
    }

    hasError(): boolean {
        return this.error !== null;
    }

    async setIsRunning(isRunning: boolean) {
        this.isRunning = isRunning;

        if (this.isRunning) {
            this.error = await Codebot.interpreter.evaluate(this.program, this.customBuiltins.builtins);
            if (this.hasError()) {
                console.error(this.error);
            }

            this.isRunning = false;
            this.notify();
        }
    }

    getSpeed(): number {
        return CODEBOT_SPEED;
    }

    isAnimated(): boolean {
        return this.isRunning || this.hasError();
    }

    async moveTo(position: Position) {
        this.target = position;

        return new Promise<void>((resolve) => {
            this.onTargetReached?.();
            this.onTargetReached = resolve;
        });
    }

    getInventorySize(): number {
        return CODEBOT_INVENTORY_SIZE;
    }

    update(_: Set<string>, delta: number) {
        if (this.target === null) {
            return;
        }

        const deltaX = this.target.x - this.posX;
        const deltaY = this.target.y - this.posY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const moveDist = this.getSpeed() * (delta / 60);
        if (moveDist >= distance) {
            this.posX = this.target.x;
            this.posY = this.target.y;
            this.target = null;
            this.onTargetReached?.();
            this.onTargetReached = null;
        } else {
            this.posX += (deltaX / distance) * moveDist;
            this.posY += (deltaY / distance) * moveDist;
        }
    }
}
