## Mention

The mention configuration with a custom commitKeys configuration and static list of autocomplete feed:

### Configuration

The feeds:

1. Static list with `@` marker:

    - Barney
    - Lily
    - Marshall
    - Robin
    - Ted

### Interaction

You can interact with mention panel with keyboard:

- Use <kbd>arrowup</kbd> to select previous item
- Use <kbd>arrowdown</kbd> to select next item
- Use <kbd>space</kbd> or <kbd>a</kbd> keys to insert a mention into the documentation.
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
