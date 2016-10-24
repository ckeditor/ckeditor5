@bender-ui: collapsed
@bender-tags: view

## Fake selection
1. Click button to create fake selection over `bar` before each of following steps:
   1. Press left arrow key - collapsed selection should appear before `bar`
   1. Press up arrow key - collapsed selection should appear before `bar`
   1. Press right arrow key - collapsed selection should appear after `bar`
   1. Press down arrow key - collapsed selection should appear after `bar`
1. Open console and check if `<div style="position: fixed; top: 0px; left: -1000px;">fake selection over bar</div>` is added to editable when fake selection is present. It should be removed when fake selection is not present.
