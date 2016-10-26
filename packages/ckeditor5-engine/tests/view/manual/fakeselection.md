@bender-ui: collapsed
@bender-tags: view

## Fake selection

1. Click on bold `bar` to create fake selection over it before each of following steps:
   1. Press left/up arrow key - collapsed selection should appear before `bar`
   1. Press right/down arrow key - collapsed selection should appear after `bar`
1. Open console and check if `<div style="position: fixed; top: 0px; left: -9999px;">fake selection over bar</div>` is added to editable when fake selection is present. It should be removed when fake selection is not present.

Notes:

* Focus shouldn't disappear from the editable element.
* No #blur event should be logged on the console.
* The viewport shouldn't scroll when selecting the `bar`.
