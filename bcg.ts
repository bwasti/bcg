import { dlopen, toArrayBuffer, FFIType, suffix, CFunction, ptr } from "bun:ffi"

const path = `libbcg.${suffix}`

const { symbols: bcg } = dlopen(path, {
  createCodeGen: {
    returns: FFIType.ptr,
  },
  getFunction: {
    args: [FFIType.ptr],
    returns: FFIType.ptr,
  },
  getPtr: {
    args: [FFIType.ptr],
    returns: FFIType.ptr,
  },
  deleteFunction: {
    returns: FFIType.ptr,
  },
  deleteCodeGen: {
    returns: FFIType.ptr,
  },
  // THREE OPERAND
  _add: {
    args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32]
  },
  _ret: {
    args: [FFIType.ptr]
  },
})

export class Callable extends Function {
  private __self__: this
  constructor() {
    super('...args', 'return this.__self__.call(...args)')
    const self = this.bind(this)
    this.__self__ = self
    return self
  }

  call(...args: unknown[]) {
    throw new Error('You must implement a `call()` method')
  }
}
class CodeGenFunction extends Callable {
  constructor(cg, spec) {
    super()
    this.cg = cg
    this.fn_ptr = bcg.getFunction(this.cg.cg_ptr)
    this.fn_store = toArrayBuffer(this.fn_ptr, 0, 1, bcg.deleteFunction())
    const base_spec = {
      ptr: bcg.getPtr(this.fn_ptr)
    }
    this.fn = new CFunction({
      ...base_spec,
      ...spec
    })
  }

  call(...args) {
    return this.fn(...args)
  }
}

class CodeGen {
  constructor() {
    this.cg_ptr = bcg.createCodeGen()
    this.cg_store = toArrayBuffer(this.cg_ptr, 0, 1, bcg.deleteCodeGen())
  }

  compile(spec) {
    return new CodeGenFunction(this, spec)
  }

  add(c, a, b) {
    bcg._add(this.cg_ptr, c, a, b)
  }
  ret() {
    bcg._ret(this.cg_ptr)
  }
}

{

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
}

