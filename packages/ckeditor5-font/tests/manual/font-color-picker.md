## Color picker manual test

### Description

This manual test contains 3 editors:
* the first one has the default color picker config;
* the second one has the output colors set to `rgb` for font color and `hex` for background color;
* the last one has color picker disabled.

### Testing

To test the feature, ensure that:
* The "Color picker" button is visible by default.
* Clicking the "Color picker" button toggles the dropdown view to color picker.
* Upon color picker opening, the current selection color is set in the palette and color input (converted to the `hex` format).
* Colors set through the color picker are applied in the model and data in the right formats.
* Font and font background color configs are independent.
* "Save" button applies changes and hides the dropdown.
* "Cancel" button cancels the changes done through the color picker.
* Color input only accepts colors in `hex` format (both with or without `#` at the beginning).
* Multiple color changes through the color picker are batched in one undo step.
* Keyboard navigation (with `tab` and arrows) works (all items in color picker view are accessible).
* Focus is clearly indicated on all focusable items.
