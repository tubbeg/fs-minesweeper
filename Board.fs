module Board
open MiniplexInterop
open Fable.Core
open Types
open Queries
open System
open Browser


let rnd = new Random()

[<Import("addEntity","./Query.js")>]
let addCell (c : CellAR) (w : World) : World  = jsNative

[<Import("removeEntity","./Query.js")>]
let removeCell (c : CellAR)  (w : World) : World = jsNative

let addMineEntity pos (w : World)  =
    let cont = Mine
    let cell = {position=pos;content=cont; visibility=Hidden; flag=NotFlagged}
    w |> addCell {|cell=cell|}
    

let addProxyEntity pos n (w : World)  =
    let err () = console.log("Error! Found no cells")
    let cont = Proxy n
    let cell = {position=pos;content=cont; visibility=Hidden; flag=NotFlagged}
    let addNoReplace () = w |> addCell {|cell=cell|}
    match isEmpty pos w with
    | Some _ ->
        match jsQueryCell w with
        | Some cellsAR ->
            match cellsAR |> Array.tryFind (fun c -> (positionIsEqual pos c.cell.position)) with
            | Some cellToRemove ->
                console.log("Replacing empty cell")
                w |> removeCell cellToRemove |> addCell {|cell=cell|}
            | None ->
                err()
                addNoReplace ()
        | None-> 
                err()
                addNoReplace ()
    | None -> addNoReplace ()

let isNotOutOfBounds (x,y) (a,b) =
    (x >= 0) && (x < a) && (y >= 0) && (y < b)
let getNeighbours (x,y) (w : World) =
    let possibleNeighbours =
        [
            x - 1, y
            x + 1, y
            x, y - 1
            x, y + 1
            x - 1, y - 1
            x + 1, y + 1
            x - 1, y + 1
            x + 1, y - 1
        ]
    match queryBoard w with
    | Some b ->
        let size  = b.board.size.a, b.board.size.b
        possibleNeighbours |>
        List.filter(fun p -> (isNotOutOfBounds p size)) |>
        Some
    | None -> None

let getRandomPosition (x,y) : Position =
    rnd.Next(1, (x + 1)), rnd.Next(1, (y + 1))
        
let posIsOk pos w : bool option =  
    match queryBoard w with
    | Some b ->
        let size  = b.board.size.a, b.board.size.b
        match isEmpty pos w, isNotOutOfBounds pos size with
        | None, true -> Some true
        | _ ->
            console.log("FOUND INVALID MINE AT", pos)
            Some false
    | _ -> None

let generatePositionList  d  w =
    let errB () = printfn "Could not find board"
    let errSize ()  = printfn "Size of board is too small"
    let rec gpl (x,y) l =
        let len = l |> List.length
        match len with
        | n when n < d ->
            let pos = getRandomPosition (x,y)
            match posIsOk pos w with
            | Some false -> gpl (x,y) l
            | Some true ->
                [pos] |>
                List.append l |>
                List.distinct |>
                gpl (x,y) 
            | None -> []
        | _ -> l
    match queryBoard w with
    | None ->
        errB()
        []
    | Some board ->
        let size = board.board.size
        match (size.a * size.b) with
        |   n when (n - 1) > d ->
            gpl (size.a, size.b) []
        | _ ->
            errSize()
            []

let addMines  difficulty w =
    let posList = generatePositionList difficulty w
    let rec am (l : Position list) wrld  =
        match l with
        | pos::rem ->
            wrld |> addMineEntity pos |> am rem
        | [] -> wrld
    w |> am posList

[<Emit("$1.add($0)")>]
let addBoard (b : BoardAR)  (w : World)  : unit = jsNative

let addBoardEntity  x y w : World  =
    let b = {size={a=x; b=y}}
    let bar : BoardAR = {|board=b|}
    w |> addBoard bar
    w



let nrOfMines (x,y) (w : World) =
    let n = getNeighbours (x,y) w
    match n with
    | None ->  None
    | Some neighbours ->
        let isM c =
            match c with
            | Some _ -> true
            | _ -> false
        neighbours |>
        List.filter(fun p -> (isMine p w |> isM)) |>
        List.length |>
        Some

let createProxy (x,y) (w : World) =
    match isMine (x,y) w with
    | None ->
        match nrOfMines (x,y) w with
        | Some n when n > 0 -> addProxyEntity (x,y) n w
        | _ -> w
    | _ -> w

let addProxies (w : World) =
    let rec addProxyToRow y max init (wrld : World) =
        match init with
        | n when n < max ->
            wrld |> createProxy (init,y) |> addProxyToRow y max (init + 1)
        | _ -> wrld
    let rec addProxyToBoard size initRow wrld =
        match initRow with
        | n when n < size.a ->
            wrld |> addProxyToRow n size.b 0 |> addProxyToBoard size (n + 1)
        | _ -> wrld
    match queryBoard w with
    | Some b -> addProxyToBoard b.board.size 0 w
    | _ -> w

