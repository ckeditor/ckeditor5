## Image Resize UI

Tests for manual image resizing using the UI in the image toolbar.
**NOTE**: Both editors have disabled resize handles. The only way to resize the images is to do it by the UI in the image toolbar.

## Dropdown

1. Select an image in the editor.
2. A dropdown with configured options (`config.image.resizeOptions`) should be visible in the toolbar.
	- The plugin icon should appear only next to the dropdown button.
	- Each option should have a label text corresponding to an option value defined in the configuration.
	- The selected option should be "on" when the dropdown is open.
	- The editor is using the combination of `ImageResizeEditing` and `ImageResizeButtons`.

## Buttons

1. Select an image in the editor.
2. Standalone buttons should be displayed in the image toolbar (corresponding to `config.image.resizeOptions`).
	- Each button should have an icon as in the configuration (`small`, `medium`, `large` or `original`).
	- No label should be rendered,
	- The tooltip text and the `aria-label` attribute should be the same (and more verbose).
	- The selected option button should be "on".
	- The editor is using the combination of `ImageResizeEditing` and `ImageResizeButtons`.
