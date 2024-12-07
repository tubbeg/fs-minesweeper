import { nonSeeded } from "./fable_modules/fable-library-js.4.24.0/Random.js";
import { Board, Size, Cell, Flag, Visibility, CellContent } from "./Types.fs.js";
import { removeEntity, queryCell, addEntity } from "./Query.js";
import { some } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { isHiddenEmptyOrProxy, isVisible, isFlagged, isProxy, isMine, queryBoard, positionIsEqual, isEmpty } from "./QueryWorld.fs.js";
import { tryFind } from "./fable_modules/fable-library-js.4.24.0/Array.js";
import { cons, head, tail, isEmpty as isEmpty_1, singleton, append, empty, length, filter, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { printf, toConsole } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { List_distinct } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";
import { arrayHash, equalArrays } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { World } from "miniplex";

export const rnd = nonSeeded();

export function addMineEntity(pos_, pos__1, w) {
    const pos = [pos_, pos__1];
    const cont = new CellContent(0, []);
    const cell = new Cell(pos, cont, new Visibility(1, []), new Flag(1, []));
    return addEntity({
        cell: cell,
    }, w);
}

export function addProxyEntity(pos_, pos__1, n, w) {
    const pos = [pos_, pos__1];
    const err = () => {
        console.log(some("Error! Found no cells"));
    };
    const cont = new CellContent(2, [n]);
    const cell = new Cell(pos, cont, new Visibility(1, []), new Flag(1, []));
    const addNoReplace = () => addEntity({
        cell: cell,
    }, w);
    const matchValue = isEmpty(pos[0], pos[1], w);
    if (matchValue == null) {
        return addNoReplace();
    }
    else {
        const matchValue_1 = queryCell(w);
        if (matchValue_1 == null) {
            err();
            return addNoReplace();
        }
        else {
            const cellsAR = matchValue_1;
            const matchValue_2 = tryFind((c_1) => {
                const tupledArg = c_1.cell.position;
                return positionIsEqual(pos[0], pos[1], tupledArg[0], tupledArg[1]);
            }, cellsAR);
            if (matchValue_2 == null) {
                err();
                return addNoReplace();
            }
            else {
                const cellToRemove = matchValue_2;
                console.log(some("Replacing empty cell"));
                return addEntity({
                    cell: cell,
                }, removeEntity(cellToRemove, w));
            }
        }
    }
}

export function isNotOutOfBounds(x, y, a, b) {
    if (((x >= 0) && (x < a)) && (y >= 0)) {
        return y < b;
    }
    else {
        return false;
    }
}

export function getNeighbours(x, y, w) {
    const possibleNeighbours = ofArray([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1], [x - 1, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x + 1, y - 1]]);
    const matchValue = queryBoard(w);
    if (matchValue == null) {
        return undefined;
    }
    else {
        const b = matchValue;
        const size = [b.board.size.a, b.board.size.b];
        return filter((p) => isNotOutOfBounds(p[0], p[1], size[0], size[1]), possibleNeighbours);
    }
}

export function getRandomPosition(x, y) {
    return [rnd.Next2(1, x + 1), rnd.Next2(1, y + 1)];
}

