import {World} from "miniplex"

export function queryComponent (w){
    const result = w.with("position");
    return result.entities;
}