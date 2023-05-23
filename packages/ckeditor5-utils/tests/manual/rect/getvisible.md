## Rect#isVisible() method

* There are several test cases rendered in the document.

* Each test case represents a different combination of `position` and `overflow` style in a parent and child containers.

* The parent-child pairs are color-coded.

* For each test case, a visible sub-rect of a child  (the output of `Rect( child ).getVisible()` ) is painted as a box with a solid border and "X" stretching to its boundaries.

* For each test case, a total bounding rect of a child is painted as a box with dashed border (could be hidden underneath the visible sub-rect).

**Things to verify**:

* Make sure the latter rect (the one with "X") represents the actual visible subset of a child considering the geometry of the parent. Resize the window to see the visible rect change.

* Scroll down to see parent-child paris in the invisible sections of a viewport. The `getVisible()` method ignores the rect of the viewport so the children should be marked as fully visible.
