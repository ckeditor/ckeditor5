### Loading

The data should be loaded with different text and background colors in the following order:

* Colors 1-5 use the predefined palette,
* Colors 6-8 use custom CSS colors, not defined in the configuration,
* Color 9-10 use a mix from the predefined palette and custom ones.

The format is the editor content is `N. [font color]; [background color]`.

1. no-color; no-color
2. White; Black
3. Red; no-color
4. no-color; Light green
5. Orange: Dim grey
6. #00FFFF; rgb(255, 0, 0)
7. hsla( 0, 0%, 0%, .7); gold
8. rgba( 0, 120, 250, 0.8); hsla(270, 100%, 50%, 0.3)
9. #ddd; Aquamarine
10. Purple; #d82

### Testing

- Change the font color and font background color on selected text.
- Change the font color and font background color across many paragraphs.
- Check whether the colors are added to recent colors list.
- Try to re-apply a color from recent colors list: the color should move to the beginning of the list.
