---
category: framework-contributing
order: 50
---

# Plugin metadata

Most of our packages have a separate `ckeditor5-metadata.json` file in its root directory. This file contains basic information about plugins, that are exported from the package. Not all plugins are described in `ckeditor5-metadata.json`, but only the main ones, that connect the given functionality together. For example, the `ckeditor5-metadata.json` in the `ckeditor5-mention` package does not contain `MentionEditing` and `MentionUI` plugins, but instead it only contains the metadata for the main `Mention` plugin, which is a "glue", that loads the editing and UI features.

## Data format for plugin metadata

The `ckeditor5-metadata.json` file is a JavaScript object, that has `plugins` array. Each element of this array is an object, which contains information about a different plugin, that is exposed by the package. Below is a list of all the properties, that can be used to define the metadata for a plugin:

* `name` &ndash; Human-readable name of a plugin.
* `description` &ndash; Human-readable short description of a plugin.
* `docs` &ndash; Absolute or relative URL for the plugin's documentation. In case it is a relative URL, it leads to the CKEditor 5 documentation in https://ckeditor.com/docs/ckeditor5/latest/.
* `path` &ndash; Path to a file, relative to the metadata file, that exports a plugin.
* `className` &ndash; The class name, that was used to create a plugin.
* `requires`&ndash; An array of the plugin's soft requirements and other not explicit requirements.
* `registeredToolbars`&ndash; An array of all toolbar names, that are registered by the plugin. These names need to contain the full configuration path (e.g. `table.contentToolbar` and `table.tableToolbar` for `Table` plugin).
* `uiComponents` &ndash; An array of objects, that describe UI components exposed by a plugin. Each object in this array may contain:
	* `name` &ndash; Component name, that the plugin exposes.
	* `type` &ndash; Component type: `Button`, `SplitButton` or `Dropdown`.
	* `iconPath` &ndash; Path to the SVG icon for `Button` or `SplitButton` components.
	* `label` &ndash; Text content for `Dropdown` components.
	* `toolbars`&ndash; An array of toolbar names, where given UI component can be added. Some features may be added to multiple toolbars.
* `htmlOutput` &ndash; An array of objects, that define all possible HTML elements, which can be created by a given plugin. The main property in this object is `elements`. Other properties (e.g. `classes`, `styles`, `attributes`) apply only to items defined in `elements` property within given object. Wildcard character `*` is used to mark any value. Below is a list of all these properties:
	* `elements` &ndash; HTML elements (a single one or an array of them), that are created by the plugin. The pseudo-element `$block` indicates, that given plugin applies classes, styles or attributes (defined in appropriate properties) for all block elements.
	* `classes` &ndash; CSS class names (a single one or an array of them), that might be applied to the HTML elements defined in the `elements` property.
	* `styles` &ndash; Inline CSS styles (a single one or an array of them), that might be applied to the HTML elements defined in the `elements` property.
	* `attributes` &ndash; HTML attributes (a single one or an array of them) other than `class` and `styles`, which are covered separately, that might be applied to the HTML elements defined in the `elements` property.
	* `implements` &ndash; Name of an element or a pseudo-element which indicates, that HTML elements defined in the `elements` property may contain classes, styles or attributes, that are created by other plugins. For example, `implements` equal to `$block` means, that HTML elements may contain classes, styles or attributes, that are defined by other plugin, which have `elements` equal to `$block`.
	* `_comment` &ndash; Human-readable description to explain more complicated cases like, for example, the conditions when a given element, class or style can be created.
