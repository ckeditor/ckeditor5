## Find and replace
Things to look for:
* Find should be enabled in readonly mode
* Find and replace should be disabled in source mode
* Occurrences in the text input should be refreshed properly.

## Testing
#### Find is enabled in readonly mode
* Click on a 'Toggle editor readonly mode' button.
* Click on a find and replace dropdown button.
* Search for "cake" string.
* FindNext, findPrevious buttons and 'Match case', 'Whole words only' checkboxes should be working normally.

#### Find is disabled in source mode
* Click on the 'Source' button in toolbar to start source editing mode.
* Find and replace similarily to all buttons, except the source editing, should be disabled.

#### Matches color
* Open find dropdown.
* Search for "cake" string.
* The "cake" string in "Chocolate cake bar" (third paragraph) should be readable.
