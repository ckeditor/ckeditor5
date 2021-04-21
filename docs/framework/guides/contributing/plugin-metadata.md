---
category: framework-contributing
order: 40
---

# Plugin metadata

Most of CKEditor 5 packages contain a separate `ckeditor5-metadata.json` file in their root directory. This file contains the basic information about plugins that are exported by the package. Only the main ones that put the given functionality together are described in `ckeditor5-metadata.json`. For example, the `ckeditor5-metadata.json` in the `ckeditor5-mention` package does not contain the `MentionEditing` and `MentionUI` plugins, but instead it only contains the metadata for the main `Mention` plugin, which is a "glue plugin", that loads the editing and UI features.

## Data format for plugin metadata

The `ckeditor5-metadata.json` file is a JavaScript object that holds a `plugins` array. Each element of this array is an object containing information about a different plugin  delivered by the package. Below is a list of all properties that can be used to define the metadata for a plugin:

* `name` &ndash; A human-readable name of the plugin.
* `description` &ndash; A human-readable short description of the plugin.
* `docs` &ndash; An absolute or relative URL for the plugin's documentation. If this URL is relative, it leads to the CKEditor 5 documentation in [https://ckeditor.com/docs/ckeditor5/latest/](https://ckeditor.com/docs/ckeditor5/latest/).
* `path` &ndash; A path to the file, relative to the metadata file that exports the plugin.
* `className` &ndash; The name of the class used to create the plugin.
* `requires`&ndash; An array of the plugin's soft requirements and other non-explicit requirements.
* `registeredToolbars`&ndash; An array of all toolbar names registered by the plugin. These names need to contain the full configuration path (e.g. `table.contentToolbar` and `table.tableToolbar` for `Table` plugin).
* `uiComponents` &ndash; An array of objects, that describe UI components exported by the plugin. Each object in this array may contain:
	* `name` &ndash; A name of the component the plugin exports.
	* `type` &ndash; Component type: `Button`, `SplitButton` or `Dropdown`.
	* `iconPath` &ndash; A path to the SVG icon for `Button` or `SplitButton` components.
	* `label` &ndash; Text content for `Dropdown` components.
	* `toolbars`&ndash; An array of toolbar names, a given UI component can be added to. Some features may be added to multiple toolbars.
* `htmlOutput` &ndash; An array of objects, that define all possible HTML elements, which can be created by a given plugin. The main property in this object is `elements`. Other properties (e.g. `classes`, `styles`, `attributes`) only apply to items defined in the `elements` property within a given object. Wildcard character `*` is used to mark any value. Full list of all these properties includes:
	* `elements` &ndash; HTML elements (a single one or an array of these) that are created by the plugin. The pseudo-element `$block` indicates that a given plugin applies classes, styles or attributes (defined in appropriate properties) for all block elements.
	* `classes` &ndash; CSS class names (a single one or an array of these) that may be applied to the HTML elements defined in the `elements` property.
	* `styles` &ndash; Inline CSS styles (a single one or an array of these) that may be applied to the HTML elements defined in the `elements` property.
	* `attributes` &ndash; HTML attributes (a single one or an array of these) other than `class` and `styles` (covered separately), that might be applied to the HTML elements defined in the `elements` property.
	* `implements` &ndash; A name of an element or a pseudo-element which indicates that HTML elements defined in the `elements` property may contain classes, styles or attributes that are created by other plugins. For example, `implements` equal to `$block` means, that HTML elements may contain classes, styles or attributes that are defined by another plugin, which have `elements` equal to `$block`.
	* `_comment` &ndash; A human-readable description to explain more complicated cases, for example: the conditions when a given element, class or style can be created.
