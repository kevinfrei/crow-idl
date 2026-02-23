#!/usr/bin/env bun
import { InterfaceDeclaration, Project, TypeAliasDeclaration } from 'ts-morph';

type FuncProp = { name: string; args: string; result: string };
type DataProp = { name: string; type: string };
type Property = FuncProp | DataProp;

type NodeInfo = {
  name: string;
  kind: 'interface' | 'type';
  extends: string[];
  props: Property[];
};

function cleanParams(params: string): string {
  // This is a very naive implementation and won't handle nested *anything* correctly.
  return params.replaceAll(/:[^,]+([),])/g, '$1');
}

function deImport(typeStr: string): string {
  // This is a very naive implementation and won't handle nested *anything* correctly.
  return typeStr.replaceAll(/import\("[^"]*"\)\./g, '');
}

function unPromise(typeStr: string): string {
  if (typeStr.startsWith('Promise<') && typeStr.endsWith('>')) {
    return typeStr.slice(8, -1);
  }
  return typeStr;
}

function deGeneric(typeStr: string): string {
  return typeStr.replaceAll('<', '~').replaceAll('>', '~');
}

function cleanType(typeStr: string): string {
  return unPromise(deImport(typeStr)).trim();
}

function unVoid(typeStr: string): string {
  typeStr = typeStr
    .trim()
    .replaceAll(/\s*\|\s*void\s*/g, '')
    .replaceAll(/void\s*\|\s*/g, '')
    .replaceAll(/\s*\|\s*null\s*/g, '')
    .replaceAll(/null\s*\|\s*/g, '')
    .replaceAll(/\s*\|\s*undefined\s*/g, '')
    .replaceAll(/undefined\s*\|\s*/g, '')
    .trim();
  return typeStr === 'void' || typeStr === 'undefined' || typeStr === 'null'
    ? ''
    : typeStr;
}

function MakeFuncProp(name: string, args: string, result: string): FuncProp {
  result = cleanType(result);
  args = cleanParams(args).slice(1, -1); // Remove the parentheses
  return { name, args, result };
}

function MakeDataProp(name: string, type: string): DataProp {
  return { name, type: cleanType(type) };
}

function MakeProp(name: string, type: string): Property {
  if (type.startsWith('(')) {
    // This needs to handle nesting...eventually. For now, just look for the first "=>"
    const retStart = type.indexOf(') => ') + 5;
    if (retStart <= 5) {
      throw new Error('Invalid function signature');
    }
    const params = type.slice(0, retStart - 4);
    return MakeFuncProp(name, params, type.substring(retStart));
  }
  return MakeDataProp(name, type);
}

function extractInterface(iface: InterfaceDeclaration): NodeInfo {
  const name = iface.getName();

  const extendsNames = iface
    .getExtends()
    .map((e) => e.getExpression().getText());

  const props = iface
    .getProperties()
    .map((p) => MakeProp(p.getName(), p.getType().getText()));

  return {
    name,
    kind: 'interface',
    extends: extendsNames,
    props,
  };
}

function extractTypeAlias(alias: TypeAliasDeclaration): NodeInfo {
  const name = alias.getName();
  const type = alias.getType();

  const props: Property[] = [];
  const extendsNames: string[] = [];

  // Handle object-like types
  if (type.isObject()) {
    for (const prop of type.getProperties()) {
      const propType = prop.getTypeAtLocation(alias);
      props.push(MakeProp(prop.getName(), propType.getText()));
      extendsNames.push(...type.getIntersectionTypes().map((t) => t.getText()));
    }
  }

  // Handle unions, intersections, primitives, etc. as needed

  return {
    name,
    kind: 'type',
    extends: extendsNames,
    props,
  };
}

function GetMemberName(p: Property): string {
  if ('args' in p) {
    const res = unVoid(deGeneric(p.result));
    return `${p.name}(${p.args}) ${res}`;
  }
  return `${deGeneric(p.type)} ${p.name}`;
}

const builtInTypes = new Set<string>([
  'Buffer',
  'Date',
  'string',
  'number',
  'boolean',
  'symbol',
  'bigint',
  'any',
  'unknown',
]);
function NotBuiltinType(typeStr: string): boolean {
  typeStr = typeStr.endsWith('[]') ? typeStr.slice(0, -2) : typeStr;
  return !builtInTypes.has(typeStr);
}

function unAggregate(typeStr: string): string {
  if (typeStr.endsWith('[]')) {
    return typeStr.slice(0, -2);
  }
  if (typeStr.startsWith('Set<') && typeStr.endsWith('>')) {
    return typeStr.slice(4, -1);
  }
  if (
    (typeStr.startsWith('Map<') || typeStr.startsWith('MultiMap<')) &&
    typeStr.endsWith('>')
  ) {
    const comma = typeStr.indexOf(',');
    if (comma === -1) {
      return typeStr;
    }
    return typeStr.slice(comma + 1, -1).trim();
  }
  return typeStr;
}

function ShowRelation(className: string, result: string, kind: string) {
  const res = unVoid(result);
  const cleanType = unAggregate(res);
  if (res !== '' && NotBuiltinType(cleanType)) {
    const relation =
      res.length != result.length
        ? '"0..1"'
        : res.endsWith('[]')
          ? '"many"'
          : '';
    console.log(
      `    ${className} --> ${relation} ${deGeneric(cleanType)} : ${kind}`,
    );
  }
}

function ShowRelations(className: string, p: Property) {
  if ('args' in p) {
    ShowRelation(className, p.result, 'returns');
  } else {
    ShowRelation(className, p.type, 'has');
  }
}

function ShowProp(className: string, p: Property) {
  const memberName = GetMemberName(p);
  console.log(`    ${className} : ${memberName}`);
  ShowRelations(className, p);
}

function MakeMermaidGraph(tsConfigFilePath: string) {
  const project = new Project({ tsConfigFilePath });

  const nodes = new Map<string, NodeInfo>();
  for (const sf of project.getSourceFiles()) {
    sf.getInterfaces()
      .map(extractInterface)
      .forEach((n) => nodes.set(n.name, n));
    sf.getTypeAliases()
      .map(extractTypeAlias)
      .forEach((n) => nodes.set(n.name, n));
  }

  // Emit Mermaid
  console.log(`---
  config:
    class:
      hideEmptyMembersBox: true
---
classDiagram`);

  // Only show classes that have some relationship or members for now
  // for (const node of nodes.values()) {
  //   console.log(`    class ${node.name}`);
  // }

  for (const node of nodes.values()) {
    for (const base of node.extends) {
      if (nodes.has(base)) {
        console.log(`    ${node.name} --|> ${base} : extends`);
      }
    }
  }

  for (const node of nodes.values()) {
    for (const p of node.props) {
      ShowProp(node.name, p);
    }
  }
}

MakeMermaidGraph(process.argv.length > 2 ? process.argv[2]! : 'tsconfig.json');
