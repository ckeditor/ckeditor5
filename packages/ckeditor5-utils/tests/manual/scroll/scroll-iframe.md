## scrollViewportToShowTarget() helper in an iframe

The aim of this test is checking if the helper function works for targets residing in a child document (window) within an `<iframe>`. There are 3 elements that interact in this test:

1. the **target**, which is a <span style="background: red; border: 3px solid green">red square with green border</span>,
2. the **iframe**, which is a <span style="background: white; border: 3px solid blue">blue–bordered square</span>,
3. the scrollable **iframe parent** <span style="background: white; border: 3px solid orange">has an orange border</span>.

## Scenario #1

1. Click the "Scroll" button in the upper–right corner of the viewport.

**Expected**:

The viewport should scroll so the red (target) square (and its green border). It should be revealed and completely visible in the viewport. Most certainly, it will land directly in the bottom–right corner of the viewport.

## Scenario #2

1. Click the "Scroll" button again.

**Expected**:

Basically, nothing should happen (nothing should get scrolled).

## Scenario #3

1. Play with the scrollbars of each element (iframe, iframe's parent, top window), e.g. to partially hide the target or to completely hide it to to hide it to the left/right/top/bottom. Be creative.
2. Click the "Scroll" button.

**Expected**:

The target should always be scrolled back and become completely visible. Mind the green border, it should become visible too. The location of the target on the screen will vary, depending on where you "hide" in its scrollable ancestors.
