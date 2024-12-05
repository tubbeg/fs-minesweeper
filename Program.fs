// For more information see https://aka.ms/fsharp-console-apps

open Fable.Core
open Browser
open Browser.Dom
open Feliz

type MyStuff =
    | SomeStuff of int
    | NotAny

let x : MyStuff = SomeStuff 5

console.log x

type Action =
    | Inspect
    | Flag

type UpdateSystem = Action -> int -> int -> unit

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
let RTable (cb : UpdateSystem) =
    let r = createRows 5  5 cb
    Html.div [
        Html.table [
            Html.tbody r
        ]
    ]

let updateSystem (a : Action)  (x : int) (y : int)  =
    console.log(x,y, a)
    ()

[<ReactComponent>]
let App () =
    let (count, setCount) = React.useState(0)
    let table = RTable updateSystem
    Html.div [
        prop.className "box centerDiv"
        prop.children [table]
    ]


let root = ReactDOM.createRoot(document.getElementById "divRoot")
root.render(App())