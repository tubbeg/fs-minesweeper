import {World} from "miniplex"



export function queryBoard (w){
    const result = w.with("board");
    return result.entities;
}

export function queryCell (w){
    const result = w.with("cell");
    return result.entities;
}