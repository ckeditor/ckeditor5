## Restricted editing - Standard mode

* The editor data should be loaded with "it is editable" fragment marked as an exception in the first paragraph (orange-ish background).
* Test the "Restricted editing" button to mark parts of text as non-restricted.

## Restricted editing - Restricted mode

* The editor data should be loaded with the same exception fragments as defined in standard mode.
* The editor toolbar should have limited set of buttons for basic styles.
* The following table features **should be enabled** (via `restrictedEditingModeEditing.enableCommand()`):
	* 'insertTableRowAbove'
	* 'insertTableRowBelow'
	* 'insertTableColumnRight'
	* 'insertTableColumnLeft'
	* 'mergeTableCells'
