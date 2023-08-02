# Sticky panel

Verify the behavior of the sticky panel inside the overflowing (scrollable) containers.
Best to run with `--debug=stickypanel` flag.

Tests:
* Panel should stick only when it's active.
* Panel should not change its state when scrolling the element that isn't its ancestor (drawn rects will disappear though).
* Sticky toolbar inside the inner container.
* Sticking the toolbar when scrolling the outer container.
* Top viewport offset should be taken into account when scrolling the window.
* Panel should stick to the bottom of the container when it's near end.
