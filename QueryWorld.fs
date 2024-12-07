module Queries
open Fable.Core
open MiniplexInterop
open Types
open Browser

//running queries each time in these functions is going to be quite inefficient
//however performance is a low priority for this project

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

let getNrOfEmpties w : (int * Cell array) option =
    let cellsAR = queryCells w
    match cellsAR with
    | None -> None
    | Some c -> 
        let e = c |> Array.filter(fun cell -> (cell.content = Empty))
        let len = e |> Array.length
        (len,e) |> Some

let getNrOfFlags w : (int * Cell array) option =
    let cellsAR = queryCells w
    match cellsAR with
    | None -> None
    | Some c -> 
        let e = c |> Array.filter(fun cell -> (cell.flag = Flagged))
        let len = e |> Array.length
        (len,e) |> Some

let getNrOfHidden w : (int * Cell array) option =
    let cellsAR = queryCells w
    match cellsAR with
    | None -> None
    | Some c -> 
        let e = c |> Array.filter(fun cell -> (cell.visibility = Hidden))
        let len = e |> Array.length
        (len,e) |> Some

let getNrOfVisible w : (int * Cell array) option =
    let cellsAR = queryCells w
    match cellsAR with
    | None -> None
    | Some c -> 
        let e = c |> Array.filter(fun cell -> (cell.visibility = Visible))
        let len = e |> Array.length
        (len,e) |> Some

let getNrOfProxies w : (int * Cell array) option =
    let isProxy c =
        match c.content with
        | Proxy(_) ->  true
        | _ -> false
    let cellsAR = queryCells w
    match cellsAR with
    | None -> None
    | Some c -> 
        let e = c |> Array.filter(fun cell -> (isProxy cell))
        let len = e |> Array.length
        (len,e) |> Some


//Options are absolutely beautiful
let isMine (x,y) w =
    let p = x,y
    let query = getNrOfMines w
    match query with
    | None -> None
    | Some (nr,mines) ->
        mines |> Array.tryFind(fun c -> (positionIsEqual c.position p))

let isEmpty (x,y) w =
    let p = x,y
    let query = getNrOfEmpties w
    match query with
    | None -> None
    | Some (nr,e) ->
        e |> Array.tryFind(fun c -> (positionIsEqual c.position p))

let isFlagged (x,y) w =
    let p = x,y
    let query = getNrOfFlags w
    match query with
    | None -> None
    | Some (_,e) ->
        e |>
        Array.filter(fun c -> (c.visibility = Hidden)) |>
        Array.tryFind(fun c -> (positionIsEqual c.position p))

let isHidden (x,y) w =
    let p = x,y
    let query = getNrOfHidden w
    match query with
    | None -> None
    | Some (nr,e) ->
        e |> Array.tryFind(fun c -> (positionIsEqual c.position p))

let isVisible (x,y) w =
    let p = x,y
    let query = getNrOfVisible w
    match query with
    | None -> None
    | Some (nr,e) ->
        e |> Array.tryFind(fun c -> (positionIsEqual c.position p))

let isProxy (x,y) w =
    let p = x,y
    let query = getNrOfProxies w
    match query with
    | None -> None
    | Some (nr,e) ->
        let f = e |> Array.filter(fun c -> (positionIsEqual c.position p))
        e |> Array.tryFind(fun c -> (positionIsEqual c.position p))

let isHiddenEmptyOrProxy (x,y) w =
    let v = isVisible (x,y) w
    let e = isEmpty (x,y) w
    let p = isProxy (x,y) w
    match v,e,p with
    | None, Some _, _ -> true
    | None, _, Some _ -> true
    | _ -> false


let allMinesAreFlagged w =
    match queryCells w with
    | None -> false
    | Some cells ->
        let mines = cells |> Array.filter(fun c -> (c.content = Mine))
        let flags = mines |> Array.filter(fun c -> (c.flag = Flagged))
        let lenMines = mines |> Array.length
        let lenFlags = flags |> Array.length
        console.log("Flagged mines", lenFlags)
        console.log("Mines", lenMines)
        let MinesNotFlagged = mines |> Array.filter(fun c -> (c.flag = NotFlagged))
        console.log("NOT FLAGGED MINES", MinesNotFlagged)
        (lenMines = lenFlags)

let anyMineIsVisible w =
    match queryCells w with
    | None -> false
    | Some cells ->
        let mines = cells |> Array.filter(fun c -> (c.content = Mine))
        let vis = mines |> Array.tryFind(fun c -> (c.visibility = Visible))
        match vis with
        | Some _ -> true
        | _ ->false

let proxyOrEmpty c =
    match c.content with
    | Proxy (_) -> true
    | Empty -> true
    | _ -> false
    
let allEmptiesAreVisible w =
    match queryCells w with
    | None -> false
    | Some cells ->
        let empties = cells |> Array.filter (fun c ->(proxyOrEmpty c))
        let vis = empties |> Array.filter(fun c -> (c.visibility = Visible))
        let lenEmpties = empties |> Array.length
        let lenVis = vis |> Array.length
        (lenEmpties = lenVis)


let getGameState (world : World option) = 
    match world with
    | None -> None
    | Some w ->
        match anyMineIsVisible w,allMinesAreFlagged w with
        | true, _ -> Some Lost
        | _, true -> Some Won
        | _ -> None