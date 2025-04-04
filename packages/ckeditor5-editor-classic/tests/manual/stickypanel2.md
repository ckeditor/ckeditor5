# Sticky panel

Verify the behavior of the sticky panel.
Use visual viewport to verify the behavior (pinch to zoom page).
Best to run with `--debug=stickypanel` flag.

Tests:
* Panel should stick only when it's active.
* Top viewport offset should be taken into account (visible part of it) when scrolling the window especially when partly or non-visible in the visual viewport.
* Panel should stick to the bottom of the container when it's near end.
