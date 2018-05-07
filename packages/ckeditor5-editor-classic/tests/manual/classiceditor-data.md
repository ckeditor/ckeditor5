1. Click "Init editor".
2. Expected:
  * Framed editor should be created.
  * Original element should disappear.
  * There should be a toolbar with "Bold", "Italic", "Undo" and "Redo" buttons.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed.
  * Original element should be visible.
  * The element should contain its data (updated).
  * The 'ck-body region' should be removed.

## Notes:

* You can play with:
  * `editable.isReadOnly`,
* Changes to `editable.isFocused` should be logged to the console.
* Features should work.
