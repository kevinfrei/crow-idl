# ts-cpp-tooling

This is my set of TS/C++ tools (specifically for dealing with projects that
involve both)

## crow-idl

A very restrictive IDL for generating types in C++ and Typescript with to/from
[CrowCpp](https://crowcpp.org)'s JSON types.

Just use it by running

```shell
bunx --package="@freik/ts-cpp-tooling" crow-idl <args>
```

or

```shell
npx --package="@freik/ts-cpp-tooling" crow-idl <args>
```

This is actually actively in use by my
[Cassette Music Player](https://github.com/kevinfrei/cassette) project.

Basically, you define your types (in a simple Typescript-hosted IDL) and
`crow-idl` will generate both Typescript and C++ files for marshalling &
unmarshalling the types as CrowCpp's JSON types.

- [ ] Document the command line better. It's not complicated, but it's not
      obvious, either.

- [ ] Switch this over to the JSON stuff that my friend built in his Crow
      project, because it's pretty cool (and a lot better than Crow's stuff). Or
      maybe just add his stuff as a possible target option?

## ts-class-graph

Create a mermaid class graph from Typescript types & interfaces. This is very
clunky, shockingly untested, but I'm using it to document TS code that I'm
converting over to C++.

```shell
bunx --package="@freik/ts-cpp-tooling" ts-class-graph <optional path to tsconfig.json>
```
