## Image Resize UI

The tests for manual image resizing.
- The first test should have the dropdown with configured options in the image toolbar (using `imageResize`).
	- Plugin icon should appear only in the dropbdown button.
	- Each option should have a label text represented an option value defined in the plugin configuration.
	- Selected options should be set "on" when dropdown is open.
- The second one should have the standalone buttons instead of dropdown (from the first test) in the image toolbar (using
`imageResize:option`).
	- Each option should have the plugin icon "stretched" over the label text which represents an option value defined in the plugin configuration.
	- Selected option should be set "on".
