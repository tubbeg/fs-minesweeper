module Types


//Discriminated Unions <3 <3
type Position = int * int
type CellContent =
    | Mine
    | Empty
    | Proxy of int
type Visibility =
    | Visible
    | Hidden
type Flag =
    | Flagged
    | NotFlagged
type Cell =
    {
        position:Position
        content:CellContent
        visibility:Visibility
        flag:Flag    
    }
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


type MSAction =
    | Inspect
    | Flag


type GameState =
    | Won
    | Lost