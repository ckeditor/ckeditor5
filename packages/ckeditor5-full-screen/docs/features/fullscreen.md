---
title: Fullscreen mode
menu-title: Fullscreen mode
meta-title: Fullscreen mode | CKEditor 5 Documentation
category: features
classes: main__content--no-toc
toc: false
contributeUrl: false
modified_at: 2025-01-16
---

@TODO - description

<info-box warning>
	This is a **feature preview**, and as such it is not recommended for production use. For more information, comments, and feature requests, please refer to the [issue on GitHub](https://github.com/ckeditor/ckeditor5/issues/10089).
</info-box>

## Demo

@TODO

{@snippet features/fullscreen}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { DecoupledEditor, Fullscreen } from 'ckeditor5';

DecoupledEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Fullscreen, /* ... */ ],
		fullscreen: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

<info-box>
	For more technical details, please check the {@link module:fullscreen/fullscreenconfig~FullscreenConfig plugin configuration API}.
</info-box>

## Related features

Here are some other CKEditor&nbsp;5 features that you can use to navigate content better:

* @TODO

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-fullscreen](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-fullscreen).
