# bcg
An assembler for bun

```javascript
const cg = new CodeGen()

cg.add(0, 0, 1)
cg.ret()

const fn = cg.compile({
  returns: "i32",
  args: ["i32", "i32"],
})

const out = fn(4, 5)
console.log(`${out}!`) // 9!
```

## Build + test

```
git submodule update --recursive
cmake -Bbuild .
make -Cbuild
bun test.ts
```
