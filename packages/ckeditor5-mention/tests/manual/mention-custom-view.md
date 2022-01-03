## Mention

This sample overrides default mention conversion to `<span>`. The mention is converted to a link (`<a>`).

### Configuration

The feed:
- `{ id: '@Barney Stinson', text: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' }`
- `{ id: '@Lily Aldrin', text: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989?ref_=tt_cl_t5' }`
- `{ id: '@Marshall Eriksen', text: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' }`
- `{ id: '@Robin Scherbatsky', text: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' }`
- `{ id: '@Ted Mosby', text: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }`

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
