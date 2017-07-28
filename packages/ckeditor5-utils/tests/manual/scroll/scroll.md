## scrollViewportToShowTarget() helper

1. Click the "Go to blue" button.

**Expected:** The viewport is scrolled to **fully** reveal the 80x80px blue square in the bottom-right corner.

2. Scroll the **viewport** right and down just a little bit.
3. Make sure the blue square is right in the **bottom-right corner** of the topmost div containing it. **There should be only one set of scrollbars visible**.
4. Click "Go to red".

**Expected:** The viewport is scrolled to **fully** reveal the 80x80px red square in in the top area of the page.

5. Scroll the **viewport** top and left just a little bit.
6. Make sure the red square is right in the **bottom-right corner** of the topmost div containing it. **There should be only one set of scrollbars visible**.
7. Click "Go to green".

**Expected:** The viewport is scrolled to **fully** reveal the 80x80px green square in in the bottom-left corner of the page.

8. Scroll the **viewport** to the bottom and left just a little bit.
9. Make sure the green square is right in the **bottom-right corner** of the topmost div containing it. **There should be only one set of scrollbars visible**.
10. Click "Go to blue" to repeat the cycle.
