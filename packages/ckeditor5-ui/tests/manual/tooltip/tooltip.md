# Tooltip playground

This manual test allows testing various tooltip scenarios in the UI (testing `TooltipManager`).

## Tooltip positions

1. Hover each box (N, S, E, etc.).
2. A tooltip should show up at a position corresponding to the name of the box.
3. Make sure tooltip arrows ("tips") are always centered with respect to the box.

## Tooltips in the editor

### With mouse

1. Hover various editor buttons to display their tooltips.
2. Tooltips should show up after a delay.
3. There should always be a single tooltip at a time on a web page.
4. Make sure that moving mouse between buttons quickly does not result in orphaned tooltips attached to elements no longer being hovered.

### With keyboard

1. Use `Alt+F10` to focus the toolbar and navigate it using the keyboard.
2. Tooltips should show up when items are focused and hide when they get blurred.
3. Moving mouse to another toolbar item should hide a tooltip attached to the item focused using the keyboard (and vice-versa).

## Tooltips when editor has a scrollable ancestor

1. Make any tooltip show up using either mouse or keyboard.
2. Scroll the box.
3. The tooltip should hide and not return.

Repeat the same scenario but scroll the entire webpage (not just the box containing the editor). The tooltip should remain visible in this case.
