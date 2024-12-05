module Board
open MiniplexInterop
open Fable.Core
open Types
open Queries
open System
open Browser


let rnd = new Random()


[<Emit("$1.add($0)")>]
let addCell (m : CellAR) (w : World) : unit  = jsNative

let addMine pos (w : World)  =
    let cont = Mine
    let cell = {position=pos;content=cont; visibility=Hidden; flag=NotFlagged}
    w |> addCell {|cell=cell|}
    w

let getRandomPosition (x,y) : Position =
    rnd.Next(1, (x + 1)), rnd.Next(1, (y + 1))
        
let generatePositionList d  w =
    let errB () = printfn "Could not find board"
    let errSize ()  = printfn "Size of board is too small"
    let rec gpl  (x,y) l =
        let len = l |> List.length
        match len with
        | n when n < d ->
            let p = getRandomPosition (x,y) 
            l |> List.distinct |> List.append [p] |> gpl (x,y)
        | _ -> l
    let b = queryBoard w
    match b with
    | None ->
        errB()
        []
    | Some board ->
        let size = board.board.size
        match (size.a * size.b) with
        | n when (n - 1) > d ->
            gpl (size.a, size.b) []
        | _ ->
            errSize()
            []

let addMines  difficulty w =
    let posList = generatePositionList difficulty w
    let rec am (l : Position list) wrld  =
        match l with
        | pos::rem ->
            wrld |> addMine pos |> am rem
        | [] -> wrld
    w |> am posList

[<Emit("$1.add($0)")>]
let addBoard (b : BoardAR)  (w : World)  : unit = jsNative

let addBoardEntity  x y w : World  =
    let b = {size={a=x; b=y}}
    let bar : BoardAR = {|board=b|}
    w |> addBoard bar
    w

let addEntities difficulty x y w : World = 
    w |> addBoardEntity x y |> addMines difficulty

let debugInspect x y w : unit =
    console.log("Inspecting",x,y)
    match isMine (x,y) w with
    | None -> ()
    | Some b -> console.log("Cell is a mine?: ", b)
    ()

let updateWorld (a : MSAction) (x : int) (y : int) w  =
    console.log("Updating WORLD HERE NOW")
    debugInspect x y w
    w


let createWorld difficulty (init : Position) (a :int,b : int) =
    let w = new World()
    w |> addEntities difficulty a b