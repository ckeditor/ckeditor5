/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/template
 */

import View from './view.js';
import ViewCollection from './viewcollection.js';

import {
	CKEditorError,
	EmitterMixin,
	isNode,
	toArray,
	type ArrayOrItem,
	type Emitter,
	type Observable,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import { isObject, cloneDeepWith } from 'es-toolkit/compat';

const xhtmlNs = 'http://www.w3.org/1999/xhtml';

/**
 * A basic Template class. It renders a DOM HTML element or text from a
 * {@link module:ui/template~TemplateDefinition definition} and supports element attributes, children,
 * bindings to {@link module:utils/observablemixin~Observable observables} and DOM event propagation.
 *
 * A simple template can look like this:
 *
 * ```ts
 * const bind = Template.bind( observable, emitter );
 *
 * new Template( {
 * 	tag: 'p',
 * 	attributes: {
 * 		class: 'foo',
 * 		style: {
 * 			backgroundColor: 'yellow'
 * 		}
 * 	},
 * 	on: {
 * 		click: bind.to( 'clicked' )
 * 	},
 * 	children: [
 * 		'A paragraph.'
 * 	]
 * } ).render();
 * ```
 *
 * and it will render the following HTML element:
 *
 * ```html
 * <p class="foo" style="background-color: yellow;">A paragraph.</p>
 * ```
 *
 * Additionally, the `observable` will always fire `clicked` upon clicking `<p>` in the DOM.
 *
 * See {@link module:ui/template~TemplateDefinition} to know more about templates and complex
 * template definitions.
 */
export default class Template extends /* #__PURE__ */ EmitterMixin() {
	public ns?: string;

	/**
	 * The tag (`tagName`) of this template, e.g. `div`. It also indicates that the template
	 * renders to an HTML element.
	 */
	public tag?: string;

	/**
	 * The text of the template. It also indicates that the template renders to a DOM text node.
	 */
	public text?: Array<TemplateSimpleValue | TemplateBinding>;

	/**
	 * The attributes of the template, e.g. `{ id: [ 'ck-id' ] }`, corresponding with
	 * the attributes of an HTML element.
	 *
	 * **Note**: This property only makes sense when {@link #tag} is defined.
	 */
	public attributes?: Record<string, AttributeValues>;

	/**
	 * The children of the template. They can be either:
	 * * independent instances of {@link ~Template} (sub–templates),
	 * * native DOM Nodes.
	 *
	 * **Note**: This property only makes sense when {@link #tag} is defined.
	 */
	public children?: Array<ViewCollection | View | Node | Template>;

	/**
	 * The DOM event listeners of the template.
	 */
	public eventListeners?: Record<string, Array<TemplateToBinding>>;

	/**
	 * Indicates whether this particular Template instance has been
	 * {@link #render rendered}.
	 */
	private _isRendered: boolean;

	/**
	 * The data used by the {@link #revert} method to restore a node to its original state.
	 *
	 * See: {@link #apply}.
	 */
	private _revertData: RevertData | null;

	/**
	 * Creates an instance of the {@link ~Template} class.
	 *
	 * @param def The definition of the template.
	 */
	constructor( def: TemplateDefinition ) {
		super();

		Object.assign( this, normalize( clone( def ) ) );

		this._isRendered = false;
		this._revertData = null;
	}

	/**
	 * Renders a DOM Node (an HTML element or text) out of the template.
	 *
	 * ```ts
	 * const domNode = new Template( { ... } ).render();
	 * ```
	 *
	 * See: {@link #apply}.
	 */
	public render(): HTMLElement | Text {
		const node = this._renderNode( {
			intoFragment: true
		} as any );

		this._isRendered = true;

		return node;
	}

	/**
	 * Applies the template to an existing DOM Node, either HTML element or text.
	 *
	 * **Note:** No new DOM nodes will be created. Applying extends:
	 *
	 * {@link module:ui/template~TemplateDefinition attributes},
	 * {@link module:ui/template~TemplateDefinition event listeners}, and
	 * `textContent` of {@link module:ui/template~TemplateDefinition children} only.
	 *
	 * **Note:** Existing `class` and `style` attributes are extended when a template
	 * is applied to an HTML element, while other attributes and `textContent` are overridden.
	 *
	 * **Note:** The process of applying a template can be easily reverted using the
	 * {@link module:ui/template~Template#revert} method.
	 *
	 * ```ts
	 * const element = document.createElement( 'div' );
	 * const observable = new Model( { divClass: 'my-div' } );
	 * const emitter = Object.create( EmitterMixin );
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	attributes: {
	 * 		id: 'first-div',
	 * 		class: bind.to( 'divClass' )
	 * 	},
	 * 	on: {
	 * 		click: bind( 'elementClicked' ) // Will be fired by the observable.
	 * 	},
	 * 	children: [
	 * 		'Div text.'
	 * 	]
	 * } ).apply( element );
	 *
	 * console.log( element.outerHTML ); // -> '<div id="first-div" class="my-div"></div>'
	 * ```
	 *
	 * @see module:ui/template~Template#render
	 * @see module:ui/template~Template#revert
	 * @param node Root node for the template to apply.
	 */
	public apply( node: HTMLElement | Text ): HTMLElement | Text {
		this._revertData = getEmptyRevertData();

		this._renderNode( {
			node,
			intoFragment: false,
			isApplying: true,
			revertData: this._revertData
		} );

		return node;
	}

	/**
	 * Reverts a template {@link module:ui/template~Template#apply applied} to a DOM node.
	 *
	 * @param node The root node for the template to revert. In most of the cases, it is the
	 * same node used by {@link module:ui/template~Template#apply}.
	 */
	public revert( node: HTMLElement | Text ): void {
		if ( !this._revertData ) {
			/**
			 * Attempting to revert a template which has not been applied yet.
			 *
			 * @error ui-template-revert-not-applied
			 */
			throw new CKEditorError(
				'ui-template-revert-not-applied',
				[ this, node ]
			);
		}

		this._revertTemplateFromNode( node, this._revertData );
	}

	/**
	 * Returns an iterator which traverses the template in search of {@link module:ui/view~View}
	 * instances and returns them one by one.
	 *
	 * ```ts
	 * const viewFoo = new View();
	 * const viewBar = new View();
	 * const viewBaz = new View();
	 * const template = new Template( {
	 * 	tag: 'div',
	 * 	children: [
	 * 		viewFoo,
	 * 		{
	 * 			tag: 'div',
	 * 			children: [
	 * 				viewBar
	 * 			]
	 * 		},
	 * 		viewBaz
	 * 	]
	 * } );
	 *
	 * // Logs: viewFoo, viewBar, viewBaz
	 * for ( const view of template.getViews() ) {
	 * 	console.log( view );
	 * }
	 * ```
	 */
	public* getViews(): IterableIterator<View> {
		function* search( def: Template ): Iterable<View> {
			if ( def.children ) {
				for ( const child of def.children ) {
					if ( isView( child ) ) {
						yield child;
					} else if ( isTemplate( child ) ) {
						yield* search( child );
					}
				}
			}
		}

		yield* search( this );
	}

	/**
	 * An entry point to the interface which binds DOM nodes to
	 * {@link module:utils/observablemixin~Observable observables}.
	 * There are two types of bindings:
	 *
	 * * HTML element attributes or text `textContent` synchronized with attributes of an
	 * {@link module:utils/observablemixin~Observable}. Learn more about {@link module:ui/template~BindChain#to}
	 * and {@link module:ui/template~BindChain#if}.
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	attributes: {
	 * 		// Binds the element "class" attribute to observable#classAttribute.
	 * 		class: bind.to( 'classAttribute' )
	 * 	}
	 * } ).render();
	 * ```
	 *
	 * * DOM events fired on HTML element propagated through
	 * {@link module:utils/observablemixin~Observable}. Learn more about {@link module:ui/template~BindChain#to}.
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	on: {
	 * 		// Will be fired by the observable.
	 * 		click: bind( 'elementClicked' )
	 * 	}
	 * } ).render();
	 * ```
	 *
	 * Also see {@link module:ui/view~View#bindTemplate}.
	 *
	 * @param observable An observable which provides boundable attributes.
	 * @param emitter An emitter that listens to observable attribute
	 * changes or DOM Events (depending on the kind of the binding). Usually, a {@link module:ui/view~View} instance.
	 */
	public static override bind<TObservable extends Observable>(
		observable: TObservable,
		emitter: Emitter
	): BindChain<TObservable> {
		return {
			to( eventNameOrFunctionOrAttribute: any, callback?: any ) {
				return new TemplateToBinding( {
					eventNameOrFunction: eventNameOrFunctionOrAttribute,
					attribute: eventNameOrFunctionOrAttribute,
					observable, emitter, callback
				} );
			},

			if( attribute: string, valueIfTrue?: string, callback?: any ) {
				return new TemplateIfBinding( {
					observable, emitter, attribute, valueIfTrue, callback
				} );
			}
		} as any;
	}

	/**
	 * Extends an existing {@link module:ui/template~Template} instance with some additional content
	 * from another {@link module:ui/template~TemplateDefinition}.
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * const template = new Template( {
	 * 	tag: 'p',
	 * 	attributes: {
	 * 		class: 'a',
	 * 		data-x: bind.to( 'foo' )
	 * 	},
	 * 	children: [
	 * 		{
	 * 			tag: 'span',
	 * 			attributes: {
	 * 				class: 'b'
	 * 			},
	 * 			children: [
	 * 				'Span'
	 * 			]
	 * 		}
	 * 	]
	 *  } );
	 *
	 * // Instance-level extension.
	 * Template.extend( template, {
	 * 	attributes: {
	 * 		class: 'b',
	 * 		data-x: bind.to( 'bar' )
	 * 	},
	 * 	children: [
	 * 		{
	 * 			attributes: {
	 * 				class: 'c'
	 * 			}
	 * 		}
	 * 	]
	 * } );
	 *
	 * // Child extension.
	 * Template.extend( template.children[ 0 ], {
	 * 	attributes: {
	 * 		class: 'd'
	 * 	}
	 * } );
	 * ```
	 *
	 * the `outerHTML` of `template.render()` is:
	 *
	 * ```html
	 * <p class="a b" data-x="{ observable.foo } { observable.bar }">
	 * 	<span class="b c d">Span</span>
	 * </p>
	 * ```
	 *
	 * @param template An existing template instance to be extended.
	 * @param def Additional definition to be applied to a template.
	 */
	public static extend( template: Template, def: Partial<TemplateDefinition> ): void {
		if ( template._isRendered ) {
			/**
			 * Extending a template after rendering may not work as expected. To make sure
			 * the {@link module:ui/template~Template.extend extending} works for an element,
			 * make sure it happens before {@link module:ui/template~Template#render} is called.
			 *
			 * @error template-extend-render
			 */
			throw new CKEditorError(
				'template-extend-render',
				[ this, template ]
			);
		}

		extendTemplate( template, normalize( clone( def ) ) );
	}

	/**
	 * Renders a DOM Node (either an HTML element or text) out of the template.
	 *
	 * @param data Rendering data.
	 */
	private _renderNode( data: RenderData ) {
		let isInvalid;

		if ( data.node ) {
			// When applying, a definition cannot have "tag" and "text" at the same time.
			isInvalid = this.tag && this.text;
		} else {
			// When rendering, a definition must have either "tag" or "text": XOR( this.tag, this.text ).
			isInvalid = this.tag ? this.text : !this.text;
		}

		if ( isInvalid ) {
			/**
			 * Node definition cannot have the "tag" and "text" properties at the same time.
			 * Node definition must have either "tag" or "text" when rendering a new Node.
			 *
			 * @error ui-template-wrong-syntax
			 */
			throw new CKEditorError(
				'ui-template-wrong-syntax',
				this
			);
		}

		if ( this.text ) {
			return this._renderText( data );
		} else {
			return this._renderElement( data );
		}
	}

	/**
	 * Renders an HTML element out of the template.
	 *
	 * @param data Rendering data.
	 */
	private _renderElement( data: RenderData ) {
		let node = data.node;

		if ( !node ) {
			node = data.node = document.createElementNS( this.ns || xhtmlNs, this.tag! ) as any;
		}

		this._renderAttributes( data );
		this._renderElementChildren( data );
		this._setUpListeners( data );

		return node;
	}

	/**
	 * Renders a text node out of {@link module:ui/template~Template#text}.
	 *
	 * @param data Rendering data.
	 */
	private _renderText( data: RenderData ) {
		let node = data.node;

		// Save the original textContent to revert it in #revert().
		if ( node ) {
			data.revertData!.text = node.textContent;
		} else {
			node = data.node = document.createTextNode( '' );
		}

		// Check if this Text Node is bound to Observable. Cases:
		//
		//		text: [ Template.bind( ... ).to( ... ) ]
		//
		//		text: [
		//			'foo',
		//			Template.bind( ... ).to( ... ),
		//			...
		//		]
		//
		if ( hasTemplateBinding( this.text ) ) {
			this._bindToObservable( {
				schema: this.text!,
				updater: getTextUpdater( node ),
				data
			} );
		}
		// Simply set text. Cases:
		//
		//		text: [ 'all', 'are', 'static' ]
		//
		//		text: [ 'foo' ]
		//
		else {
			node.textContent = this.text!.join( '' );
		}

		return node;
	}

	/**
	 * Renders HTML element attributes out of {@link module:ui/template~Template#attributes}.
	 *
	 * @param data Rendering data.
	 */
	private _renderAttributes( data: RenderData ) {
		if ( !this.attributes ) {
			return;
		}

		const node = data.node as HTMLElement;
		const revertData = data.revertData;

		for ( const attrName in this.attributes ) {
			// Current attribute value in DOM.
			const domAttrValue = node.getAttribute( attrName );

			// The value to be set.
			const attrValue = this.attributes[ attrName ];

			// Save revert data.
			if ( revertData ) {
				revertData.attributes[ attrName ] = domAttrValue;
			}

			// Detect custom namespace:
			//
			//		class: {
			//			ns: 'abc',
			//			value: Template.bind( ... ).to( ... )
			//		}
			//
			const attrNs = isNamespaced( attrValue ) ? attrValue[ 0 ].ns : null;

			// Activate binding if one is found. Cases:
			//
			//		class: [
			//			Template.bind( ... ).to( ... )
			//		]
			//
			//		class: [
			//			'bar',
			//			Template.bind( ... ).to( ... ),
			//			'baz'
			//		]
			//
			//		class: {
			//			ns: 'abc',
			//			value: Template.bind( ... ).to( ... )
			//		}
			//
			if ( hasTemplateBinding( attrValue ) ) {
				// Normalize attributes with additional data like namespace:
				//
				//		class: {
				//			ns: 'abc',
				//			value: [ ... ]
				//		}
				//
				const valueToBind = isNamespaced( attrValue ) ? attrValue[ 0 ].value : attrValue;

				// Extend the original value of attributes like "style" and "class",
				// don't override them.
				if ( revertData && shouldExtend( attrName ) ) {
					valueToBind.unshift( domAttrValue );
				}

				this._bindToObservable( {
					schema: valueToBind,
					updater: getAttributeUpdater( node, attrName, attrNs ),
					data
				} );
			}

			// Style attribute could be an Object so it needs to be parsed in a specific way.
			//
			//		style: {
			//			width: '100px',
			//			height: Template.bind( ... ).to( ... )
			//		}
			//
			else if ( attrName == 'style' && typeof attrValue[ 0 ] !== 'string' ) {
				this._renderStyleAttribute( attrValue[ 0 ] as any, data );
			}

			// Otherwise simply set the static attribute:
			//
			//		class: [ 'foo' ]
			//
			//		class: [ 'all', 'are', 'static' ]
			//
			//		class: [
			//			{
			//				ns: 'abc',
			//				value: [ 'foo' ]
			//			}
			//		]
			//
			else {
				// Extend the original value of attributes like "style" and "class",
				// don't override them.
				if ( revertData && domAttrValue && shouldExtend( attrName ) ) {
					attrValue.unshift( domAttrValue as any );
				}

				const value: any = attrValue
					// Retrieve "values" from:
					//
					//		class: [
					//			{
					//				ns: 'abc',
					//				value: [ ... ]
					//			}
					//		]
					//
					.map( ( val: any ) => val ? ( val.value || val ) : val )
					// Flatten the array.
					.reduce( ( prev, next ) => prev.concat( next ), [] )
					// Convert into string.
					.reduce( arrayValueReducer, '' );

				if ( !isFalsy( value ) ) {
					node.setAttributeNS( attrNs, attrName, value );
				}
			}
		}
	}

	/**
	 * Renders the `style` attribute of an HTML element based on
	 * {@link module:ui/template~Template#attributes}.
	 *
	 * A style attribute is an object with static values:
	 *
	 * ```ts
	 * attributes: {
	 * 	style: {
	 * 		color: 'red'
	 * 	}
	 * }
	 * ```
	 *
	 * or values bound to {@link module:ui/model~Model} properties:
	 *
	 * ```ts
	 * attributes: {
	 * 	style: {
	 * 		color: bind.to( ... )
	 * 	}
	 * }
	 * ```
	 *
	 * Note: The `style` attribute is rendered without setting the namespace. It does not seem to be
	 * needed.
	 *
	 * @param styles Styles located in `attributes.style` of {@link module:ui/template~TemplateDefinition}.
	 * @param data Rendering data.
	 */
	private _renderStyleAttribute( styles: Record<string, TemplateSimpleValue | TemplateBinding>, data: RenderData ) {
		const node = data.node;

		for ( const styleName in styles ) {
			const styleValue = styles[ styleName ];

			// Cases:
			//
			//		style: {
			//			color: bind.to( 'attribute' )
			//		}
			//
			if ( hasTemplateBinding( styleValue ) ) {
				this._bindToObservable( {
					schema: [ styleValue ],
					updater: getStyleUpdater( node, styleName ),
					data
				} );
			}

			// Cases:
			//
			//		style: {
			//			color: 'red'
			//		}
			//
			else {
				( node as any ).style[ styleName ] = styleValue;
			}
		}
	}

	/**
	 * Recursively renders HTML element's children from {@link module:ui/template~Template#children}.
	 *
	 * @param data Rendering data.
	 */
	private _renderElementChildren( data: RenderData ) {
		const node = data.node as HTMLElement;
		const container = data.intoFragment ? document.createDocumentFragment() : node;
		const isApplying = data.isApplying;
		let childIndex = 0;

		for ( const child of this.children! ) {
			if ( isViewCollection( child ) ) {
				if ( !isApplying ) {
					child.setParent( node );

					// Note: ViewCollection renders its children.
					for ( const view of child ) {
						container.appendChild( view.element! );
					}
				}
			} else if ( isView( child ) ) {
				if ( !isApplying ) {
					if ( !child.isRendered ) {
						child.render();
					}

					container.appendChild( child.element! );
				}
			} else if ( isNode( child ) ) {
				container.appendChild( child );
			} else {
				if ( isApplying ) {
					const revertData = data.revertData!;
					const childRevertData = getEmptyRevertData();

					revertData.children.push( childRevertData );

					child._renderNode( {
						intoFragment: false,
						node: container.childNodes[ childIndex++ ] as any,
						isApplying: true,
						revertData: childRevertData
					} );
				} else {
					container.appendChild( child.render() );
				}
			}
		}

		if ( data.intoFragment ) {
			node.appendChild( container );
		}
	}

	/**
	 * Activates `on` event listeners from the {@link module:ui/template~TemplateDefinition}
	 * on an HTML element.
	 *
	 * @param data Rendering data.
	 */
	private _setUpListeners( data: RenderData ) {
		if ( !this.eventListeners ) {
			return;
		}

		for ( const key in this.eventListeners ) {
			const revertBindings = this.eventListeners[ key ].map( schemaItem => {
				const [ domEvtName, domSelector ] = key.split( '@' );

				return schemaItem.activateDomEventListener( domEvtName, domSelector, data );
			} );

			if ( data.revertData ) {
				data.revertData.bindings.push( revertBindings );
			}
		}
	}

	/**
	 * For a given {@link module:ui/template~TemplateValueSchema} containing {@link module:ui/template~TemplateBinding}
	 * activates the binding and sets its initial value.
	 *
	 * Note: {@link module:ui/template~TemplateValueSchema} can be for HTML element attributes or
	 * text node `textContent`.
	 *
	 * @param options Binding options.
	 * @param options.updater A function which updates the DOM (like attribute or text).
	 * @param options.data Rendering data.
	 */
	private _bindToObservable( { schema, updater, data }: {
		schema: Array<TemplateSimpleValue | TemplateBinding>;
		updater: Updater;
		data: RenderData;
	} ) {
		const revertData = data.revertData;

		// Set initial values.
		syncValueSchemaValue( schema, updater, data );

		const revertBindings = schema
			// Filter "falsy" (false, undefined, null, '') value schema components out.
			.filter( item => !isFalsy( item ) )
			// Filter inactive bindings from schema, like static strings ('foo'), numbers (42), etc.
			.filter( ( item: any ): item is TemplateBinding => item.observable )
			// Once only the actual binding are left, let the emitter listen to observable change:attribute event.
			// TODO: Reduce the number of listeners attached as many bindings may listen
			// to the same observable attribute.
			.map( templateBinding => templateBinding.activateAttributeListener( schema, updater, data ) );

		if ( revertData ) {
			revertData.bindings.push( revertBindings );
		}
	}

	/**
	 * Reverts {@link module:ui/template~RenderData#revertData template data} from a node to
	 * return it to the original state.
	 *
	 * @param node A node to be reverted.
	 * @param revertData An object that stores information about what changes have been made by
	 * {@link #apply} to the node. See {@link module:ui/template~RenderData#revertData} for more information.
	 */
	private _revertTemplateFromNode( node: HTMLElement | Text, revertData: RevertData ) {
		for ( const binding of revertData.bindings ) {
			// Each binding may consist of several observable+observable#attribute.
			// like the following has 2:
			//
			//		class: [
			//			'x',
			//			bind.to( 'foo' ),
			//			'y',
			//			bind.to( 'bar' )
			//		]
			//
			for ( const revertBinding of binding ) {
				revertBinding();
			}
		}

		if ( revertData.text ) {
			node.textContent = revertData.text;

			return;
		}

		const element = node as HTMLElement;

		for ( const attrName in revertData.attributes ) {
			const attrValue = revertData.attributes[ attrName ];

			// When the attribute has **not** been set before #apply().
			if ( attrValue === null ) {
				element.removeAttribute( attrName );
			} else {
				element.setAttribute( attrName, attrValue );
			}
		}

		for ( let i = 0; i < revertData.children.length; ++i ) {
			this._revertTemplateFromNode( element.childNodes[ i ] as any, revertData.children[ i ] );
		}
	}
}

type AttributeValues = Array<TemplateSimpleValue | TemplateBinding> |
	[ NamespacedValue<Array<TemplateSimpleValue | TemplateBinding>> ];

/**
 * Describes a binding created by the {@link module:ui/template~Template.bind} interface.
 *
 * @internal
 */
export abstract class TemplateBinding {
	/**
	 * The name of the {@link module:ui/template~TemplateBinding#observable observed attribute}.
	 */
	public readonly attribute: string;

	/**
	 * An observable instance of the binding. It either:
	 *
	 * * provides the attribute with the value,
	 * * or passes the event when a corresponding DOM event is fired.
	 */
	public readonly observable: Observable;

	/**
	 * An {@link module:utils/emittermixin~Emitter} used by the binding to:
	 *
	 * * listen to the attribute change in the {@link module:ui/template~TemplateBinding#observable},
	 * * or listen to the event in the DOM.
	 */
	public readonly emitter: Emitter;

	/**
	 * A custom function to process the value of the {@link module:ui/template~TemplateBinding#attribute}.
	 */
	public readonly callback?: ( value: any, node: Node ) => TemplateSimpleValue;

	/**
	 * Creates an instance of the {@link module:ui/template~TemplateBinding} class.
	 *
	 * @param def The definition of the binding.
	 */
	constructor( def: {
		attribute: string;
		observable: Observable;
		emitter: Emitter;
		callback?: ( value: any, node: Node ) => TemplateSimpleValue;
	} ) {
		this.attribute = def.attribute;
		this.observable = def.observable;
		this.emitter = def.emitter;
		this.callback = def.callback;
	}

	/**
	 * Returns the value of the binding. It is the value of the {@link module:ui/template~TemplateBinding#attribute} in
	 * {@link module:ui/template~TemplateBinding#observable}. The value may be processed by the
	 * {@link module:ui/template~TemplateBinding#callback}, if such has been passed to the binding.
	 *
	 * @param node A native DOM node, passed to the custom {@link module:ui/template~TemplateBinding#callback}.
	 * @returns The value of {@link module:ui/template~TemplateBinding#attribute} in
	 * {@link module:ui/template~TemplateBinding#observable}.
	 */
	public getValue( node: Node ): TemplateSimpleValue {
		const value = ( this.observable as any )[ this.attribute ];

		return this.callback ? this.callback( value, node ) : value;
	}

	/**
	 * Activates the listener which waits for changes of the {@link module:ui/template~TemplateBinding#attribute} in
	 * {@link module:ui/template~TemplateBinding#observable}, then updates the DOM with the aggregated
	 * value of {@link module:ui/template~TemplateValueSchema}.
	 *
	 * @param schema A full schema to generate an attribute or text in the DOM.
	 * @param updater A DOM updater function used to update the native DOM attribute or text.
	 * @param data Rendering data.
	 * @returns A function to sever the listener binding.
	 */
	public activateAttributeListener(
		schema: Array<TemplateSimpleValue | TemplateBinding>,
		updater: Updater,
		data: RenderData
	): () => void {
		const callback = () => syncValueSchemaValue( schema, updater, data );

		this.emitter.listenTo<ObservableChangeEvent>( this.observable, `change:${ this.attribute }`, callback );

		// Allows revert of the listener.
		return () => {
			this.emitter.stopListening( this.observable, `change:${ this.attribute }`, callback );
		};
	}
}

/**
 * Describes either:
 *
 * * a binding to an {@link module:utils/observablemixin~Observable},
 * * or a native DOM event binding.
 *
 * It is created by the {@link module:ui/template~BindChain#to} method.
 *
 * @internal
 */
export class TemplateToBinding extends TemplateBinding {
	public readonly eventNameOrFunction: string | ( ( domEvent: Event ) => void );

	constructor( def: ConstructorParameters<typeof TemplateBinding>[ 0 ] & {
		eventNameOrFunction: string | ( ( domEvent: Event ) => void );
	} ) {
		super( def );

		this.eventNameOrFunction = def.eventNameOrFunction;
	}

	/**
	 * Activates the listener for the native DOM event, which when fired, is propagated by
	 * the {@link module:ui/template~TemplateBinding#emitter}.
	 *
	 * @param domEvtName The name of the native DOM event.
	 * @param domSelector The selector in the DOM to filter delegated events.
	 * @param data Rendering data.
	 * @returns A function to sever the listener binding.
	 */
	public activateDomEventListener(
		domEvtName: string,
		domSelector: string,
		data: { node: any }
	): () => void {
		const callback = ( evt: unknown, domEvt: Event ) => {
			if ( !domSelector || ( domEvt.target as Element ).matches( domSelector ) ) {
				if ( typeof this.eventNameOrFunction == 'function' ) {
					this.eventNameOrFunction( domEvt );
				} else {
					this.observable.fire( this.eventNameOrFunction, domEvt );
				}
			}
		};

		this.emitter.listenTo( data.node, domEvtName, callback );

		// Allows revert of the listener.
		return () => {
			this.emitter.stopListening( data.node, domEvtName, callback );
		};
	}
}

/**
 * Describes a binding to {@link module:utils/observablemixin~Observable} created by the {@link module:ui/template~BindChain#if}
 * method.
 *
 * @internal
 */
export class TemplateIfBinding extends TemplateBinding {
	/**
	 * The value of the DOM attribute or text to be set if the {@link module:ui/template~TemplateBinding#attribute} in
	 * {@link module:ui/template~TemplateBinding#observable} is `true`.
	 */
	public readonly valueIfTrue?: string;

	constructor( def: ConstructorParameters<typeof TemplateBinding>[ 0 ] & {
		valueIfTrue?: string;
	} ) {
		super( def );

		this.valueIfTrue = def.valueIfTrue;
	}

	/**
	 * @inheritDoc
	 */
	public override getValue( node: Node ): TemplateSimpleValue {
		const value = super.getValue( node );

		return isFalsy( value ) ? false : ( this.valueIfTrue || true ) as any;
	}
}

/**
 * Checks whether given {@link module:ui/template~TemplateValueSchema} contains a
 * {@link module:ui/template~TemplateBinding}.
 */
function hasTemplateBinding( schema: any ) {
	if ( !schema ) {
		return false;
	}

	// Normalize attributes with additional data like namespace:
	//
	//		class: {
	//			ns: 'abc',
	//			value: [ ... ]
	//		}
	//
	if ( schema.value ) {
		schema = schema.value;
	}

	if ( Array.isArray( schema ) ) {
		return schema.some( hasTemplateBinding );
	} else if ( schema instanceof TemplateBinding ) {
		return true;
	}

	return false;
}

/**
 * Assembles the value using {@link module:ui/template~TemplateValueSchema} and stores it in a form of
 * an Array. Each entry of the Array corresponds to one of {@link module:ui/template~TemplateValueSchema}
 * items.
 *
 * @param node DOM Node updated when {@link module:utils/observablemixin~Observable} changes.
 */
function getValueSchemaValue( schema: Array<TemplateSimpleValue | TemplateBinding>, node: Node ) {
	return schema.map( schemaItem => {
		// Process {@link module:ui/template~TemplateBinding} bindings.
		if ( schemaItem instanceof TemplateBinding ) {
			return schemaItem.getValue( node );
		}

		// All static values like strings, numbers, and "falsy" values (false, null, undefined, '', etc.) just pass.
		return schemaItem;
	} );
}

/**
 * A function executed each time the bound Observable attribute changes, which updates the DOM with a value
 * constructed from {@link module:ui/template~TemplateValueSchema}.
 *
 * @param updater A function which updates the DOM (like attribute or text).
 * @param node DOM Node updated when {@link module:utils/observablemixin~Observable} changes.
 */
function syncValueSchemaValue(
	schema: Array<TemplateSimpleValue | TemplateBinding>,
	updater: Updater,
	{ node }: { node: Node }
) {
	const values = getValueSchemaValue( schema, node );
	let value: TemplateSimpleValue;

	// Check if schema is a single Template.bind.if, like:
	//
	//		class: Template.bind.if( 'foo' )
	//
	if ( schema.length == 1 && schema[ 0 ] instanceof TemplateIfBinding ) {
		value = values[ 0 ];
	} else {
		value = values.reduce( arrayValueReducer, '' );
	}

	if ( isFalsy( value ) ) {
		updater.remove();
	} else {
		updater.set( value );
	}
}

interface Updater {
	set( value: any ): void;
	remove(): void;
}

/**
 * Returns an object consisting of `set` and `remove` functions, which
 * can be used in the context of DOM Node to set or reset `textContent`.
 * @see module:ui/view~View#_bindToObservable
 *
 * @param node DOM Node to be modified.
 */
function getTextUpdater( node: Node ): Updater {
	return {
		set( value ) {
			node.textContent = value;
		},

		remove() {
			node.textContent = '';
		}
	};
}

/**
 * Returns an object consisting of `set` and `remove` functions, which
 * can be used in the context of DOM Node to set or reset an attribute.
 * @see module:ui/view~View#_bindToObservable
 *
 * @param el DOM Node to be modified.
 * @param attrName Name of the attribute to be modified.
 * @param ns Namespace to use.
 */
function getAttributeUpdater( el: Element, attrName: string, ns: string | null ): Updater {
	return {
		set( value ) {
			el.setAttributeNS( ns, attrName, value );
		},

		remove() {
			el.removeAttributeNS( ns, attrName );
		}
	};
}

/**
 * Returns an object consisting of `set` and `remove` functions, which
 * can be used in the context of CSSStyleDeclaration to set or remove a style.
 * @see module:ui/view~View#_bindToObservable
 *
 * @param el DOM Node to be modified.
 * @param styleName Name of the style to be modified.
 */
function getStyleUpdater( el: any, styleName: string ): Updater {
	return {
		set( value ) {
			el.style[ styleName ] = value;
		},

		remove() {
			el.style[ styleName ] = null;
		}
	};
}

/**
 * Clones definition of the template.
 */
function clone( def: unknown ) {
	const clone = cloneDeepWith( def, value => {
		// Don't clone the `Template.bind`* bindings because of the references to Observable
		// and DomEmitterMixin instances inside, which would also be traversed and cloned by greedy
		// cloneDeepWith algorithm. There's no point in cloning Observable/DomEmitterMixins
		// along with the definition.
		//
		// Don't clone Template instances if provided as a child. They're simply #render()ed
		// and nothing should interfere.
		//
		// Also don't clone View instances if provided as a child of the Template. The template
		// instance will be extracted from the View during the normalization and there's no need
		// to clone it.
		if ( value && ( value instanceof TemplateBinding || isTemplate( value ) || isView( value ) || isViewCollection( value ) ) ) {
			return value;
		}
	} );

	return clone;
}

/**
 * Normalizes given {@link module:ui/template~TemplateDefinition}.
 *
 * See:
 *  * {@link normalizeAttributes}
 *  * {@link normalizeListeners}
 *  * {@link normalizePlainTextDefinition}
 *  * {@link normalizeTextDefinition}
 *
 * @param def A template definition.
 * @returns Normalized definition.
 */
function normalize( def: any ) {
	if ( typeof def == 'string' ) {
		def = normalizePlainTextDefinition( def );
	} else if ( def.text ) {
		normalizeTextDefinition( def );
	}

	if ( def.on ) {
		def.eventListeners = normalizeListeners( def.on );

		// Template mixes EmitterMixin, so delete #on to avoid collision.
		delete def.on;
	}

	if ( !def.text ) {
		if ( def.attributes ) {
			normalizeAttributes( def.attributes );
		}

		const children = [];

		if ( def.children ) {
			if ( isViewCollection( def.children ) ) {
				children.push( def.children );
			} else {
				for ( const child of def.children ) {
					if ( isTemplate( child ) || isView( child ) || isNode( child ) ) {
						children.push( child );
					} else {
						children.push( new Template( child ) );
					}
				}
			}
		}

		def.children = children;
	}

	return def;
}

/**
 * Normalizes "attributes" section of {@link module:ui/template~TemplateDefinition}.
 *
 * ```
 * attributes: {
 * 	a: 'bar',
 * 	b: {@link module:ui/template~TemplateBinding},
 * 	c: {
 * 		value: 'bar'
 * 	}
 * }
 * ```
 *
 * becomes
 *
 * ```
 * attributes: {
 * 	a: [ 'bar' ],
 * 	b: [ {@link module:ui/template~TemplateBinding} ],
 * 	c: {
 * 		value: [ 'bar' ]
 * 	}
 * }
 * ```
 */
function normalizeAttributes( attributes: any ) {
	for ( const a in attributes ) {
		if ( attributes[ a ].value ) {
			attributes[ a ].value = toArray( attributes[ a ].value );
		}

		arrayify( attributes, a );
	}
}

/**
 * Normalizes "on" section of {@link module:ui/template~TemplateDefinition}.
 *
 * ```
 * on: {
 * 	a: 'bar',
 * 	b: {@link module:ui/template~TemplateBinding},
 * 	c: [ {@link module:ui/template~TemplateBinding}, () => { ... } ]
 * }
 * ```
 *
 * becomes
 *
 * ```
 * on: {
 * 	a: [ 'bar' ],
 * 	b: [ {@link module:ui/template~TemplateBinding} ],
 * 	c: [ {@link module:ui/template~TemplateBinding}, () => { ... } ]
 * }
 * ```
 *
 * @returns Object containing normalized listeners.
 */
function normalizeListeners( listeners: any ) {
	for ( const l in listeners ) {
		arrayify( listeners, l );
	}

	return listeners;
}

/**
 * Normalizes "string" {@link module:ui/template~TemplateDefinition}.
 *
 * ```
 * "foo"
 * ```
 *
 * becomes
 *
 * ```
 * { text: [ 'foo' ] },
 * ```
 *
 * @returns Normalized template definition.
 */
function normalizePlainTextDefinition( def: string ) {
	return {
		text: [ def ]
	};
}

/**
 * Normalizes text {@link module:ui/template~TemplateDefinition}.
 *
 * ```
 * children: [
 * 	{ text: 'def' },
 * 	{ text: {@link module:ui/template~TemplateBinding} }
 * ]
 * ```
 *
 * becomes
 *
 * ```
 * children: [
 * 	{ text: [ 'def' ] },
 * 	{ text: [ {@link module:ui/template~TemplateBinding} ] }
 * ]
 * ```
 */
function normalizeTextDefinition( def: any ) {
	def.text = toArray( def.text );
}

/**
 * Wraps an entry in Object in an Array, if not already one.
 *
 * ```
 * {
 * 	x: 'y',
 * 	a: [ 'b' ]
 * }
 * ```
 *
 * becomes
 *
 * ```
 * {
 * 	x: [ 'y' ],
 * 	a: [ 'b' ]
 * }
 * ```
 */
function arrayify( obj: any, key: string ) {
	obj[ key ] = toArray( obj[ key ] );
}

/**
 * A helper which concatenates the value avoiding unwanted
 * leading white spaces.
 */
function arrayValueReducer( prev: TemplateSimpleValue, cur: TemplateSimpleValue ) {
	if ( isFalsy( cur ) ) {
		return prev;
	} else if ( isFalsy( prev ) ) {
		return cur;
	} else {
		return `${ prev } ${ cur }`;
	}
}

/**
 * Extends one object defined in the following format:
 *
 * ```
 * {
 * 	key1: [Array1],
 * 	key2: [Array2],
 * 	...
 * 	keyN: [ArrayN]
 * }
 * ```
 *
 * with another object of the same data format.
 *
 * @param obj Base object.
 * @param ext Object extending base.
 */
function extendObjectValueArray( obj: any, ext: any ) {
	for ( const a in ext ) {
		if ( obj[ a ] ) {
			obj[ a ].push( ...ext[ a ] );
		} else {
			obj[ a ] = ext[ a ];
		}
	}
}

/**
 * A helper for {@link module:ui/template~Template#extend}. Recursively extends {@link module:ui/template~Template} instance
 * with content from {@link module:ui/template~TemplateDefinition}. See {@link module:ui/template~Template#extend} to learn more.
 *
 * @param def A template instance to be extended.
 * @param def A definition which is to extend the template instance.
 * @param Error context.
 */
function extendTemplate( template: Template, def: any ) {
	if ( def.attributes ) {
		if ( !template.attributes ) {
			template.attributes = {};
		}

		extendObjectValueArray( template.attributes, def.attributes );
	}

	if ( def.eventListeners ) {
		if ( !template.eventListeners ) {
			template.eventListeners = {};
		}

		extendObjectValueArray( template.eventListeners, def.eventListeners );
	}

	if ( def.text ) {
		template.text!.push( ...def.text );
	}

	if ( def.children && def.children.length ) {
		if ( template.children!.length != def.children.length ) {
			/**
			 * The number of children in extended definition does not match.
			 *
			 * @error ui-template-extend-children-mismatch
			 */
			throw new CKEditorError(
				'ui-template-extend-children-mismatch',
				template
			);
		}

		let childIndex = 0;

		for ( const childDef of def.children ) {
			extendTemplate( template.children![ childIndex++ ] as any, childDef );
		}
	}
}

/**
 * Checks if value is "falsy".
 * Note: 0 (Number) is not "falsy" in this context.
 *
 * @param value Value to be checked.
 */
function isFalsy( value: unknown ): value is FalsyValue {
	return !value && value !== 0;
}

/**
 * Checks if the item is an instance of {@link module:ui/view~View}
 *
 * @param value Value to be checked.
 */
function isView( item: unknown ): item is View {
	return item instanceof View;
}

/**
 * Checks if the item is an instance of {@link module:ui/template~Template}
 *
 * @param value Value to be checked.
 */
function isTemplate( item: unknown ): item is Template {
	return item instanceof Template;
}

/**
 * Checks if the item is an instance of {@link module:ui/viewcollection~ViewCollection}
 *
 * @param value Value to be checked.
 */
function isViewCollection( item: unknown ): item is ViewCollection {
	return item instanceof ViewCollection;
}

/**
 * Checks if value array contains the one with namespace.
 */
function isNamespaced(
	attrValue: AttributeValues
): attrValue is [ NamespacedValue<Array<TemplateSimpleValue | TemplateBinding>> ] {
	return isObject( attrValue[ 0 ] ) && ( attrValue[ 0 ] as any ).ns;
}

/**
 * Creates an empty skeleton for {@link module:ui/template~Template#revert}
 * data.
 */
function getEmptyRevertData(): RevertData {
	return {
		children: [],
		bindings: [],
		attributes: {}
	};
}

/**
 * Checks whether an attribute should be extended when
 * {@link module:ui/template~Template#apply} is called.
 *
 * @param attrName Attribute name to check.
 */
function shouldExtend( attrName: string ) {
	return attrName == 'class' || attrName == 'style';
}

/**
 * A definition of the {@link module:ui/template~Template}. It describes what kind of
 * node a template will render (HTML element or text), attributes of an element, DOM event
 * listeners and children.
 *
 * Also see:
 * * {@link module:ui/template~TemplateValueSchema} to learn about HTML element attributes,
 * * {@link module:ui/template~TemplateListenerSchema} to learn about DOM event listeners.
 *
 * A sample definition on an HTML element can look like this:
 *
 * ```ts
 * new Template( {
 * 	tag: 'p',
 * 	children: [
 * 		{
 * 			tag: 'span',
 * 			attributes: { ... },
 * 			children: [ ... ],
 * 		},
 * 		{
 * 			text: 'static–text'
 * 		},
 * 		'also-static–text',
 * 	],
 * 	attributes: {
 * 		class: {@link module:ui/template~TemplateValueSchema},
 * 		id: {@link module:ui/template~TemplateValueSchema},
 * 		style: {@link module:ui/template~TemplateValueSchema}
 *
 * 		// ...
 * 	},
 * 	on: {
 * 		'click': {@link module:ui/template~TemplateListenerSchema}
 *
 * 		// Document.querySelector format is also accepted.
 * 		'keyup@a.some-class': {@link module:ui/template~TemplateListenerSchema}
 *
 * 		// ...
 * 	}
 * } );
 * ```
 *
 * A {@link module:ui/view~View}, another {@link module:ui/template~Template} or a native DOM node
 * can also become a child of a template. When a view is passed, its {@link module:ui/view~View#element} is used:
 *
 * ```ts
 * const view = new SomeView();
 * const childTemplate = new Template( { ... } );
 * const childNode = document.createElement( 'b' );
 *
 * new Template( {
 * 	tag: 'p',
 *
 * 	children: [
 * 		// view#element will be added as a child of this <p>.
 * 		view,
 *
 * 		// The output of childTemplate.render() will be added here.
 * 		childTemplate,
 *
 * 		// Native DOM nodes are included directly in the rendered output.
 * 		childNode
 * 	]
 * } );
 * ```
 *
 * An entire {@link module:ui/viewcollection~ViewCollection} can be used as a child in the definition:
 *
 * ```ts
 * const collection = new ViewCollection();
 * collection.add( someView );
 *
 * new Template( {
 * 	tag: 'p',
 *
 * 	children: collection
 * } );
 * ```
 */
export type TemplateDefinition = string |
	Template |
	TemplateElementDefinition |
	TemplateTextDefinition;

export type TemplateElementDefinition = {

	/**
	 * See the template {@link module:ui/template~Template#tag} property.
	 */
	tag: string;

	/**
	 * See the template {@link module:ui/template~Template#attributes} property.
	 */
	attributes?: Record<string, TemplateValueSchema>;

	/**
	 * See the template {@link module:ui/template~Template#children} property.
	 */
	children?: Iterable<View | Node | Template | TemplateDefinition>;

	/**
	 * See the template {@link module:ui/template~Template#eventListeners} property.
	 */
	on?: Record<string, TemplateListenerSchema>;
};

export type TemplateTextDefinition = {

	/**
	 * See the template {@link module:ui/template~Template#text} property.
	 */
	text: ArrayOrItem<TemplateSimpleValueSchema>;
};

export type FalsyValue = false | null | undefined | '';

export type NamespacedValue<T> = { ns: string; value: T };

export type TemplateSimpleValue = string | boolean | number | null | undefined;

export type TemplateSimpleValueSchema = TemplateSimpleValue | AttributeBinding;

/**
 * Describes a value of an HTML element attribute or `textContent`. It allows combining multiple
 * data sources like static values and {@link module:utils/observablemixin~Observable} attributes.
 *
 * Also see:
 * * {@link module:ui/template~TemplateDefinition} to learn where to use it,
 * * {@link module:ui/template~Template.bind} to learn how to configure
 * {@link module:utils/observablemixin~Observable} attribute bindings,
 * * {@link module:ui/template~Template#render} to learn how to render a template,
 * * {@link module:ui/template~BindChain#to `to()`} and {@link module:ui/template~BindChain#if `if()`}
 * methods to learn more about bindings.
 *
 * Attribute values can be described in many different ways:
 *
 * ```ts
 * // Bind helper will create bindings to attributes of the observable.
 * const bind = Template.bind( observable, emitter );
 *
 * new Template( {
 * 	tag: 'p',
 * 	attributes: {
 * 		// A plain string schema.
 * 		'class': 'static-text',
 *
 * 		// An object schema, binds to the "foo" attribute of the
 * 		// observable and follows its value.
 * 		'class': bind.to( 'foo' ),
 *
 * 		// An array schema, combines the above.
 * 		'class': [
 * 			'static-text',
 * 			bind.to( 'bar', () => { ... } ),
 *
 * 			// Bindings can also be conditional.
 * 			bind.if( 'baz', 'class-when-baz-is-true' )
 * 		],
 *
 * 		// An array schema, with a custom namespace, e.g. useful for creating SVGs.
 * 		'class': {
 * 			ns: 'http://ns.url',
 * 			value: [
 * 				bind.if( 'baz', 'value-when-true' ),
 * 				'static-text'
 * 			]
 * 		},
 *
 * 		// An object schema, specific for styles.
 * 		style: {
 * 			color: 'red',
 * 			backgroundColor: bind.to( 'qux', () => { ... } )
 * 		}
 * 	}
 * } );
 * ```
 *
 * Text nodes can also have complex values:
 *
 * ```ts
 * const bind = Template.bind( observable, emitter );
 *
 * // Will render a "foo" text node.
 * new Template( {
 * 	text: 'foo'
 * } );
 *
 * // Will render a "static text: {observable.foo}" text node.
 * // The text of the node will be updated as the "foo" attribute changes.
 * new Template( {
 * 	text: [
 * 		'static text: ',
 * 		bind.to( 'foo', () => { ... } )
 * 	]
 * } );
 * ```
 */
export type TemplateValueSchema = ArrayOrItem<
	TemplateSimpleValueSchema |
	NamespacedValue<TemplateSimpleValueSchema>
> |
	Record<string, TemplateSimpleValueSchema>;

/**
 * Describes an event listener attached to an HTML element. Such listener can propagate DOM events
 * through an {@link module:utils/observablemixin~Observable} instance, execute custom callbacks
 * or both, if necessary.
 *
 * Also see:
 * * {@link module:ui/template~TemplateDefinition} to learn more about template definitions,
 * * {@link module:ui/template~BindChain#to `to()`} method to learn more about bindings.
 *
 * Check out different ways of attaching event listeners below:
 *
 * ```ts
 * // Bind helper will propagate events through the observable.
 * const bind = Template.bind( observable, emitter );
 *
 * new Template( {
 * 	tag: 'p',
 * 	on: {
 * 		// An object schema. The observable will fire the "clicked" event upon DOM "click".
 * 		click: bind.to( 'clicked' )
 *
 * 		// An object schema. It will work for "click" event on "a.foo" children only.
 * 		'click@a.foo': bind.to( 'clicked' )
 *
 * 		// An array schema, makes the observable propagate multiple events.
 * 		click: [
 * 			bind.to( 'clicked' ),
 * 			bind.to( 'executed' )
 * 		],
 *
 * 		// An array schema with a custom callback.
 * 		'click@a.foo': {
 * 			bind.to( 'clicked' ),
 * 			bind.to( evt => {
 * 				console.log( `${ evt.target } has been clicked!` );
 * 			} }
 * 		}
 * 	}
 * } );
 * ```
 */
export type TemplateListenerSchema = ArrayOrItem<ListenerBinding>;

// `Template.bind( observable, emitter ).to( name )` is used in two different contexts:
// - in `attribute` (or `text`) section of the `TemplateDefinition` - `name` is an observed property of the provided `observable`, or
// - in `on` section - `name` is the event to be fired.
//
// In both cases, the returned type is `TemplateToBinding` which can be misleading.
// Moreover, some forms of `to()` can be used in specific context only:
// - `to( name, callback )` can only be used in `attribute` or `text`
// - `to( callback )` can only be used in `on`.
//
// But note, that the fact it's `Template{To,If}Binding` is not relevant to the user.
// The instances are both produced and consumed by this file only.
// So let's invent some opaque types for outside use and only keep using `TemplateBinding` internally. They can be different for
// `attribute` and `on` contexts.
// To make them opaque, a non-exported symbol is used, so it's not possible to accidentally create an instance outside.
declare const AttributeBindingSymbol: unique symbol; // eslint-disable-line @typescript-eslint/no-unused-vars
declare const ListenerBindingSymbol: unique symbol; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface AttributeBinding { _opaqueAttributeBinding: typeof AttributeBindingSymbol }
export interface ListenerBinding { _opaqueListenerBinding: typeof ListenerBindingSymbol }

/**
 * The return value of {@link ~Template.bind `Template.bind()`}. It provides `to()` and `if()`
 * methods to create the {@link module:utils/observablemixin~Observable observable} attribute and event bindings.
 */
export interface BindChain<TObservable> {

	/**
	 * Binds an {@link module:utils/observablemixin~Observable observable} to either:
	 *
	 * * an HTML element attribute or a text node `textContent`, so it remains in sync with the observable
	 * attribute as it changes,
	 * * or an HTML element DOM event, so the DOM events are propagated through an observable.
	 *
	 * Some common use cases of `to()` bindings are presented below:
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	tag: 'p',
	 * 	attributes: {
	 * 		// class="..." attribute gets bound to `observable#a`
	 * 		class: bind.to( 'a' )
	 * 	},
	 * 	children: [
	 * 		// <p>...</p> gets bound to observable#b; always `toUpperCase()`.
	 * 		{
	 * 			text: bind.to( 'b', ( value, node ) => value.toUpperCase() )
	 * 		}
	 * 	],
	 * 	on: {
	 * 		click: [
	 * 			// An observable will fire "clicked" upon "click" in the DOM.
	 * 			bind.to( 'clicked' ),
	 *
	 * 			// A custom callback will be executed upon "click" in the DOM.
	 * 			bind.to( () => {
	 * 				...
	 * 			} )
	 * 		]
	 * 	}
	 * } ).render();
	 * ```
	 *
	 * Learn more about using `to()` in the {@link module:ui/template~TemplateValueSchema} and
	 * {@link module:ui/template~TemplateListenerSchema}.
	 *
	 * @label ATTRIBUTE
	 * @param attribute An attribute name of {@link module:utils/observablemixin~Observable}.
	 */
	to<TAttribute extends keyof TObservable & string>(
		attribute: TAttribute
	): AttributeBinding & ListenerBinding;

	/**
	 * Binds an {@link module:utils/observablemixin~Observable observable} to either:
	 *
	 * * an HTML element attribute or a text node `textContent`, so it remains in sync with the observable
	 * attribute as it changes,
	 * * or an HTML element DOM event, so the DOM events are propagated through an observable.
	 *
	 * Some common use cases of `to()` bindings are presented below:
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	tag: 'p',
	 * 	attributes: {
	 * 		// class="..." attribute gets bound to `observable#a`
	 * 		class: bind.to( 'a' )
	 * 	},
	 * 	children: [
	 * 		// <p>...</p> gets bound to observable#b; always `toUpperCase()`.
	 * 		{
	 * 			text: bind.to( 'b', ( value, node ) => value.toUpperCase() )
	 * 		}
	 * 	],
	 * 	on: {
	 * 		click: [
	 * 			// An observable will fire "clicked" upon "click" in the DOM.
	 * 			bind.to( 'clicked' ),
	 *
	 * 			// A custom callback will be executed upon "click" in the DOM.
	 * 			bind.to( () => {
	 * 				...
	 * 			} )
	 * 		]
	 * 	}
	 * } ).render();
	 * ```
	 *
	 * Learn more about using `to()` in the {@link module:ui/template~TemplateValueSchema} and
	 * {@link module:ui/template~TemplateListenerSchema}.
	 *
	 * @label ATTRIBUTE_CALLBACK
	 * @param attribute An attribute name of {@link module:utils/observablemixin~Observable}.
	 * @param callback Allows for processing of the value. Accepts `Node` and `value` as arguments.
	 */
	to<TAttribute extends keyof TObservable & string>(
		attribute: TAttribute,
		callback: ( value: TObservable[ TAttribute ], node: Node ) => ( TemplateSimpleValue )
	): AttributeBinding;

	/**
	 * Binds an {@link module:utils/observablemixin~Observable observable} to either:
	 *
	 * * an HTML element attribute or a text node `textContent`, so it remains in sync with the observable
	 * attribute as it changes,
	 * * or an HTML element DOM event, so the DOM events are propagated through an observable.
	 *
	 * Some common use cases of `to()` bindings are presented below:
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	tag: 'p',
	 * 	attributes: {
	 * 		// class="..." attribute gets bound to `observable#a`
	 * 		class: bind.to( 'a' )
	 * 	},
	 * 	children: [
	 * 		// <p>...</p> gets bound to observable#b; always `toUpperCase()`.
	 * 		{
	 * 			text: bind.to( 'b', ( value, node ) => value.toUpperCase() )
	 * 		}
	 * 	],
	 * 	on: {
	 * 		click: [
	 * 			// An observable will fire "clicked" upon "click" in the DOM.
	 * 			bind.to( 'clicked' ),
	 *
	 * 			// A custom callback will be executed upon "click" in the DOM.
	 * 			bind.to( () => {
	 * 				...
	 * 			} )
	 * 		]
	 * 	}
	 * } ).render();
	 * ```
	 *
	 * Learn more about using `to()` in the {@link module:ui/template~TemplateValueSchema} and
	 * {@link module:ui/template~TemplateListenerSchema}.
	 *
	 * @label EVENT
	 * @param eventNameOrCallback A DOM event name or an event callback.
	 */
	to( eventNameOrCallback: string | ( ( domEvent: Event ) => void ) ): ListenerBinding;

	/**
	 * Binds an {@link module:utils/observablemixin~Observable observable} to an HTML element attribute or a text
	 * node `textContent` so it remains in sync with the observable attribute as it changes.
	 *
	 * Unlike {@link module:ui/template~BindChain#to}, it controls the presence of the attribute or `textContent`
	 * depending on the "falseness" of an {@link module:utils/observablemixin~Observable} attribute.
	 *
	 * ```ts
	 * const bind = Template.bind( observable, emitter );
	 *
	 * new Template( {
	 * 	tag: 'input',
	 * 	attributes: {
	 * 		// <input checked> when `observable#a` is not undefined/null/false/''
	 * 		// <input> when `observable#a` is undefined/null/false
	 * 		checked: bind.if( 'a' )
	 * 	},
	 * 	children: [
	 * 		{
	 * 			// <input>"b-is-not-set"</input> when `observable#b` is undefined/null/false/''
	 * 			// <input></input> when `observable#b` is not "falsy"
	 * 			text: bind.if( 'b', 'b-is-not-set', ( value, node ) => !value )
	 * 		}
	 * 	]
	 * } ).render();
	 * ```
	 *
	 * Learn more about using `if()` in the {@link module:ui/template~TemplateValueSchema}.
	 *
	 * @param attribute An attribute name of {@link module:utils/observablemixin~Observable} used in the binding.
	 * @param valueIfTrue Value set when the {@link module:utils/observablemixin~Observable} attribute is not
	 * undefined/null/false/'' (empty string).
	 * @param callback Allows for processing of the value. Accepts `Node` and `value` as arguments.
	 */
	if<TAttribute extends keyof TObservable & string>(
		attribute: TAttribute,
		valueIfTrue?: unknown,
		callback?: ( value: TObservable[ TAttribute ], node: Node ) => ( boolean | FalsyValue )
	): AttributeBinding;
}

/**
 * The {@link module:ui/template~Template#_renderNode} configuration.
 */
export interface RenderData {

	/**
	 * A node which is being rendered.
	 */
	node: HTMLElement | Text;

	/**
	 * Tells {@link module:ui/template~Template#_renderNode} to render
	 * children into `DocumentFragment` first and then append the fragment
	 * to the parent element. It is a speed optimization.
	 */
	intoFragment: boolean;

	/**
	 * Indicates whether the {@link #node} has been provided by {@link module:ui/template~Template#apply}.
	 */
	isApplying: boolean;

	/**
	 * An object storing the data that helps {@link module:ui/template~Template#revert}
	 * bringing back an element to its initial state, i.e. before
	 * {@link module:ui/template~Template#apply} was called.
	 */
	revertData?: RevertData;
}

interface RevertData {
	text?: string | null;
	children: Array<RevertData>;
	bindings: Array<Array<() => void>>;
	attributes: Record<string, string | null>;
}
