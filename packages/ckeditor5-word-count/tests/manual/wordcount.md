1. Try to type in editor. Container below should be automatically updated with new amount of words and characters.
2. Special characters are treat as separators for words. For example
	* `Hello world` - 2 words
	* `Hello(World)` - 2 words
	* `Hello\nWorld` - 2 words
3. Numbers are treat as words.
4. There are logged values of `WordCount:event-update` in the console. Values should change in same way as container in html.
5. After destroy container with word and character values should be removed.
