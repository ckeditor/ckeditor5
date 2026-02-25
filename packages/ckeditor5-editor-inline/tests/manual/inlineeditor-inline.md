1. Click "Init editors".
2. Expected:
  * Two inline editor should be created.
  * Elements used as editables should remain visible.
    * They should preserve `.custom-class` and `custom-attr="foo"`.
  * There should be floating toolbars with "Bold", "Italic", "Undo", "Redo", "Link" and "Unlink" buttons.
3. Scroll the webpage.
4. Expected:
  * Focused editor's toolbar should float around but always stick to editable.
  * Focused editor's toolbar should stick to the bottom of the editable if there's not enough space above.
5. Press <kbd>Alt+F10</kbd> when focusing the editor.
6. Expected:
  * Toolbar should gain focus. Editable should keep its styling.
7. Click "Destroy editors".
8. Expected:
  * Editors should be destroyed.
  * Element used as editables should remain visible.
    * They should preserve `.custom-class` and `custom-attr="foo"`.
  * Elements should contain its data (updated).
  * `.ck-body` regions should be removed from `<body>`.

## Notes:

* You can play with:
  * `window.editables[ N ].isReadOnly`,
* Changes to `window.editors[ name ].focusTracker.isFocused` should be logged to the console.
* Features should work.
