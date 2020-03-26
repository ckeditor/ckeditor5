---
menu-title: Using a React component in a widget
category: framework-tutorials
order: 10
---

# Using a React component in a block widget

In this tutorial, you will learn how to implement an editor plugin that uses the power of the [React](https://reactjs.org/) library inside the CKEditor 5 widget ecosystem. You will build a "Product preview" feature which renders an actual React component inside the editor to display some useful information about the product.

Later on, you will use the "Product preview" feature to build a simple React application that displays an editor next to the list of available products, allowing the user to insert the product into the editor content by clicking it on the list.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

<!-- TODO: dynamic controls in React to change the appearance of the widget https://github.com/ckeditor/ckeditor5-widget/issues/81 -->

## Before you start

There are a couple of things you should know before you start:

* Since you are here, you probably have at least some basic understanding of what React is and how it works. But what you might not know is that CKEditor 5 has an official {@link builds/guides/frameworks/react **rich text editor component for React**} and it will be one of the key features used in this tutorial. Learning how to {@link builds/guides/frameworks/react#integrating-ckeditor-5-built-from-source use it in your project} is a good place to start.
* In this tutorial, you are going to implement a block editor widget and that itself could give you a headache. It is recommended to at least skim through the {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget} tutorial to get a grip on editor widgets, their API, and possible use cases.
* Also, while it is not strictly necessary to read the {@link framework/guides/quick-start Quick start} guide before going through this tutorial, it may help you to get more comfortable with CKEditor 5 Framework before you dive into this tutorial.
* Various parts of the {@link framework/guides/architecture/intro CKEditor 5 architecture} section will be referenced as you go. While reading them is not necessary to finish this tutorial, it is recommended to read those guides at some point to get a better understanding of the mechanisms used in this tutorial.

## Let's start

This guide assumes that you are familiar with [yarn](https://yarnpkg.com) and your project uses yarn already. If not, see the [yarn documentation](https://yarnpkg.com/en/docs/getting-started). If you are using [npm](https://www.npmjs.com/get-npm) you do not have to worry — you can perform the same installation tasks just as easily using [corresponding npm commands](https://docs.npmjs.com/getting-packages-from-the-registry).

First, install the packages needed to build and set up a basic React application with a CKEditor 5 instance.

```bash
yarn add --dev \
	@babel/cli \
	@babel/core \
	@babel/preset-react \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-build-classic \
	@ckeditor/ckeditor5-core \
	@ckeditor/ckeditor5-dev-utils \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-inspector \
	@ckeditor/ckeditor5-link \
	@ckeditor/ckeditor5-paragraph \
	@ckeditor/ckeditor5-react \
	@ckeditor/ckeditor5-table \
	@ckeditor/ckeditor5-theme-lark \
	@ckeditor/ckeditor5-ui \
	@ckeditor/ckeditor5-widget \
	babel-loader \
	css-loader \
	postcss-loader@3 \
	raw-loader@3 \
	react \
	react-dom \
	style-loader@1 \
	webpack@4 \
	webpack-cli@3
```

Create a minimal [webpack](https://webpack.js.org) configuration and save it as `webpack.config.js` in the root of the application. To learn more about using webpack with CKEditor 5 and React, check out the {@link builds/guides/frameworks/react#integrating-ckeditor-5-built-from-source Integrating CKEditor 5 built from source} section of the CKEditor 5 React component guide.

```js
// webpack.config.js

const webpack = require( 'webpack' );
const path = require( 'path' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );

module.exports = {
	entry: path.resolve( __dirname, 'app.js' ),

	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'bundle.js'
	},

	module: {
		rules: [
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
				use: [ 'raw-loader' ]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [ '@babel/react' ]
				}
			},
			{
				test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
				use: [
					{
						loader: 'style-loader',
						options: {
							injectType: 'singletonStyleTag',
							attributes: {
								'data-cke': true
							}
						}
					},
					{
						loader: 'postcss-loader',
						options: styles.getPostCssConfig( {
							themeImporter: {
								themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
							},
							minify: true
						} )
					}
				]
			}
		]
	},

	// Useful for debugging.
	devtool: 'source-map',

	// By default webpack logs warnings if the bundle is bigger than 200kb.
	performance: { hints: false }
};
```

Create your project's entry point and save it as `app.js`, also in the root of the application:

```js
// app.js

// Imports necessary to run a React application.
import React from 'react';
import ReactDOM from 'react-dom';

// The React application class.
class App extends React.Component {
	render() {
		return 'Hello world!';
	}
}

// Render the <App> in the <div class="app"></div> element found in the DOM.
ReactDOM.render(
	<App />,
	document.querySelector( '.app' )
);
```

Add an `index.html` page next to the `app.js` file:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Using React components in CKEditor 5 widgets</title>
	</head>
	<body>
		<div class="app"></div>
		<script src="dist/bundle.js"></script>
	</body>
</html>
```

Finally, build your project and see if everything worked well by opening the index page in your browser:

```bash
oleq@MBP15 ckeditor5-react-in-widgets> node_modules/.bin/webpack --mode development
Hash: f46cba995690347de4cf
Version: webpack 4.29.6
Time: 896ms
Built at: 04/11/2019 12:43:26 PM
        Asset      Size  Chunks                    Chunk Names
    bundle.js   881 KiB    main  [emitted]  [big]  main
bundle.js.map  1020 KiB    main  [emitted]         main
Entrypoint main [big] = bundle.js bundle.js.map
[./app.js] 391 bytes {main} [built]
[./node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 472 bytes {main} [built]
    + 11 hidden modules
```

You should see a "Hello world" application in your web browser, which might not be much but it is a good start:

{@img assets/img/using-react-in-a-widget-1.png Screenshot of the "Hello world" application in web browser.}

## Application structure

Nothing warms the heart of a developer like a good "Hello world!". But you probably agree that what you created is not the most useful application and it is time to change that. In the next sections, you will create some React components and CKEditor 5 classes to bring some real logic to the application.

To keep some order in the project, you will put [CKEditor classes](#ckeditor-classes) in the `/ckeditor` directory and [React components](#react-components) in the `/react` directory. [Images and CSS styles](#styles-and-assets) will land in the `/assets` directory. By the time you are finished with this tutorial, the structure of the project should look as follows:

```bash
├── app.js
├── assets
│   ├── product1.jpg
│   ├── product2.jpg
│   ├── product3.jpg
│   ├── product4.jpg
│   └── styles.css
├── ckeditor
│   ├── insertproductpreviewcommand.js
│   └── productpreviewediting.js
├── dist
│   ├── bundle.js
│   └── bundle.js.map
├── index.html
├── package.json
├── react
│   ├── productlist.js
│   └── productpreview.js
├── node_modules
└── webpack.config.js
```

## CKEditor classes

Create the CKEditor–side logic that supports product preview widgets in the editor content:

* The [`ProductPreviewEditing`](#editing-plugin) plugin will extend the editor data layers to support the new kind of content.
* The [`InsertProductPreviewCommand`](#command) provides an easy way for the "outside world" to insert product previews into the editor content.

<info-box>
	This guide assumes you are familiar with the {@link framework/guides/tutorials/implementing-a-block-widget Implementing a block widget} guide which explains the basic concepts behind data structures and widgets. If in doubt, please refer to that guide for more information.
</info-box>

### Editing plugin

The `ProductPreviewEditing` plugin defines the `productPreview` element in the editor {@link framework/guides/architecture/editing-engine#model model} and specifies the way it is converted to the editing and data {@link framework/guides/architecture/editing-engine#view views}.

<info-box>
	Read more about the {@link framework/guides/architecture/editing-engine#overview editing engine architecture} of CKEditor 5.
</info-box>

* In the **data view**, the `productPreview` is represented as an empty `<section class="product" data-id="..."></section>` element with a `data-id` attribute associating it with a particular product. A semantic representation of the product saved in the database can be then consumed in the front–end by retrieving a fresh preview using the `data-id`. Since it does not carry any formatting or styling, the data representation will never get outdated, even if the layout or styles of the application change in the future.
* In the **editing view**, on the other hand, the product preview is a {@link framework/guides/tutorials/implementing-a-block-widget block widget}, which acts as a self–contained piece of content the user can insert, copy, and paste as a whole but they cannot change its internal structure. Inside the widget, there is a {@link module:engine/view/uielement~UIElement `UIElement`} with a `.product__react-wrapper` class that hosts a React `<ProductPreview>` component. Each time the model element is upcasted, the rendering function specified in the {@link builds/guides/integration/configuration editor configuration} (`editor.config.products.productRenderer`) mounts a React component inside the `UIElement`.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

The differences in data representations of the product preview are summarized in the following table:

<table>
	<tr>
		<th>Data structure</th>
		<th>Representation</th>
	</tr>
	<tr>
		<td>Model</td>
		<td>
			<pre><code>&lt;productPreview id="..." /></code></pre>
		</td>
	</tr>
	<tr>
		<td>Editing view</td>
		<td>
			<pre><code>&lt;section class="product" data-id="...">
	&lt;div class="product__react-wrapper">
		&lt;ProductPreview /> // React component
	&lt;/div>
&lt;/section></code></pre>
		</td>
	</tr>
	<tr>
		<td>Data view (editor output)</td>
		<td>
			<pre><code>&lt;section class="product" data-id="...">&lt;/section></code></pre>
		</td>
	</tr>
</table>

Here is the full source code of the `ProductPreviewEditing` editor plugin:

```js
// ckeditor/productpreviewediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertProductPreviewCommand from './insertproductpreviewcommand';

export default class ProductPreviewEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertProduct', new InsertProductPreviewCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'productPreview', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block',

			// Each product preview has an ID. A unique ID tells the application which
			// product it represents and makes it possible to render it inside a widget.
			allowAttributes: [ 'id' ]
		} );
	}

	_defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;
		const renderProduct = editor.config.get( 'products' ).productRenderer;

		// <productPreview> converters ((data) view → model)
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'section',
				classes: 'product'
			},
			model: ( viewElement, modelWriter ) => {
				// Read the "data-id" attribute from the view and set it as the "id" in the model.
				return modelWriter.createElement( 'productPreview', {
					id: parseInt( viewElement.getAttribute( 'data-id' ) )
				} );
			}
		} );

		// <productPreview> converters (model → data view)
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'productPreview',
			view: ( modelElement, viewWriter ) => {
				// In the data view, the model <productPreview> corresponds to:
				//
				// <section class="product" data-id="..."></section>
				return viewWriter.createEmptyElement( 'section', {
					class: 'product',
					'data-id': modelElement.getAttribute( 'id' )
				} );
			}
		} );

		// <productPreview> converters (model → editing view)
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'productPreview',
			view: ( modelElement, viewWriter ) => {
				// In the editing view, the model <productPreview> corresponds to:
				//
				// <section class="product" data-id="...">
				//     <div class="product__react-wrapper">
				//         <ProductPreview /> (React component)
				//     </div>
				// </section>
				const id = modelElement.getAttribute( 'id' );

				// The outermost <section class="product" data-id="..."></section> element.
				const section = viewWriter.createContainerElement( 'section', {
					class: 'product',
					'data-id': id
				} );

				// The inner <div class="product__react-wrapper"></div> element.
				// This element will host a React <ProductPreview /> component.
				const reactWrapper = viewWriter.createUIElement( 'div', {
					class: 'product__react-wrapper'
				}, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					// This the place where React renders the actual product preview hosted
					// by a UIElement in the view. You are using a function (renderer) passed as
					// editor.config.products#productRenderer.
					renderProduct( id, domElement );

					return domElement;
				} );

				viewWriter.insert( viewWriter.createPositionAt( section, 0 ), reactWrapper );

				return toWidget( section, viewWriter, { label: 'product preview widget' } );
			}
		} );
	}
}
```

### Command

The `InsertProductPreviewCommand` inserts the `productPreview` element into the model at the current selection position. It is executed by the `<ProductPreview>` React component in the application sidebar to insert a widget into the editor content.

Learn more about widget commands in the {@link framework/guides/tutorials/implementing-a-block-widget#creating-a-command Implementing a block widget} guide. You can see this command in action in the section about the [main application component](#main-application-component).

```js
// ckeditor/insertproductpreviewcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertProductPreviewCommand extends Command {
	execute( id ) {
		this.editor.model.change( writer => {
			// Insert <productPreview id="...">*</productPreview> at the current selection position
			// in a way which will result in creating a valid model structure.
			this.editor.model.insertContent( writer.createElement( 'productPreview', { id } ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'productPreview' );

		this.isEnabled = allowedIn !== null;
	}
}
```

## React components

It is time to define the React side of the application that renders the actual layout:

* The [`<ProductList>`](#product-list) component displays a bunch of `<ProductPreview>` children and allows the user to click them to insert them into the editor.
* The [`<ProductPreview>`](#product-preview) component represents a single product with its name, price tag and a background image.
* The [`<App>`](#main-application-component) component glues all the things together.

### Product list

The `<ProductList>` React component renders instances of `<ProductPreview>`. When clicked, the preview executes a callback passed in ["props"](https://reactjs.org/docs/components-and-props.html) that inserts its own copy into the editor content by executing the [`'insertProduct'`](#command) editor command. The list is displayed in the sidebar of the [application](#main-application-component).

```jsx
// react/productlist.js

import React from 'react';
import ProductPreview from './productpreview';

export default class ProductList extends React.Component {
	render() {
		return <div className="app__product-list">
			<h3>Products</h3>
			<ul>
				{this.props.products.map( product => {
					return <li key={product.id}>
						<ProductPreview
							id={product.id}
							onClick={this.props.onClick}
							{...product}
						/>
					</li>;
				})}
			</ul>
			<p><b>Tip</b>: Clicking the product will add it to the editor.</p>
		</div>;
	}
}
```

### Product preview

The actual preview of the product, with its name, price and an image. Instances of the `<ProductPreview>` component populate both the [`<ProductList>`](#product-list) and the [editor widgets](#editing-plugin) in the content.

Clicking a preview in the sidebar executes the [`'insertProduct'`](#command) editor command and inserts the same preview into the editor content.

```jsx
// react/productpreview.js

import React from 'react';

export default class ProductPreview extends React.Component {
	render() {
		const style = {
			'--product-image': `url(${ this.props.image })`
		};

		return <div
			className="product-preview"
			style={style}>
				<button
					className="product-preview__add"
					onClick={() => this.props.onClick( this.props.id )}
					title="Add to the offer"
				>
					<span>+</span>
				</button>
				<span className="product-preview__name">{this.props.name}</span>
				<span className="product-preview__price">from {this.props.price}</span>
			</div>
	}
}
```

### Main application component

So far, you have CKEditor classes that bring the product preview into the content, a list of products, and a product component ready. It is time to glue things together in the `App` class.

You are going to extend the [main application file](#lets-start) skeleton that you created earlier in this tutorial so it renders the {@link builds/guides/frameworks/react official `<CKEditor>` React component} on the left side, and the list of available products on the right.

Have a look at the full source code of the `App` class:

```jsx
// app.js

// Imports necessary to run a React application.
import React from 'react';
import ReactDOM from 'react-dom';

// The official <CKEditor> component for React.
import CKEditor from '@ckeditor/ckeditor5-react';

// The official CKEditor 5 instance inspector. It helps understand the editor view and model.
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

// The base editor class and features required to run the editor.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

// CKEditor plugin implementing a product widget to be used in the editor content.
import ProductPreviewEditing from './ckeditor/productpreviewediting';

// React components to render the list of products and the product preview.
import ProductList from './react/productlist';
import ProductPreview from './react/productpreview';

// The React application class. It renders the editor and the product list.
class App extends React.Component {
	constructor( props ) {
		super( props );

		// A place to store the reference to the editor instance created by the <CKEditor> component.
		// The editor instance is created asynchronously and is only available when the editor is ready.
		this.editor = null;

		this.state = {
			// The initial editor data. It is bound to the editor instance and will change as
			// the user types and modifies the content of the editor.
			editorData: '<h2>Check our last minute deals!</h2><p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun.</p><section class="product" data-id="2"></section><p>You’ll definitely love exploring <a href="https://en.wikipedia.org/wiki/Warsaw">Warsaw</a>! Best time to visit the city is July and August, when it’s cool enough to not break a sweat and hot enough to enjoy summer. The city which has quite a combination of both old and modern textures is located by the river Vistula.</p><section class="product" data-id="1"></section><h3>Other destinations</h3><figure class="table"><table><thead><tr><th>Destination</th><th>Trip details</th></tr></thead><tbody><tr><td><section class="product" data-id="3"></section><p>&nbsp;</p></td><td>Getting used to an entirely different culture can be challenging. While it’s also nice to learn about cultures online or from books, nothing comes close to experiencing cultural diversity in person. You learn to appreciate each and every single one of the differences while you become more culturally fluid. <a href="http://ckeditor.com">Find out more...</a></td></tr><tr><td><section class="product" data-id="4"></section><p>&nbsp;</p></td><td>Tourists frequently admit that Taj Mahal "simply cannot be described with words". And that’s probably true. The more you try the more speechless you become. Words give only a semblance of truth. <a href="http://ckeditor.com">Find out more...</a></td></tr></tbody></table></figure>'
		};

		// The configuration of the <CKEditor> instance.
		this.editorConfig = {
			plugins: [
				// A set of editor features to be enabled and made available to the user.
				Essentials, Heading, Bold, Italic, Underline,
				Link, Paragraph, Table, TableToolbar,

				// Your custom plugin implementing the widget is loaded here.
				ProductPreviewEditing
			],
			toolbar: [
				'heading',
				'|',
				'bold', 'italic', 'underline',
				'|',
				'link', 'insertTable',
				'|',
				'undo', 'redo'
			],
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			// The configuration of the Products plugin. It specifies a function that will allow
			// the editor to render a React <ProductPreview> component inside a product widget.
			products: {
				productRenderer: ( id, domElement ) => {
					const product = this.props.products.find( product => product.id === id );

					ReactDOM.render(
						<ProductPreview id={id} {...product} />,
						domElement
					);
				}
			}
		};

		this.handleEditorDataChange = this.handleEditorDataChange.bind( this );
		this.handleEditorInit = this.handleEditorInit.bind( this );
	}

	// A handler executed when the user types or modifies the editor content.
	// It updates the state of the application.
	handleEditorDataChange( evt, editor ) {
		this.setState( {
			editorData: editor.getData()
		} );
	}

	// A handler executed when the editor has been initialized and is ready.
	// It synchronizes the initial data state and saves the reference to the editor instance.
	handleEditorInit( editor ) {
		this.editor = editor;

		this.setState( {
			editorData: editor.getData()
		} );

		// CKEditor 5 inspector allows you to take a peek into the editor's model and view
		// data layers. Use it to debug the application and learn more about the editor.
		CKEditorInspector.attach( editor );
	}

	render() {
		return [
			// The application renders two columns:
			// * in the left one, the <CKEditor> and the textarea displaying live
			//   editor data are rendered.
			// * in the right column, a <ProductList> is rendered with available <ProductPreviews>
			//   to choose from.
			<div className="app__offer-editor" key="offer-editor">
				<h3>Product offer editor</h3>
				<CKEditor
					editor={ClassicEditor}
					data={this.state.editorData}
					config={this.editorConfig}
					onChange={this.handleEditorDataChange}
					onInit={this.handleEditorInit}
				/>

				<h3>Editor data</h3>
				<textarea value={this.state.editorData} readOnly={true}></textarea>
			</div>,
			<ProductList
				key="product-list"
				products={this.props.products}
				onClick={( id ) => {
					this.editor.execute( 'insertProduct', id );
					this.editor.editing.view.focus();
				}}
			/>
		];
	}
}
```

The JavaScript code is ready, but to run the application you need to specify a couple of product definitions. Do that when mounting the `<App>` component:

```js
// app.js

class App extends React.Component {
	// ...
}

// Render the <App> in the <div class="app"></div> element found in the DOM.
ReactDOM.render(
	<App
		// Feeding the application with predefined products.
		// In a real-life application, this sort of data would be loaded
		// from a database. To keep this tutorial simple, a few
		//  hard–coded product definitions will be used.
		products={[
			{
				id: 1,
				name: 'Colors of summer in Poland',
				price: '$1500',
				image: 'product1.jpg'
			},
			{
				id: 2,
				name: 'Mediterranean sun on Malta',
				price: '$1899',
				image: 'product2.jpg'
			},
			{
				id: 3,
				name: 'Tastes of Asia',
				price: '$2599',
				image: 'product3.jpg'
			},
			{
				id: 4,
				name: 'Exotic India',
				price: '$2200',
				image: 'product4.jpg'
			}
		]}
	/>,
	document.querySelector( '.app' )
);
```

Please note that each product comes with its own image (e.g. `product1.jpg`), which should be stored in the `assets/` directory to load correctly with the CSS `background-image`. Learn more about styles in the [next section](#styles-and-assets).

## Styles and assets

The application needs some styling to look good. You are going to put them in the `assets/styles.css` file imported in your main HTML file (`index.html`):

```css
/* assets/styles.css */

/* --- General application styles --------------------------------------------------- */

.app {
	display: flex;
	flex-direction: row;
	justify-content: center;
	font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
	margin: 0 auto;
}

.app h2 {
	font-size: 1.3em;
}

.app textarea {
	width: 100%;
	height: 150px;
	font-family: 'Courier New', Courier, monospace;
	box-sizing: border-box;
	font-size: 14px;
}

/* --- Product offer editor styles ----------------------------------------------------- */

.app .app__offer-editor {
	flex: 1 1 auto;
	max-width: 800px;
}

/* --- Generic product preview styles --------------------------------------------------- */

.app .product-preview {
	background-repeat: no-repeat;
	background-position: center;
	background-image: var(--product-image);
	background-size: cover;
	height: 150px;
	position: relative;
	overflow: hidden;
	box-shadow: 1px 1px 3px hsla(0, 0%, 0%, .3);
	min-width: 160px;
}

.app .product-preview .product-preview__name {
	padding: 10px;
	background: hsl(0, 0%, 100%);
	font-weight: bold;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
}

.app .product-preview .product-preview__price {
	position: absolute;
	top: 0;
	right: 0;
	display: block;
	background: hsl(346, 100%, 56%);
	padding: 6px 10px;
	min-width: 50px;
	text-align: center;
	color: hsl(0, 0%, 100%);
	text-transform: uppercase;
	font-size: .8em;
}

.app .product-preview .product-preview__add {
	display: none;
}

/* --- Product list styles --------------------------------------------------- */

.app .app__product-list {
	margin-left: 20px;
	padding: 20px;
	min-width: 400px;
	border-left: 1px solid hsl(0, 0%, 87%);
}

.app .app__product-list h2 {
	margin-top: 10px;
}

.app .app__product-list ul {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 10px;
	margin-top: 10px;
	list-style-type: none;
	margin: 0;
	padding: 0;
}

.app .app__product-list .product-preview {
	opacity: .7;
}

.app .app__product-list .product-preview:hover {
	opacity: 1;
}

.app .app__product-list .product-preview:hover .product-preview__add {
	display: block;
}

.app .app__product-list .product-preview .product-preview__add {
	display: none;
	position: absolute;
	width: 40px;
	height: 40px;
	top: 45%;
	left: 50%;

	border: 0;
	padding: 0;
	cursor: pointer;
	font-weight: bold;
	text-align: center;
	border-radius: 100px;
	background: hsl(0, 0%, 100%);
	transform: translate(-50%, -50%);
	box-shadow: 2px 2px 2px hsla(0, 0%, 0%, .3);
}

.app .app__product-list .product-preview .product-preview__add span {
	font-size: 25px;
	vertical-align: middle;
	color: hsl(0, 0%, 24%);
	line-height: 40px;
	display: inline-block;
}

.app .app__product-list .product-preview .product-preview__name {
	font-size: 10px;
}

.app .app__product-list .product-preview .product-preview__price {
	font-size: 10px;
}

/* --- In-editor product widget styles --------------------------------------------------- */

.app .ck-content .product {
	margin: 1em;
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	0% {
		opacity: 0;
		transform: translateY(1em);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}
```

The product preview (`.product-preview` class) uses `background-image: var(--product-image)` to set its background. It means that all images must be stored in the `assets/` directory next to the `styles.css` file in order to load properly.

## Demo

You can see the entire application working below. Click the products in the sidebar to add them to the editor. You can also check out the [full source code](#full-source-code) of this tutorial if you want to extend it further or use it as base for your application.

{@snippet framework/tutorials/using-react-in-widget}

## Full source code

The following code snippets present the complete implementation of the application (and all its dependencies). Follow the [application structure](#application-structure) diagram to re–create the application.

### `app.js`

```jsx
// app.js

// Imports necessary to run a React application.
import React from 'react';
import ReactDOM from 'react-dom';

// The official <CKEditor> component for React.
import CKEditor from '@ckeditor/ckeditor5-react';

// The official CKEditor 5 instance inspector. It helps understand the editor view and model.
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

// The base editor class and features required to run the editor.
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Link from '@ckeditor/ckeditor5-link/src/link';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

// CKEditor plugin implementing a product widget to be used in the editor content.
import ProductPreviewEditing from './ckeditor/productpreviewediting';

// React components to render the list of products and the product preview.
import ProductList from './react/productlist';
import ProductPreview from './react/productpreview';

// The React application class. It renders the editor and the product list.
class App extends React.Component {
	constructor( props ) {
		super( props );

		// A place to store the reference to the editor instance created by the <CKEditor> component.
		// The editor instance is created asynchronously and is only available when the editor is ready.
		this.editor = null;

		this.state = {
			// The initial editor data. It is bound to the editor instance and will change as
			// the user types and modifies the content of the editor.
			editorData: `
				<h2>Check our last minute deals!</h2>

				<p>Aenean erat conubia pretium libero habitant turpis vivamus dignissim molestie, phasellus libero! Curae; consequat cubilia mattis. Litora non iaculis tincidunt.</p>
				<section class="product" data-id="2">&nbsp;</section>
				<p>Mollis gravida parturient ad maecenas euismod consectetur lacus rutrum urna eget ligula. Nisi imperdiet scelerisque natoque scelerisque cubilia nulla gravida. Eleifend malesuada pharetra est commodo venenatis aenean habitasse curae; fusce elit.</p>
				<section class="product" data-id="1">&nbsp;</section>

				<h3>Other deals</h3>
				<p>Ultricies dapibus placerat orci natoque fames commodo facilisi sollicitudin. Sed hendrerit mi dis non lacinia ipsum. Luctus fames scelerisque auctor pellentesque mi nunc mattis, amet sapien.</p>

				<figure class="table">
					<table>
						<thead>
							<tr>
								<th>Our deal</th>
								<th>Why this one?</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<section class="product" data-id="3">&nbsp;</section>
								</td>
								<td>Nascetur, nullam hac nibh curabitur elementum. Est ridiculus turpis adipiscing erat maecenas habitant montes. Curabitur mauris ut luctus semper. Neque orci auctor luctus accumsan quam cursus purus condimentum dis?</td>
							</tr>
							<tr>
								<td>
									<section class="product" data-id="4">&nbsp;</section>
								</td>
								<td>Elementum condimentum convallis porttitor cubilia consectetur cum. In pretium neque accumsan pharetra. Magna in quisque dignissim praesent facilisi diam. Ad habitant ultricies at faucibus. Ultricies auctor sodales massa nisi eget sem porta?</td>
							</tr>
						</tbody>
					</table>
				</figure>
			`,
		};

		// The configuration of the <CKEditor> instance.
		this.editorConfig = {
			plugins: [
				// A set of editor features to be enabled and made available to the user.
				Essentials, Heading, Bold, Italic, Underline,
				Link, Paragraph, Table, TableToolbar,

				// Your custom plugin implementing the widget is loaded here.
				ProductPreviewEditing
			],
			toolbar: [
				'heading',
				'|',
				'bold', 'italic', 'underline',
				'|',
				'link', 'insertTable',
				'|',
				'undo', 'redo'
			],
			table: {
				contentToolbar: [
					'tableColumn',
					'tableRow',
					'mergeTableCells'
				]
			},
			// The configuration of the Products plugin. It specifies a function that will allow
			// the editor to render a React <ProductPreview> component inside a product widget.
			products: {
				productRenderer: ( id, domElement ) => {
					const product = this.props.products.find( product => product.id === id );

					ReactDOM.render(
						<ProductPreview id={id} {...product} />,
						domElement
					);
				}
			}
		};

		this.handleEditorDataChange = this.handleEditorDataChange.bind( this );
		this.handleEditorInit = this.handleEditorInit.bind( this );
	}

	// A handler executed when the user types or modifies the editor content.
	// It updates the state of the application.
	handleEditorDataChange( evt, editor ) {
		this.setState( {
			editorData: editor.getData()
		} );
	}

	// A handler executed when the editor has been initialized and is ready.
	// It synchronizes the initial data state and saves the reference to the editor instance.
	handleEditorInit( editor ) {
		this.editor = editor;

		this.setState( {
			editorData: editor.getData()
		} );

		// CKEditor 5 inspector allows you to take a peek into the editor's model and view
		// data layers. Use it to debug the application and learn more about the editor.
		CKEditorInspector.attach( editor );
	}

	render() {
		return [
			// The application renders two columns:
			// * in the left one, the <CKEditor> and the textarea displaying live
			//   editor data are rendered.
			// * in the right column, a <ProductList> is rendered with available <ProductPreviews>
			//   to choose from.
			<div className="app__offer-editor" key="offer-editor">
				<h3>Product offer editor</h3>
				<CKEditor
					editor={ClassicEditor}
					data={this.state.editorData}
					config={this.editorConfig}
					onChange={this.handleEditorDataChange}
					onInit={this.handleEditorInit}
				/>

				<h3>Editor data</h3>
				<textarea value={this.state.editorData} readOnly={true}></textarea>
			</div>,
			<ProductList
				key="product-list"
				products={this.props.products}
				onClick={( id ) => {
					this.editor.execute( 'insertProduct', id );
					this.editor.editing.view.focus();
				}}
			/>
		];
	}
}

// Render the <App> in the <div class="app"></div> element found in the DOM.
ReactDOM.render(
	<App
		// Feeding the application with predefined products.
		// In a real-life application, this sort of data would be loaded
		// from a database. To keep this tutorial simple, a few
		//  hard–coded product definitions will be used.
		products={[
			{
				id: 1,
				name: 'Colors of summer in Poland',
				price: '$1500',
				image: 'product1.jpg'
			},
			{
				id: 2,
				name: 'Mediterranean sun on Malta',
				price: '$1899',
				image: 'product2.jpg'
			},
			{
				id: 3,
				name: 'Tastes of Asia',
				price: '$2599',
				image: 'product3.jpg'
			},
			{
				id: 4,
				name: 'Exotic India',
				price: '$2200',
				image: 'product4.jpg'
			}
		]}
	/>,
	document.querySelector( '.app' )
);
```

### `productpreviewediting.js`

```js
// ckeditor/productpreviewediting.js

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertProductPreviewCommand from './insertproductpreviewcommand';

export default class ProductPreviewEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertProduct', new InsertProductPreviewCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'productPreview', {
			// Behaves like a self-contained object (e.g. an image).
			isObject: true,

			// Allow in places where other blocks are allowed (e.g. directly in the root).
			allowWhere: '$block',

			// Each product preview has an ID. A unique ID tells the application which
			// product it represents and makes it possible to render it inside a widget.
			allowAttributes: [ 'id' ]
		} );
	}

	_defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;
		const renderProduct = editor.config.get( 'products' ).productRenderer;

		// <productPreview> converters ((data) view → model)
		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'section',
				classes: 'product'
			},
			model: ( viewElement, modelWriter ) => {
				// Read the "data-id" attribute from the view and set it as the "id" in the model.
				return modelWriter.createElement( 'productPreview', {
					id: parseInt( viewElement.getAttribute( 'data-id' ) )
				} );
			}
		} );

		// <productPreview> converters (model → data view)
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'productPreview',
			view: ( modelElement, viewWriter ) => {
				// In the data view, the model <productPreview> corresponds to:
				//
				// <section class="product" data-id="..."></section>
				return viewWriter.createEmptyElement( 'section', {
					class: 'product',
					'data-id': modelElement.getAttribute( 'id' )
				} );
			}
		} );

		// <productPreview> converters (model → editing view)
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'productPreview',
			view: ( modelElement, viewWriter ) => {
				// In the editing view, the model <productPreview> corresponds to:
				//
				// <section class="product" data-id="...">
				//     <div class="product__react-wrapper">
				//         <ProductPreview /> (React component)
				//     </div>
				// </section>
				const id = modelElement.getAttribute( 'id' );

				// The outermost <section class="product" data-id="..."></section> element.
				const section = viewWriter.createContainerElement( 'section', {
					class: 'product',
					'data-id': id
				} );

				// The inner <div class="product__react-wrapper"></div> element.
				// This element will host a React <ProductPreview /> component.
				const reactWrapper = viewWriter.createUIElement( 'div', {
					class: 'product__react-wrapper'
				}, function( domDocument ) {
					const domElement = this.toDomElement( domDocument );

					// This the place where React renders the actual product preview hosted
					// by a UIElement in the view. You are using a function (renderer) passed as
					// editor.config.products#productRenderer.
					renderProduct( id, domElement );

					return domElement;
				} );

				viewWriter.insert( viewWriter.createPositionAt( section, 0 ), reactWrapper );

				return toWidget( section, viewWriter, { label: 'product preview widget' } );
			}
		} );
	}
}
```

### `insertproductpreviewcommand.js`

```js
// ckeditor/insertproductpreviewcommand.js