export function posIsOk(pos_, pos__1, w) {
    const pos = [pos_, pos__1];
    const matchValue = queryBoard(w);
    if (matchValue != null) {
        const b = matchValue;
        const size = [b.board.size.a, b.board.size.b];
        const matchValue_1 = isEmpty(pos[0], pos[1], w);
        const matchValue_2 = isNotOutOfBounds(pos[0], pos[1], size[0], size[1]);
        let matchResult;
        if (matchValue_1 == null) {
            if (matchValue_2) {
                matchResult = 0;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0:
                return true;
            default: {
                console.log(some("FOUND INVALID MINE AT"), pos);
                return false;
            }
        }
    }
    else {
        return undefined;
    }
}

export function generatePositionList(d, w) {
    let n_2;
    const errB = () => {
        toConsole(printf("Could not find board"));
    };
    const errSize = () => {
        toConsole(printf("Size of board is too small"));
    };
    const gpl = (tupledArg_mut, l_mut) => {
        let n;
        gpl:
        while (true) {
            const tupledArg = tupledArg_mut, l = l_mut;
            const x = tupledArg[0] | 0;
            const y = tupledArg[1] | 0;
            const len = length(l) | 0;
            if ((n = (len | 0), n < d)) {
                const n_1 = len | 0;
                const pos = getRandomPosition(x, y);
                const matchValue = posIsOk(pos[0], pos[1], w);
                if (matchValue == null) {
                    return empty();
                }
                else if (matchValue) {
                    tupledArg_mut = [x, y];
                    l_mut = List_distinct(append(l, singleton(pos)), {
                        Equals: equalArrays,
                        GetHashCode: arrayHash,
                    });
                    continue gpl;
                }
                else {
                    tupledArg_mut = [x, y];
                    l_mut = l;
                    continue gpl;
                }
            }
            else {
                return l;
            }
            break;
        }
    };
    const matchValue_1 = queryBoard(w);
    if (matchValue_1 != null) {
        const board = matchValue_1;
        const size = board.board.size;
        const matchValue_2 = (size.a * size.b) | 0;
        if ((n_2 = (matchValue_2 | 0), (n_2 - 1) > d)) {
            const n_3 = matchValue_2 | 0;
            return gpl([size.a, size.b], empty());
        }
        else {
            errSize();
            return empty();
        }
    }
    else {
        errB();
        return empty();
    }
}

export function addMines(difficulty, w) {
    const posList = generatePositionList(difficulty, w);
    const am = (l_mut, wrld_mut) => {
        am:
        while (true) {
            const l = l_mut, wrld = wrld_mut;
            if (isEmpty_1(l)) {
                return wrld;
            }
            else {
                const rem = tail(l);
                const pos = head(l);
                l_mut = rem;
                wrld_mut = addMineEntity(pos[0], pos[1], wrld);
                continue am;
            }
            break;
        }
    };
    return am(posList, w);
}

export function addBoardEntity(x, y, w) {
    const b = new Board(new Size(x, y));
    const bar = {
        board: b,
    };
    w.add(bar);
    return w;
}

export function nrOfMines(x, y, w) {
    const n = getNeighbours(x, y, w);
    if (n != null) {
        const neighbours = n;
        const isM = (c) => {
            if (c != null) {
                return true;
            }
            else {
                return false;
            }
        };
        return length(filter((p) => isM(isMine(p[0], p[1], w)), neighbours));
    }
    else {
        return undefined;
    }
}

export function createProxy(x, y, w) {
    let n;
    if (isMine(x, y, w) == null) {
        const matchValue_1 = nrOfMines(x, y, w);
        let matchResult, n_1;
        if (matchValue_1 != null) {
            if ((n = (matchValue_1 | 0), n > 0)) {
                matchResult = 0;
                n_1 = matchValue_1;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0:
                return addProxyEntity(x, y, n_1, w);
            default:
                return w;
        }
    }
    else {
        return w;
    }
}

export function addProxies(w) {
    const addProxyToRow = (y_mut, max_mut, init_mut, wrld_mut) => {
        let n;
        addProxyToRow:
        while (true) {
            const y = y_mut, max = max_mut, init = init_mut, wrld = wrld_mut;
            if ((n = (init | 0), n < max)) {
                const n_1 = init | 0;
                y_mut = y;
                max_mut = max;
                init_mut = (init + 1);
                wrld_mut = createProxy(init, y, wrld);
                continue addProxyToRow;
            }
            else {
                return wrld;
            }
            break;
        }
    };
    const addProxyToBoard = (size_mut, initRow_mut, wrld_1_mut) => {
        let n_2;
        addProxyToBoard:
        while (true) {
            const size = size_mut, initRow = initRow_mut, wrld_1 = wrld_1_mut;
            if ((n_2 = (initRow | 0), n_2 < size.a)) {
                const n_3 = initRow | 0;
                size_mut = size;
                initRow_mut = (n_3 + 1);
                wrld_1_mut = addProxyToRow(n_3, size.b, 0, wrld_1);
                continue addProxyToBoard;
            }
            else {
                return wrld_1;
            }
            break;
        }
    };
    const matchValue = queryBoard(w);
    if (matchValue != null) {
        const b = matchValue;
        return addProxyToBoard(b.board.size, 0, w);
    }
    else {
        return w;
    }
}

export function createEmpty(x, y, w) {
    const matchValue = isMine(x, y, w);
    const matchValue_1 = isProxy(x, y, w);
    let matchResult;
    if (matchValue == null) {
        if (matchValue_1 == null) {
            matchResult = 0;
        }
        else {
            matchResult = 1;
        }
    }
    else {
        matchResult = 1;
    }
    switch (matchResult) {
        case 0: {
            const cell = new Cell([x, y], new CellContent(1, []), new Visibility(1, []), new Flag(1, []));
            return addEntity({
                cell: cell,
            }, w);
        }
        default:
            return w;
    }
}

export function addEmpties(w) {
    const addEmptyRow = (y_mut, max_mut, init_mut, wrld_mut) => {
        let n;
        addEmptyRow:
        while (true) {
            const y = y_mut, max = max_mut, init = init_mut, wrld = wrld_mut;
            if ((n = (init | 0), n < max)) {
                const n_1 = init | 0;
                y_mut = y;
                max_mut = max;
                init_mut = (init + 1);
                wrld_mut = createEmpty(init, y, wrld);
                continue addEmptyRow;
            }
            else {
                return wrld;
            }
            break;
        }
    };
    const addEmptyToBoard = (size_mut, initRow_mut, wrld_1_mut) => {
        let n_2;
        addEmptyToBoard:
        while (true) {
            const size = size_mut, initRow = initRow_mut, wrld_1 = wrld_1_mut;
            if ((n_2 = (initRow | 0), n_2 < size.a)) {
                const n_3 = initRow | 0;
                size_mut = size;
                initRow_mut = (n_3 + 1);
                wrld_1_mut = addEmptyRow(n_3, size.b, 0, wrld_1);
                continue addEmptyToBoard;
            }
            else {
                return wrld_1;
            }
            break;
        }
    };
    const matchValue = queryBoard(w);
    if (matchValue != null) {
        const b = matchValue;
        return addEmptyToBoard(b.board.size, 0, w);
    }
    else {
        return w;
    }
}

export function addReserves(init_, init__1, w) {
    const init = [init_, init__1];
    console.log(some("ADDING RESERVES AT "), init);
    const addCells = (p_mut, wrld_mut) => {
        addCells:
        while (true) {
            const p = p_mut, wrld = wrld_mut;
            if (!isEmpty_1(p)) {
                const rem = tail(p);
                const el = head(p);
                const cell = new Cell(el, new CellContent(1, []), new Visibility(1, []), new Flag(1, []));
                p_mut = rem;
                wrld_mut = addEntity({
                    cell: cell,
                }, w);
                continue addCells;
            }
            else {
                return wrld;
            }
            break;
        }
    };
    const matchValue = getNeighbours(init[0], init[1], w);
    if (matchValue != null) {
        const nb = matchValue;
        return addCells(cons(init, nb), w);
    }
    else {
        return w;
    }
}

export function addEntities(init_, init__1, difficulty, x, y, w) {
    const init = [init_, init__1];
    return addEmpties(addProxies(addMines(difficulty, addReserves(init[0], init[1], addBoardEntity(x, y, w)))));
}

export function debugInspect(x, y, w) {
    console.log(some("Inspecting"), x, y);
    const matchValue = isMine(x, y, w);
    if (matchValue != null) {
        console.log(some("Cell is a mine? "));
    }
    const matchValue_1 = nrOfMines(x, y, w);
    if (matchValue_1 != null) {
        const n = matchValue_1 | 0;
        console.log(some("Number of mine neighbours:"), n);
    }
    else {
        console.log(some("Has ZERO mine neighbours"));
    }
    const matchValue_2 = isFlagged(x, y, w);
    if (matchValue_2 != null) {
        console.log(some("Cell is flagged: "));
    }
    const matchValue_3 = isVisible(x, y, w);
    if (matchValue_3 != null) {
        console.log(some("Cell is visible: "));
    }
    else {
        console.log(some("Cell is visible: "));
    }
    const matchValue_4 = isEmpty(x, y, w);
    if (matchValue_4 != null) {
        console.log(some("Cell is empty: "));
    }
    else {
        console.log(some("Cell is not empty: "));
    }
    const matchValue_5 = isProxy(x, y, w);
    if (matchValue_5 != null) {
        const p = matchValue_5;
        const matchValue_6 = p.content;
        if (matchValue_6.tag === 2) {
            const n_1 = matchValue_6.fields[0] | 0;
            console.log(some("Cell is proxy:"), n_1);
        }
        else {
            console.log(some("Error, cell is a proxy, but does not have proxy property"));
        }
    }
}

export function revealCell(x, y, w) {
    const matchValue = queryCell(w);
    if (matchValue != null) {
        const cells = matchValue;
        const matchValue_1 = tryFind((c) => {
            const tupledArg = c.cell.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], x, y);
        }, cells);
        if (matchValue_1 != null) {
            const cell = matchValue_1;
            const cont = cell.cell.content;
            const newCell = {
                cell: new Cell([x, y], cont, new Visibility(0, []), new Flag(1, [])),
            };
            const newWorld = addEntity(newCell, removeEntity(cell, w));
            return [newWorld, cont];
        }
        else {
            console.log(some("Unable to find cell"), x, y);
            return [w, undefined];
        }
    }
    else {
        console.log(some("Unable to find cells"));
        return [w, undefined];
    }
}

