## Unicode support

### Selection

1. Put caret somewhere before surrogate pair characters.
2. Using right arrow key move caret to the end of paragraph.
3. Caret should be placed after each character.
4. No errors in console.
5. Do the same but make selection using mouse.
6. Do the same for combined marks. Note that some browsers (i.e. Chrome) forbid putting selection between லை and க்கு.

### Removing

1. Put caret at the end of first paragraph.
2. Start removing surrogate pair characters using backspace.
3. Characters should be removed one by one.


1. Put caret at the end of second paragraph.
2. Start removing combined characters using backspace.
3. Combining mark and base characters should be removed separately (not at once).


1. You may need to refresh test if you removed too many combined characters.
2. Put caret before combined character.
3. Start removing combined characters using delete key.
4. Combining marks should be removed together with base characters.
