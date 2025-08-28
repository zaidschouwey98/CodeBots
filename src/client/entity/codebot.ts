import Interpreter from "codebotsinterpreter";
import CustomBuiltins from "../interpreter/custom_builtins";
import {Entity} from "./entity";
import type {AnimationName, TextureName} from "../spritesheet_atlas";
import {EntityType} from "../types/entity_type";

export class Codebot extends Entity {
    private customBuiltins: CustomBuiltins;
    private program: string;
    private isRunning: boolean;
    private error: string|null;
    private static interpreter = new Interpreter();

    constructor(){
        super();
        this.program = "";
        this.isRunning = false;
        this.error = null;
        this.customBuiltins = new CustomBuiltins(this);
    }

    getType(): EntityType {
        return EntityType.CODEBOT;
    }

    getTextureName(): TextureName {
        return "codebot_1";
    }

    getAnimationName(): AnimationName|null {
        if (this.isRunning) {
            return "codebot";
        }

        return null;
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
        }
    }

    update(keys: Set<string>, delta: number) {}
}
