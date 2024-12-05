module Board
open MiniplexInterop
open Fable.Core

//Discriminated Unions <3 <3
type Position = int * int
type CellContent =
    | Mine
    | Empty
    | Proxy of int
type Visbility =
    | Visible
    | HIdden
type Flag =
    | Flagged
    | NotFlagged
type Cell =
    | Content of CellContent
    | Visbility of Visbility
    | Flag of Flag
type Size =
    {
        a:int
        b:int
    }
type Board = {size: Size}

//anonymous records are translated directly into
//js objects which makes them preferable for js interop
type CellAR = {|cell:Cell|}
type BoardAR = {|board: Board|}


[<Emit("$1.add($0)")>]
let addCell (w : World) (m : CellAR)  = jsNative


let addMines w =
    w

[<Emit("$1.add($0)")>]
let addBoard (b : BoardAR)  (w : World)  : unit = jsNative

let addBoardEntity  x y w : World  =
    let b = {size={a=x; b=y}}
    w |> addBoard {|board=b|}
    w

let addEntities x y w : World = 
    w |> addBoardEntity x y |> addMines


let createWorld (init : Position) (a :int,b : int) =
    let w = new World()
    w |> addEntities a b