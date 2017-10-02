---
category: features
toc: false
---

# Setting the UI language

The UI of the editor can be localized. CKEditor 5 currently supports around 20 languages and the number is growing.

If you want to help translate CKEditor 5 into your native language, join the [CKEditor 5 project on Transifex](https://www.transifex.com/ckeditor/ckeditor5/). Your help will be much appreciated!

See the demo of the editor in German:

{@snippet features/ui-language}

## Building the editor using a specific language

Currently, it is only possible to change the UI language at the build stage. A single build of the editor supports only the language which was defined in the [CKEditor 5 webpack plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin)'s configuration.

If you use one of the {@link builds/index predefined editor builds}, refer to {@link builds/guides/development/custom-builds Creating custom builds} to learn how to change the language of your build.

If you build CKEditor from scratch or integrate it directly into your application, then all you need to do is to:

1. Install the [`@ckeditor/ckeditor5-dev-webpack-plugin`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin) package:

	```bash
	npm install --save @ckeditor/ckeditor5-dev-webpack-plugin
	```

2. Add it to your webpack configuration:

	Note: The language code is defined in the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) standard.

	```js
	const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );

	// Define webpack plugins ...
		plugins: [
			new CKEditorWebpackPlugin( {
				// Note: The plugin is currently able to build just one language at a time.
				languages: [ 'pl' ]
			} ),

			// Other webpack plugins...
		]
	// ...
	```

3. Run webpack. The CKEditor plugin for webpack will replace the {@link module:utils/locale~Locale#t `t()`} function calls used in the source code with localized language strings.

<info-box>
	We are aware that the current localization method is not sufficient for all needs. It neither supports different bundlers (e.g. Rollup or Browserify) nor building multiple languages (to make it possible to pick one at runtime). We will be extending the localization possiblities in the near future.

	You can read more about the used techniques and future plans in the ["Implement translation services" issue](https://github.com/ckeditor/ckeditor5/issues/387).
</info-box>
