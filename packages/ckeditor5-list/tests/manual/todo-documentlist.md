## Loading

1. The data should be loaded with:
  * two paragraphs,
  * to-do list with eight items, where 2,4 and 7 are checked,
  * two paragraphs,
  * numbered list with one item,
  * to-do list with one unchecked item,
  * bullet list with one item.
2. Toolbar should have three buttons: for bullet, numbered and to-do list.

## Testing

### Creating:

1. Convert first paragraph to to-do list item
2. Create empty paragraph and convert to to-do list item
3. Press `Enter` in the middle of item
4. Press `Enter` at the start of item
5. Press `Enter` at the end of item

### Removing:

1. Delete all contents from list item and then the list item
2. Press enter in empty list item
3. Click on highlighted button ("turn off" list feature)
4. Do it for first, second and last list item

### Changing type:

1. Change type from todo to numbered for checked and unchecked list item
3. Do it for multiple items at once

### Merging:

1. Convert paragraph before to-do list to same type of list
2. Convert paragraph after to-do list to same type of list
3. Convert paragraph before to-do list to different type of list
4. Convert paragraph after to-do list to different type of list
5. Convert first paragraph to to-do list, then convert second paragraph to to-do list
6. Convert multiple items and paragraphs at once

### Toggling check state:

1. Put selection in the middle of unchecked the to-do list item
2. Check list item (selection should not move)

---

1. Select multiple to-do list items
2. Check or uncheck to-do list item (selection should not move)

---

1. Check to-do list item
2. Convert checked list item to other list item
3. Convert this list item once again to to-do list item ()should be unchecked)

---

1. Put collapsed selection to to-do list item
2. Press `Ctrl+Space` (check state should toggle)

### Toggling check state for multiple items:

1. Select two unchecked list items
2. Press `Ctrl+Space` (both should be checked)
3. Press `Ctrl+Space` once again (both should be unchecked)

---

1. Select checked and unchecked list item
2. Press `Ctrl+Space` (both should be checked)

---

1. Select the entire content
2. Press `Ctrl+Space` (all to-do list items should be checked)
3. Press `Ctrl+Space` once again (all to-do list items should be unchecked)

### Integration with attribute elements:

1. Select multiple to-do list items
2. Highlight selected text
3. Check or uncheck highlighted to-do list item
4. Type inside highlighted to-do list item

### Content styles

1. Inspect list styles in the editor and in the content preview (below).
2. There should be no major visual difference between them.
3. Check marks in the content preview should be rich custom components (no native checkboxes).
