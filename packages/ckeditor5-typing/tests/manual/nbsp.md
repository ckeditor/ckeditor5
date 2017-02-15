### `&nbsp;` handling test

Typing plugin should correctly handle spaces and &nbsp; characters.

**Requirements:**

1. Non-breakable spaces created by browser when using <kbd>space</kbd> should be changed to normal space characters when
inserted to model (and then, to view).
2. In DOM we still need to render them as `&nbsp;`s.
3. Multiple consecutive spaces should be allowed, as well as spaces at the beginning or end of element.
4. `&nbsp;` characters inserted intentionally should be kept as `&nbsp;` in model (and view).
5. Whitespaces should be removed when editor data is set.

**Test steps:**

1. Open console and start using <kbd>space</kbd>. After each change, console is refreshed with output:
    - There should be no `&nbsp;` inserted in view and model after using <kbd>space</kbd>.
    - There should be `&nbsp;` in DOM and `getData` output, where needed.
2. Use `editor.setData()` to test whether whitespaces in input HTML are correctly removed and `&nbsp;` are correctly
saved in model and view. `&nbsp;` inserted through `editor.setData()` should be kept, not changed to normal spaces.
3. Use the button to test whether `&nbsp;`s are correctly preserved in model, view and DOM.
