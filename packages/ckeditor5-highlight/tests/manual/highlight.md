### Loading

1. The data should be loaded with different markers and pens.

### Testing

You should be able to:
- see different markers class
- manually invoke highlight command in console:

```
editor.execute( 'highlight', { value: 'yellowMarker' } );
editor.execute( 'highlight', { value: 'greenMarker' } );
editor.execute( 'highlight', { value: 'pinkMarker' } );
editor.execute( 'highlight', { value: 'blueMarker' } );

editor.execute( 'highlight', { value: 'redPen' } );
editor.execute( 'highlight', { value: 'greenPen' } );
```
