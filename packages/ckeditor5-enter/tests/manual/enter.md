## Enter key

Test the <kbd>Enter</kbd> key support.

### Notes:

* Expected behavior:
	* At the end of a heading should create a new paragraph.
	* In the middle of a heading should split it.
	* <kbd>Shift+Enter</kbd> should have <kbd>Enter</kbd> behavior.
	* The selection should always be moved to the newly created block.
	* Select all + <kbd>Enter</kbd> should leave an empty paragraph.
* Check:
  * Non-collapsed selections.
  * Integration with undo.
  * ~~Integration with basic styles~~ ([bug](https://github.com/ckeditor/ckeditor5-enter/issues/4)).
