---
category: features
menu-title: Math and chemical formulas
meta-title: Math equations and chemical formulas | CKEditor 5 Documentation
badges: [ premium ]
---

# Math equations and chemical formulas

[MathType](http://www.wiris.com/en/mathtype) is a popular mathematical and science formula editor with classical and handwriting input modes. You can use it to create math equations or chemical formulas right inside the CKEditor&nbsp;5 content.

<info-box>
	This is a premium feature that is additionally payable on top of CKEditor&nbsp;5 commercial license fee and delivered by our partner, [Wiris](https://www.wiris.com/en/). Please [contact us](https://ckeditor.com/contact/) if you have any feedback or questions.

	You can also report any issues in the official [CKEditor&nbsp;5 GitHub repository](https://github.com/ckeditor/ckeditor5/issues).
</info-box>

## Demo

To create math or chemical formulas in the editor below, click the MathType {@icon @wiris/mathtype-ckeditor5/theme/icons/formula.svg MathType} or ChemType {@icon @wiris/mathtype-ckeditor5/theme/icons/chem.svg ChemType} buttons in the toolbar. This will open the relevant dialog.

Use the toolbar to write your equation or formula. At any time, you can also click the "Go to handwritten mode" button on the right side of the MathType editor to switch to handwriting.

When you are done creating your scientific content, click the "OK" button to insert your formula into the editor. You can also edit any existing formulas by double-clicking them in your document.

{@snippet features/mathtype}

<info-box info>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</info-box>

## Additional feature information

MathType is based upon standards like MathML for internal representation and the PNG image format for displaying formulas. It can also handle other formats like LaTeX, Flash, SVG, and EPS.

Additionally, MathType offers a special tool designed to help you work with chemical notation. When enabled, ChemType adds a specialized toolbar with the common chemical symbols as well as changes the notation to make it more intuitive to work with chemical formulas.

## Usage

The MathType window is split into two main areas: a [tabbed toolbar](https://docs.wiris.com/mathtype/en/user-interfaces/mathtype-web-interface/toolbar-and-icons.html) that contains a large number of icons that are useful for creating math equations and chemical formulas, and an editing area where you can see your current formula, the location of the cursor, and the text currently selected (if any).

The following resources can come in handy if you want to become proficient at working with this tool:
* [Using MathType Web](https://docs.wiris.com/mathtype/en/user-interfaces/mathtype-web-interface/using-mathtype.html) covers the basics of creating formulas, using your keyboard, moving the cursor in templates, formatting your content, or writing on mobile devices.
* [Introductory tutorials](https://docs.wiris.com/mathtype/en/user-interfaces/mathtype-web-interface/introductory-tutorials.html) are intended to get you started using MathType.
* [ChemType](https://docs.wiris.com/mathtype/en/mathtype-integrations/mathtype-web-interface-features/chemistry.html) explains the features of the dedicated chemistry toolbar.
* [MathType documentation](https://docs.wiris.com/mathtype/index.html) is a complete reference to all MathType features and settings.

## Editing modes

MathType lets you choose between two editing modes:
* **Classic input mode** provides options to choose symbols and templates from the MathType or ChemType toolbars and combine them to build the equation.
* **Handwritten input mode** lets you write the equation in your own handwriting. After checking the equation preview to ensure its accuracy, you can insert the equation or switch to classic input for further editing. [Read more here](https://docs.wiris.com/mathtype/en/mathtype-integrations/mathtype-web-interface-features/handwritten-input.html).

If you visit a page using MathType with your mobile device, the handwriting interface will appear by default. However, if you visit the same page with a laptop or desktop computer, the classic input will be displayed. The user is always free to change between the two interfaces.

## Installation

<info-box info>
	⚠️ **New import paths**

	Starting with {@link updating/update-to-42 version 42.0.0}, we changed the format of import paths. This guide uses the new, shorter format. Refer to the {@link getting-started/legacy-getting-started/legacy-imports Packages in the legacy setup} guide if you use an older version of CKEditor&nbsp;5.
</info-box>

<info-box>
	This is an additionally payable feature. [Contact us](https://ckeditor.com/contact/?sales=true#contact-form) to receive an offer tailored to your needs.
</info-box>

<info-box warning>
	We are working with our partners to update this package to work with our new installation methods. Meanwhile, if you use or plan to use this package, please continue to use our legacy installation methods which are still supported.
</info-box>

MathType is delivered as a CKEditor&nbsp;5 plugin, so it can be combined into an editor preset just like other features. To add this feature to your editor, install the [`@wiris/mathtype-ckeditor5`](https://www.npmjs.com/package/@wiris/mathtype-ckeditor5) package:

```bash
npm install --save @wiris/mathtype-ckeditor5
```

Then add it to your plugin list and the toolbar configuration:

```js
import MathType from '@wiris/mathtype-ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ MathType, /* ... */ ],
		toolbar: [ 'MathType', 'ChemType', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

## Customizing MathType service

It is possible to use different services for MathType support. There are several ways to deploy it in the CKEditor&nbsp;5 environment. The following instructions will allow you to customize MathType Web Integration services for CKEditor&nbsp;5.

### Java

To install the Java service, follow the steps below:

1. Download the [MathType Web Integration Services - Java](https://store.wiris.com/en/products/downloads/mathtype/integrations) package.

2. Deploy the `pluginwiris_engine` war file.

3. Add `mathTypeParameters` to CKEditor&nbsp;5 with the configuration shown below:

	```js
	ClassicEditor
		.create( document.querySelector( '#example' ), {
				plugins: [ MathType, /* ... */ ],
				toolbar: {
					items: [
						'MathType',
						'ChemType',
						// More toolbar items.
						// ...
					]
				},
				language: 'en',
				// MathType parameters.
				mathTypeParameters : {
					serviceProviderProperties : {
						URI : '/pluginwiris_engine/app/configurationjs',
						server : 'java'
					}
				}
		})
		.then( /* ... */ )
		.catch( /* ... */ );
	```

### PHP

To install the PHP service, follow the steps below:

1. Download the [MathType Web Integration Services - PHP](https://store.wiris.com/en/products/downloads/mathtype/integrations) package.

2. Copy the `generic_wiris/integration` folder into your project. In this example, it was assumed the services are located at `DOCUMENT_ROOT/php-services/`.

3. Add `mathTypeParameters` to CKEditor&nbsp;5 with the following configuration:

	```js
	ClassicEditor
		.create( document.querySelector( '#example' ), {
				plugins: [ MathType, /* ... */ ],
				toolbar: {
					items: [
						'MathType',
						'ChemType',
						// More toolbar items.
						// ...
					]
				},
				language: 'en',
				// MathType parameters.
				mathTypeParameters : {
					serviceProviderProperties : {
						URI : 'http://localhost/php-services/integration',
						server : 'php'
					}
				}
		})
	.then( /* ... */ )
	.catch( /* ... */ );
	```
<!-- Update Node.js installation if confirmed, remove .Net and Ruby if so -->

### .NET

To install the .NET service, follow the steps below:

1. Download the [MathType Web Integration Services - Aspx](http://www.wiris.com/en/plugins/services/download) package.

2. Copy the `generic_wiris/integration` folder into your project. In this example, it was assumed the services are located at `DOCUMENT_ROOT/aspx-services/`.

3. Add `mathTypeParameters` to CKEditor&nbsp;5 with this configuration:

	```js
	ClassicEditor
		.create( document.querySelector( '#example' ), {
				plugins: [ MathType, /* ... */ ],
				toolbar: {
					items: [
						'MathType',
						'ChemType',
						// More toolbar items.
						// ...
					]
				},
				language: 'en',
				// MathType parameters.
				mathTypeParameters : {
					serviceProviderProperties : {
						URI : 'http://localhost/aspx-services/integration',
						server : 'aspx'
					}
				}
		})
	.then( /* ... */ )
	.catch( /* ... */ );
	```

### Ruby on Rails

To install the Ruby on Rails service, follow the steps below:

1. Download the [MathType Web Integration Services - Ruby on Rails](http://www.wiris.com/en/plugins/services/download) package.

2. Install the `wirispluginengine.gem` gem.

	```
	gem install -l wirispluginengine.gem
	```

3. Add `mathTypeParameters` to CKEditor&nbsp;5 with the configuration below:


	```js
	ClassicEditor
		.create( document.querySelector( '#example' ), {
				plugins: [ MathType, /* ... */ ],
				toolbar: {
					items: [
						'MathType',
						'ChemType',
						// More toolbar items.
						// ...
					]
				},
				language: 'en',
				// MathType parameters.
				mathTypeParameters : {
					serviceProviderProperties : {
						URI : '/wirispluginengine/integrationn',
						server : 'ruby'
					}
				}
		})
	.then( /* ... */ )
	.catch( /* ... */ );
	```

## Displaying equations on your website

By default, MathType returns equations in MathML which is [not supported by all browsers](https://developer.mozilla.org/en-US/docs/Web/MathML#browser_compatibility). To display equations on a page, you will need to use an engine that will handle the rendering process.

Fortunately, MathType introduces the full MathML mode that handles the unsupported markup and converts it into a form that can be properly recognized by browsers. You can read more about the full MathML mode [in the documentation](https://docs.wiris.com/en/mathtype/mathtype_web/integrations/mathml-mode).

