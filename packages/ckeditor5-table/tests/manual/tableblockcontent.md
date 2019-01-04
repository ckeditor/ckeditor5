### Loading

1. The data should be loaded with a table with block contents in second column:

    * Paragraph - it should be rendered as `<span>` if single paragraph is inside table cell.
    * List
    * Heading
    * Block Quote (with inner paragraph)
    * Image

2. The third column consist blocks with text alignment.
    * Paragraph - should be rendered was `<p>` when alignment is set (apart from default) for single paragraph.

### Testing

1. Use <kbd>Enter</kbd> in cells with single `<paragraph>`. When two `<paragraph>`'s are in one table cell they should be rendered as `<p>`.
2. Undo previous step - the `<p>` element should be changed to `<span>` for single paragraph.
3. Change `<heading>` to paragraph - it should be rendered as `<p>` element if there are other headings or other block content.
4. Change one `<heading>` to paragraph and remove other headings. The `<paragraph>` should be rendered as `<span>`.
