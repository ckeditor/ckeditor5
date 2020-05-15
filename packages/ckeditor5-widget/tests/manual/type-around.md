# Typing around block widgets

## General idea

1. Move the mouse cursor over various block widgets.
2. There should be buttons appearing at the top/bottom boundaries of a widget when there is no way to put the caret before/after.
3. Clicking an individual button should insert a paragraph before/after the widget.

## States

1. Check the look of the buttons when widgets are in a different states:
	* Not selected but hovered by the cursor.
	* Selected and hovered by the cursor.
	* Selected but the editor is blurred (use dev tools console to test that) and hovered by the cursor.
2. In each of these states, the buttons that insert paragraphs around widgets should blend in with the style of the widget.

## Exceptions

1. Inline widgets should **never** display the UI (buttons) regardless of their position in the document and their surroundings.
2. Blocks widgets should display the UI only when there's a "tight spot" next to them. If you can type freely before/after a widget, the UI (buttons) related to that position should never appear.
	* If you can type before the widget (e.g. preceded by a paragraph), the top button should never appear.
	* If you can type after the widget (e.g. followed by a paragraph), the bottom button should never appear.
