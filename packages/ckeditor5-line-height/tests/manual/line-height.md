# Line Height Feature - Manual Test

## Test scenario

1. The editor data contains various elements (paragraphs, headings, lists, blockquotes) with default line height.
2. Use the line height dropdown in the toolbar to change the line height of selected text.
3. Test selecting multiple paragraphs at once and applying line height to them.
4. Test applying line height to different block elements (paragraphs, headings, list items, blockquotes).

## Expected results

1. The line height dropdown is available in the editor toolbar.
2. By default, the dropdown offers the following line height options:
   - 0.5
   - 1
   - 1.5
   - 2
   - 2.5
3. Selecting text and choosing a line height option should apply the selected line height to the text.
4. Line height should be applied to entire block elements, not just selected fragments.
5. You can select multiple blocks and apply line height to all of them at once.
6. You can remove applied line height by selecting the "Default" option in the dropdown.
7. The configuration can be updated using the form at the bottom of the page.

## Advanced testing

1. Try selecting a mixture of blocks with and without line height applied and verify the UI state.
2. Modify the configuration in the textarea to test different line height options.
3. Try adding custom-named options in the configuration, like:
   ```json
   {
       "lineHeight": {
           "options": [
               { "title": "Single", "model": 1 },
               { "title": "One and a half", "model": 1.5 },
               { "title": "Double", "model": 2 }
           ]
       }
   }
   ```
4. Verify the output HTML has the correct inline style for line-height applied.