export function inspectCell(x, y, w) {
    const err = () => {
        toConsole(printf("Failed to inspect cell!"));
    };
    const ins = (wrld_mut, l_mut) => {
        ins:
        while (true) {
            const wrld = wrld_mut, l = l_mut;
            if (!isEmpty_1(l)) {
                const rem = tail(l);
                const p = head(l);
                const matchValue = revealCell(p[0], p[1], wrld);
                if (matchValue[1] != null) {
                    switch (matchValue[1].tag) {
                        case 2: {
                            const newWorld_2 = matchValue[0];
                            wrld_mut = newWorld_2;
                            l_mut = rem;
                            continue ins;
                        }
                        case 1: {
                            const newWorld_3 = matchValue[0];
                            toConsole(printf("Getting neighbours"));
                            const matchValue_1 = getNeighbours(p[0], p[1], newWorld_3);
                            if (matchValue_1 == null) {
                                return undefined;
                            }
                            else {
                                const nb = matchValue_1;
                                wrld_mut = newWorld_3;
                                l_mut = List_distinct(append(rem, filter((p_1) => isHiddenEmptyOrProxy(p_1[0], p_1[1], newWorld_3), nb)), {
                                    Equals: equalArrays,
                                    GetHashCode: arrayHash,
                                });
                                continue ins;
                            }
                        }
                        default: {
                            const newWorld_1 = matchValue[0];
                            wrld_mut = newWorld_1;
                            l_mut = rem;
                            continue ins;
                        }
                    }
                }
                else {
                    const newWorld = matchValue[0];
                    wrld_mut = newWorld;
                    l_mut = rem;
                    continue ins;
                }
            }
            else {
                return wrld;
            }
            break;
        }
    };
    const matchValue_2 = ins(w, singleton([x, y]));
    if (matchValue_2 != null) {
        const world = matchValue_2;
        return world;
    }
    else {
        err();
        return w;
    }
}

