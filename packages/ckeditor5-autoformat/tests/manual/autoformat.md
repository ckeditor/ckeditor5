@bender-ui: collapsed
@bender-tags: autoformat

## Autoformat

1. Type `#` and press space to replace current paragraph with the heading.

2. Type `*` or `-` and press space to replace current paragraph with list item.

3. Type number from the range **1-3** to replace current paragraph with numbered list item.

4. Type `*foobar*` to italicize `foobar`. `*` should be removed.

5. Type `**foobar**` to bold `foobar`. `**` should be removed.

6. For every autoformat pattern: Undo until you'll see just the pattern (e.g. `- `). Typing should be then possible  without triggering autoformatting again.

7. Typing a different pattern in already converted block **must not** trigger autoformatting. For example, typing `- ` in heading should not convert heading to list.

