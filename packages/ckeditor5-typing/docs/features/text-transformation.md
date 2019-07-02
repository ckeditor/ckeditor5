---
category: features
---

# Automatic text transformation

{@snippet features/build-text-transformation-source}

The {@link module:typing/texttransformation~TextTransformation} feature brings support for automatically turning predefined snippets into their improved forms. For instance:

<table style="width: unset">
	<thead>
		<tr>
		<th>from</th>
		<th>to</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>(tm)</td>
			<td>™</td>
		</tr>
		<tr>
			<td>1/2</td>
			<td>½</td>
		</tr>
		<tr>
			<td>-&gt;</td>
			<td>→</td>
		</tr>
		<tr>
			<td>--</td>
			<td>–</td>
		</tr>
		<tr>
			<td>"foo"</td>
			<td>“foo”</td>
		</tr>
	</tbody>
</table>

This feature comes pre-configured with a set of the most popular transformations. You can, however, disable existing ones or add your own ones.

While, most often this feature is used to allow easily inserting characters which are not present on your keyboard, it can also be used to achieve other goals. For instance, you can improve users' productivity by configuring it to expand some abbreviations (e.g. team or company names) into their full forms.

## Demo

Type snippets such as `(tm)`, `1/2`, `->`, `--`, `"foo"` and see how they get automatically transformed into their nicer typographically forms.

{@snippet features/text-transformation}

## Related productivity features

In addition to enabling automatic text transformations, you may want to check the following productivity features:

* {@link features/autoformat Autoformatting} &mdash; allows quickly applying formatting to the content you are writing.
* {@link features/mentions Mentions} &mdash; support for smart autocompletion.

## Configuring transformations

This feature comes pre-configured with a set of transformations. You can find the list of them in {@link module:typing/texttransformation~TextTransformationConfig} documentation.

By using the below defined options you can extend, limit or override this list:

* {@link module:typing/texttransformation~TextTransformationConfig#include `typing.transformations.include`} &mdash; allows overriding the default configuration. When overriding the default configuration you can reuse the predefined transformations (by using their names, which you can find in the {@link module:typing/texttransformation~TextTransformationConfig} documentation) and write your own transformations
* {@link module:typing/texttransformation~TextTransformationConfig#remove `typing.transformations.remove`} &mdash; allows disabling predefined transformations.
* {@link module:typing/texttransformation~TextTransformationConfig#extra `typing.transformations.extra`} &mdash; allows disabling predefined transformations. You can find the names of the predefined transformations in the {@link module:typing/texttransformation~TextTransformationConfig} documentation.

### Example: using `transformations.include`

For instance, in order to use only the transformations from the "quotes" and "typography" groups and in order to turn `CKE` into `CKEditor`, you can use the `transformations.include` property like this:

```js
ClassicEditor
	.create( editorElement, {
		typing: {
			transformations: {
				include: [
					// Use only the 'quotes' and 'typography' groups.
					'quotes',
					'typography',

					// Plus, some custom transformation.
					{ from: 'CKE', to: 'CKEditor' }
				],
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

### Example: using `transformations.remove` and `extra`

Another example, removing a couple of transformations and adding a couple of extra ones:

```js
ClassicEditor
	.create( editorElement, {
		typing: {
			transformations: {
				remove: [
					// Don't use the transformations from the
					// 'symbols' and 'mathematical' groups.
					'symbols',
					'mathematical',

					// As well as the following transformations.
					'arrowLeft',
					'arrowRight'
				],

				extra: [
					// Add some custom transformations – e.g. for emojis.
					{ from: ':)', to: '🙂' },
					{ from: ':+1:', to: '👍' },
					{ from: ':tada:', to: '🎉' },

					// You can also define patterns using regexp.
					// Note: the pattern must end with `$`.
					// The following (naive) rule will remove @ from emails.
					// For example, user@example.com will become user.at.example.com.
					{ from: /([a-z-]+)@([a-z]+\.[a-z]{2,})$/i, to: '$1.at.$2' }
				],
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

You can test the above configuration here:

{@snippet features/text-transformation-extended}

## Installation

To add this feature to your rich-text editor, install the [`@ckeditor/ckeditor5-typing`](https://www.npmjs.com/package/@ckeditor/ckeditor5-typing) package:

```bash
npm install --save @ckeditor/ckeditor5-typing
```

And add it to your plugin list configuration:

```js
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ TextTransformation, ... ],
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-typing.
