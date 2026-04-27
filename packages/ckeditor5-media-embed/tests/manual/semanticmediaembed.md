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
1. All the media should be represented without previews, using only the `<oembed>` tag.

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

### Resize handles (semantic mode)

1. Click on a video embed (YouTube, Vimeo),
1. Four resize handles should appear at the corners of the media wrapper,
1. Drag a corner handle to resize — a size label should appear during the drag,
1. The resized media should stay centered,
1. Both left and right handles should resize symmetrically,
1. Release the handle — the new width should persist (check `editor.getData()`),
1. The data output `<figure>` should include `style="width: …"` and class `media_resized`,
1. The inner element should remain `<oembed>` (not a preview div),
1. Undo (`Ctrl+Z`) should restore the original size.

### Resize minimum width (semantic mode)

1. Drag a resize handle to shrink the embed as far as possible,
1. The embed should floor at the base `.media { min-width: 15em }` (~240px).
   Handles should remain reachable at that floor.

### Spotify is not resizable (semantic mode)

1. Click a Spotify embed,
1. No resize handles should appear (Spotify is marked as non-resizable in the provider config).

### Resize upcast (semantic mode)

1. The "Pre-resized media (50%)" section should load at 50% width, centered.

### Resize for generic media, no preview (semantic mode)

1. Click a generic media (Twitter, Flickr, Instagram, etc.),
1. Resize handles should appear around the placeholder,
1. Dragging should change the figure width,
1. The placeholder should scale within the resized figure.

### Resize + URL change (semantic mode)

1. Resize a media embed to ~50%,
1. Change the media URL (select it, click the media embed button, enter a new URL),
1. The new media should retain the 50% width.

### Aspect ratio in the editing view (semantic mode)

1. Inspect a YouTube or Vimeo iframe in the DOM,
1. The iframe should be wrapped in a plain `<div>` (no `padding-bottom` or `position` styles on the wrapper),
1. The iframe's inline CSS should include `aspect-ratio: 16 / 9` and `height: auto`,
1. Resizing the embed should preserve the 16:9 proportion.
