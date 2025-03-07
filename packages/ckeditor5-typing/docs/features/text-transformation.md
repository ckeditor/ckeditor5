---
category: features
menu-title: Automatic text transformation
meta-title: Automatic text transformation (autocorrect) | CKEditor 5 Documentation
---

# Automatic text transformation (autocorrect)

The text transformation feature enables autocorrection. It automatically changes predefined text fragments into their improved forms.

## Demo

Type snippets such as `(c)`, `3/4`, `!=`, `---`, `"foo"` into the editor below and see how they get transformed into their typographically nicer forms. You can see the complete list of predefined transformations in the {@link module:typing/typingconfig~TextTransformationConfig} documentation.

{@snippet features/text-transformation}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

Here are some examples of snippets changed by the text transformation feature:

<!-- vale off -->
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
<!-- vale on -->

This feature comes pre-configured with a set of the most popular transformations. You can, however, remove existing ones or add your own autocorrect entries.

While most often this feature is used to insert special characters that are not present on your keyboard, you can also use it to achieve other goals. For instance, you can improve the users' productivity by configuring it to expand some abbreviations (like team or company names) into their full forms.

You may find interesting details and usage examples in the [Automatic text transformation in CKEditor&nbsp;5](https://ckeditor.com/blog/feature-of-the-month-automatic-text-transformation-in-ckeditor-5/) blog post after reading this guide.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration:

<code-switcher>
```js
import { ClassicEditor, TextTransformation } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ TextTransformation, /* ... */ ],
		typing: {
			// Configuration.
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuring transformations

This feature comes pre-configured with a set of transformations. You can find the list of them in the {@link module:typing/typingconfig~TextTransformationConfig} documentation.

By using the options defined below you can extend, limit, or override this list:

* {@link module:typing/typingconfig~TextTransformationConfig#include `typing.transformations.include`} &ndash; Overrides the default configuration. When overriding the default configuration you can reuse the predefined transformations (by using their names that you can find in the {@link module:typing/typingconfig~TextTransformationConfig} documentation) and write custom transformations.
* {@link module:typing/typingconfig~TextTransformationConfig#remove `typing.transformations.remove`} &ndash; Removes predefined transformations.
* {@link module:typing/typingconfig~TextTransformationConfig#extra `typing.transformations.extra`} &ndash; Adds your custom transformations to the predefined ones.

### Example: Using `transformations.include`

For instance, to use the transformations from the "quotes" and "typography" groups and to turn `CKE` into `CKEditor`, you can use the `transformations.include` property like this:

```js
ClassicEditor
	.create( editorElement, {
		// ... Other configuration options ...
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
	.then( /* ... */ )
	.catch( /* ... */ );
```

### Example: Using `transformations.remove` and `extra`

Another example, removing some transformations and adding some extra ones:

```js
ClassicEditor
	.create( editorElement, {
		// ... Other configuration options ...
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
					// Add some custom transformations, for example, for emojis.
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
					// This (naive) rule will auto-capitalize the first word after a period, question mark, or an exclamation mark.
					{
						from: /([.?!] )([a-z])$/,
						to: matches => [ null, matches[ 1 ].toUpperCase() ]
					}
				],
			}
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

You can read more about the format of transformation rules in {@link module:typing/typingconfig~TextTransformationDescription}.

You can test these custom rules in the demo. Try typing `:)` or `:+1:` and see how the text gets transformed into emojis. You can also write some sentences to test how the editor capitalizes words after a period, a quotation mark, or an exclamation mark.

{@snippet features/text-transformation-extended}

## Related features

In addition to enabling automatic text transformations, you may want to check the following productivity features:

* {@link features/autoformat Autoformatting} &ndash; Quickly apply formatting to the content you are writing.
* {@link features/link#autolink-feature Autolink} &ndash; Turns the links and email addresses typed or pasted into the editor into active URLs.
* {@link features/slash-commands Slash commands} &ndash; Execute a predefined command by writing its name or alias directly in the editor.
* {@link features/mentions Mentions} &ndash; Brings support for smart autocompletion.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-typing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-typing).
