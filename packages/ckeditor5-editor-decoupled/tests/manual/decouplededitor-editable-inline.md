1. Click "Init editor".
2. Expected:
  * The toolbar container should get the toolbar.
  * The toolbar should appear with "Heading", "Bold", "Italic", "Undo" and "Redo" buttons.
  * **The yellow element should become an editable**.
3. Do some editing and formatting.
4. Click "Destroy editor".
5. Expected:
  * Editor should be destroyed.
  * The toolbar should disappear from the container.
  * **The editable must remain**.
  * **The editable must retain the editor data**.
  * The `.ck-body` region should be removed.

## Notes:

* You can play with:
  * `editable.isReadOnly`,
* Changes to `editable.isFocused` should be logged to the console.
* Features should work.
