package game

import (
	"fmt"
	"syscall/js"
)

var Sum = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
	fmt.Printf("Sum")
	aJs := args[0].Index(0)
	bJs := args[0].Index(1)

	a := make([]uint8, aJs.Get("byteLength").Int())
	b := make([]uint8, bJs.Get("byteLength").Int())

	js.CopyBytesToGo(a, aJs)
	js.CopyBytesToGo(b, bJs)

	var sum int = 0

	for i := range a {
		sum += int(a[i]) * int(b[i])
	}

	return sum
})