let createEmpty (x,y) (w : World) =
    match isMine (x,y) w, isProxy (x,y) w with
    | None, None ->
            let cell = {position=(x,y);content=Empty; visibility=Hidden; flag=NotFlagged}
            w |> addCell {|cell=cell|}
    | _ -> w 

let addEmpties (w : World) =
    let rec addEmptyRow y max init (wrld : World) =
        match init with
        | n when n < max ->
            wrld |> createEmpty (init,y) |> addEmptyRow y max (init + 1)
        | _ -> wrld
    let rec addEmptyToBoard size initRow wrld =
        match initRow with
        | n when n < size.a ->
            wrld |> addEmptyRow n size.b 0 |> addEmptyToBoard size (n + 1)
        | _ -> wrld
    match queryBoard w with
    | Some b -> addEmptyToBoard b.board.size 0 w
    | _ -> w

let addReserves (init : Position) w =
    console.log("ADDING RESERVES AT ", init)
    let rec addCells  (p : Position list) wrld =
        match p with
        | [] -> wrld
        | el::rem ->
            let cell = {position=el;content=Empty; visibility=Hidden; flag=NotFlagged}
            w |> addCell {|cell=cell|} |> addCells rem
    match (getNeighbours init w) with
    | None -> w
    | Some nb -> addCells (init::nb) w

let addEntities init difficulty x y w : World = 
    w |>
    addBoardEntity x y |>
    addReserves init |>
    addMines difficulty |>
    addProxies |>
    addEmpties

let debugInspect x y w : unit =
    console.log("Inspecting",x,y)
    match isMine (x,y) w with
    | None -> ()
    | Some _ -> console.log("Cell is a mine? ")
    match nrOfMines (x,y) w with
    | Some n -> console.log("Number of mine neighbours:", n)
    | _ -> console.log("Has ZERO mine neighbours")
    match isFlagged (x,y) w with
    | None -> ()
    | Some _ -> console.log("Cell is flagged: ")
    match isVisible (x,y) w with
    | None -> console.log("Cell is visible: ")
    | Some _ -> console.log("Cell is visible: ")
    match isEmpty (x,y) w with
    | None -> console.log("Cell is not empty: ")
    | Some _ -> console.log("Cell is empty: ")
    match isProxy (x,y) w with
    | None -> ()
    | Some p ->
        match p.content with
        | Proxy n ->
            console.log("Cell is proxy:",n)
        | _ -> console.log("Error, cell is a proxy, but does not have proxy property")
    ()

let revealCell (x,y) w =
    match jsQueryCell w with
    | Some cells ->
        match cells |> Array.tryFind(fun c -> (positionIsEqual c.cell.position (x,y))) with
        | Some cell ->
            let cont = cell.cell.content
            let newCell = {|cell={position=(x,y);content=cont;visibility=Visible;flag=NotFlagged}|}
            let newWorld = w |> removeCell cell |> addCell newCell
            newWorld, Some cont
        | _ ->
            console.log("Unable to find cell", x,y)
            w,None
    | _ ->
        console.log("Unable to find cells")
        w, None

let inspectCell (x,y) (w : World) = 
    let err () = printfn "Failed to inspect cell!"
    let rec ins (wrld : World) l =
        match l with
        | [] -> Some wrld
        | p::rem ->
            match revealCell p wrld with
            | newWorld, None -> ins newWorld rem
            | newWorld, Some (Mine) -> ins newWorld rem
            | newWorld , Some (Proxy(_)) -> ins newWorld rem
            | newWorld, Some (Empty) ->
                printfn "Getting neighbours"
                match getNeighbours p newWorld with
                | Some nb ->
                    nb |>
                    List.filter(fun p -> (isHiddenEmptyOrProxy p newWorld)) |>
                    List.append  rem |>
                    List.distinct |>
                    ins newWorld 
                | None -> None
    match ins w [(x,y)] with
    | Some world -> world
    | _ ->
        err()
        w


let flagCell p (w : World) =
    let err () = printfn "Cannot flag visible cell"
    let v = isVisible p w 
    match v with
    | None ->
        match jsQueryCell w with
        | Some cells ->
            match cells |> Array.tryFind (fun c -> positionIsEqual p c.cell.position) with
            | Some cell ->
                let newFlag =
                    match cell.cell.flag with
                    | Flagged -> NotFlagged
                    | _ -> Flagged
                let newCell = {position=p;content=cell.cell.content; visibility=Hidden; flag=newFlag}
                w |> removeCell cell |> addCell {|cell=newCell|}
            | _ -> w
        | _ -> w
    | _ ->
        err()
        w

let updateWorld (a : MSAction) (x : int) (y : int) (w : World) : World  =
    debugInspect x y w
    match a with
    | Inspect -> inspectCell (x,y) w
    | Flag -> flagCell (x,y) w


let createWorld difficulty (init : Position) (a :int,b : int) =
    let w = new World()
    w |> addEntities init difficulty a b