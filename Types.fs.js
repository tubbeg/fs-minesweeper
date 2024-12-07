import { Record, Union } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { record_type, tuple_type, union_type, int32_type } from "./fable_modules/fable-library-js.4.24.0/Reflection.js";

export class CellContent extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Mine", "Empty", "Proxy"];
    }
}

export function CellContent_$reflection() {
    return union_type("Types.CellContent", [], CellContent, () => [[], [], [["Item", int32_type]]]);
}

export class Visibility extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Visible", "Hidden"];
    }
}

export function Visibility_$reflection() {
    return union_type("Types.Visibility", [], Visibility, () => [[], []]);
}

export class Flag extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Flagged", "NotFlagged"];
    }
}

export function Flag_$reflection() {
    return union_type("Types.Flag", [], Flag, () => [[], []]);
}

export class Cell extends Record {
    constructor(position, content, visibility, flag) {
        super();
        this.position = position;
        this.content = content;
        this.visibility = visibility;
        this.flag = flag;
    }
}

export function Cell_$reflection() {
    return record_type("Types.Cell", [], Cell, () => [["position", tuple_type(int32_type, int32_type)], ["content", CellContent_$reflection()], ["visibility", Visibility_$reflection()], ["flag", Flag_$reflection()]]);
}

export class Size extends Record {
    constructor(a, b) {
        super();
        this.a = (a | 0);
        this.b = (b | 0);
    }
}

export function Size_$reflection() {
    return record_type("Types.Size", [], Size, () => [["a", int32_type], ["b", int32_type]]);
}

export class Board extends Record {
    constructor(size) {
        super();
        this.size = size;
    }
}

export function Board_$reflection() {
    return record_type("Types.Board", [], Board, () => [["size", Size_$reflection()]]);
}

export class MSAction extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Inspect", "Flag"];
    }
}

export function MSAction_$reflection() {
    return union_type("Types.MSAction", [], MSAction, () => [[], []]);
}

export class GameState extends Union {
    constructor(tag, fields) {
        super();
        this.tag = tag;
        this.fields = fields;
    }
    cases() {
        return ["Won", "Lost"];
    }
}

export function GameState_$reflection() {
    return union_type("Types.GameState", [], GameState, () => [[], []]);
}

