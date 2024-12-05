module MiniplexInterop
open Fable.Core

[<Import("World","miniplex")>]
type World() =
    class
        member this.add (o : obj) = jsNative
        member this.addComponent () = jsNative
        member this.removeComponent () = jsNative
    end


[<Emit("$0.addComponent()")>]
let addComponent w  = jsNative


let w = new World()