import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertProductPreviewCommand extends Command {
	execute( id ) {
		this.editor.model.change( writer => {
			// Insert <productPreview id="...">*</productPreview> at the current selection position
			// in a way which will result in creating a valid model structure.
			this.editor.model.insertContent( writer.createElement( 'productPreview', { id } ) );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'productPreview' );

		this.isEnabled = allowedIn !== null;
	}
}
```

### `productlist.js`

```jsx
// react/productlist.js

import React from 'react';
import ProductPreview from './productpreview';

export default class ProductList extends React.Component {
	render() {
		return <div className="app__product-list">
			<h3>Products</h3>
			<ul>
				{this.props.products.map( product => {
					return <li key={product.id}>
						<ProductPreview
							id={product.id}
							onClick={this.props.onClick}
							{...product}
						/>
					</li>;
				})}
			</ul>
			<p><b>Tip</b>: Clicking the product will add it to the editor.</p>
		</div>;
	}
}
```

### `productpreview.js`

```jsx
// react/productpreview.js

import React from 'react';

export default class ProductPreview extends React.Component {
	render() {
		const style = {
			'--product-image': `url(${ this.props.image })`
		};

		return <div
			className="product-preview"
			style={style}>
				<button
					className="product-preview__add"
					onClick={() => this.props.onClick( this.props.id )}
					title="Add to the offer"
				>
					<span>+</span>
				</button>
				<span className="product-preview__name">{this.props.name}</span>
				<span className="product-preview__price">from {this.props.price}</span>
			</div>
	}
}
````

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Using React components in CKEditor 5 widgets</title>
		<link rel="stylesheet" href="assets/styles.css">
	</head>
	<body>
		<div class="app"></div>
		<script src="dist/bundle.js"></script>
	</body>
</html>
```
