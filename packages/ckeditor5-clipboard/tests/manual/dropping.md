## Dropping

**Note:** There's no real drag&drop support yet. This test is only supposed to check if the drop position is calculated correctly.

Expected: At the precise drop position (where you see the caret before releasing the mouse button) a "@" should be inserted.

Notes:

* It may all not work in Edge (because it's focused on file support now).
* Drop position is not the same as selection before drop (which is not that aprarent if you drop something from outside but it's obvious if you d&d content within the editor).
* It's a known bug that after dropping content from outside the editor there's no focus in the editor.
