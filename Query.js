


export function removeEntity (c,w){
    w.remove(c);
    return w;
}

export function addEntity (c,w){
    w.add(c);
    return w;
}

export function queryBoard (w){
    const result = w.with("board");
    return result.entities;
}

export function queryCell (w){
    const result = w.with("cell");
    return result.entities;
}