### Testing

Selecting table cells:

1. It should be possible to select multiple table cells.
2. Observe selection inn the below model representation - for a block selection the table cells should be selected.

Copying selected table cells:

1. Select a fragment of table cell.
2. Use copy shortcut <kbd>ctrl</kbd>+<kbd>C</kbd>.
3. Paste somewhere in the document.
4. The pasted table should:
   - be rectangular (no missing nor exceeding table cells)
   - have proper headings

Note that table copy:

- have cut disabled
- paste in table is not possible
- pasted table can be fixed by a post-fixer (use content editable to verify what's being copied)
