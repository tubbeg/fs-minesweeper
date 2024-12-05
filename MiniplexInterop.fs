module MiniplexInterop
open Fable.Core

[<Import("World","miniplex")>]
type World() =
    class
        member this.add () = jsNative
        member this.addComponent () = jsNative
        member this.removeComponent () = jsNative
    end


let w = new World()