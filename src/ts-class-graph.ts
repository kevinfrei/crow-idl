#!/usr/bin/env bun
import { InterfaceDeclaration, Project, TypeAliasDeclaration } from 'ts-morph';

/*
---
  config:
    class:
      hideEmptyMembersBox: true
---
classDiagram
    FlatAudioDatabase : SongWithPath[] songs
    FlatAudioDatabase --> "many" SongWithPath : has
    FlatAudioDatabase : Artist[] artists
    FlatAudioDatabase --> "many" Artist : has
    FlatAudioDatabase : Album[] albums
    FlatAudioDatabase --> "many" Album : has
    AudioDatabase : getSong(key) void | SongWithPath
    AudioDatabase "*" --> "0..1" SongWithPath : gets
    AudioDatabase : getAlbum(key) void | Album
    AudioDatabase "*" --> "0..1" Album : gets
    AudioDatabase : getArtist(key) void | Artist
    AudioDatabase "*" --> "0..1" Artist : gets
    AudioDatabase : getSongFromPath(filepath) string
    AudioDatabase : searchIndex(substring, term) SearchResults
    AudioDatabase : addAudioFileIndex(idx) Promise~boolean~
    AudioDatabase : removeAudioFileIndex(idx) Promise~boolean~
    AudioDatabase : addFileLocation(str) Promise~boolean~
    AudioDatabase : removeFileLocation(str) Promise~boolean~
    AudioDatabase : getLocations() string[]
    AudioDatabase : getAlbumPicture(key) Promise~void | Buffer~
    AudioDatabase : setAlbumPicture(key, filepath) Promise~void~
    AudioDatabase : getArtistPicture(key) Promise~void | Buffer~
    AudioDatabase : setArtistPicture(key, filepath) Promise~void~
    AudioDatabase : getSongPicture(key) Promise~void | Buffer~
    AudioDatabase : setSongPicture(key, filepath) Promise~void~
    AudioDatabase : clearImageCache() Promise~void~
    AudioDatabase : addIgnoreItem(which, value) void
    AudioDatabase : removeIgnoreItem(which, value) boolean
    AudioDatabase : getIgnoreItems() IterableIterator~[IgnoreType, string]~
    AudioDatabase : getFlatDatabase() FlatAudioDatabase
    AudioDatabase --> "1" FlatAudioDatabase : gets
    AudioDatabase : load() Promise~boolean~
    AudioDatabase : save() Promise~void~
    AudioDatabase : refresh() Promise~boolean~
    AudioDatabase : updateMetadata(fullPath, newMetadata) boolean
    AudioDatabase : getMetadata(fullPathOrKey) Promise~void | FullMetadata~
    AudioDatabase "*" --> "0..1" FullMetadata : gets
    AudioDatabase : getCanonicalFileName(song) string | void
    AudioDatabase : clearMetadataCache() void
    AudioDatabase : clearLocalMetadataOverrides() void
    PrivateAudioData : Map~string, AudioFileIndex~ dbAudioIndices
    PrivateAudioData "*" --> "many" AudioFileIndex : has
    PrivateAudioData : Map~string, SongWithPath~ dbSongs
    PrivateAudioData --> "many" SongWithPath : has
    PrivateAudioData : Map~string, Album~ dbAlbums
    PrivateAudioData --> "many" Album : has
    PrivateAudioData : Map~string, Artist~ dbArtists
    PrivateAudioData --> "many" Artist : has
    PrivateAudioData : MultiMap~string, string~ albumTitleIndex
    PrivateAudioData : Map~string, string~ artistNameIndex
    PrivateAudioData : MusicSearch | null keywordIndex
    PrivateAudioData : IgnoreType, string~ ignoreInfo
    AudioFileIndex : getHashForIndex() string
    AudioFileIndex : getLocation() string
    AudioFileIndex : makeSongKey(songPath) string
    AudioFileIndex : forEachAudioFile(fn) Promise~void~
    AudioFileIndex : forEachAudioFileSync(fn) void
    AudioFileIndex : getLastScanTime() Date | null
    AudioFileIndex : rescanFiles(addAudioFile?, delAudioFile?) Promise~void~
    AudioFileIndex : updateMetadata(newMetadata) void
    AudioFileIndex : getMetadataForSong(filePath) Promise~void | FullMetadata~
    AudioFileIndex : clearMetadataCache() Promise~void~
    AudioFileIndex : clearLocalMetadataOverrides() Promise~void~
    AudioFileIndex : setImageForSong(filePathOrKey, buf) Promise~void~
    AudioFileIndex : getImageForSong(filePathOrKey, preferInternal?) Promise~void | Buffer~
    AudioFileIndex : clearLocalImageCache() Promise~void~
    AudioFileIndex : destroy() void
    AudioFileIndex : addIgnoreItem(which, value) void
    AudioFileIndex : removeIgnoreItem(which, value) boolean
    AudioFileIndex : getIgnoreItems() IterableIterator~[IgnoreType, string]~
    AudioFileIndex : symbol __@FreikTypeTag@2829
    IndexLocation : string location
    IndexLocation : AudioFileIndex index
    AudioFileIndexOptions : string readOnlyFallbackLocation
    AudioFileIndexOptions : Watcher fileWatchFilter
    AudioFileIndexOptions : boolean watchHidden
    BlobStore : get(key) Promise~void | Buffer~
    BlobStore : put(data, key) Promise~void~
    BlobStore : putMany(data, key) Promise~void~
    BlobStore : delete(key) Promise~void~
    BlobStore : clear() Promise~void~
    BlobStore : flush() Promise~void~
    MetadataStore : get(filepath) void | MinimumMetadata
    MetadataStore : set(filepath, md) void
    MetadataStore : merge(filepath, md) void
    MetadataStore : overwrite(filepath, md) void
    MetadataStore : fail(filepath) void
    MetadataStore : shouldTry(filepath) boolean
    MetadataStore : save() void
    MetadataStore : load() Promise~boolean~
    MetadataStore : flush() Promise~void~
    MetadataStore : clear() Promise~void~
    MusicSearch : Searchable~string~ songs
    MusicSearch : Searchable~string~ albums
    MusicSearch : Searchable~string~ artists
    SearchResults : string[] songs
    SearchResults : string[] albums
    SearchResults : string[] artists
*/

type FuncProp = { name: string; args: string; result: string };
type DataProp = { name: string; type: string };
type Property = FuncProp | DataProp;

interface NodeInfo {
  name: string;
  kind: 'interface' | 'type';
  extends: string[];
  props: Property[];
}

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
  return unPromise(typeStr).replaceAll('<', '~').replaceAll('>', '~');
}

function cleanType(typeStr: string): string {
  return deGeneric(deImport(typeStr));
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

function MakeFuncProp(name: string, argPack: string, result: string): FuncProp {
  result = cleanType(result);
  argPack = cleanParams(argPack);
  const args = argPack.substring(1, argPack.length - 1);
  //console.log(`FuncProp: ${n ame}(${argPack}) : ${result}`);
  return { name, args, result };
}

function MakeDataProp(name: string, type: string): DataProp {
  return { name, type: cleanType(type) };
}

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

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

function getMemberName(p: Property): string {
  if ('args' in p) {
    const res = unVoid(p.result);
    return `${p.name}(${p.args}) ${res}`;
  }
  return `${p.type} ${p.name}`;
}

for (const node of nodes.values()) {
  for (const p of node.props) {
    console.log(`    ${node.name} : ${getMemberName(p)}`);
  }
}
