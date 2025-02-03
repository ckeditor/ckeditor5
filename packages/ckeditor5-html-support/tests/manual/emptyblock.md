# Empty Block Manual Test

## Test scenario

1. You should see two editors side by side and a clipboard preview area below them.
2. Both editors have the source editing plugin enabled.
3. The clipboard preview area shows the HTML content of the last clipboard operation (copy/cut).

### Things to check

1. If you copy `<p>&nbsp;</p>` from the editor without the EmptyBlock plugin and then paste it to the editor with the EmptyBlock plugin, then the pasted content should be `<p>&nbsp;</p>`.
2. If you copy `<p>&nbsp;</p>` from the editor with the EmptyBlock plugin and then paste it to the editor without the EmptyBlock plugin, then the pasted content should be `<p>&nbsp;</p>`.
3. If you copy `<p></p>` from the editor with the EmptyBlock plugin and then paste it to the editor without the EmptyBlock plugin, then the pasted content should be `<p>&nbsp;</p>`.
4. If you copy `<p></p>` from the editor with the EmptyBlock plugin and then paste it to the same editor, then the pasted content should be `<p></p>`.
