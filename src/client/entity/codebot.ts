import Interpreter from "codebotsinterpreter";
import CustomBuiltins from "../interpreter/custom_builtins";
import {Entity} from "./entity";
import type {AnimationName} from "../spritesheet_atlas";

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
        }
    }

    update(keys: Set<string>, delta: number) {}
}
