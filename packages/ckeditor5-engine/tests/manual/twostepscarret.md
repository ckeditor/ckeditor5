## Two-steps caret movment [#1286](https://github.com/ckeditor/ckeditor5-engine/issues/1289)

### Moving right
1. Put selection one character before the link
2. Move selection by one character to the right using right arrow
	- selection should be outside the link
3. Press right arrow once again
	- selection should be at the same position but inside the link
4. Using right arrow move selection at the end of the link
	- selection should be still inside the link
5. Press right arrow once again
	- selection should be at the same position but outside the link

### Moving left
1. Put selection one character after the link
2. Move selection by one character to the left using left arrow
	- selection should be outside the link (ignore the blink).
3. Press left arrow once again
	- selection should be at the same position but inside the link
4. Using left arrow move selection at the beginning of the link
	- selection should be still inside the link (ignore the blink).
5. Press left arrow once again
	- selection should be at the same position but outside the link

### Mouse
1. Put selection at the beginning of the link
	- selection should be outside the link
2. Put selection at the end of the link
	- selection should be inside the link

### Attributes set explicit
1. Put selection one character before the end of the link
2. Move selection by one character to the right using right arrow
	- selection should be inside the link
3. Turn on bold attribute (`Ctrl + B`)
3. Press right arrow once again
	- selection should be at the same position but outside the link
	- bold should stay enabled

### Not bounded attribute
Just make sure that two-steps caret movement is disabled for bold text from the second paragraph.
