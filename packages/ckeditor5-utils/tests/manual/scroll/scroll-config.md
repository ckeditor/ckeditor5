## scrollViewportToShowTarget() helper (config options)

0. Scroll the entire webpage to any position. Try top-left, bottom-right, etc.
1. Use "Scroll to #..." buttons to scroll the container to reveal a corresponding div.
2. Repeat for other buttons and divs, scrolling the container manually to different positions.
3. Change the configuration of the `scrollViewportToShowTarget()` method.
4. See how the config affects the scrolling.
5. The most interesting cases are when the container renders partially off-screen (sticks to the top or the bottom).
6. Try setting the same value of viewport and ancestor offsets. Then set them to different values.
7. Expect the helper to always reveal a div respecting the configuration.
