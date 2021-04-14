### Testing

Copying selected table cells:

1. Select a fragment of table cell.
2. Use copy shortcut <kbd>ctrl</kbd>+<kbd>C</kbd>.
3. Paste selected content:
    - somewhere in the document.
    - in the editable field on the right.
4. The pasted table should:
    - be rectangular (no missing nor exceeding table cells)
    - have proper headings
5. The editors are exposed as:
    - `window.editor.content` and "content" editor in CKEditor inspector
    - `window.editor.geometry` and "geometry" editor in CKEditor inspector

Note that table copy:

- have cut disabled
- paste in table is not possible
- pasted table can be fixed by a post-fixer (use content editable to verify what's being copied)
