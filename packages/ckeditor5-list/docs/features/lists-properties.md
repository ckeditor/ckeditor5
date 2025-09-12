---
menu-title: List properties
meta-title: List properties | CKEditor 5 Documentation
meta-description: Change the various properties of the ordered and unordered lists in CKEditor 5, such as marker styles, ordering and starting number.
category: features-lists
order: 40
badges: [ premium ]
---

# List properties

Besides the basic functionality of creating ordered and unordered lists, CKEditor&nbsp;5 offers formatting tools that let you control the lists. You can enable features such as customizing list markers with additional styles, setting the start index, or reversing the list order separately or all at once. Check out the individual demos below or see all list properties working together in the {@link examples/builds/full-featured-editor feature-rich editor example}.

{@snippet getting-started/unlock-feature}

## List styles

The list style feature introduces more styles for the list item markers. When {@link module:list/listconfig~ListPropertiesConfig#styles enabled}, it adds three styles for unordered lists and six styles for ordered lists to choose from. The user will be able to set or change the list style via the dropdown. It opens when you click the arrow next to the appropriate list button in the toolbar.

### Demo

In the editor below, use the ordered {@icon @ckeditor/ckeditor5-icons/theme/icons/numbered-list.svg Insert ordered list} or unordered list dropdown {@icon @ckeditor/ckeditor5-icons/theme/icons/bulleted-list.svg Insert unordered list} to choose the desired marker type for each list.

{@snippet features/lists-style}

## List start index

The list start index feature allows the user to choose the starting point of an ordered list. By default, this would be `1` (or `A`, or `I` &ndash; see the [list styles section](#list-styles)). Sometimes you may want to start a list with some other digit or letter, though.

When this feature is {@link module:list/listconfig~ListPropertiesConfig#startIndex enabled}, an extra dropdown option is available in the ordered list toolbar button. Thanks to it, the user may set or change the starting marker.

### Demo

In the editor below, notice how the ordering continues in the second list. To achieve continuous numbering of all spaceships from the example, go to the first item of the last list. Then use the ordered list {@icon @ckeditor/ckeditor5-icons/theme/icons/numbered-list.svg Insert ordered list} dropdown input field to set the start index.

{@snippet features/lists-index}

## Reversed list

The reversed list feature lets the user reverse the numbering order of a list, changing it from ascending to descending. This is useful in countdowns and things-to-do lists that need to reproduce steps in a reversed order (for example, in disassembly instructions).

When this feature is {@link module:list/listconfig~ListPropertiesConfig#reversed enabled}, an extra dropdown switch is available in the ordered list toolbar button. Thanks to it,  the user may reverse the order of a list with a single click.

### Demo

Click the second list and use the ordered list {@icon @ckeditor/ckeditor5-icons/theme/icons/numbered-list.svg Insert ordered list} dropdown switch to choose whether to reverse the numbering order.

{@snippet features/lists-reversed}

<info-box info>
	You can see all the list properties together in action in the {@link examples/builds/full-featured-editor Feature-rich editor} and {@link examples/builds/document-editor Document editor} examples.
</info-box>

## List item marker formatting

The list item marker formatting feature automatically applies text formatting to list item markers when the entire content of the list item shares the same formatting. It integrates with the {@link features/font font feature} and {@link features/basic-styles basic styles feature}, supporting the following formatting options:

* **Bold** and **italic** (from basic styles),
* **Font color**, **font size**, and **font family** (from font).

When this feature is enabled, if the whole list item content is consistently styled using any of the supported formats, the bullet or number marker will reflect the same style automatically. For example, if a list item is entirely bold, its marker will appear bold as well.

### Demo

Select the entire content of a list item and apply a format like bold, italic, or a font style. If the whole item is formatted, the list marker will automatically update to match.

{@snippet features/lists-marker-formatting}

### Disabling marker formatting

This feature is enabled by default. To disable it, use the following configuration:

<code-switcher>
```js
import { ClassicEditor, List, Bold } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ List, Bold, /* ... */ ],
		toolbar: [ 'bulletedList', 'numberedList', 'bold', /* ... */ ]
		list: {
			enableListItemMarkerFormatting: false
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>
