## Mention

**NOTE**: Playground for testing model implementation.

### Configuration

The mention with custom feed and view representation.

The list is returned in promise (no timeout) and is filtered for any match of `label` and `username` (custom feed):

The feed:
- `{ label: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' }`
- `{ label: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989?ref_=tt_cl_t5' }`
- `{ label: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' }`
- `{ label: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' }`
- `{ label: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }`

The mention is converted to link (`<a>`) with additional data of default span.

### Interaction

You can interact with mention panel with keyboard:

- move arrows up/down to select item
- use <kbd>enter</kbd> or <kbd>tab</kbd> to select item.

**Note**: Mouse trigger not yet implemented.
