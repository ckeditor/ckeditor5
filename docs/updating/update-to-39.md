---
category: update-guides
meta-title: Update to version 39.x | CKEditor 5 Documentation
menu-title: Update to v39.x
order: 85
---

# Update to CKEditor&nbsp;5 v39.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v39.0.0

_Released on August 2, 2023._

For the entire list of changes introduced in version 39.0.0, see the [release notes for CKEditor&nbsp;5 v39.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v39.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v39.0.0.

### Introduction of color pickers to table and table cell properties features

Starting with CKEditor&nbsp;5 v39.0.0, the {@link features/tables-styling table styling tools} will display a color picker in their user interfaces for color-related tools.

Just like with the {@link updating/update-to-38#introduction-of-color-pickers-to-font-color-and-font-background-color-features introduction of color pickers to font color and font background color features}, you can decide whether this new functionality works for your integration and to opt out of it.

You can set the {@link module:table/tableconfig~TablePropertiesConfig#colorPicker} and {@link module:table/tableconfig~TableCellPropertiesConfig#colorPicker} configuration options to `false` to get rid of color pickers in all table styling tools:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		table: {
			/* ... */

			tableProperties: {
				// Disable the color picker for the table properties feature.
				colorPicker: false
			},

			tableCellProperties: {
				// Disable the color picker for the table cell properties feature.
				colorPicker: false
			}
		}
		toolbar: [
			'heading', 'bulletedList', 'numberedList', 'fontColor', 'fontBackgroundColor', 'insertTable', 'undo', 'redo'
		]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Adjusting to changes in the `ckeditor5-cbox` package

#### CKBox library dependency

The [`@ckeditor/ckeditor5-cbox`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckbox) package now solely operates with the [CKBox](https://ckeditor.com/docs/ckbox/latest/index.html) library version `2.0.0` or higher. Ensure you have the following script tag set in your HTML to load the correct version:

```html
<script src="https://cdn.ckbox.io/ckbox/2.0.0/ckbox.js"></script>
```

#### On-premises CKBox backend adjustments

The CKBox backend was released in version 2.0.0. Users operating the on-premises version of the CKBox backend need to update to this version to ensure compatibility.

Moreover, the editor configuration parameter `ckbox.assetsOrigin`, commonly used with the on-premises version, is no longer necessary. This is because the plugin no longer constructs asset URLs on its own but instead uses those provided directly by the backend. You should remove the `ckbox.assetsOrigin` parameter from your editor configuration.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		/* ... */

		// CKBox configuration parameters.
		ckbox: {
			serviceOrigin: 'https://your-service-origin.com',

			// This parameter is no longer needed and should be removed.
			assetsOrigin: 'https://your-assets-origin.com'
		}
	} )
```

### View element placeholder

The {@link module:engine/view/placeholder~enablePlaceholder `enablePlaceholder()`} function no longer gets placeholder content as a `text` property of the `options` argument. To define a value of the placeholder, you need to specify it as a {@link module:engine/view/placeholder~PlaceholderableElement#placeholder `placeholder` property} of the `element` which is passed into the `options` object.

```js
element.placeholder = 'Type something…';

enablePlaceholder( {
    view: editingView,
    element: element,
    isDirectHost: false,
    keepOnFocus: true
} );
```
