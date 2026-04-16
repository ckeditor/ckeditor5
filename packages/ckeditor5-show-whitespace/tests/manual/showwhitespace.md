## Show whitespace

1. Click the pilcrow button (¶) in the toolbar to enable show whitespace.
2. Verify that:
   - Spaces appear as middle dots (·).
   - Non-breaking spaces appear as open boxes (␣) in a reddish color.
   - Paragraph marks (¶) appear at the end of each paragraph and heading.
   - Soft breaks (Shift+Enter) show a return arrow (↵) before the line break.
   - Trailing spaces (spaces at end of line) have an orange background highlight.
3. Click the button again to disable — all markers should disappear.
4. Type new text with the feature enabled — spaces should get markers in real-time.
5. Verify that `getData()` output (check console) does not contain any marker elements.
6. Verify cursor navigation and text selection work normally through decorated spaces.
7. Verify empty paragraphs show a pilcrow (¶) on the same line as the caret.

### Lists
8. Verify an arrow (→) appears between the list bullet/number and the content.
9. Verify pilcrow marks (¶) appear at the end of each list item (both ul and ol).
10. Verify spaces inside list items are shown with dots.
11. Verify empty list items show: → (arrow), caret, ¶ (pilcrow) — all on the same line.

### Blockquote
12. Verify pilcrow marks appear at the end of paragraphs inside blockquotes.
13. Verify double spaces inside blockquote are visible.

### Table
14. Verify end-of-cell marker (¤) appears at the end of content in table cells.
15. Verify empty table cells show the end-of-cell marker (¤) on the same line as the caret.
16. Verify spaces and nbsp inside table cells are marked.
17. Verify trailing spaces in table cells have orange background.

### Configuration
18. To test config, modify the editor creation in JS to add:
    `showWhitespace: { paragraphMarks: false }` — verify pilcrow marks are hidden but spaces still show.
    `showWhitespace: { spaces: false }` — verify spaces are not marked but nbsp and paragraph marks still show.
