import { CodeGen } from './bcg'

const cg = new CodeGen()

cg.add(0, 0, 1)
cg.ret()

const fn = cg.compile({
  returns: "i32",
  args: ["i32", "i32"],
})

const f = fn.fn
const iters = 10000000
for (let i = 0; i < iters/100; ++i) {
  const c = f(4, 5)
}
const t0 = performance.now()
for (let i = 0; i < iters; ++i) {
  const c = f(4, 5)
}
const t1 = performance.now()
console.log(1e6 * (t1 - t0) / iters, 'ns/iter')
const c = fn(4, 5)
console.log(c)


