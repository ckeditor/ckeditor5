## Mention

The minimal mention configuration with a static list of autocomplete feed:

### Configuration

The feeds:

1. Static list with `@` marker:

    - Barney Stinson
    - Lily Aldrin
    - Marshall Eriksen
    - Robin Sherbatsky
    - Ted Mosby

2. Static list of 20 items (`#` marker)

    - a01
    - a02
    - ...
    - a20

3. Static list of "special characters" items (`:` marker)

    - :+1:
    - :-1:
    - :@(at-sign):
    - :$(dollar-sign):
    - :#(hash-sign):

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

Mention UI should not appear when mention command is disabled (**Mentions** toggle in toolbar).
