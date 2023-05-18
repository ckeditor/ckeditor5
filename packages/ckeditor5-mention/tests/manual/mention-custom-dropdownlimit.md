## Mention

The mention configuration with a custom `config.mention.dropdownLimit` configuration and a static list of autocomplete feed. You can also limit the dropdown per feeds object:
```json
{
	marker: '#',
	feed: [
		...
	],
	dropdownLimit: 3
}
```

### Configuration

Type "@" to display the list of 20 mentions out of 21 available or type "#" to see shorter list limited to 3.

### Interaction

- Move arrows up/down to select an item.
- Use <kbd>enter</kbd> or <kbd>tab</kbd> to insert a mention into the document.
- The <kbd>esc</kbd> should close the panel.
