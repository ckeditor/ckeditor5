1. Try to type in the editor. The container below should be automatically updated with the current amount of words and characters.
2. Special characters are treated as separators for words. For example
	* `Hello world` - 2 words
	* `Hello(World)` - 2 words
	* `Hello\nWorld` - 2 words
3. Numbers are treated as words.
4. There are logged values of `WordCount:event-update` in the console. Values should change in same way as container in html.
5. After destroying the editor, the container with word and character values should be also removed.
