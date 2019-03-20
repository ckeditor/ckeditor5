## Mention

### Configuration

The mention configuration with custom balloon panel item renderer.

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

- move arrows up/down to select item
- use <kbd>enter</kbd> or <kbd>tab</kbd> to select item.

**Note**: <kbd>esc</kbd> not yet implemented.

**Note**: Mouse trigger not yet implemented.
