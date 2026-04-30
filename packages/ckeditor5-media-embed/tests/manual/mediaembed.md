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

### Resize handles

1. Click on a video embed (YouTube, Vimeo),
1. Four resize handles should appear at the corners of the media wrapper,
1. Drag a corner handle to resize — a size label should appear during the drag,
1. The resized media should stay centered,
1. Both left and right handles should resize symmetrically,
1. Release the handle — the new width should persist (check `editor.getData()`),
1. The data output `<figure>` should include `style="width: …"` and class `media_resized`,
1. Undo (`Ctrl+Z`) should restore the original size.

### Resize minimum width

1. Drag a resize handle to shrink the embed as far as possible,
1. The embed should floor at the base `.media { min-width: 15em }` (~240px).
   Handles should remain reachable at that floor.

### Spotify is not resizable

1. Click a Spotify embed,
1. No resize handles should appear around it (Spotify is marked as non-resizable in the provider config).

### Resize upcast

1. The "Pre-resized media (50%)" section should load at 50% width, centered,
1. Clicking it should show resize handles,
1. Dragging handles should work normally.

### Resize for generic media (no preview)

1. Click a generic media (Twitter, Flickr, etc.),
1. Resize handles should appear around the placeholder,
1. Dragging should change the figure width,
1. The placeholder should scale within the resized figure.

### Resize + URL change

1. Resize a media embed to ~50%,
1. Change the media URL (select it, click the media embed button, enter a new URL),
1. The new media should retain the 50% width.

### Aspect ratio (modern CSS)

1. Inspect a YouTube or Vimeo iframe in the DOM,
1. The iframe should be wrapped in a plain `<div>` (no `padding-bottom` or `position` styles on the wrapper),
1. The iframe's inline CSS should include `aspect-ratio: 16 / 9` and `height: auto`,
1. Resizing the embed should preserve the 16:9 proportion.

### Data migration

1. Load the existing document (the "Media with previews" section uses the old `padding-bottom` wrapper format),
1. The editor should render them correctly — upcast reads only the URL and regenerates the preview using the current provider HTML,
1. Call `editor.getData()` — the iframe should carry inline `aspect-ratio` CSS directly, wrapped only in a plain `<div>` (no `padding-bottom` or `position` styles on the wrapper).
