1. Click "Init editor".
2. Expected:
  * Inline editor should be created.
  * The element used as editable should remain visible.
    * It should preserve `.custom-class` and `custom-attr="foo"`.
  * There should be a floating toolbar with "Bold", "Italic", "Undo" and "Redo" buttons.
3. Scroll the webpage.
4. Expected:
  * The toolbar should float around but always stick to editable.
  * The toolbar should stick to the bottom of the editable if there's not enough space above.
5. Click "Destroy editor".
6. Expected:
  * Editor should be destroyed.
  * The element used as editable should remain visible.
    * It should preserve `.custom-class` and `custom-attr="foo"`.
  * The element should contain its data (updated).
  * The 'ck-body region' should be removed.

## Notes:

* You can play with:
  * `editable.isReadOnly`,
* Changes to `editable.isFocused` should be logged to the console.
* Features should work.