export function flagCell(p_, p__1, w) {
    const p = [p_, p__1];
    const err = () => {
        toConsole(printf("Cannot flag visible cell"));
    };
    const v = isVisible(p[0], p[1], w);
    if (v == null) {
        const matchValue = queryCell(w);
        if (matchValue != null) {
            const cells = matchValue;
            const matchValue_1 = tryFind((c) => {
                const tupledArg = c.cell.position;
                return positionIsEqual(p[0], p[1], tupledArg[0], tupledArg[1]);
            }, cells);
            if (matchValue_1 != null) {
                const cell = matchValue_1;
                const newFlag = (cell.cell.flag.tag === 0) ? (new Flag(1, [])) : (new Flag(0, []));
                const newCell = new Cell(p, cell.cell.content, new Visibility(1, []), newFlag);
                return addEntity({
                    cell: newCell,
                }, removeEntity(cell, w));
            }
            else {
                return w;
            }
        }
        else {
            return w;
        }
    }
    else {
        err();
        return w;
    }
}

export function updateWorld(a, x, y, w) {
    debugInspect(x, y, w);
    if (a.tag === 1) {
        return flagCell(x, y, w);
    }
    else {
        return inspectCell(x, y, w);
    }
}

export function createWorld(difficulty, init_, init__1, a, b) {
    const init = [init_, init__1];
    const w = new World();
    return addEntities(init[0], init[1], difficulty, a, b, w);
}

