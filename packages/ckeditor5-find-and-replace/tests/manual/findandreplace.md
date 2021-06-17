## Find and replace

### Loading

1. The data should be loaded with different markers and pen.

### Testing

1. Put the selection on any highlighted/colored text node
2. In JS dev console type the following:

```js
editor.execute( 'find', 'Chocolate' )
```

You should see:
- All 'chocolate' occurences highlighted in the editor.
- Highlighted text has the same color.
- Text is readable.
