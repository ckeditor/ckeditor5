# Media embed styles (custom `config.mediaEmbed.styles`)

Editor with `MediaEmbed` + `MediaEmbedStyle` + `MediaEmbedResize` and a non-default config:

1. Only `alignBlockLeft` and `alignCenter` kept from the built-ins (`wrapText` auto-skips, `breakText` not placed in the toolbar).
1. Two custom styles `sideOrange` / `sideGreen` &ndash; both float right with text wrapping, differ only in box-shadow ring color.
1. Inline `mediaEmbed:sideMedia` split-button dropdown groups them in `config.mediaEmbed.toolbar`.

The YouTube embed loads pre-resized to 50% width so alignment shifts are visible.

## Toolbar contents

1. Select an embed,
1. The contextual toolbar should show three entries: **Left aligned media** (flat, `mediaEmbed:alignBlockLeft`), **Centered media** (flat, `mediaEmbed:alignCenter`), and **Side media** (split-button dropdown, `mediaEmbed:sideMedia`),
1. There should be no `mediaEmbed:alignLeft`, `mediaEmbed:alignRight`, or `mediaEmbed:alignBlockRight` buttons.

## Flat buttons

1. Click **Left aligned media** &mdash; the figure should pin left and the data `<figure>` should include `media-style-block-align-left`,
1. Click **Centered media** &mdash; the figure should re-center and the data `<figure>` should have only `class="media"` (default, no class).

## Side media dropdown

1. With no side style applied, the action button should show **Side media (orange border)** (the `defaultItem`),
1. Clicking the action should apply `sideOrange`,
1. The flyout should contain **(orange border)** and **(green border)**,
1. Click **(green border)** &mdash; the figure should gain a green ring and the data `<figure>` should include `media-style-side-green`,
1. Click the action while green is active &mdash; the dropdown should open instead of firing (action only fires when no child is on),
1. Click **(orange border)** from the flyout &mdash; the ring should switch to orange and the data `<figure>` should include `media-style-side-orange`.

## Resize interaction

1. Apply **Side media (orange border)** to the pre-resized YouTube embed,
1. Drag-resize the figure &mdash; the orange ring should remain attached as the width changes (proves the custom class composes with `media_resized`).

## Filtered values silently rejected

1. In the browser console, run `editor.execute('mediaStyle', { value: 'alignRight' })`,
1. Nothing should change in the editor,
1. `editor.commands.get('mediaStyle').value` should still report the previously applied style.

## Clearing the style

1. Apply **Side media (orange border)**,
1. In the console run `editor.execute('mediaStyle', { value: null })` (or click **Centered media**),
1. The figure should clear to the default centered state.
