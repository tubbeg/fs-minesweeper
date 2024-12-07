import { createElement } from "react";
import React from "react";
import { getGameState, isProxy, isFlagged, isVisible, isMine } from "./QueryWorld.fs.js";
import { createObj, int32ToString } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { MSAction } from "./Types.fs.js";
import { some, unwrap } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { ofArray, singleton, empty, cons } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { createWorld, updateWorld } from "./Board.fs.js";
import { createRoot } from "react-dom/client";

export function CreateButton(createButtonInputProps) {
    const world = createButtonInputProps.world;
    const cb = createButtonInputProps.cb;
    const y = createButtonInputProps.y;
    const x = createButtonInputProps.x;
    let patternInput;
    if (world != null) {
        const w = world;
        patternInput = [isMine(x, y, w), isVisible(x, y, w), isFlagged(x, y, w), isProxy(x, y, w)];
    }
    else {
        patternInput = [undefined, undefined, undefined, undefined];
    }
    const v = patternInput[1];
    const p = patternInput[3];
    const m = patternInput[0];
    const f = patternInput[2];
    let patternInput_1;
    let matchResult;
    if (m == null) {
        if (v != null) {
            matchResult = 2;
        }
        else if (f != null) {
            matchResult = 1;
        }
        else {
            matchResult = 3;
        }
    }
    else if (v == null) {
        if (f != null) {
            matchResult = 1;
        }
        else {
            matchResult = 3;
        }
    }
    else {
        matchResult = 0;
    }
    switch (matchResult) {
        case 0: {
            patternInput_1 = ["☠️", "has-background-dark"];
            break;
        }
        case 1: {
            patternInput_1 = ["🏳", "has-background-black has-text-light"];
            break;
        }
        case 2: {
            const defTCN = ["_", "has-background-dark has-text-dark"];
            let matchResult_1, n;
            if (p != null) {
                if (p.content.tag === 2) {
                    matchResult_1 = 0;
                    n = p.content.fields[0];
                }
                else {
                    matchResult_1 = 1;
                }
            }
            else {
                matchResult_1 = 1;
            }
            switch (matchResult_1) {
                case 0: {
                    patternInput_1 = [int32ToString(n), "has-background-black has-text-warning"];
                    break;
                }
                default:
                    patternInput_1 = defTCN;
            }
            break;
        }
        default:
            patternInput_1 = ["?", "has-background-black"];
    }
    const t = patternInput_1[0];
    const cn = patternInput_1[1];
    return createElement("button", {
        style: {
            marginRight: 5,
        },
        onClick: (e) => {
            if (e.detail === 2) {
                cb(new MSAction(0, []), x, y);
            }
            else {
                cb(new MSAction(1, []), x, y);
            }
        },
        className: "button " + cn,
        children: t,
    });
}

export function createCells(r, c, cb, w) {
    const cc = (d_mut, l_mut) => {
        let n;
        cc:
        while (true) {
            const d = d_mut, l = l_mut;
            if ((n = (d | 0), n < c)) {
                const n_1 = d | 0;
                const b = createElement(CreateButton, {
                    x: n_1,
                    y: r,
                    cb: cb,
                    world: unwrap(w),
                });
                const td = createElement("td", {
                    children: reactApi.Children.toArray([b]),
                });
                d_mut = (n_1 + 1);
                l_mut = cons(td, l);
                continue cc;
            }
            else {
                return l;
            }
            break;
        }
    };
    return cc(0, empty());
}

export function createRows(rows, columns, cb, w) {
    const cr = (d_mut, l_mut) => {
        let n;
        cr:
        while (true) {
            const d = d_mut, l = l_mut;
            if ((n = (d | 0), n < rows)) {
                const n_1 = d | 0;
                const tds = createCells(n_1, columns, cb, w);
                const tr = createElement("tr", {
                    children: reactApi.Children.toArray(Array.from(tds)),
                });
                d_mut = (n_1 + 1);
                l_mut = cons(tr, l);
                continue cr;
            }
            else {
                return l;
            }
            break;
        }
    };
    return cr(0, empty());
}

