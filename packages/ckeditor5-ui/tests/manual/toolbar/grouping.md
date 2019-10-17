# Automatic toolbar grouping

## Grouping on load

1. Narrow the browser window so some toolbar items should wrap to the next row.
2. Refresh the test.
3. The toolbar should looks the same. Make sure none of toolbar items wrapped or overflow.
4. The dropdown button should be displayed at the end of the toolbar, allowing to access grouped features.
	* The drop–down should be displayed **under** the main toolbar.
5. Grouped items toolbar should never start or end with a separator, even if one was in the main toolbar space.
6. Other separators (between items) should be preserved.

## Grouping and ungrouping on resize

1. Play with the size of the browser window.
2. Toolbar items should group and ungroup automatically but
	* the should never wrap to the next line,
	* or stick out beyond the toolbar boundaries.

## Accessibility

1. Make sure no toolbar items are grouped.
2. Use <kbd>Alt</kbd> + <kbd>F10</kbd> (+ <kbd>Fn</kbd> on Mac) to focus the toolbar.
3. Navigate the toolbar using the keyboard
	* it should work naturally,
	* the navigation should cycle (leaving the last item focuses the first item, and going back from the first items focuses the last)
4. Resize the window so some items are grouped.
5. Check if navigation works in the same way but includes the button that aggregates grouped items.
6. Enter the group button, navigate across grouped items, go back (<kbd>Esc</kbd>).
7. There should be no interruptions or glitches in the navigation.

## RTL UI support

1. Perform the same scenarios in the editor with RTL (right–to–left) UI.
2. There should be no visual or behavioral difference between LTR and RTL editors except that the toolbar is mirrored.
3. The button aggregating grouped toolbar items should be displayed on the left–hand side.

