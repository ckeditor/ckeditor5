---
title: Line height
meta-title: Line height | CKEditor 5 Documentation
category: features
modified_at: 2025-04-09
---

The line height features lets you control the distance between the lines of content.

## Demo

Select content and change the line height using the toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/line-height.svg Change line height}. Please note that the feature can only be applied to whole block of content (such as paragraphs, tables or lists).

{@snippet features/line-height}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the plugins which you need to your plugin list. Then, simply configure the toolbar items to make the features available in the user interface.

<code-switcher>
```js
import { ClassicEditor, LineHeight } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ LineHeight, /* ... */ ],
		toolbar: [ 'lineheight', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

The feature can be configured to provide desired available values:

```ts
	const lineHeightConfig = {
		options: [ 1, 2, 4 ]
	};
 ```

The available values are always multipliers of the default line height applied to the edited content. Line height values have to be provided in a format without units. The default values are: 0.5, 1, 1.5, 2, 2.5.

## Related features

Check out also these CKEditor&nbsp;5 features to gain better control over your content style and format:
* list them

<info-box info>
	You can remove all basic text styles with the {@link features/remove-format remove format} feature.
</info-box>

## Common API

The line height feature registers the UI button:

* link it

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-line-height](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-line-height).
