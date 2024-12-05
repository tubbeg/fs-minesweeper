// For more information see https://aka.ms/fsharp-console-apps

open Fable.Core
open Browser
open Browser.Dom
open Feliz
open Board
open MiniplexInterop
open Types

type MyStuff =
    | SomeStuff of int
    | NotAny

let x : MyStuff = SomeStuff 5

console.log x

type UpdateSystem = MSAction -> int -> int -> unit

[<ReactComponent>]
let CreateButton (x:int,y :int) (t : string) (cb : UpdateSystem) =
    Html.button [
        prop.style [ style.marginRight 5 ]
        prop.onClick (fun e ->  (match e.detail with |  2.0 -> cb Inspect x y | _ -> cb Flag x y))
        prop.className "button  has-background-black"
        prop.text t
    ]

let createCells (r : int) (c : int) (cb : UpdateSystem) =
    let rec cc i (l : ReactElement list) =
        match i with
        | n when n > 0 ->
            let b = CreateButton (n,r) ("MYDATA") cb
            let td = Html.td [b]
            cc (n - 1) (td::l)
        | _ -> l
    cc c []

let createRows (rows : int) (columns : int) (cb : UpdateSystem) =
    let rec cr i (l : ReactElement list) =
        match i with
        | n when n > 0 ->
            let tds = createCells n columns cb
            let tr = Html.tr tds
            cr (n - 1) (tr::l)
        | _ -> l
    cr rows []

[<ReactComponent>]
let RTable (cb : UpdateSystem) (a,b) =
    let r = createRows a  b cb
    Html.div [
        Html.table [
            Html.tbody r
        ]
    ]

let updateSystem (a : MSAction)  (x : int) (y : int) (w : World) =
    console.log(x,y, a)
    updateWorld a x y w 

let defaultSize = 10,10
let defaultPosition = 0,0
let defaultDifficulty = 60

[<ReactComponent>]
let App () =
    let defaultWorld = createWorld defaultDifficulty defaultPosition defaultSize 
    let (world, setWorld) = React.useState({|state=defaultWorld|})
    let updateState w =
        setWorld {|state=w|}
    let table = RTable (fun a x y -> ((updateSystem a x y world.state) |> updateState))
    Html.div [
        prop.className "box centerDiv"
        prop.children [table defaultSize]
    ]

let root = ReactDOM.createRoot(document.getElementById "divRoot")
root.render(App())