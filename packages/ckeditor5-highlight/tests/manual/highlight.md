### Loading

1. The data should be loaded with different markers and pens.

### Testing

You should be able to:
- see different markers class
- manually invoke highlight command in console:

```
editor.execute( 'highlight', { class: 'marker' } );
editor.execute( 'highlight', { class: 'marker-green' } );
editor.execute( 'highlight', { class: 'marker-pink' } );

editor.execute( 'highlight', { class: 'pen-red' } );
editor.execute( 'highlight', { class: 'pen-green' } );
```
