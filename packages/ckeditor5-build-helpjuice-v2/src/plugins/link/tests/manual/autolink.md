## AutoLink feature

### After a space

1. Type a URL:
    - Staring with `http://`.
    - staring with `https://`.
    - staring without a protocol (www.cksource.com).
    - e-mail address should be linked using `mailto://` (in `linkHref` attribute value only).
2. Type space after a URL.
3. Check if text typed before space get converted to link.

### After a soft break/new paragraph

1. Type a URL as in base scenario.
2. Press <kbd>Enter</kbd> or <kbd>Shift</kbd>+<kbd>Enter</kbd> after a link.
3. Check if text typed pressed key get converted to link.

### Undo integration

1. Execute auto link either with "space" or with "enter" scenarios.
2. Execute undo.
3. Check if *only* created link was removed:
    - For "space" - the space after the text link should be preserved.
    - For "enter" - the new block or `<softBreak>` should be preserved.
