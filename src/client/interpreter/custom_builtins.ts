import BuiltinObject from "codebotsinterpreter/lib/object/builtin_object";
import IntegerObject from "codebotsinterpreter/lib/object/integer_object";
import ErrorObject from "codebotsinterpreter/lib/object/error_object";
import BooleanObject from "codebotsinterpreter/lib/object/boolean_object";
import StringObject from "codebotsinterpreter/lib/object/string_object";
import HashObject from "codebotsinterpreter/lib/object/hash_object";
import {NULL} from "codebotsinterpreter/lib/evaluator";
import type {Codebot} from "../entity/codebot";
import {Item, ITEM_TYPES, ItemType} from "../types/item";
import { Object } from "codebotsinterpreter/lib/object";
import {Position} from "../types/position";

export default class CustomBuiltins {
    private codebot: Codebot;

    constructor (codebot: Codebot) {
        this.codebot = codebot;
    }

    isValidItemType(itemType: string): itemType is ItemType {
        return ITEM_TYPES.includes(itemType as ItemType);
    }

    parsePosition(object: Object): Position|string {
        if (!(object instanceof HashObject)) {
            return `unsupported argument type: ${object.type()}`;
        }

        const x = object.pairs.get(new StringObject("x").hashKey().toString())?.value;

        if (!(x instanceof IntegerObject)) {
            return `invalid x: ${x?.type()}`;
        }

        const y = object.pairs.get(new StringObject("y").hashKey().toString())?.value;

        if (!(y instanceof IntegerObject)) {
            return `invalid x: ${y?.type()}`;
        }

        return {x: x.value, y: y.value};
    }

    parseItem(object: Object): Item|string {
        if (!(object instanceof HashObject)) {
            return `unsupported argument type: ${object.type()}`;
        }

        const type = object.pairs.get(new StringObject("type").hashKey().toString())?.value;

        if (!(type instanceof StringObject)) {
            return `unsupported argument type: ${type?.type()}`;
        }
        if (!this.isValidItemType(type.value)) {
            return `invalid item type: ${type.value}`;
        }

        const amount = object.pairs.get(new StringObject("amount").hashKey().toString())?.value;

        if (amount && !(amount instanceof IntegerObject)) {
            return `unsupported argument type: ${amount?.type()}`;
        }

        return {
            type: type.value,
            amount: amount?.value ?? 1,
        };
    }

    get builtins(): Record<string, BuiltinObject> {
        return {
            "goto": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const position = this.parsePosition(args[0]);

                if (typeof position === "string") {
                    return new ErrorObject(position);
                }

                await this.codebot.moveTo(position);

                return NULL;
            }),
            "canTake": new BuiltinObject(async (...args) => {
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (typeof item === "string") {
                    return new ErrorObject(item);
                }

                return new BooleanObject(this.codebot.canAddItem(item) === item.amount);
            }),
            "isEmpty": new BuiltinObject(async (...args) => {
                if (args.length !== 0) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 0`);
                }

                return new BooleanObject(this.codebot.isEmpty());
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
            "has": new BuiltinObject(async (...args) => {
                // (item) => boolean
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (typeof item === "string") {
                    return new ErrorObject(item);
                }

                return new BooleanObject(this.codebot.canRemoveItem(item) === item.amount);
            }),
            "deposit": new BuiltinObject(async (...args) => {
                // (item) => void
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (typeof item === "string") {
                    return new ErrorObject(item);
                }

                if (!this.codebot.canRemoveItem(item)) {
                    return new ErrorObject("unable to deposit such amount");
                }

                this.codebot.removeItem(item);

                // TODO
                throw new Error("not implemented");
            }),
            "take": new BuiltinObject(async (...args) => {
                // (item) => void : dans un coffre
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (typeof item === "string") {
                    return new ErrorObject(item);
                }

                if (!this.codebot.canAddItem(item)) {
                    return new ErrorObject("unable to take such amount");
                }

                this.codebot.addItem(item);

                // TODO
                throw new Error("not implemented");
            }),
            "hold": new BuiltinObject(async (...args) => {
                // (item) => void
                if (args.length !== 1) {
                    return new ErrorObject(`wrong arguments amount: received ${args.length}, expected 1`);
                }

                const item = this.parseItem(args[0]);
                if (typeof item === "string") {
                    return new ErrorObject(item);
                }

                // TODO
                throw new Error("not implemented");
            }),
            "find": new BuiltinObject(async (...args) => {
                // (ressource) => coordinate

                throw new Error("not implemented");
            }),
            "gather": new BuiltinObject(async (...args) => {
                // () => void
                // TODO: get item type

                throw new Error("not implemented");
            }),
            "place": new BuiltinObject(async (...args) => {
                // (item) => void

                // TODO
                throw new Error("not implemented");
            }),
            "setCraft": new BuiltinObject(async (...args) => {
                // (item) => void : parametrer la workbench

                throw new Error("not implemented");
            }),
        };
    }
}
