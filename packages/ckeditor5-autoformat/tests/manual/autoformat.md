@bender-ui: collapsed
@bender-tags: autoformat

## Autoformat

1. Type `#` and press space in empty paragraph to replace it with the heading.

2. Type `*` or `-` and press space in empty paragraph to replace it with list item.

3. Type number from the range **1-3** to replace empty paragraph with numbered list item.

4. Type `*foobar*`/`_foobar_` to italicize `foobar`. `*`/`_` should be removed.

5. Type `**foobar**`/`__foobar__` to bold `foobar`. `**`/`__` should be removed.

6. For every autoformat pattern: Undo until you'll see just the pattern (e.g. `- `). Typing should be then possible  without triggering autoformatting again.

7. Typing a different pattern in already converted block **must not** trigger autoformatting. For example, typing `- ` in heading should not convert heading to list.

