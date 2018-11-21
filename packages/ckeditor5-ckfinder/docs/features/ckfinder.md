---
category: features
---

{@snippet features/build-ckfinder-source}

# CKFinder

The {@link module:ckfinder/ckfinder~CKFinder} feature brings support 

CKFinder lets you easily insert images and links to files into content by automatically integrating with [CKFinder](https://ckeditor.com/ckfinder/).

## Demo

You can use the "Insert image or file" button in the toolbar to insert image or a link to any other file. You can also paste the image into the editor content and it will be automatically uploaded to [CKFinder](https://ckeditor.com/ckeditor-4/ckfinder/)'s backend for CKEditor 5.

{@snippet features/ckfinder}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-ckfinder`](https://www.npmjs.com/package/@ckeditor/ckeditor5-ckfinder) package:

```bash
npm install --save @ckeditor/ckeditor5-ckfinder
```

Then add `CKFinder` to your plugin list and {@link module:ckfinder/ckfinder~CKFinderConfig configure} the feature (if needed):

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			// configuration...
		}
	} )
	.then( ... )
	.catch( ... );
```

## CKFinder configuration

This feature integrates with [CKFinder](https://ckeditor.com/ckfinder/) with no additional configuration required. However it is possible to configure behavior of CKFinder by passing {@link module:ckfinder/ckfinder~CKFinderConfig#options configuration options}. Check [CKFinder documentation](https://ckeditor.com/docs/ckfinder/ckfinder3/#!/api/CKFinder.Config) for complete list of options. This feature will automatically set `chooseFiles=true` to enable file choosing behavior in CKFinder.

<info-box>
To enable uploads of pasted images configure the {@link module:adapter-ckfinder/uploadadapter~CKFinderAdapterConfig#uploadUrl}.
</info-box> 

Below code will instruct CKFinder to open only one resource type: 

```js
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CKFinder, ... ],
		toolbar: [ 'ckfinder', ... ]
		ckfinder: {
			openerMethod: 'popup',
			options: {
				resourceType: 'Images'
			}
		}
	} )
	.then( ... )
	.catch( ... );
``` 

{@snippet features/ckfinder-options}

<info-box>
The CKFinder featuer will also pass the editor language. This behavior can be changed by setting `ckfinder.options.language` configuration option.
</info-box>

## Common API

The {@link module:ckfinder/ckfinder~CKFinder} plugin registers:

* the `'ckfinder'` UI button component,
* the `'ckfinder'` command implemented by {@link module:ckfinder/ckfindercommand~CKFinderCommand}.

	You can open a CKFinder by executing the following code:

	```js
	editor.execute( 'ckfinder' );
	```

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-ckfinder.
