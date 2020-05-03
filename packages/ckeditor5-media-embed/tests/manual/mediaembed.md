## Media Embed

### Embed the media

1. Put an URL in the clipboard,
1. Use the button in the dropdown or paste the URL directly in the editor,
1. Insert the media,
1. Check if media was inserted and is selected.

### Update the media

1. Put an URL in the clipboard,
1. Select some media,
1. Use the button in the dropdown,
1. Update the URL,
1. Check if media was updated and remains selected.

### Data output

1. Call `editor.getData()`,
1. Media with previews should include their previews. Preview–less media should be represented using only the `<oembed>` tag.

### URL validation

#### Invalid

1. In the previous scenarios try using a non–media URL,
1. The error should be displayed next to the URL field,
1. Nothing should be inserted/updated.

#### Empty

1. In the previous scenarios try using an empty URL,
1. The error should be displayed next to the URL field,
1. Nothing should be inserted/updated.

### Copy&Paste

1. Play with media copy&paste.
1. It should work just like images or any other widget.

### Open media in new tab

1. Locate any generic media in the content,
1. Hover the URL in the content (the tooltip should show up),
1. Click the URL,
1. A new browser tab should open with the media URL.

### Media embed toolbar

1. Click the media,
1. The block quote button should be visible,
1. Click the block quote button,
1. The block quote should be applied to the media.
