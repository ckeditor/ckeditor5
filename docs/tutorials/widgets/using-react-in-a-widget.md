---
menu-title: Using a React component in a widget
category: widget-tutorials
order: 25
meta-title: Using a React component in a block widget tutorial | CKEditor 5 Documentation
---

# Using a React component in a block widget

In this tutorial, you will learn how to implement an editor plugin that uses the power of the [React](https://reactjs.org/) library inside the CKEditor&nbsp;5 widget ecosystem. You will build a "Product preview" feature which renders an actual React component inside the editor to display some useful information about the product.

Later on, you will use the "Product preview" feature to build a simple React application that displays an editor next to the list of available products. The application will allow the user to insert the product into the editor content by clicking it on the list.

<info-box>
	If you want to see the final product of this tutorial before you plunge in, check out the [demo](#demo).
</info-box>

<!-- TODO: dynamic controls in React to change the appearance of the widget https://github.com/ckeditor/ckeditor5-widget/issues/81 -->

## Before you start

There are a couple of things you should know before you start:

* Since you are here, you probably have at least some basic understanding of what React is and how it works. But what you might not know is that CKEditor&nbsp;5 has an official {@link getting-started/integrations/react **rich text editor component for React**} and it will be one of the key features used in this tutorial. Learning how to use it in your project is a good place to start.
* In this tutorial, you are going to implement a block editor widget and that itself could give you a headache. It is recommended to at least skim through the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} tutorial to get a grip on editor widgets, their API, and possible use cases.
* Various parts of the {@link framework/architecture/intro CKEditor&nbsp;5 architecture} section will be referenced as you go. While reading them is not necessary to finish this tutorial, it is recommended to read those guides at some point to get a better understanding of the mechanisms used in this tutorial.

<info-box>
	If you want to use your own event handler for events triggered by your React component, you must wrap it with a container that has a `data-cke-ignore-events` attribute to exclude it from the editor's default handlers. Refer to {@link framework/deep-dive/widget-internals#exclude-dom-events-from-default-handlers Exclude DOM events from default handlers} for more details.
</info-box>

## Let's start

The easiest way to set up your project is to grab the starter files from the [GitHub repository for this tutorial](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/react-widget/starter-files). We gathered all the necessary dependencies there, including some CKEditor 5 packages and other files needed to start the editor.

The editor has already been created in the `main.js` file with some basic plugins. All you need to do is clone the repository, navigate to the starter-files directory, run the `npm install` command, and you can start coding right away.

```bash
git clone https://github.com/ckeditor/ckeditor5-tutorials-examples
cd ckeditor5-tutorials-examples/react-widget/starter-files

npm install
npm run dev
```

You should see a "Hello world" application in your web browser, which might not be much but it is a good start:

{@img assets/img/using-react-in-a-widget-1.png Screenshot of the "Hello world" application in web browser.}

## Application structure

Nothing warms the heart of a developer like a good "Hello world!" But you probably agree that what you created is not the most useful application and it is time to change that. In the next sections, you will create some React components and CKEditor&nbsp;5 classes to bring some real logic to the application.

To keep some order in the project, you will put [CKEditor classes](#ckeditor-classes) in the `/ckeditor` directory and [React components](#react-components) in the `/react` directory. [Images](#styles-and-assets) will land in the `/public` directory. By the time you are finished with this tutorial, the structure of the project should look as follows:

```plain
├── public
│	├── fields.jpg
│	├── malta.jpg
│	├── tajmahal.jpg
│	└── umbrellas.jpg
├── src
│	├── ckeditor
│	│   ├── insertproductpreviewcommand.js
│	│   └── productpreviewediting.js
│	├── react
│	│   ├── productlist.jsx
│	│   └── productpreview.jsx
│	├── app.jsx
│	├── main.jsx
│	└── styles.css
├── index.html
├── package.json
└── node_modules
```

## CKEditor classes

Create the CKEditor–side logic that supports product preview widgets in the editor content:

* The [`ProductPreviewEditing`](#editing-plugin) plugin will extend the editor data layers to support the new kind of content.
* The [`InsertProductPreviewCommand`](#command) provides an easy way for the "outside world" to insert product previews into the editor content.

<info-box>
	This guide assumes you are familiar with the {@link tutorials/widgets/implementing-a-block-widget Implementing a block widget} guide which explains the basic concepts behind data structures and widgets. If in doubt, refer to that guide for more information.
</info-box>

### Editing plugin

The `ProductPreviewEditing` plugin defines the `productPreview` element in the editor {@link framework/architecture/editing-engine#model model} and specifies the way it is converted to the editing and data {@link framework/architecture/editing-engine#view views}.

<info-box>
	Read more about the {@link framework/architecture/editing-engine#overview editing engine architecture} of CKEditor&nbsp;5.
</info-box>

* In the **data view**, the `productPreview` is represented as an empty `<section class="product" data-id="..."></section>` element with a `data-id` attribute associating it with a particular product. A semantic representation of the product saved in the database can be then consumed in the frontend by retrieving a fresh preview using the `data-id`. Since it does not carry any formatting or styling, the data representation will never get outdated, even if the layout or styles of the application change in the future.
* In the **editing view**, on the other hand, the product preview is a {@link tutorials/widgets/implementing-a-block-widget block widget}, which acts as a self–contained piece of content the user can insert, copy, and paste as a whole but they cannot change its internal structure. Inside the widget, there is a {@link module:engine/view/uielement~UIElement `UIElement`} with a `.product__react-wrapper` class that hosts a React `<ProductPreview>` component. Each time the model element is upcasted, the rendering function specified in the {@link getting-started/setup/configuration editor configuration} (`editor.config.products.productRenderer`) mounts a React component inside the `UIElement`.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
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

import { Plugin, Widget, toWidget } from 'ckeditor5';

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
			model: ( viewElement, { writer: modelWriter } ) => {
				// Read the "data-id" attribute from the view and set it as the "id" in the model.
				return modelWriter.createElement( 'productPreview', {
					id: parseInt( viewElement.getAttribute( 'data-id' ) )
				} );
			}
		} );

		// <productPreview> converters (model → data view)
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'productPreview',
			view: ( modelElement, { writer: viewWriter } ) => {
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
			view: ( modelElement, { writer: viewWriter } ) => {
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
				const reactWrapper = viewWriter.createRawElement( 'div', {
					class: 'product__react-wrapper'
				}, function( domElement ) {
					// This the place where React renders the actual product preview hosted
					// by a UIElement in the view. You are using a function (renderer) passed as
					// editor.config.products#productRenderer.
					renderProduct( id, domElement );
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

Learn more about widget commands in the {@link tutorials/widgets/implementing-a-block-widget#creating-a-command Implementing a block widget} guide. You can see this command in action in the section about the [main application component](#main-application-component).

```js
// ckeditor/insertproductpreviewcommand.js

import { Command } from 'ckeditor5';

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

import ProductPreview from './productpreview';

export default function ProductList( props ) {
	return (
		<div className='app__product-list'>
			<h3>Products</h3>
			<ul>
				{props.products.map( ( product ) => {
					return (
						<li key={ product.id }>
							<ProductPreview
								id={ product.id }
								onClick={ props.onClick }
								{ ...product }
							/>
						</li>
					);
				})}
			</ul>
			<p><b>Tip</b>: Clicking the product will add it to the editor.</p>
		</div>
	);
}
```

### Product preview

The actual preview of the product, with its name, price and an image. Instances of the `<ProductPreview>` component populate both the [`<ProductList>`](#product-list) and the [editor widgets](#editing-plugin) in the content.

Clicking a preview in the sidebar executes the [`'insertProduct'`](#command) editor command and inserts the same preview into the editor content.

```jsx
// react/productpreview.js

export default function ProductPreview( props ) {
	return (
		<div
			className='product-preview'
			style={ {
				'--product-image': `url(${ props.image })`
			} }
		>
			<button
				className='product-preview__add'
				onClick={ () => props.onClick( props.id ) }
				title='Add to the offer'
			>
				<span>+</span>
			</button>
			<span className='product-preview__name'>{ props.name }</span>
			<span className='product-preview__price'>from { props.price }</span>
		</div>
	);
}
```

### Main application component

At the moment, you have CKEditor classes that bring the product preview into the content, a list of products, and a product component ready. It is time to glue things together in the `App` component.

You are going to extend the [main application file](#lets-start) skeleton that you created earlier in this tutorial so it renders the {@link getting-started/integrations/react official `<CKEditor>` React component} on the left side, and the list of available products on the right.

Have a look at the full source code of the `App` function:

```jsx
// app.jsx

// Imports necessary to run a React application.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
// The official <CKEditor> component for React.
import { CKEditor } from '@ckeditor/ckeditor5-react';
// The base editor class and features required to run the editor.
import {
	ClassicEditor,
	Bold,
	Italic,
	Underline,
	Essentials,
	Heading,
	Link,
	Paragraph,
	Table,
	TableToolbar
} from 'ckeditor5';
// The official CKEditor 5 instance inspector. It helps understand the editor view and model.
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
// CKEditor plugin implementing a product widget to be used in the editor content.
import ProductPreviewEditing from './ckeditor/productpreviewediting';
// React components to render the list of products and the product preview.
import ProductList from './react/productlist';
import ProductPreview from './react/productpreview';
import 'ckeditor5/ckeditor5.css';
import './styles.css';

// The React application function component. It renders the editor and the product list.
export default function App( props ) {
	// A place to store the reference to the editor instance created by the <CKEditor> component.
	// The editor instance is created asynchronously and is only available when the editor is ready.
	const [ editorRef, setEditorRef ] = useState( null );
	// The initial editor data. It is bound to the editor instance and will change as
	// the user types and modifies the content of the editor.
	const [ editorData, setEditorData ] = useState( `<h2>Check our last minute deals!</h2>

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
	</figure>` );

	return (
		// The application renders two columns:
		// * in the left one, the <CKEditor> and the textarea displaying live
		//   editor data are rendered.
		// * in the right column, a <ProductList> is rendered with available <ProductPreviews>
		//   to choose from.
		<div ref={ setEditorRef } className='app'>
			{ editorRef && <>
				<div className='app__offer-editor' key='offer-editor'>
					<CKEditor
						editor={ ClassicEditor }
						// The configuration of the <CKEditor> instance.
						config={ {
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
									const product = props.products.find( product => product.id === id );
									const root = createRoot( domElement );
						
									root.render(
										<ProductPreview id={ id } { ...product } />
									);
								}
							}
						} }
						data={ editorData }
						onReady={ ( editor ) => {
							// A function executed when the editor has been initialized and is ready.
    						// It synchronizes the initial data state and saves the reference to the editor instance.
							setEditorRef( editor );
							// CKEditor&nbsp;5 inspector allows you to take a peek into the editor's model and view
        					// data layers. Use it to debug the application and learn more about the editor.
							CKEditorInspector.attach( editor );
						} }
						onChange={ ( evt, editor ) => {
							// A function executed when the user types or modifies the editor content.
							// It updates the state of the application.
							setEditorData( editor.getData() );
						} }
					/>
				</div>
				<ProductList
					key='product-list'
					products={ props.products }
					onClick={ ( id  ) => {
						editorRef.execute( 'insertProduct', id );
						editorRef.editing.view.focus();
					} }
				/>
			</> }
		</div>
	)
}
```

The JavaScript code is ready, but to run the application you need to specify a couple of product definitions. Do that when mounting the `<App>` component:

```js
// main.jsx

import ReactDOM from 'react-dom/client';
import App from './app';

// Render the <App> in the <div class="root"></div> element found in the DOM.
ReactDOM.createRoot( document.getElementById( 'root' ) ).render(
	<App 
		// Feeding the application with predefined products.
		// In a real-life application, this sort of data would be loaded
		// from a database. To keep this tutorial simple, a few
		// hard–coded product definitions will be used.
		products={ [
			{
				id: 1,
				name: 'Colors of summer in Poland',
				price: '$1500',
				image: 'fields.jpg'
			},
			{
				id: 2,
				name: 'Mediterranean sun on Malta',
				price: '$1899',
				image: 'malta.jpg'
			},
			{
				id: 3,
				name: 'Tastes of Asia',
				price: '$2599',
				image: 'umbrellas.jpg'
			},
			{
				id: 4,
				name: 'Exotic India',
				price: '$2200',
				image: 'tajmahal.jpg'
			}
		] }
	/>
)
```

Each product comes with its own image (like `malta.jpg`), which should be stored in the `public/` directory to load correctly with the CSS `background-image`. Learn more about styles in the [next section](#styles-and-assets).

## Styles and assets

The application needs some styling to look good. You are going to put them in the `src/styles.css` file imported in your `app.jsx` file:

```css
/* src/styles.css */

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

The product preview (`.product-preview` class) uses `background-image: var(--product-image)` to set its background. It means that all images must be stored in the `public/` directory to load properly.

## Demo

You can see the entire application working below. Click the products in the sidebar to add them to the editor. You can also check out the [full source code](#final-solution) of this tutorial if you want to extend it further or use it as base for your application.

{@snippet framework/tutorials/using-react-in-widget}

## Final solution

If you got lost at any point in the tutorial or want to go straight to the solution, there is a repository with the [final project](https://github.com/ckeditor/ckeditor5-tutorials-examples/tree/main/react-widget/final-project) available.

```bash
git clone https://github.com/ckeditor/ckeditor5-tutorials-examples
cd ckeditor5-tutorials-examples/react-widget/final-project

npm install
npm run dev
```
