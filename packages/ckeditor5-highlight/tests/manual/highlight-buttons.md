### Loading

1. The data should be loaded with different markers and pens.
2. The toolbar should have 5 highlight buttons and one remove highlight button. 

### Testing

You should be able to:
- see different markers class
- manually invoke highlight command in console:

```
editor.execute( 'highlight', { class: 'marker' } );
editor.execute( 'highlight', { class: 'marker-green' } );
editor.execute( 'highlight', { class: 'marker-pink' } );
	
editor.execute( 'highlight', { class: 'pen-red' } );
editor.execute( 'highlight', { class: 'pen-blue' } );	 
```