export function RTable(rTableInputProps) {
    let children_2;
    const w = rTableInputProps.w;
    const b = rTableInputProps.b;
    const a = rTableInputProps.a;
    const cb = rTableInputProps.cb;
    const r = createRows(a, b, cb, w);
    const children_4 = singleton((children_2 = singleton(createElement("tbody", {
        children: reactApi.Children.toArray(Array.from(r)),
    })), createElement("table", {
        children: reactApi.Children.toArray(Array.from(children_2)),
    })));
    return createElement("div", {
        children: reactApi.Children.toArray(Array.from(children_4)),
    });
}

export function updateSystem(a, x, y, w) {
    console.log(some(x), y, a);
    return updateWorld(a, x, y, w);
}

export function Title() {
    return createElement("div", {
        className: "box has-text-primary",
        children: "Minesweeper",
    });
}

export function ResetButton(resetButtonInputProps) {
    let elems;
    const cb = resetButtonInputProps.cb;
    return createElement("div", createObj(ofArray([["className", "box"], (elems = [createElement("button", {
        children: "Reset",
        className: "button",
        onClick: cb,
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

export const defaultSize = [10, 10];

export const defaultPosition = [0, 0];

export const defaultDifficulty = 10;

export function RResult(rResultInputProps) {
    const r = rResultInputProps.r;
    const endGame = (result) => {
        if (result.tag === 1) {
            return createElement("div", {
                className: "box has-text-danger",
                children: "YOU LOST",
            });
        }
        else {
            return createElement("div", {
                className: "box has-text-primary",
                children: "YOU WON",
            });
        }
    };
    if (r != null) {
        const r_1 = r;
        return endGame(r_1);
    }
    else {
        return createElement("div", {});
    }
}

export function App() {
    let elems;
    const s = defaultSize;
    const d = defaultDifficulty | 0;
    const defaultStart = false;
    const defaultWorld = undefined;
    let patternInput;
    const initial = {
        state: unwrap(defaultWorld),
    };
    patternInput = reactApi.useState(initial);
    const world = patternInput[0];
    const setWorld = patternInput[1];
    let patternInput_1;
    const initial_1 = {};
    patternInput_1 = reactApi.useState(initial_1);
    const setResult = patternInput_1[1];
    const result = patternInput_1[0];
    const updateState = (w) => {
        setWorld({
            state: unwrap(w),
        });
    };
    const runWorld = (a, x, y) => {
        const matchValue = world.state;
        if (matchValue != null) {
            const w_2 = matchValue;
            updateState(updateSystem(a, x, y, w_2));
        }
        else if (a.tag === 0) {
            updateState(updateSystem(a, x, y, createWorld(d, x, y, s[0], s[1])));
        }
    };
    const updateWorldVerifyGameState = (a_2, x_1, y_1) => {
        if (result.result == null) {
            runWorld(a_2, x_1, y_1);
            const gameState = getGameState(world.state);
            setResult({
                result: unwrap(gameState),
            });
            if (gameState != null) {
                if (gameState.tag === 1) {
                    console.log(some("YOU lost"));
                }
                else {
                    console.log(some("YOU WON"));
                }
            }
        }
    };
    const table = (tupledArg, w_3) => createElement(RTable, {
        cb: updateWorldVerifyGameState,
        a: tupledArg[0],
        b: tupledArg[1],
        w: unwrap(w_3),
    });
    const resetWorld = (e) => {
        setWorld({});
        setResult({});
    };
    return createElement("div", createObj(ofArray([["className", "box centerDiv"], (elems = [createElement(Title, null), createElement(RResult, {
        r: unwrap(result.result),
    }), createElement(ResetButton, {
        cb: resetWorld,
    }), table(s, world.state)], ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

export function runApp(el) {
    const rRoot = createRoot(el);
    rRoot.render(createElement(App, null));
}

export const root = document.getElementById("divRoot");

runApp(root);

