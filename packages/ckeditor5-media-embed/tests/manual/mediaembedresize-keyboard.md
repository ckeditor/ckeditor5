# Keyboard-accessible resize UI for media embeds — dropdown

This test verifies that media embeds can be resized without a pointing device using the resize dropdown.

Three editors are shown:
1. **Resize dropdown (%) with drag handles** — full `MediaEmbedResize`, `resizeUnit: '%'`.
2. **Resize dropdown (%) without drag handles** — `MediaEmbedResizeEditing + MediaEmbedResizeButtons + MediaEmbedCustomResizeUI` (no `MediaEmbedResizeHandles`).
3. **Resize dropdown (px) with drag handles** — full `MediaEmbedResize`, `resizeUnit: 'px'`, custom pixel-based options.

## Test plan

### Preset resize (dropdown)

1. Click into the editor content to focus it.
2. Use **Tab** (or click) to select a media widget.
3. Use **Tab** to navigate to the media embed toolbar. The resize dropdown button (`resizeMediaEmbed`) should be visible.
4. Press **Enter** or **Space** to open the dropdown. Verify the list shows: Original, Custom, 25%, 50%, 75% (or the configured values for the px editor).
5. Use **Arrow Down / Arrow Up** to navigate the list, then press **Enter** to apply a size.
6. Verify the media embed resizes visually and the model attribute `resizedWidth` reflects the change.
7. Reopen the dropdown — the selected option should be highlighted (`isOn: true`).
8. Select **Original** — the resize is removed, `resizedWidth` attribute disappears.

### Custom resize (balloon)

1. Select a media widget using keyboard.
2. Navigate to the toolbar and open the resize dropdown.
3. Choose **Custom** from the list.
4. Verify the custom resize balloon opens with a number input pre-filled with the current width (empty if not resized).
5. Type a valid number (e.g. `60`) and press **Enter**. Verify the media resizes to `60%` (or `60px` in the px editor) and the balloon closes.
6. Reopen the dropdown and choose **Custom** again. The input should be pre-filled with the previously set value.
7. Press **Escape** — the balloon closes without applying a change.

### Validation

1. Open the custom resize balloon.
2. Clear the input and press **Enter** (or click Save). Verify error "The value must not be empty." appears.
3. Type a non-numeric value (e.g. `abc`) and press **Enter**. Verify error "The value should be a plain number." appears.
4. Type a valid number and press **Enter**. Verify the form submits and the error disappears.

### Click outside

1. Open the custom resize balloon.
2. Click outside the balloon (on the document body or another part of the editor). Verify the balloon closes without applying a change.

### Generic (non-previewable) media

1. In editor 1, select the Facebook placeholder widget.
2. Navigate to the resize dropdown and apply a preset size. Verify the figure resizes without errors in the console (no NaN, no exceptions).
3. Press **Original** to reset. Verify the `media_resized` class is removed.

### Drag handles interop (editors 1 and 3)

1. After resizing via the dropdown, grab a drag handle and resize further.
2. Verify the drag starts from the current width (not 0 or some incorrect value).
3. Verify the dropdown label updates to reflect the new drag-resize value.

### Spotify embed (editor 3, px)

1. In the px editor, select the Spotify widget (it has its own responsive layout and a minimum width).
2. Apply a preset size and a custom size via the dropdown. Verify the widget resizes without console errors and is not shrunk below its usable minimum width.
3. Select **Original** to reset.
