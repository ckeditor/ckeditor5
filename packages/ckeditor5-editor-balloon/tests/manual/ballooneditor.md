1. Click the "Init editors" button.
2. Expected:
   * Two editor instances should be created.
   * Elements used as editables should remain visible.
      * They should preserve `.custom-class` and `custom-attr="foo"`.
3. Select some text in the editor.
   * A floating toolbar should appear at the end (forward selection) or at the beginning (backward selection) of the selection.
3. Scroll the webpage.
4. Expected:
   * The toolbar should always stick to the selection.
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
