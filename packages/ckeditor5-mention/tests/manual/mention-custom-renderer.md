## Mention

The mention configuration with custom item renderer for autocomplete list.

### Configuration

The list is returned in promise (no timeout) and is filtered for any match of `name` and `username` (custom feed):

The feed:
- `{ id: '1', name: 'Barney Stinson', username: 'swarley' }`
- `{ id: '2', name: 'Lily Aldrin', username: 'lilypad' }`
- `{ id: '3', name: 'Marshall Eriksen', username: 'marshmallow' }`
- `{ id: '4', name: 'Robin Scherbatsky', username: 'rsparkles' }`
- `{ id: '5', name: 'Ted Mosby', username: 'tdog' }`

The item is rendered as `<span>` instead of default button.

### Interaction

You can interact with mention panel with keyboard:

- Move arrows up/down to select an item.
- Use <kbd>enter</kbd> or <kbd>tab</kbd> to insert a mention into the documentation. 
- The <kbd>esc</kbd> should close the panel.

Mention panel should be closed on:
- Click outside the panel view.
- Changing selection - like placing it in other part of text.

### Editing behavior:

The mention should be removed from the text when:

- typing inside a mention
- removing characters from a mention
- breaking the mention (<kbd>enter</kbd>)
- pasting part of a mention
