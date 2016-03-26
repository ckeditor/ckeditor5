@bender-ui: collapsed

1. Click "Init editor".
2. Expected:
  * Boxed editor with two editables should be created.
  * Original elements should disappear.
  * There should be a toolbar with "Bold" and "Italic" buttons.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed.
  * Original elements should be visible.
  * The elements should contain their data (updated).
  * The 'ck-body region' should be removed.

## Notes:

* You can play with:
  * `editables.get( 'editable1/2' ).isEditable`,
  * `boldModel.isEnabled` and `italicModel.isEnabled`.
* Changes to `editable.isFocused/isEditable` should be logged to the console.
* Changes to `editables.current` should be logged to the console.
* Clicks on the buttons should be logged to the console.
