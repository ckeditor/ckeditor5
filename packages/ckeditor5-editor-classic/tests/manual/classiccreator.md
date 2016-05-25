@bender-ui: collapsed

1. Click "Init editor".
2. Expected:
  * Framed editor should be created.
  * Original element should disappear.
  * There should be a toolbar with "Bold" and "Italic" buttons.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed.
  * Original element should be visible.
  * The element should contain its data (updated).
  * The 'ck-body region' should be removed.

## Notes:

* You can play with:
  * `editable.isEditable`,
  * `boldModel.isEnabled`, `italicModel.isEnabled` and `fontModel.isEnabled`.
  * `fontModel.isOn`.
* Changes to `editable.isFocused/isEditable` should be logged to the console.
* Clicks on the buttons should be logged to the console.

