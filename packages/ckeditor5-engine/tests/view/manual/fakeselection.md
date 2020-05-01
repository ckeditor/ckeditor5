## Fake selection

Click on bold `bar` to create fake selection over it before each of following steps:
   * Press left/up arrow key - collapsed selection should appear before `bar`
   * Press right/down arrow key - collapsed selection should appear after `bar`

Notes:

- Focus shouldn't disappear from the editable element.
- No #blur event should be logged on the console.
- The viewport shouldn't scroll when selecting the `bar`.

-----

Open console and check if `<div style="position: fixed; top: 0px; left: -9999px;">fake selection over bar</div>` is added to editable when fake selection is present. It should be removed when fake selection is not present.

-----

Click on bold `bar` to create fake selection over it. Click outside editable and check if yellow fake selection turns to gray one.

