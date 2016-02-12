@bender-ui: collapsed

1. Click "Init editor".
2. Expected:
  * Inline editor should be created.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed (the element should not be editable).
  * The element should contain its data (updated).

## Notes:

* You can play with `editor.editable.isEditable`.
* Changes to `editable.isFocused/isEditable` should be logged to the console.
