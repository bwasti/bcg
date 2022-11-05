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

export class CodeGen {
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

