# ts-cpp-tooling

This is my set of TS/C++ tools (specifically for dealing with projects that
involve both)

## crow-idl

An _intentionally restrictive_ IDL for generating types in C++ and Typescript with
support for automatic converson to and from [CrowCpp](https://crowcpp.org)'s JSON types.

Use it by running

```shell
bunx --package="@freik/ts-cpp-tooling" crow-idl <args>
```

or

```shell
npx --package="@freik/ts-cpp-tooling" crow-idl <args>
```

This is mostly just used by [Cuark](https://github.com/kevinfrei/cuark) for creation
of light-weight web-UI, local logic apps (instead of Electron). I'm using Cuark for my
[Cassette Music Player](https://github.com/kevinfrei/cassette) project, currently.

Basically, you define your types (in a simple Typescript-hosted IDL) and
`crow-idl` will generate both Typescript and C++ files for marshalling &
unmarshalling the types as CrowCpp's JSON types.

### The types:

This supports all the std:: integer types. Note that 64 bit values translate to JavaScript BigInt values (because
that's what's necessary). It also supports strings, 'simple' objects, arrays (as std::vectors), tuples, optional fields (as std::optional<T>'s), and maps and sets (as either std::map/std::set or std::unordered_map/std::unordered_set).

Notes:

- 'ref' is more restrictive that most other stuff, in that you cannot have a ref
  to anything that requires 'deep' understanding of it's content. At this
  writing, I believe that means you can't have a ref to an opt type.

- 'opt' types don't really nest. An opt to an opt to an opt (should) flatten
  out.

### TODO's

- [ ] Document the core IDL. Current examples are insufficient.

- [ ] Document the command line better. It's not complicated, but it's not
      obvious, either.

- [ ] Add support for a different JSON library, because Crow's JSON library leaves a lot to be desired

## ts-class-graph

Create a mermaid class graph from Typescript types & interfaces. This is very
clunky, shockingly untested, but I'm using it to document TS code that I'm
converting over to C++.

```shell
bunx --package="@freik/ts-cpp-tooling" ts-class-graph <optional path to tsconfig.json>
```
