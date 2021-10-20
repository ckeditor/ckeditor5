---
category: framework-contributing
order: 40
modified_at: 2021-06-07
---

# Package metadata

The package metadata is a set of CKEditor 5-related data describing plugins that the package delivers. It allows for an automated detection of plugins and building them by an external builder.

In case of official CKEditor 5 packages (as well as some partner ones), this data is used by the [CKEditor 5 Online Builder](https://ckeditor.com/ckeditor-5/online-builder/) and allows for building the {@link builds/guides/integration/features-html-output-overview Features' HTML output} page presenting all official CKEditor 5 plugins.

The package metadata should be saved in the special `ckeditor5-metadata.json` file in the root of the package published on npm.

<info-box>
	Only plugins that provide major functionalities should be described in the metadata file. For example, the [metadata file for the `@ckeditor/ckeditor5-mention` package](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-mention/ckeditor5-metadata.json) describes only the `Mention` plugin, which is a "glue plugin" that loads both the editing and UI parts of the mention feature. This package does not expose the `MentionEditing` and `MentionUI` plugins that cannot be used alone.
</info-box>

## Data format for plugin metadata

The `ckeditor5-metadata.json` file is a JSON object that holds the `plugins` array. Each element of this array should be an object containing information about a different plugin delivered by the package. Below is a list of all metadata properties that can be used to describe a plugin:

* `name` &ndash; A human-readable name of the plugin.
* `description` &ndash; A human-readable short description of the plugin.
* `docs` &ndash; An absolute or relative URL to the plugin documentation. If this URL is relative, it leads to the CKEditor 5 documentation in [https://ckeditor.com/docs/ckeditor5/latest/](https://ckeditor.com/docs/ckeditor5/latest/).
* `path` &ndash; A path to the file, relative to the metadata file that exports the plugin.
* `className` &ndash; The name of the class used to create the plugin. This class should be exported from the file using the `export default` syntax.
* `requires` &ndash; An array of the plugin's soft requirements and other non-explicit requirements. It should contain class names of plugins that should be included if this plugin is added. If the element of this array is another (nested) array containing plugins' class names, it means that at least one plugin listed from this nested array is required, but not all of them.
* `registeredToolbars` &ndash; An array of all toolbar names registered by the plugin. These names need to represent the configuration path (for example, `table.contentToolbar` for `editorConfig.table.contentToolbar` and `table.tableToolbar` for the `editorConfig.table.tableToolbar`, which are registered by the `Table` plugin).
* `uiComponents` &ndash; An array of objects that describes UI components exported by the plugin. Each object in this array may contain:
	* `name` &ndash; The name of the component the plugin exports. It should match the actual UI name registered by the plugin.
	* `type` &ndash; The component type: `Button`, `SplitButton` or `Dropdown`.
	* `iconPath` &ndash; The path to the SVG icon for `Button` or `SplitButton`. The path can be either relative to the package or absolute &mdash; linking to a resource from another package.
	* `label` &ndash; Text content for `Dropdown` components.
	* `toolbars` &ndash; An array of toolbar names that a given UI component can be added to. Some UI components may be added to multiple toolbars.
* `htmlOutput` &ndash; An array of objects that defines all possible HTML elements which can be created by a given plugin. The main property in this object is `elements`. Other properties (like `classes`, `styles`, `attributes`) only apply to items defined in the `elements` property within a given object. The wildcard character `*` is used to mark any value. The full list of all these properties includes:
	* `elements` &ndash; HTML elements (a single one or an array of these) that are created or altered by the plugin. The pseudo-element `$block` indicates that a given plugin applies classes, styles or attributes (defined in appropriate properties) for all block elements.
	* `classes` &ndash; CSS class names (a single one or an array of these) that may be applied to the HTML elements defined in the `elements` property.
	* `styles` &ndash; Inline CSS styles (a single one or an array of these) that may be applied to the HTML elements defined in the `elements` property.
	* `attributes` &ndash; HTML attributes (a single one or an array of these) other than `class` and `styles` (covered separately) that might be applied to the HTML elements defined in the `elements` property.
	* `implements` &ndash; The name of an element or a pseudo-element which indicates that HTML elements defined in the `elements` property may contain classes, styles or attributes that are created by other plugins. For example, `implements` equal to `$block` means that HTML elements may contain classes, styles or attributes that are defined by another plugin, which has `elements` equal to `$block`.
	* `isAlternative` &ndash; If the plugin output depends on its configuration, this value should be set to `true` to mark outputs that are not produced by the default configuration. If this value is either missing or `false`, the output will be considered as default output.
	* `_comment` &ndash; A human-readable description to explain more complicated cases, for example: the conditions when a given element, class or style can be created.

Below is an example showing how the `Bold` plugin can be documented using this format:

```json
{
	"name": "Bold",
	"className": "Bold",
	"description": "Implements bold formatting support. It is a part of the basic text styles package.",
	"docs": "features/basic-styles.html",
	"path": "src/bold.js",
	"uiComponents": [
		{
			"type": "Button",
			"name": "bold",
			"iconPath": "theme/icons/bold.svg"
		}
	],
	"htmlOutput": [
		{
			"elements": "strong"
		}
	]
}
```

If you want to check how plugins are documented in other packages, visit the [CKEditor 5 packages](https://github.com/ckeditor/ckeditor5/tree/master/packages) section on GitHub and find the `ckeditor5-metadata.json` file in a package you are interested in.
