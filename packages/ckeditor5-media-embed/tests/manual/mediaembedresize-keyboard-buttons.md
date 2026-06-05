# Keyboard-accessible resize UI for media embeds — standalone buttons

This test verifies that media embeds can be resized without a pointing device using standalone toolbar buttons.

The editor uses `MediaEmbedResize` (full plugin including handles) with `resizeMediaEmbed.toolbar` configured to show individual buttons: `resizeMediaEmbed:25`, `resizeMediaEmbed:50`, `resizeMediaEmbed:75`, `resizeMediaEmbed:original`, and `resizeMediaEmbed:custom`.

## Test plan

### Preset resize (standalone buttons)

1. Click into the editor content to focus it.
2. Use **Tab** (or click) to select a media widget.
3. Use **Tab** to navigate to the media embed toolbar. Five resize buttons should be visible.
4. Press **Space** or **Enter** on one of the size buttons (e.g. 25%). Verify the media resizes.
5. The pressed button should appear toggled on (`isOn: true`). Other size buttons should be off.
6. Press **Original** — resize is removed, `resizedWidth` attribute disappears, no button is toggled.

### Custom resize (balloon via standalone button)

1. Select a media widget using keyboard.
2. Navigate to the toolbar and press the **Custom** button.
3. Verify the custom resize balloon opens.
4. Type a valid number (e.g. `40`) and press **Enter**. Verify the media resizes to `40%` and the balloon closes.
5. Now none of the preset buttons should be toggled (because `40%` doesn't match any preset).

### Validation

1. Open the custom resize balloon via the **Custom** button.
2. Clear the input and press **Enter**. Verify error "The value must not be empty." appears.
3. Type `abc` and press **Enter**. Verify error "The value should be a plain number." appears.

### Click outside

1. Open the custom resize balloon.
2. Click outside the balloon. Verify the balloon closes without changes.

### Drag handles interop

1. Apply a preset size via a button.
2. Grab a drag handle and resize further.
3. Verify the drag starts from the correct current width.
4. After dragging, verify no preset button is toggled (the value no longer matches any preset).

### Spotify embed

1. Select the Spotify widget (it has its own responsive layout and a minimum width).
2. Apply a preset size and a custom size. Verify the widget resizes without console errors and is not shrunk below its usable minimum width.
3. Press **Original** to reset.

### Generic (non-previewable) media

1. Select the Facebook placeholder widget.
2. Press any preset size button. Verify the figure resizes without console errors.
3. Press **Original** to reset.
