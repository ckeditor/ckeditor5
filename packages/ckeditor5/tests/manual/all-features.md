# All features test

## Toolbar

It should contain as many features as we developed. By resizing your viewport you can observe whether grouping toolbar items work.

---

## Editor

There should be "three pages" with couple of sections per each page. Pages should be separated by the page break feature.

### First page

**Lists in the table** – In the table (2x3) in the second row should be 3 lists (bulleted, numbered and todo). The styles for list item markers for unordered and ordered list can be changed via the dropdown that opens when you click the arrow next to the appropriate list button in the toolbar. There are 3 styles for unordered lists and 6 styles for ordered lists.

**Basic features overview** - a few paragraphs of text (that contain text formatted using basic styles feature), an image, and a blockquote.

### Second page

**Media with previews in the table** - in the table (3x3), in the middle column you should see a preview of attached media embed elements.

**Code blocks in the table** - in the table (4x3), in the second and fourth columns should be visible code snippets.

**Horizontal line** - There is the `<hr>` in the source HTML. It should be displayed in the editor.

**Link images + Link decorators** - in the table (3x2), there are a linked text and two linked images that uses the manual decorators feature:
  - Left column: the text with two decorators enabled: `Open in a new tab`, `Downloadable`
  - Middle column: an image with the caption that is a `Gallery link`
  - Right column: an image without the caption with enabled all decorators (listed above)

### Third page

**HTML embed** - there are 3 widgets with embedded HTML:
- `video`
- `details` and `summary`
- `iframe`

The "previews in view" mode is enabled, which means that previews should be visible.

**Paste from Office** - Copy & paste some content from Word.

**Text part language** - There are 2 paragraphs with applied language: Spanish with left-to-right direction and Arabic with right-to-left direction. Both should have italic style. Play with the selection and the language dropdown.

**HTML comments** - There are 10 comments in this section: from `C1` to `C10`. Open the source editing mode (or just call the `editor.getData()`) and verify that they are present.

---

## Action buttons

- Clear editor - calls `editor.setData( '' )`
- Open print preview - opens the print preview window
- Turn on/off read-only mode - toggle read-only mode

---

## Console

Wordcount plugin logs into the console number of characters and words in the editor's data.

---

## Additional

- Empty editor should display a placeholder: `'Type the content here!'`
- Mention plugin is configured with an array of feed: `[ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ],`
- ImageUpload uses EasyImage
- Styles for printing preview are served by official docs
- The `SourceEditing` plugin should be disabled if there is at least one pending action.
