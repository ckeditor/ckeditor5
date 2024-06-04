# Show blocks

Confirm if the show blocks feature works as expected.

## Ensure the feature is loaded

1. In JS dev console type the following:

```js
editor.plugins.get( 'ShowBlocks' );
```

## Ensure the blocks are showing and hiding

1. Press the "Show blocks" button in the toolbar or type `editor.execute( 'showBlocks' )` in the console. Check if all elements besides the widgets are wrapped into blocks with labels.
2. Play with the editor (add new element, modify and remove existing ones). Make sure that block outlines and labels are refreshed.
3. Press the "Show blocks" button again. Ensure all the outlines are gone.
