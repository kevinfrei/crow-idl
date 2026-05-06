# ts-cpp-tooling

This is my set of TS/C++ tools (specifically for dealing with projects that
involve both)

## crow-idl

An _intentionally restrictive_ IDL for generating types in C++ and Typescript
with support for automatic converson to and from
[CrowCpp](https://crowcpp.org)'s JSON types.

Use it by running

```shell
bunx --package="@freik/ts-cpp-tooling" crow-idl <args>
```

or

```shell
npx --package="@freik/ts-cpp-tooling" crow-idl <args>
```

This is mostly just used by [Cuark](https://github.com/kevinfrei/cuark) for
creation of light-weight web-UI, local logic apps (instead of Electron). I'm
using Cuark for my
[Cassette Music Player](https://github.com/kevinfrei/cassette) project,
currently.

Basically, you define your types (in a simple Typescript-hosted IDL) and
`crow-idl` will generate both Typescript and C++ files for marshalling &
unmarshalling the types as CrowCpp's JSON types.

### The types:

This supports all the std:: integer types. Note that 64 bit values translate to
JavaScript BigInt values (because that's what's necessary). It also supports
strings, 'simple' objects, arrays (as std::vectors), tuples, optional fields (as
std::optional<T>'s), and maps and sets (as either std::map/std::set or
std::unordered_map/std::unordered_set).

| crow-idl type             | TypeScript                  | C++                                     |
| ------------------------- | --------------------------- | --------------------------------------- |
| `u8()`                    | `number`                    | `std::uint8_t`                          |
| `i8()`                    | `number`                    | `std::int8_t`                           |
| `u16()`                   | `number`                    | `std::uint16_t`                         |
| `i16()`                   | `number`                    | `std::int16_t`                          |
| `u32()`                   | `number`                    | `std::uint32_t`                         |
| `i32()`                   | `number`                    | `std::int32_t`                          |
| `u64()`                   | `BigInt`                    | `std::uint64_t`                         |
| `i64()`                   | `BigInt`                    | `std::int64_t`                          |
| `flt()`                   | `number`                    | `float`                                 |
| `dbl()`                   | `number`                    | `double`                                |
| `chr()`                   | `string`                    | `char`                                  |
| `str()`                   | `string`                    | `std::string` (Should be string_u8?)    |
| `bool()`                  | `boolean`                   | `bool`                                  |
| `arr(T)`                  | `T[]`                       | `std::vector<T>`                        |
| `tup(...T)`               | `[...T]`                    | `std::tuple<...T>`                      |
| `opt(T)`                  | `T?`                        | `std::optional<T>`                      |
| `set(T)`                  | `Set<T>`                    | `std::set<T>`                           |
| `fset(T)`                 | `Set<T>`                    | `std::unordered_set<T>`                 |
| `map(K,V)`                | `Map<K,V>`                  | `std::map<K,V>`                         |
| `fmap(K,V)`               | `Map<K,V>`                  | `std::unordered_map<K,V>`               |
| `obj({Keys:Types})`       | `{Keys...: Types...}`       | `struct { Types Keys...}`               |
| `sub(ref, {Keys: Types})` | `ref & {Keys...: Types...}` | `struct : public ref { Types Keys... }` |

TODO: Document `enum_lst`, `enum_num`, and `enum_str`, plus `ref`.

To use this in C++, you'll need both the generated header, as well as the
`json_pickling.hpp` header file which can be found in the `build` subdirectory.
(TODO: maybe generate that header? Inline or as an external header?)

Notes:

- `ref` is more restrictive that most other stuff, in that you cannot have a ref
  to anything that requires 'deep' understanding of it's content. At this
  writing, I believe that means you can't have a ref to an opt type. (What you
  probably want is an opt to a ref type)

- `opt` types don't (and probably shouldn't) nest. An opt to an opt to an opt
  (should) flatten out. TODO: I think maybe this should be an error when the
  user tries it.

### TODO's

- [ ] Document the core IDL. Current examples are insufficient.

- [ ] Document the command line better. It's not complicated, but it's not
      obvious, either.

- [ ] Add support for a different JSON library, because Crow's JSON library
      leaves a lot to be desired

## ts-class-graph

Create a mermaid class graph from Typescript types & interfaces. This is very
clunky, shockingly untested, but I'm using it to document TS code that I'm
converting over to C++.

```shell
bunx --package="@freik/ts-cpp-tooling" ts-class-graph <optional path to tsconfig.json>
```
