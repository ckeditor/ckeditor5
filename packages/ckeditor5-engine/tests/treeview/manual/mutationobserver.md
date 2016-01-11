@bender-ui: collapsed
@bender-tags: treeview

Try to:
 - type,
 - break paragraph,
 - delete break,
 - bold,
 - move text/paragraph,
 - insert/delete paragraph.

## Mutation Preventing ##

Document should not change, all changes should be prevented before rendering. Selection may change.

## Mutation Observer ##

Check the console for the mutation events. There should be:
 - no duplications,
 - only TreeView objects,
 - only mutation on TreeView children,
 - text mutation only if parents child list do not change.