#include "sysml/code_generator.hpp"
#include "sysml/code_generator/meta_mnemonics.hpp"
#include <cstring>
#include <algorithm>
#include <array>
#include <cstddef>
#include <cstdint>
#include <numeric>
#include <type_traits>
#include <vector>

class CodeGen : public sysml::code_generator::basic_code_generator,
               public sysml::code_generator::meta_mnemonics::large_imm<CodeGen>,
               public sysml::code_generator::meta_mnemonics::m1_accelerate<CodeGen>

{
  private:
    using large_imm = sysml::code_generator::meta_mnemonics::large_imm<CodeGen>;

  public:
    CodeGen()
      : large_imm(x7)
    {
      //enable_amx();

      //meta_mov_imm(x9, 0x4000000000000000);
      //// meta_mov_imm(x10, 0x4000000000000080);
      //meta_mov_imm(x11, 1 << 27);
      //meta_mov_imm(x12, 0x110000 ^ (1 << 27));
      //meta_mov_imm(x13, 0x200040 ^ (1 << 27));
      //meta_mov_imm(x14, 0x310040 ^ (1 << 27));
      //meta_mov_imm(x15, 0x4LL << 56 | 0x80);
      //meta_mov_imm(x10, 0x2LL << 56 | 16 * 0x80);
      //orr(x0, x0, x9);
      //orr(x1, x1, x9);
      //orr(x2, x2, x9);
      //mov(x3, x2);

      //// Do this many times

      //for (auto k = 0; k < 16; ++k)
      //{
      //  // Load A[0:2]
      //  amxldx(x0);
      //  // Load B[0:2]
      //  amxldy(x1);
      //  // A[0] \otimes B[0]
      //  amxfma32(x11);
      //  // A[1] \otimes B[0]
      //  amxfma32(x12);
      //  // A[0] \otimes B[1]
      //  amxfma32(x13);
      //  // A[1] \otimes B[1]
      //  amxfma32(x14);

      //  if (k == 0)
      //  {
      //    eor(x14, x14, x11);
      //    eor(x13, x13, x11);
      //    eor(x12, x12, x11);
      //    eor(x11, x11, x11);
      //  }

      //  add(x0, x0, 0x80);
      //  add(x1, x1, 0x80);
      //}

      //for (int i = 0; i < 32; i++)
      //{
      //  if (i % 2 == 1)
      //  {
      //    continue;
      //  }
      //  amxstz(x2);
      //  add(x2, x2, x15);
      //}

      //add(x3, x3, x10);
      //for (int i = 0; i < 32; i++)
      //{
      //  if (i % 2 == 0)
      //  {
      //    continue;
      //  }
      //  amxstz(x3);
      //  add(x3, x3, x15);
      //}

      //disable_amx();
      //add(x0, x0, x1);
      //ret();
    }
};

struct Function {
  sysml::code_generator::shared_dynamic_fn<void(void)> fn;
};

extern "C" {
  void *createCodeGen() {
    return new CodeGen();
  }

  void *getFunction(void* ptr) {
    auto& cg = *reinterpret_cast<CodeGen*>(ptr);
    return new Function{std::move(cg).get_shared_fn<void(void)>()};
  }

  void _add(void* ptr, int32_t c, int32_t a, int32_t b) {
    auto& cg = *reinterpret_cast<CodeGen*>(ptr);
    cg.add(CodeGen::XReg(c), CodeGen::XReg(a), CodeGen::XReg(b));
  }

  void _ret(void* ptr) {
    auto& cg = *reinterpret_cast<CodeGen*>(ptr);
    cg.ret();
  }

  void *getPtr(void* ptr) {
    auto* wrapped = reinterpret_cast<Function*>(ptr);
    return (void*)(wrapped->fn.get());
  }


  void deleteFunction_impl(void* ptr) {
    auto* wrapped = reinterpret_cast<Function*>(ptr);
    delete wrapped;
  }

  void deleteCodeGen_impl(void* ptr) {
    auto* cg = reinterpret_cast<CodeGen*>(ptr);
    delete cg;
  }

  void* deleteFunction() {
    return (void*)deleteFunction_impl;
  }
  void* deleteCodeGen() {
    return (void*)deleteCodeGen_impl;
  }
}
