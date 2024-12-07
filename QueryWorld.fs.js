import { equals } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { queryCell, queryBoard as queryBoard_1 } from "./Query.js";
import { tryFind, map, tryHead } from "./fable_modules/fable-library-js.4.24.0/Array.js";
import { GameState, Visibility, Flag, CellContent } from "./Types.fs.js";
import { some } from "./fable_modules/fable-library-js.4.24.0/Option.js";

export function positionIsEqual(p1_, p1__1, p2_, p2__1) {
    const p1 = [p1_, p1__1];
    const p2 = [p2_, p2__1];
    const y = p1[1];
    const x = p1[0];
    const b = p2[1];
    const a = p2[0];
    if (equals(x, a)) {
        return equals(y, b);
    }
    else {
        return false;
    }
}

export function queryBoard(w) {
    let n;
    const result = queryBoard_1(w);
    if (result != null) {
        const r = result;
        const matchValue = r.length | 0;
        if ((n = (matchValue | 0), n > 0)) {
            const n_1 = matchValue | 0;
            return tryHead(r);
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
}

export function queryCells(w) {
    const result = queryCell(w);
    if (result != null) {
        const r = result;
        return map((c) => c.cell, r);
    }
    else {
        return undefined;
    }
}

export function getNrOfMines(w) {
    const cellsAR = queryCells(w);
    if (cellsAR != null) {
        const c = cellsAR;
        const mines = c.filter((cell) => equals(cell.content, new CellContent(0, [])));
        const len = mines.length | 0;
        return [len, mines];
    }
    else {
        return undefined;
    }
}

export function getNrOfEmpties(w) {
    const cellsAR = queryCells(w);
    if (cellsAR != null) {
        const c = cellsAR;
        const e = c.filter((cell) => equals(cell.content, new CellContent(1, [])));
        const len = e.length | 0;
        return [len, e];
    }
    else {
        return undefined;
    }
}

export function getNrOfFlags(w) {
    const cellsAR = queryCells(w);
    if (cellsAR != null) {
        const c = cellsAR;
        const e = c.filter((cell) => equals(cell.flag, new Flag(0, [])));
        const len = e.length | 0;
        return [len, e];
    }
    else {
        return undefined;
    }
}

export function getNrOfHidden(w) {
    const cellsAR = queryCells(w);
    if (cellsAR != null) {
        const c = cellsAR;
        const e = c.filter((cell) => equals(cell.visibility, new Visibility(1, [])));
        const len = e.length | 0;
        return [len, e];
    }
    else {
        return undefined;
    }
}

export function getNrOfVisible(w) {
    const cellsAR = queryCells(w);
    if (cellsAR != null) {
        const c = cellsAR;
        const e = c.filter((cell) => equals(cell.visibility, new Visibility(0, [])));
        const len = e.length | 0;
        return [len, e];
    }
    else {
        return undefined;
    }
}

export function getNrOfProxies(w) {
    const isProxy_1 = (c) => {
        if (c.content.tag === 2) {
            return true;
        }
        else {
            return false;
        }
    };
    const cellsAR = queryCells(w);
    if (cellsAR != null) {
        const c_1 = cellsAR;
        const e = c_1.filter(isProxy_1);
        const len = e.length | 0;
        return [len, e];
    }
    else {
        return undefined;
    }
}

export function isMine(x, y, w) {
    const p = [x, y];
    const query = getNrOfMines(w);
    if (query != null) {
        const nr = query[0] | 0;
        const mines = query[1];
        return tryFind((c) => {
            const tupledArg = c.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], p[0], p[1]);
        }, mines);
    }
    else {
        return undefined;
    }
}

export function isEmpty(x, y, w) {
    const p = [x, y];
    const query = getNrOfEmpties(w);
    if (query != null) {
        const nr = query[0] | 0;
        const e = query[1];
        return tryFind((c) => {
            const tupledArg = c.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], p[0], p[1]);
        }, e);
    }
    else {
        return undefined;
    }
}

