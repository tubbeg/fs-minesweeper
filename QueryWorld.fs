module Queries
open Fable.Core
open MiniplexInterop
open Types
open Browser

let positionIsEqual p1 p2 =
    let x,y = p1
    let a,b = p2
    (x = a) && (y = b)

[<Import("queryBoard","./Query.js")>]
let jsQueryBoard (w : World) :  (BoardAR array) option = jsNative

[<Import("queryCell","./Query.js")>]
let jsQueryCell (w : World) :  (CellAR array) option = jsNative

let queryBoard (w : World) =
    let result = jsQueryBoard w
    match result with
    | None -> None
    | Some r ->
        match r.Length with
        | n when n > 0 -> r |> Array.tryHead
        | _ -> None

let queryCells (w : World)  =
    let result = jsQueryCell w
    match result with
    | None -> None
    | Some r ->
        r |> Array.map(fun c -> c.cell) |> Some

let getNrOfMines w : (int * Cell array) option =
    let cellsAR = queryCells w
    match cellsAR with
    | None -> None
    | Some c -> 
        let mines = c |> Array.filter(fun cell -> (cell.content = Mine))
        let len = mines |> Array.length
        (len,mines) |> Some

let isMine (x,y) w =
    let p = x,y
    let query = getNrOfMines w
    match query with
    | None -> None
    | Some (nr,mines) ->
        let f = mines |> Array.filter(fun c -> (positionIsEqual c.position p))
        match f.Length with
        | n when n > 0 -> Some true
        | _ -> Some false
