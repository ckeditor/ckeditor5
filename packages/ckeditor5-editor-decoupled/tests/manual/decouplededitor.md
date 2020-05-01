1. Click "Init editor".
2. Expected:
  * The containers should fill up with the respective editor UI.
  * There should be a toolbar with "Heading", "Bold", "Italic", "Undo" and "Redo" buttons.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed.
  * **The editor UI should remain in the containers**.
  * The `.ck-body` region should be removed.

## Notes:

* You can play with:
  * `editable.isReadOnly`,
* Changes to `editable.isFocused` should be logged to the console.
* Features should work.
