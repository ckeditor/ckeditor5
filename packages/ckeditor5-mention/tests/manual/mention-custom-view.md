## Mention

**NOTE**: Playground for testing model implementation.

Use the code of this manual sample to change bahavior of the feature.

### Attribute (default)
- works kinda OK - should use objects to store mention data
- some quirks with undo (probably the break attribute on edit is wrongly written)
- easy to change conversion

### Inline Element in model
- I didn't make it to work and to change the conversion

### Marker
- works also OK - some quirks might be due to limited time to create (ie editing breaks the editor)
- harder to overwrite the mention output (easy to customize the `<span>` but to create a link required custom listener)

### Data

The feed:
- `{ name: 'Barney Stinson', link: 'https://www.imdb.com/title/tt0460649/characters/nm0000439' }`
- `{ name: 'Lily Aldrin', link: 'https://www.imdb.com/title/tt0460649/characters/nm0004989?ref_=tt_cl_t5' }`
- `{ name: 'Marshall Eriksen', link: 'https://www.imdb.com/title/tt0460649/characters/nm0781981' }`
- `{ name: 'Robin Scherbatsky', link: 'https://www.imdb.com/title/tt0460649/characters/nm1130627' }`
- `{ name: 'Ted Mosby', link: 'https://www.imdb.com/title/tt0460649/characters/nm1102140' }`

The mention is converted to link (`<a>`) with additional data of default span.

### Interaction

**Note** Not everything works with every setup.

You can interact with mention panel with keyboard:

- move arrows up/down to select item
- use <kbd>enter</kbd> or <kbd>tab</kbd> to select item.

**Note**: Mouse trigger not yet implemented.
