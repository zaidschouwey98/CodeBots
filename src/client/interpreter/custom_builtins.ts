import BuiltinObject from "codebotsinterpreter/lib/object/builtin_object";
import IntegerObject from "codebotsinterpreter/lib/object/integer_object";
import ErrorObject from "codebotsinterpreter/lib/object/error_object";
import {NULL} from "codebotsinterpreter/lib/evaluator";
import type {Codebot} from "../entity/codebot";

export default class CustomBuiltins {
    private codebot: Codebot;

    constructor (codebot: Codebot) {
        this.codebot = codebot;
    }

    get builtins(): Record<string, BuiltinObject> {
        return {
            "goto": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const [arg] = args;

                if (!(arg instanceof IntegerObject)) {
                    return new ErrorObject(`unsupported argument type: ${arg.type()}`);
                }

                this.codebot.posX += 50;
                this.codebot.posY += 50;

                return NULL;
            }),
            "find": new BuiltinObject(async (...args) => {
                // (ressource) => coordinate

                throw new Error("not implemented");

            }),
            "gather": new BuiltinObject(async (...args) => {
                // () => void

                throw new Error("not implemented");
            }),
            "deposit": new BuiltinObject(async (...args) => {
                // (item) => void

                throw new Error("not implemented");
            }),
            "take": new BuiltinObject(async (...args) => {
                // (item) => void

                throw new Error("not implemented");
            }),
            "setCraft": new BuiltinObject(async (...args) => {
                // (item) => void : parametrer la workbench

                throw new Error("not implemented");
            }),
            "isFull": new BuiltinObject(async (...args) => {
                // () => boolean

                throw new Error("not implemented");
            }),
            "isEmpty": new BuiltinObject(async (...args) => {
                // () => boolean

                throw new Error("not implemented");
            }),
            "wait": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const [arg] = args;

                if (!(arg instanceof IntegerObject)) {
                    return new ErrorObject(`unsupported argument type: ${arg.type()}`);
                }

                await new Promise((resolve) => setTimeout(resolve, arg.value));

                return NULL;
            }),
            "hold": new BuiltinObject(async (...args) => {
                // (item) => void

                throw new Error("not implemented");
            }),
            "has": new BuiltinObject(async (...args) => {
                // (item) => boolean

                throw new Error("not implemented");
            }),
            "place": new BuiltinObject(async (...args) => {
                // (item) => void

                throw new Error("not implemented");
            }),
        };
    }
}
