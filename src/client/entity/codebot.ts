import Interpreter from "codebotsinterpreter";
import CustomBuiltins from "../interpreter/custom_builtins";
import {Entity} from "./entity";
import type {AnimationName, TextureName} from "../spritesheet_atlas";
import {EntityType} from "../types/entity_type";
import { CODEBOT_SPEED, CODEBOT_INVENTORY_SIZE } from "../constants";

export class Codebot extends Entity {
    private customBuiltins: CustomBuiltins;
    private program: string;
    private isRunning: boolean;
    private error: string|null;
    private targetX: number|null;
    private targetY: number|null;
    private onTargetReached: (() => void)|null;
    private static interpreter = new Interpreter();

    constructor(){
        super();
        this.program = "";
        this.isRunning = false;
        this.error = null;
        this.customBuiltins = new CustomBuiltins(this);
        this.targetX = null;
        this.targetY = null;
        this.onTargetReached = null;
    }

    getType(): EntityType {
        return EntityType.CODEBOT;
    }

    getAnimationName(): AnimationName {
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
            this.isRunning = false;
            this.notify();
        }
    }

    getSpeed(): number {
        return CODEBOT_SPEED;
    }

    isAnimated(): boolean {
        return this.isRunning;
    }

    async moveTo(x: number, y: number) {
        this.targetX = x;
        this.targetY = y;

        return new Promise<void>((resolve) => this.onTargetReached = resolve);
    }

    getInventorySize(): number {
        return CODEBOT_INVENTORY_SIZE;
    }

    update(_: Set<string>, delta: number) {
        if (this.targetX === null || this.targetY === null) {
            return;
        }

        const deltaX = this.targetX - this.posX;
        const deltaY = this.targetY - this.posY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const moveDist = this.getSpeed() * (delta / 60);
        if (moveDist >= distance) {
            this.posX = this.targetX;
            this.posY = this.targetY;
            this.targetX = null;
            this.targetY = null;
            this.onTargetReached?.();
        } else {
            this.posX += (deltaX / distance) * moveDist;
            this.posY += (deltaY / distance) * moveDist;
        }
    }
}
