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

### Available list styles

The following unordered list styles are available:

* `disk` (•)
* `circle` (◦)
* `square` (▪)

The following ordered list styles are available:

* `decimal` (1.)
* `decimal-leading-zero` (01.)
* `lower-roman` (i.)
* `upper-roman` (I.)
* `lower-latin` (a.)
* `upper-latin` (A.)

Additional numbering style that {@link features/lists#enabling-specific-enumerators needs configuration}:

* arabic-indic numbers (١.)

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

### Styling the markers with CSS

For every supported format, the feature adds a class to the `<li>` element. When the format carries a value, it also sets a CSS variable on the same element:

| Format      | Class                        | CSS variable                           |
| ----------- | ---------------------------- | -------------------------------------- |
| Bold        | `ck-list-marker-bold`        | &ndash;                                |
| Italic      | `ck-list-marker-italic`      | &ndash;                                |
| Font color  | `ck-list-marker-color`       | `--ck-content-list-marker-color`       |
| Font family | `ck-list-marker-font-family` | `--ck-content-list-marker-font-family` |
| Font size   | `ck-list-marker-font-size`   | `--ck-content-list-marker-font-size`   |

The content styles use these classes and variables to style the `::marker` pseudo-element of the list item. Font size is an exception: the variable holds numerical sizes, while the default named presets use dedicated classes, as described in the note below.

The feature sets the variables on the `<li>` element itself, so redefining them in `:root` does not affect formatted items. To take control of a marker style, declare the property for the marker directly. The CSS below keeps one font family for all markers, while bold, italic, font color, and font size still follow the content of the item:

```css
.ck-content ol > li.ck-list-marker-font-family::marker,
.ck-content ul > li.ck-list-marker-font-family::marker {
	font-family: var(--ck-content-font-family);
}
```

<info-box info>
	By default, the {@link features/font#configuring-the-font-size-feature font size feature} uses named presets. For a preset, the feature adds the `ck-list-marker-font-size-tiny`, `ck-list-marker-font-size-small`, `ck-list-marker-font-size-big`, or `ck-list-marker-font-size-huge` class to the list item, and the marker size comes from the matching `--ck-content-font-size-*` variable. The `ck-list-marker-font-size` class and the `--ck-content-list-marker-font-size` variable are used when the feature is configured with {@link features/font#using-numerical-values numerical values}. Include all these classes in your selector if you want every marker to keep one size.
</info-box>

### Marker width and list alignment

The browser draws the marker outside the content of the list item, ending right before that content. A marker in a monospace font family or in a bigger font size is wider, and the extra width extends to the left. As a result, the markers of a list with mixed formatting no longer start at the same position, while the content of the items stays aligned. Padding on the list does not change this, because it moves the markers together with the content.

The width of a marker comes from the font itself. Every font family has its own glyph metrics, because type designers give characters different widths, spacing, and proportions. The same marker text therefore takes a different amount of space in each font. Monospace fonts give every character the same width. In a numbered marker, the period then takes as much space as a digit, and most of that space stays empty. The gap before the content of the item looks bigger, but the content has not moved.

If your content requires all markers to start at the same position, use one of these options:

* Keep one font family and one font size for all markers, as shown in [Styling the markers with CSS](#styling-the-markers-with-css).
* [Disable marker formatting](#disabling-marker-formatting), so that markers always use the content font.

Apply the same CSS wherever the content is presented outside the editor. For example in the {@link getting-started/setup/css#styling-the-published-content published content} styles, and in the style sheets passed to the {@link features/export-pdf export to PDF} or {@link features/export-word export to Word} features.

### Disabling marker formatting

This feature is enabled by default. To disable it, use the following configuration:

<code-switcher>
```js
import { ClassicEditor, List, Bold } from 'ckeditor5';

ClassicEditor
	.create( {
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
