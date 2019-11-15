## Creating

- Put selection in the single paragraph, and press code block button. Paragraph should change to code block.

- Select multiple paragraphs and press code block icon. All blocks should be changed into one code block element with a multiple lines.

- Change the middle paragraph into code block, select the preceding and the following paragraph, and press code block button. All selected blocks should be merged into one code block.

- Try to create code block into block quote - it should work fine.

- Try to create create a block quote into a table - it should work fine.

## Leaving the code block using enter

### Block end

- Create an empty line at the end of the block and put the selection there.
- Press <kbd>Enter</kbd> again.
- The new line created in the code block should no longer be there.
- A new empty paragraph should be created after the code block.
- The selection should be in that paragraph.

### Block beginning

- Similarly, create an empty line at the beginning of the block and put the selection there.
- The operation should be mirrored upon enter (empty paragraph created before, not after, etc.).

### <kbd>Shift</kbd>+<kbd>Enter</kbd>

- The above scenarios should **not** work when using <kbd>Shift</kbd>+<kbd>Enter</kbd>.

## Indenting and outdenting

- Use <kbd>Tab</kbd> to insert tab (selection in the middle of the line) or indent entire line (selection before line's text).
- Use <kbd>Shift</kbd>+<kbd>Tab</kbd> to outdent the line.
- Try both with different selections, e.g. containing multiple lines.
- It should act similarly to native code editors.
- Use the "Increase indent" and "Decrease indent" buttons in the toolbar – their actions should correspond to the keystrokes.

## Preserving indent on enter

- Having indented some line put the caret at the end of it.
- Press <kbd>Enter</kbd>.
- The new line should have the same indentation level as the previous one.

## Integration with Autoformat

- Type `` ``` `` in an empty paragraph.
- A new empty code block should be inserted with the selection inside of it.
- Try to undo. There should be 2 undo steps (code block removal, and `` ``` ``).
