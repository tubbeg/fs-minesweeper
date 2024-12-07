// For more information see https://aka.ms/fsharp-console-apps

open Fable.Core
open Browser
open Browser.Dom
open Feliz
open Board
open MiniplexInterop
open Types
open Queries

type UpdateSystem = MSAction -> int -> int -> unit

[<ReactComponent>]
let CreateButton (x:int,y :int) (cb : UpdateSystem) (world : World option) =
    let m,v, f, p =
        match world with
        | Some w -> isMine (x,y) w, isVisible (x,y) w, isFlagged (x,y) w, isProxy (x,y) w
        | _ -> None,None,None,None
    let t, cn =
        match m,v,f with
        | Some _,Some _,_-> "☠️", "has-background-dark"
        | _, None, Some _ -> "🏳", "has-background-black has-text-light"
        | None, Some _, _ ->
            let defTCN = "_", "has-background-dark has-text-dark"
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

let createCells (r : int) (c : int) (cb : UpdateSystem)  (w : World option) =
    let rec cc d (l : ReactElement list) =
        match d with
        | n when n < c ->
            let b = CreateButton (n,r) cb w
            let td = Html.td [b]
            cc (n + 1) (td::l)
        | _ -> l
    cc 0 []

let createRows (rows : int) (columns : int) (cb : UpdateSystem)  (w : World option) =
    let rec cr d (l : ReactElement list) =
        match d with
        | n when n < rows ->
            let tds = createCells n columns cb w
            let tr = Html.tr tds
            cr (n + 1) (tr::l)
        | _ -> l
    cr 0 []

[<ReactComponent>]
let RTable (cb : UpdateSystem) (a,b) (w : World option) =
    let r = createRows a  b cb w
    Html.div [
        Html.table [
            Html.tbody r
        ]
    ]

let updateSystem (a : MSAction)  (x : int) (y : int) (w : World) =
    console.log(x,y, a)
    updateWorld a x y w 



[<ReactComponent>]
let Title () =
    Html.div [
        prop.className "box has-text-primary"
        prop.text "Minesweeper"
    ]



[<ReactComponent>]
let ResetButton cb =
    Html.div [
        prop.className "box"
        prop.children [
            Html.button [
                prop.text "Reset"
                prop.className "button"
                prop.onClick cb
            ]
        ]
    ]

let defaultSize = 10,10
let defaultPosition = 0,0
let defaultDifficulty = 10

[<ReactComponent>]
let App () =
    let s = defaultSize
    let d = defaultDifficulty
    let defaultStart = false
    let defaultWorld = None
    let (world, setWorld) = React.useState({|state=defaultWorld|})
    let updateState w =
        setWorld {|state=w|}
    let runWorld a x y =
        match world.state with
        | None ->
            match a with
            | Inspect -> createWorld d (x,y) s |> updateSystem a x y |> Some |> updateState
            | _ -> ()
        | Some w -> updateSystem a x y w |> Some |> updateState
    let table = RTable runWorld
    let resetWorld e = setWorld {|state=None|}
    Html.div [
        prop.className "box centerDiv"
        prop.children [
            Title()
            ResetButton resetWorld
            table s world.state
        ]
    ]


let runApp el =
    let rRoot = ReactDOM.createRoot el
    rRoot.render(App())

let root = document.getElementById "divRoot"
runApp root
