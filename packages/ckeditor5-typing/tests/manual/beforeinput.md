## Typing and deleting using `beforeinput` event.

**Note**: This test does not make sense in Firefox because it does not support Input Events and uses mutations-based typing instead.

**Note**: Open console before playing with the test.

### Basic typing

* Put a selection in the document and start typing.
	* The text should appear in the editor.
	* `beforeinput` event(s) should be logged in the console.
* Create a non-collapsed selection in the document and start typing.
	* The selected text should be deleted and the new text should appear in the editor.
	* `beforeinput` event(s) should be logged in the console.
* Select an image and start typing.
	* The selected image should be deleted and the new text should appear in its place.
	* `beforeinput` event(s) should be logged in the console.

### Spell check

* Right-click a spelling mistake in the document and fix it.
	* The text in the editor should be correct.
	* `beforeinput` event(s) should be logged in the console.

### Deleting

* Use <kbd>Backspace</kbd> to delete some text.
	* The text should be deleted character-by-character.
	* `beforeinput` event(s) should be logged in the console.
* Put the selection after a complex emoji (like "👨‍👩‍👧‍👧") and use <kbd>Backspace</kbd>.
	* Deleting should decompose the emoji one-by-one.
	* There should be steps for Zero Width Joiners that glue the emoji segments.
	* `beforeinput` event(s) should be logged in the console.
* Put the selection after a complex glyph (like "ã") and use <kbd>Backspace</kbd>.
	* Deleting should decompose the character.
	* `beforeinput` event(s) should be logged in the console.

### Forward deleting

* Use <kbd>Delete</kbd> to delete some text.
	* The text should be forward-deleted character-by-character.
	* `beforeinput` event(s) should be logged in the console.
* Put the selection before a complex emoji (like "👨‍👩‍👧‍👧") and use <kbd>Delete</kbd>.
	* Deleting should decompose the emoji one-by-one.
	* There should be steps for Zero Width Joiners that glue the emoji segments.
	* `beforeinput` event(s) should be logged in the console.
* Put the selection before a complex glyph (like "ã") and use <kbd>Delete</kbd>.
	* Deleting should delete the entire character (unlike backspace).

### Widget type around

* Select an image, press the arrow up key to display the horizontal caret before it and start typing.
	* The selected image should be preserved.
	* The new text should appear before it.
	* `beforeinput` event(s) should be logged in the console.
* Same scenario ☝️ but make the horizontal caret show up after the image using the opposite key.

### Table selection

* Create a multi-cell selection using the mouse and start typing.
	* All the content from selected cells should be deleted.
	* The new text should appear in the last cell.
	* `beforeinput` event(s) should be logged in the console.
