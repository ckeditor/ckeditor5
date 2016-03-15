@bender-ui: collapsed

1. Click "Init editor".
2. Expected:
  * Inline editor should be created.
  * There should be **two** toolbars:
    * one with "Bold" and "Italic" buttons,
    * second with "Italic" and "Bold" buttons.
3. Click "Destroy editor".
4. Expected:
  * Editor should be destroyed (the element should not be editable).
  * The element should contain its data (updated).
  * The 'ck-body region' should be removed.

## Notes:

* You can play with:
  * `editor.editable.isEditable`.
  * `boldModel.isEnabled` and `italicModel.isEnabled`.
* Changes to `editable.isFocused/isEditable` should be logged to the console.
* Buttons' states should be synchronised between toolbars (they share models).
