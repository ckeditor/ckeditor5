# List with skip levels (`allowSkipLevels: true`)

Editor with `list.allowSkipLevels` set to `true`. List items can be indented by more than one level relative to their parent.

## Testing

1. Place the cursor on a list item and press `Tab` (or use the indent button) multiple times. The item should keep indenting without limit.
2. The first item of a list should also be indentable (the list can start at level > 0).
3. Outdenting should work as expected (one level at a time).
4. Check the source editing view to verify the nested `<ol>`/`<ul>` structure.
5. Copy-paste list items between levels and verify the structure is preserved.
