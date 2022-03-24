# Element to element reconversion

The editor should be loaded with `items` element that contains one `item` element in which user can edit content.

Adding new items (by pressing Enter key) or removing (by pressing backspace) should:

### In threshold mode

Update `items` view element's `data-amount` attribute and change the list background color accordingly.

List of thresholds:

```
| Items    | Amount     | Color           |
|----------|------------|-----------------|
| 1 item   | single     | aquamarine      |
| 2 items  | little     | cadetblue       |
| 4 items  | few        | darkkhaki       |
| 7 items  | reasonable | darksalmon      |
| 10 items | high       | deeppink        |
| 15 items | huge       | mediumvioletred |
```

### In HSL mode

Update `items` view element's inline style background color to hsl value with hue shifted by 5 every time an `item` is added or removed.

### In none mode

Remove background color and update nothing.

## Reconversion counter

In every mode you should be able to inspect number of times each item has been inserted.

This way you can observe increasing insertion counter on the main `items` element every time a child is either inserted or removed.

Main `items` element counter should also be increased when you change mode.
