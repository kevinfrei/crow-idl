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

type NamedType = { name: string; type: string };
interface NodeInfo {
  name: string;
  kind: 'interface' | 'type';
  extends: string[];
  props: NamedType[];
}

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

function extractInterface(iface: InterfaceDeclaration): NodeInfo {
  const name = iface.getName();

  const extendsNames = iface
    .getExtends()
    .map((e) => e.getExpression().getText());

  const props = iface.getProperties().map((p) => ({
    name: p.getName(),
    type: p.getType().getText(),
  }));

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

  const props: NamedType[] = [];

  // Handle object-like types
  if (type.isObject()) {
    for (const prop of type.getProperties()) {
      const propType = prop.getTypeAtLocation(alias);
      props.push({
        name: prop.getName(),
        type: propType.getText(),
      });
    }
  }

  // Handle unions, intersections, primitives, etc. as needed

  return {
    name,
    kind: 'type',
    extends: [], // type aliases don't "extend" but you can infer relationships
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
console.log('classDiagram');

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

function cleanParams(params: string): string {
  // This is a very naive implementation and won't handle nested *anything* correctly.
  return params.replaceAll(/:[^,]+([),])/g, '$1');
}

function deImport(typeStr: string): string {
  // This is a very naive implementation and won't handle nested *anything* correctly.
  return typeStr.replaceAll(/import\(".*"\)\./g, '');
}

function deGeneric(typeStr: string): string {
  return typeStr.replaceAll('<', '~').replaceAll('>', '~');
}

function getMemberName(p: NamedType): string {
  if (p.type.startsWith('(')) {
    // This needs to handle nesting...eventually. For now, just look for the first "=>"
    const retType = p.type.indexOf(') => ') + 5;
    if (retType > 5) {
      const params = p.type.slice(0, retType - 4);
      return `${p.name}${cleanParams(params)} ${deImport(deGeneric(p.type.substring(retType)))}`;
    }
  } else {
    return `${deImport(deGeneric(p.type))} ${p.name}`;
  }
  return '';
}
for (const node of nodes.values()) {
  for (const p of node.props) {
    // console.log(p.type);
    // if (nodes.has(p.type)) {
    console.log(`    ${node.name} : ${getMemberName(p)}`);
    // }
  }
}