export function isFlagged(x, y, w) {
    const p = [x, y];
    const query = getNrOfFlags(w);
    if (query != null) {
        const e = query[1];
        return tryFind((c_1) => {
            const tupledArg = c_1.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], p[0], p[1]);
        }, e.filter((c) => equals(c.visibility, new Visibility(1, []))));
    }
    else {
        return undefined;
    }
}

export function isHidden(x, y, w) {
    const p = [x, y];
    const query = getNrOfHidden(w);
    if (query != null) {
        const nr = query[0] | 0;
        const e = query[1];
        return tryFind((c) => {
            const tupledArg = c.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], p[0], p[1]);
        }, e);
    }
    else {
        return undefined;
    }
}

export function isVisible(x, y, w) {
    const p = [x, y];
    const query = getNrOfVisible(w);
    if (query != null) {
        const nr = query[0] | 0;
        const e = query[1];
        return tryFind((c) => {
            const tupledArg = c.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], p[0], p[1]);
        }, e);
    }
    else {
        return undefined;
    }
}

export function isProxy(x, y, w) {
    const p = [x, y];
    const query = getNrOfProxies(w);
    if (query != null) {
        const nr = query[0] | 0;
        const e = query[1];
        const f = e.filter((c) => {
            const tupledArg = c.position;
            return positionIsEqual(tupledArg[0], tupledArg[1], p[0], p[1]);
        });
        return tryFind((c_1) => {
            const tupledArg_1 = c_1.position;
            return positionIsEqual(tupledArg_1[0], tupledArg_1[1], p[0], p[1]);
        }, e);
    }
    else {
        return undefined;
    }
}

export function isHiddenEmptyOrProxy(x, y, w) {
    const v = isVisible(x, y, w);
    const e = isEmpty(x, y, w);
    const p = isProxy(x, y, w);
    let matchResult;
    if (v == null) {
        if (e != null) {
            matchResult = 0;
        }
        else if (p != null) {
            matchResult = 1;
        }
        else {
            matchResult = 2;
        }
    }
    else {
        matchResult = 2;
    }
    switch (matchResult) {
        case 0:
            return true;
        case 1:
            return true;
        default:
            return false;
    }
}

export function allMinesAreFlagged(w) {
    const matchValue = queryCells(w);
    if (matchValue != null) {
        const cells = matchValue;
        const mines = cells.filter((c) => equals(c.content, new CellContent(0, [])));
        const flags = mines.filter((c_1) => equals(c_1.flag, new Flag(0, [])));
        const lenMines = mines.length | 0;
        const lenFlags = flags.length | 0;
        console.log(some("Flagged mines"), lenFlags);
        console.log(some("Mines"), lenMines);
        const MinesNotFlagged = mines.filter((c_2) => equals(c_2.flag, new Flag(1, [])));
        console.log(some("NOT FLAGGED MINES"), MinesNotFlagged);
        return lenMines === lenFlags;
    }
    else {
        return false;
    }
}

export function anyMineIsVisible(w) {
    const matchValue = queryCells(w);
    if (matchValue != null) {
        const cells = matchValue;
        const mines = cells.filter((c) => equals(c.content, new CellContent(0, [])));
        const vis = tryFind((c_1) => equals(c_1.visibility, new Visibility(0, [])), mines);
        if (vis != null) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

export function proxyOrEmpty(c) {
    const matchValue = c.content;
    switch (matchValue.tag) {
        case 2:
            return true;
        case 1:
            return true;
        default:
            return false;
    }
}

export function allEmptiesAreVisible(w) {
    const matchValue = queryCells(w);
    if (matchValue != null) {
        const cells = matchValue;
        const empties = cells.filter(proxyOrEmpty);
        const vis = empties.filter((c_1) => equals(c_1.visibility, new Visibility(0, [])));
        const lenEmpties = empties.length | 0;
        const lenVis = vis.length | 0;
        return lenEmpties === lenVis;
    }
    else {
        return false;
    }
}

export function getGameState(world) {
    if (world != null) {
        const w = world;
        const matchValue = anyMineIsVisible(w);
        const matchValue_1 = allMinesAreFlagged(w);
        if (matchValue) {
            return new GameState(1, []);
        }
        else if (matchValue_1) {
            return new GameState(0, []);
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
}

