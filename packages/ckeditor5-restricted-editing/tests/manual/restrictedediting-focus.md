## Restricted editing - focus cycling in an editor surrounded by forms

## Standard mode

1. Make sure the "Standard" mode is selected.
2. Focus the "Standard" radio button in the "Mode" form.
3. Start cycling the focus using the <kbd>Tab</kbd> key.

**Expected behaviour**:

- The focus should cycle across:
	1. The "Mode" form,
	2. The editor,
	3. The radio form below the editor,
- Pressing <kbd>Shift</kbd>+<kbd>Tab</kbd> should cycle focus in the opposite direction.

## Restricted mode

1. Switch to the "Restricted" mode.

**Expected behaviour**:

- When selection is in the **first** restricted exception, pressing <kbd>Shift</kbd>+<kbd>Tab</kbd> should set focus in the text input with a "value" ("Nick") above the editor
- When selection is in the **last** restricted exception, pressing <kbd>Tab</kbd> should set focus in the radio input with a "label" ("Test 1") below the editor.
