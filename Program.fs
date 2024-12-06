// For more information see https://aka.ms/fsharp-console-apps

open Fable.Core
open Browser
open Browser.Dom
open Feliz
open Board
open MiniplexInterop
open Types
open Queries

type MyStuff =
    | SomeStuff of int
    | NotAny

let x : MyStuff = SomeStuff 5

console.log x

type UpdateSystem = MSAction -> int -> int -> unit

[<ReactComponent>]
let CreateButton (x:int,y :int) (cb : UpdateSystem) w =
    let m,v, f =
        isMine (x,y) w, isVisible (x,y) w, isFlagged (x,y) w
    let t, cn =
        match m,v,f with
        | Some _,Some _,_-> "☠️", "has-background-dark"
        | _, None, Some _ -> "🏳", "has-background-black has-text-light"
        | None, Some _, _ ->
            let defTCN = "_", "has-background-dark has-text-dark"
            let p = isProxy (x,y) w
            match p with
            | Some ({content=Proxy(n);}) ->  n.ToString(), "has-background-black has-text-warning"
            | _ -> defTCN
        | _ -> "?", "has-background-black"
    
    Html.button [
        prop.style [ style.marginRight 5 ]
        prop.onClick (fun e ->  (match e.detail with |  2.0 -> cb Inspect x y | _ -> cb Flag x y))
        prop.className ("button " + cn)
        prop.text t
    ]

let createCells (r : int) (c : int) (cb : UpdateSystem) w =
    let rec cc d (l : ReactElement list) =
        match d with
        | n when n < c ->
            let b = CreateButton (n,r) cb w
            let td = Html.td [b]
            cc (n + 1) (td::l)
        | _ -> l
    cc 0 []

let createRows (rows : int) (columns : int) (cb : UpdateSystem) w =
    let rec cr d (l : ReactElement list) =
        match d with
        | n when n < rows ->
            let tds = createCells n columns cb w
            let tr = Html.tr tds
            cr (n + 1) (tr::l)
        | _ -> l
    cr 0 []

[<ReactComponent>]
let RTable (cb : UpdateSystem) (a,b) w =
    let r = createRows a  b cb w
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
let defaultDifficulty = 5

[<ReactComponent>]
let App () =
    let s = defaultSize
    let defaultWorld = createWorld defaultDifficulty defaultPosition s 
    let (world, setWorld) = React.useState({|state=defaultWorld|})
    let updateState w =
        setWorld {|state=w|}
    let table = RTable (fun a x y -> ((updateSystem a x y world.state) |> updateState))
    Html.div [
        prop.className "box centerDiv"
        prop.children [table s world.state]
    ]

let root = ReactDOM.createRoot(document.getElementById "divRoot")
root.render(App())