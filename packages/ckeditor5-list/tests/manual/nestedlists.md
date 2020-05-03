## Nested lists

### Loading data

The loaded data should look like this:

<ul>
	<li>
		Bullet list item 1
		<ul>
			<li>
				Bullet list item 1.1
				<ul>
					<li>Bullet list item 1.1.1</li>
				</ul>
			</li>
			<li>
				Bullet list item 1.2
				<ul>
					<li>Bullet list item 1.2.1</li>
					<li>Bullet list item 1.2.2</li>
					<li>Bullet list item 1.2.3</li>
					<li>Bullet list item 1.2.4</li>
				</ul>
			</li>
		</ul>
	</li>
	<li>
		&nbsp;
		<ul>
			<li>
				&nbsp;
				<ol>
					<li>Numbered list item 2.1.1</li>
					<li>Numbered list item 2.1.2</li>
				</ol>
			</li>
		</ul>
	</li>
</ul>

### Testing

Check if:

1. You can write and delete in indented list items and remove indented list items.
2. Tab key indents list item (other than first item on the list).
3. Shift+tab key outdents list item.
4. Enter key creates list item with same indent.
5. Enter key in empty list item outdents it.
6. Indenting and outdenting list item also indents/outdents following items.
7. Outdenting not-indented item converts it to paragraph.
8. Enter in not-indented item converts it to paragraph.
9. Lists are correctly merged after outdenting.
10. Lists are correctly merged when removing list item from between lists (for example 1.2, 1.1, 2.1 (empty)).
11. Lists are correctly merged when deleting multi-level selection.
12. You can put selection in empty list item, write something there, remove it.
13. Changing list type works correctly with nested lists.
14. Turning off list item works correctly.
15. Changing list item to heading works correctly (undo may not work correctly for this one).
16. Undo works correctly.
