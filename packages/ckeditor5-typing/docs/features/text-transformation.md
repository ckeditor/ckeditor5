---
category: features
menu-title: Automatic text transformation
---

# Automatic text transformation (autocorrect)

{@snippet features/build-text-transformation-source}

The {@link module:typing/texttransformation~TextTransformation} feature brings support for implementing autocorrection options, i.e. automatically turning predefined snippets into their improved forms. Here are some examples that will be transformed in your WYSIWYG editor:

<table style="width: unset">
	<thead>
		<tr>
		<th>From</th>
		<th>To</th>
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

This feature comes pre-configured with a set of the most popular transformations. You can, however, disable existing ones or add your own autocorrect entries.

While most often this feature is used to easily insert special characters that are not present on your keyboard, it can also be used to achieve other goals. For instance, you can improve the users' productivity by configuring it to expand some abbreviations (e.g. team or company names) into their full forms.

## Demo

Type snippets such as `(c)`, `3/4`, `!=`, `---`, `"foo"` into the rich-text editor below and see how they get transformed into their typographically nicer forms. You can see the complete list of predefined transformations in the {@link module:typing/texttransformation~TextTransformationConfig} documentation.

{@snippet features/text-transformation}

## Related productivity features

In addition to enabling automatic text transformations, you may want to check the following productivity features:

* {@link features/autoformat Autoformatting} &ndash; It allows to quickly apply formatting to the content you are writing.
* {@link features/mentions Mentions} &ndash; It brings support for smart autocompletion.

## Configuring transformations

This feature comes pre-configured with a set of transformations. You can find the list of them in the {@link module:typing/texttransformation~TextTransformationConfig} documentation.

By using the options defined below you can extend, limit or override this list:

* {@link module:typing/texttransformation~TextTransformationConfig#include `typing.transformations.include`} &ndash; Overrides the default configuration. When overriding the default configuration you can reuse the predefined transformations (by using their names that can be found in the {@link module:typing/texttransformation~TextTransformationConfig} documentation) and write your own transformations.
* {@link module:typing/texttransformation~TextTransformationConfig#remove `typing.transformations.remove`} &ndash; Removes predefined transformations.
* {@link module:typing/texttransformation~TextTransformationConfig#extra `typing.transformations.extra`} &ndash; Adds your custom transformations to the predefined ones.

### Example: Using `transformations.include`

For instance, in order to use only the transformations from the "quotes" and "typography" groups and to turn `CKE` into `CKEditor`, you can use the `transformations.include` property like this:

```js
ClassicEditor
	.create( editorElement, {
		typing: {
			transformations: {
				include: [
					// Use only the 'quotes' and 'typography' groups.
					'quotes',
					'typography',

					// Plus some custom transformation.
					{ from: 'CKE', to: 'CKEditor' }
				],
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

### Example: Using `transformations.remove` and `extra`

Another example, removing a few transformations and adding some extra ones:

```js
ClassicEditor
	.create( editorElement, {
		typing: {
			transformations: {
				remove: [
					// Do not use the transformations from the
					// 'symbols' and 'quotes' groups.
					'symbols',
					'quotes',

					// As well as the following transformations.
					'arrowLeft',
					'arrowRight'
				],

				extra: [
					// Add some custom transformations – e.g. for emojis.
					{ from: ':)', to: '🙂' },
					{ from: ':+1:', to: '👍' },
					{ from: ':tada:', to: '🎉' },

					// You can also define patterns using regular expressions.
					// Note: The pattern must end with `$` and all its fragments must be wrapped
					// with capturing groups.
					// The following rule replaces ` "foo"` with ` «foo»`.
					{
						from: /(^|\s)(")([^"]*)(")$/,
						to: [ null, '«', null, '»' ]
					},

					// Finally, you can define `to` as a callback.
					// This (naive) rule will auto-capitalize the first word after a period.
					{
						from: /(\. )([a-z])$/,
						to: matches => [ null, matches[ 1 ].toUpperCase() ]
					}
				],
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

You can read more about the format of transformation rules in {@link module:typing/texttransformation~TextTransformationDescription}.

You can test the custom rules defined above in the demo:

{@snippet features/text-transformation-extended}

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

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

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-typing.
