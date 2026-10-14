## Table features with the editor code in the main window and the editable in another document

The editor runs in the main window, while its editable element lives in another same-origin document. Use the buttons at the top to attach the editor either to an iframe or to a separate window opened with `window.open()`. No editor UI is used, the command buttons emulate a custom integration UI.

Check the status line and the log below while testing. Errors from all windows are logged there too.

Run the steps below in both modes:

1. Put the caret in a table cell. Verify that the model selection status changes and the command buttons get enabled.
1. Select multiple cells with the mouse (click and drag across cells). Verify that the cells are highlighted and the selected cells count changes.
1. Select multiple cells with <kbd>Shift</kbd> + click and <kbd>Shift</kbd> + arrow keys.
1. Execute the table commands with the buttons in the main window. Verify that the focus goes back to the editor.
1. Resize a column by dragging the column border. Verify that the resize follows the mouse and ends on mouse up, also when the mouse is released outside of the table.
1. Drag the text from the first paragraph into a table cell. Verify that the drop target marker is displayed in the correct position.
1. Drag a whole table using the widget handle and drop it between paragraphs.
1. Copy and paste selected cells into another table.
1. Navigate between cells with <kbd>Tab</kbd> and the arrow keys.

In the window mode, also:

1. Close the editor window. Verify that the log says the editor was closed and no errors are logged.
1. Switch between the modes a few times. Verify that only one editor exists at a time and no errors are logged.
