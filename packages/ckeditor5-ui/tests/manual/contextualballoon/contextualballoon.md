## Single stack

1. Select some text in the middle of the content - contextual toolbar should show up.
2. Click link icon in the contextual toolbar - link balloon should open at the position as contextual toolbar.
3. Close link balloon (Esc press or Cancel button) - contextual toolbar should show up.
4. Repeat this for backward selection.

## Multiple stacks

1. Select some highlighted text - "View in separate stack." should show up.
2. Switch stacks by clicking navigation buttons. You should switch between toolbar and custom views.

## Fake panels - min

1. Put the selection before the highlight, start moving selection by right arrow. You should see additional layer under the balloon only when at least 2 stacks are added to the balloon.

## Fake panels - max

1. Select text `[select]` (by non-collapsed selection) from the lower highlight. You should see `1 of 4` status of pagination but only 2 additional layers under the balloon should be visible.

## Force single view - Mention

1. Select text `[select]` (by non-collapsed selection).
2. Type <kbd>space</kbd> + `@` to open mention panel. You should see mention panel with no layers under the balloon and without any counter.
3. Move selection around `@` when leaving mention suggestions the balloon should be displayed as in above cases (layers, navigation buttons, etc).
