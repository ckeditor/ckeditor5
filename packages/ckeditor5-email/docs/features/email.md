---
title: Email
meta-title: Email | CKEditor 5 Documentation
category: features
modified_at: 2025-01-30
---

{@snippet features/build-email-source}

Creating and editing emails is a demanding task that has to overcome various semantic and technical difficulties due to a variety of software solutions and a lack of a standardized approach. The email feature is a set of tools aimed at making the email composition a better and more effective experience.

## Demo

Use the email toolbar button {@icon @ckeditor/ckeditor5-link/theme/icons/link.svg Link}.

{@snippet features/email}

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
import { ClassicEditor, EmailIntegration } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ EmailIntegration, /* ... */ ],
		toolbar: [ 'email', /* ... */ ], //probably not
		link: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

### Empty block plugin

The {@link module:html-support/emptyblock~EmptyBlock} plugin is recommended for email editing as it helps maintain compatibility with email clients. By default, CKEditor&nbsp;5 adds `&nbsp;` fillers to empty block elements. This can cause inconsistent rendering across email clients and interfere with the CSS styling.

Here is how empty blocks are handled with and without the plugin:

```html
<!-- Without EmptyBlock plugin -->
<p class="spacer">&nbsp;</p>
<td>&nbsp;</td>

<!-- With EmptyBlock plugin -->
<p class="spacer"></p>
<td></td>
```

To enable the EmptyBlock plugin, add it to your editor configuration:

```js
import { EmailIntegration, EmptyBlock } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ EmailIntegration, EmptyBlock, /* ... */ ],
		htmlSupport: {
			preserveEmptyBlocksInEditingView: true
		}
	} )
	.then( editor => {
		console.log( 'Editor was initialized' );
	} )
	.catch( error => {
		console.error( error );
	} );
```

The `preserveEmptyBlocksInEditingView` option determines whether empty blocks should be preserved during editing (true) or only in the final output (false).

<info-box warning>
	Without the EmptyBlock plugin, email clients may render empty blocks inconsistently. The editor will display a warning in the console if the plugin is not enabled.
</info-box>

### Logs and warnings

The {@link module:email/emailintegrationconfig~EmailIntegrationConfig} property lets you suppress warnings or log messages about email client compatibility.

```js
ClassicEditor
	.create( editorElement, {
		email: {
			logs: {
				suppressAll: false,
				suppress: [ ... ]
			}
		}
	} )
```

## Related features

Here are some similar CKEditor&nbsp;5 features that you may find helpful:
* list them here

## Common API

The {@link module:email/emailintegration~EmailIntegration} plugin registers the following components:

* The {@link module:email/emailintegration~EmailIntegration} component.
* The {@link module:email/emailintegrationconfig~EmailIntegrationConfig} property.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link).
