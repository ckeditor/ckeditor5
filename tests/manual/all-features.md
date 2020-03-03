# All features test

## Toolbar

It should contain as many features as we developed. By resizing your viewport you can observe whether grouping toolbar items work.

## Editor

There should be "two pages" with two sections per each page. Pages should be separated by the page break feature.

### First page

**Lists in the table** – in the table (2x3) in the second row should be 3 lists (bulleted, numbered and todo).

**Basic features overview** - a few paragraphs of text (that contain text formatted using basic styles feature), an image, and a blockquote.

### Second page

**Media with previews in the table** - in the table (3x3), in the middle column you should see a preview of attached media embed elements.

**Code blocks in the table** - in the table (4x3), in the second and fourth columns should be visible code snippets.

## Action buttons

- Clear editor - calls `editor.setData( '' )`
- Open print preview - opens the print preview window
- Turn on/off read-only mode - toggle read-only mode

## Console

Wordcount plugin logs into the console number of characters and words in the editor's data.

## Additional

- Empty editor should display a placeholder: `'Type the content here!'`
- Mention plugin is configured with an array of feed: `[ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ],`
- ImageUpload uses EasyImage
- Styles for printing preview are served by official docs
