# Keyboard navigation across widgets

1. Put a selection at the beginning of the document.
2. Use the **right arrow** key to navigate forwards.
3. Go through inline and block widgets.
4. The navigation should
	* be uninterrupted,
	* go always forward,
	* select widgets on its way.
5. Reach the end of the document.
6. Go backwards using the **left arrow** key and repeat the entire scenario.

Check if **up/down arrows** are working correctly. Caret should jump to text position closest to non-inline limit element if there are no more text lines between the caret and limit element. Note that limit is an external edge of a widget and also edge of nested editable inside widget.

It's also worth to check **up/down arrows** at the beginnings and ends of lines.

## RTL (right–to–left) content navigation

In this scenario the content is written in Arabic.

1. Repeat the scenario from the previous section but note that the content is mirrored, i.e. the beginning is on the right–hand side.
2. Forwards navigation is done by pressing the **left arrow** key.
3. To go backwards, use the **right arrow** key.
4. Just like with the LTR content, the navigation should be seamless, always in the same direction.
