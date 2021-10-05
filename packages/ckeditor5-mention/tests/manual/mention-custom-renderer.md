## Mention

The mention configuration with custom item renderer for autocomplete list.

### Configuration

The feeds:

1. The list is returned in promise (no timeout) and is filtered for any match of `name` and `username` (custom feed):
    - `{ itemId: '1', name: 'Barney Stinson', id: '@swarley' }`
    - `{ itemId: '2', name: 'Lily Aldrin', id: '@lilypad' }`
    - `{ itemId: '3', name: 'Marshall Eriksen', id: '@marshmallow' }`
    - `{ itemId: '4', name: 'Robin Scherbatsky', id: '@rsparkles' }`
    - `{ itemId: '5', name: 'Ted Mosby', id: '@tdog' }`

    The items are rendered as `<span>` instead of default button.

2. Static list of issues with item renderer that returns a string:
    - `{ id: '1002', text: 'Some bug in editor' }`
    - `{ id: '1003', text: 'Introduce this feature' }`
    - `{ id: '1004', text: 'Missing docs' }`
    - `{ id: '1005', text: 'Another bug' }`
    - `{ id: '1006', text: 'More bugs' }`

    This feed will create mention with `text` (as it is defined for item) instead of `id`.

### Interaction

You can interact with mention panel with keyboard:

- Move arrows up/down to select an item.
- Use <kbd>enter</kbd> or <kbd>tab</kbd> to insert a mention into the document.
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
