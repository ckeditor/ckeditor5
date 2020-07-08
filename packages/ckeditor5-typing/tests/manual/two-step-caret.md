## Two-steps caret movement [ckeditor5-engine#1286](https://github.com/ckeditor/ckeditor5-engine/issues/1289)

### Moving right
1. Put selection one character before the underline
2. Move selection by one character to the right using right arrow
	- underline button should be not selected
3. Press right arrow once again
	- selection should be at the same position
	- underline button should be selected
4. Using right arrow move selection at the end of the underline
	- underline button should be selected
5. Press right arrow once again
	- selection should be at the same position
	- underline button should be not selected

### Moving left
1. Put selection one character after the underline
2. Move selection by one character to the left using left arrow
	- underline button should be not selected
3. Press left arrow once again
	- selection should be at the same position
	- underline button should be selected
4. Using left arrow move selection at the beginning of the underline
	- underline button should be selected
5. Press left arrow once again
	- selection should be at the same position
	- underline button should be not selected

### Mouse
1. Put selection at the beginning of the underline
	- underline button should be not selected
2. Put selection at the end of the underline
	- underline button should be  selected

### Attributes set explicit
1. Put selection one character before the end of the underline
2. Move selection by one character to the right using right arrow
	- underline button should be selected
3. Turn on bold attribute (`Ctrl + B`)
3. Press right arrow once again
	- selection should be at the same position
	- underline button should be not selected
	- bold button should stay selected

### Moving from one bound attribute to another
1. Make sure that moving between underline and italic text from second paragraph works the same way as above.

### Not bounded attribute
Just make sure that two-steps caret movement is disabled for bold text from the third paragraph.

### Right–to–left content

**Tip**: Change the system keyboard to Hebrew before testing.

Two-steps caret movement should also work when the content is right–to–left. Repeat all previous steps keeping in mind that the flow of the text is "reversed".

