@bender-ui: collapsed

1. Click "Init editor".
2. Expected:
  * Framed editor should be created.
  * It should be rectangular (400x400).
  * Original element should disappear.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed.
  * Original element should be visible.
  * The element should contain its data (updated).

## Notes:

* You can play with:
  * `editor.editable.isEditable`,
  * `editor.ui.width/height`.
* Changes to `editable.isFocused/isEditable` should be logged to the console.
