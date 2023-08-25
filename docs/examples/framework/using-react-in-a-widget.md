---
category: examples-framework
order: 130
toc: false
meta-title: React components in an editor example | CKEditor 5 Documentation
classes: main__content--no-toc
modified_at: 2022-12-16
---

# React components in an editor

The editor below presents integration between React library and a block widget from the CKEditor ecosystem. In the example, the React component renders a list of products you can add to the editor content.

{@snippet framework/tutorials/using-react-in-widget}

## Detailed guide

If you would like to create such a widget on your own, take a look at the {@link tutorials/widgets/using-react-in-a-widget dedicated tutorial} which shows how to achieve this step by step with the source code provided.

## Editor example configuration

<details>
<summary>View editor configuration script</summary>

```js
import Babel from 'babel-standalone';

// Imports necessary to run a React application.
import React from 'react';
import { createRoot } from 'react-dom/client';

// The official <CKEditor> component for React.
import { CKEditor } from '@ckeditor/ckeditor5-react';

// The base editor class and features required to run the editor.
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Command, Plugin } from '@ckeditor/ckeditor5-core';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { Widget, toWidget } from '@ckeditor/ckeditor5-widget';

// ckeditor/productpreviewediting.js

class ProductPreviewEditing extends Plugin {
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
					// by a UIElement in the view. you are using a function (renderer) passed as
					// editor.config.products#productRenderer.
					renderProduct( id, domElement );
				} );

				viewWriter.insert( viewWriter.createPositionAt( section, 0 ), reactWrapper );

				return toWidget( section, viewWriter, { label: 'product preview widget' } );
			}
		} );
	}
}

// ckeditor/insertproductpreviewcommand.js

class InsertProductPreviewCommand extends Command {
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

Object.assign( window, {
	Babel,
	React,
	createRoot,
	CKEditor,
	ClassicEditor,
	Essentials,
	Heading,
	Bold,
	Italic,
	Underline,
	Link,
	Table,
	TableToolbar,
	Paragraph,
	ProductPreviewEditing,
	InsertProductPreviewCommand
} );
```

</details>

<details>
<summary>View editor content listing</summary>

```html
<style>
/* assets/styles.css */

/* --- General application styles --------------------------------------------------- */

.app {
	display: flex;
	flex-direction: row;
	justify-content: center;
}

.app textarea {
	width: 100%;
	height: 300px;
	font-family: 'Courier New', Courier, monospace;
	box-sizing: border-box;
	font-size: 14px;
}

/* --- Product offer editor styles ----------------------------------------------------- */

.app .app__offer-editor {
	flex: 1 1 auto;
}

/* --- Generic product preview styles --------------------------------------------------- */

.app .product-preview {
	background-repeat: no-repeat;
	background-position: center;
	background-image: var(--product-image);
	background-size: cover;
	height: 120px;
	position: relative;
	overflow: hidden;
	box-shadow: 1px 1px 3px hsla(0, 0%, 0%, .3);
	min-width: 120px;
}

.app .product-preview .product-preview__name {
	padding: 10px;
	background: hsl(0, 0%, 100%);
	font-weight: bold;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	line-height: 1.5em;
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
	line-height: 1.5em;
}

.app .product-preview .product-preview__add {
	display: none;
}

/* --- Product list styles --------------------------------------------------- */

.app .app__product-list {
	margin-left: 20px;
	padding: 0 20px;
	border-left: 1px solid hsl(0, 0%, 87%);
}

.app .app__product-list ul {
	display: grid;
	grid-template-columns: 1fr;
	grid-gap: 10px;
	list-style-type: none;
	margin: 1.5em 0;
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
</style>

<div id="snippet-react-in-widget">
	<div class="app"></div>
</div>

<script type="text/babel">
// react/productpreview.js

class ProductPreview extends React.Component {
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

// react/productlist.js

class ProductList extends React.Component {
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
                    </li>
                })}
            </ul>
            <p><b>Tip</b>: Clicking the product will add it to the editor.</p>
        </div>
    }
}

// app.js

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
                    const root = createRoot( domElement );

                    root.render(
                        <ProductPreview id={id} {...product} />
                    );
                }
            }
        };

        this.handleEditorDataChange = this.handleEditorDataChange.bind( this );
        this.handleEditorReady = this.handleEditorReady.bind( this );
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
    handleEditorReady( editor ) {
        this.editor = editor;

        this.setState( {
            editorData: editor.getData()
        } );
    }

    onClick( id ) {
        this.editor.execute( 'insertProduct', id );
        this.editor.editing.view.focus();
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
                    onReady={this.handleEditorReady}
                />

                <h3>Editor data</h3>
                <textarea value={this.state.editorData} readOnly={true}></textarea>
            </div>,
            <ProductList
                key="product-list"
                products={this.props.products}
                onClick={( id ) => this.onClick( id )}
            />
        ];
    }
}

// Render the <App> in the <div class="app"></div> element found in the DOM.

const root = createRoot( document.querySelector( '.app' ) );
root.render(<App
    // Feeding the application with predefined products.
    // In a real-life application, this sort of data would be loaded
    // from a database. To keep this tutorial simple, a few
    //  hard–coded product definitions will be used.
    products={ [
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
    ] }
/>);
</script>
```

</details>
