## Loading

1. The data should be loaded with:
  * two paragraphs,
  * todo list with eight items, where 2,4 and 7 are checked
  * two paragraphs,
  * numbered list with one item,
  * todo list with one unchecked item,
  * bullet list with one item.
2. Toolbar should have two buttons: for bullet and for numbered list.

## Testing

### Creating:

1. Convert first paragraph to todo list item
2. Create empty paragraph and convert to todo list item
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

1. Convert paragraph before todo list to same type of list
2. Convert paragraph after todo list to same type of list
3. Convert paragraph before todo list to different type of list
4. Convert paragraph after todo list to different type of list
5. Convert first paragraph to todo list, then convert second paragraph to todo list
6. Convert multiple items and paragraphs at once

### Toggling check state:

1. Put selection in the middle of unchecked the todo list item
2. Check list item (selection should not move)

---

1. Select multiple todo list items
2. Check or uncheck todo list item (selection should not move)

---

1. Check todo list item
2. Convert checked list item to other list item
3. Convert this list item once again to todo list item ()should be unchecked)

---

1. Put collapsed selection to todo list item
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
2. Press `Ctrl+Space` (all todo list items should be checked)
3. Press `Ctrl+Space` once again (all todo list items should be unchecked)

### Integration with attribute elements:

1. Select multiple todo list items
2. Highlight selected text
3. Check or uncheck highlighted todo list item
4. Type inside highlighted todo list item
