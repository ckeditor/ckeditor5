/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/viewconsumable
 */

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type Element from '../view/element';
import type Node from '../view/node';
import type Text from '../view/text';
import type DocumentFragment from '../view/documentfragment';
import type { Match } from '../view/matcher';

import { isArray } from 'lodash-es';

/**
 * Class used for handling consumption of view {@link module:engine/view/element~Element elements},
 * {@link module:engine/view/text~Text text nodes} and {@link module:engine/view/documentfragment~DocumentFragment document fragments}.
 * Element's name and its parts (attributes, classes and styles) can be consumed separately. Consuming an element's name
 * does not consume its attributes, classes and styles.
 * To add items for consumption use {@link module:engine/conversion/viewconsumable~ViewConsumable#add add method}.
 * To test items use {@link module:engine/conversion/viewconsumable~ViewConsumable#test test method}.
 * To consume items use {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consume method}.
 * To revert already consumed items use {@link module:engine/conversion/viewconsumable~ViewConsumable#revert revert method}.
 *
 * ```ts
 * viewConsumable.add( element, { name: true } ); // Adds element's name as ready to be consumed.
 * viewConsumable.add( textNode ); // Adds text node for consumption.
 * viewConsumable.add( docFragment ); // Adds document fragment for consumption.
 * viewConsumable.test( element, { name: true }  ); // Tests if element's name can be consumed.
 * viewConsumable.test( textNode ); // Tests if text node can be consumed.
 * viewConsumable.test( docFragment ); // Tests if document fragment can be consumed.
 * viewConsumable.consume( element, { name: true }  ); // Consume element's name.
 * viewConsumable.consume( textNode ); // Consume text node.
 * viewConsumable.consume( docFragment ); // Consume document fragment.
 * viewConsumable.revert( element, { name: true }  ); // Revert already consumed element's name.
 * viewConsumable.revert( textNode ); // Revert already consumed text node.
 * viewConsumable.revert( docFragment ); // Revert already consumed document fragment.
 * ```
 */
export default class ViewConsumable {
	/**
	 * Map of consumable elements. If {@link module:engine/view/element~Element element} is used as a key,
	 * {@link module:engine/conversion/viewconsumable~ViewElementConsumables ViewElementConsumables} instance is stored as value.
	 * For {@link module:engine/view/text~Text text nodes} and
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragments} boolean value is stored as value.
	 */
	private _consumables = new Map<Node | DocumentFragment, ViewElementConsumables | boolean>();

	/**
	 * Adds {@link module:engine/view/text~Text text node} or
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment} as ready to be consumed.
	 *
	 * ```ts
	 * viewConsumable.add( textNode ); // Adds text node to consume.
	 * viewConsumable.add( docFragment ); // Adds document fragment to consume.
	 * ```
	 *
	 * See also: {@link #add:ELEMENT `add( element, consumables )`}.
	 *
	 * @label TEXT_OR_FRAGMENT
	 */
	public add(
		textOrDocumentFragment: Text | DocumentFragment
	): void;

	/**
	 * Adds {@link module:engine/view/element~Element view element} as ready to be consumed.
	 *
	 * ```ts
	 * viewConsumable.add( p, { name: true } ); // Adds element's name to consume.
	 * viewConsumable.add( p, { attributes: 'name' } ); // Adds element's attribute.
	 * viewConsumable.add( p, { classes: 'foobar' } ); // Adds element's class.
	 * viewConsumable.add( p, { styles: 'color' } ); // Adds element's style
	 * viewConsumable.add( p, { attributes: 'name', styles: 'color' } ); // Adds attribute and style.
	 * viewConsumable.add( p, { classes: [ 'baz', 'bar' ] } ); // Multiple consumables can be provided.
	 * ```
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing actual style/class.
	 *
	 * ```ts
	 * viewConsumable.add( p, { attributes: 'style' } ); // This call will throw an exception.
	 * viewConsumable.add( p, { styles: 'color' } ); // This is properly handled style.
	 * ```
	 *
	 * See also: {@link #add:TEXT_OR_FRAGMENT `add( textOrDocumentFragment )`}.
	 *
	 * @label ELEMENT
	 * @param consumables Used only if first parameter is {@link module:engine/view/element~Element view element} instance.
	 * @param consumables.name If set to true element's name will be included.
	 * @param consumables.attributes Attribute name or array of attribute names.
	 * @param consumables.classes Class name or array of class names.
	 * @param consumables.styles Style name or array of style names.
	 */
	public add(
		element: Element,
		consumables: Consumables
	): void;

	public add(
		element: Node | DocumentFragment,
		consumables?: Consumables
	): void {
		let elementConsumables: ViewElementConsumables;

		// For text nodes and document fragments just mark them as consumable.
		if ( element.is( '$text' ) || element.is( 'documentFragment' ) ) {
			this._consumables.set( element, true );

			return;
		}

		// For elements create new ViewElementConsumables or update already existing one.
		if ( !this._consumables.has( element ) ) {
			elementConsumables = new ViewElementConsumables( element );
			this._consumables.set( element, elementConsumables );
		} else {
			elementConsumables = this._consumables.get( element ) as any;
		}

		elementConsumables.add( consumables! );
	}

	/**
	 * Tests if {@link module:engine/view/element~Element view element}, {@link module:engine/view/text~Text text node} or
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment} can be consumed.
	 * It returns `true` when all items included in method's call can be consumed. Returns `false` when
	 * first already consumed item is found and `null` when first non-consumable item is found.
	 *
	 * ```ts
	 * viewConsumable.test( p, { name: true } ); // Tests element's name.
	 * viewConsumable.test( p, { attributes: 'name' } ); // Tests attribute.
	 * viewConsumable.test( p, { classes: 'foobar' } ); // Tests class.
	 * viewConsumable.test( p, { styles: 'color' } ); // Tests style.
	 * viewConsumable.test( p, { attributes: 'name', styles: 'color' } ); // Tests attribute and style.
	 * viewConsumable.test( p, { classes: [ 'baz', 'bar' ] } ); // Multiple consumables can be tested.
	 * viewConsumable.test( textNode ); // Tests text node.
	 * viewConsumable.test( docFragment ); // Tests document fragment.
	 * ```
	 *
	 * Testing classes and styles as attribute will test if all added classes/styles can be consumed.
	 *
	 * ```ts
	 * viewConsumable.test( p, { attributes: 'class' } ); // Tests if all added classes can be consumed.
	 * viewConsumable.test( p, { attributes: 'style' } ); // Tests if all added styles can be consumed.
	 * ```
	 *
	 * @param consumables Used only if first parameter is {@link module:engine/view/element~Element view element} instance.
	 * @param consumables.name If set to true element's name will be included.
	 * @param consumables.attributes Attribute name or array of attribute names.
	 * @param consumables.classes Class name or array of class names.
	 * @param consumables.styles Style name or array of style names.
	 * @returns Returns `true` when all items included in method's call can be consumed. Returns `false`
	 * when first already consumed item is found and `null` when first non-consumable item is found.
	 */
	public test( element: Node | DocumentFragment, consumables?: Consumables | Match ): boolean | null {
		const elementConsumables = this._consumables.get( element );

		if ( elementConsumables === undefined ) {
			return null;
		}

		// For text nodes and document fragments return stored boolean value.
		if ( element.is( '$text' ) || element.is( 'documentFragment' ) ) {
			return elementConsumables as boolean;
		}

		// For elements test consumables object.
		return ( elementConsumables as ViewElementConsumables ).test( consumables! );
	}

	/**
	 * Consumes {@link module:engine/view/element~Element view element}, {@link module:engine/view/text~Text text node} or
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment}.
	 * It returns `true` when all items included in method's call can be consumed, otherwise returns `false`.
	 *
	 * ```ts
	 * viewConsumable.consume( p, { name: true } ); // Consumes element's name.
	 * viewConsumable.consume( p, { attributes: 'name' } ); // Consumes element's attribute.
	 * viewConsumable.consume( p, { classes: 'foobar' } ); // Consumes element's class.
	 * viewConsumable.consume( p, { styles: 'color' } ); // Consumes element's style.
	 * viewConsumable.consume( p, { attributes: 'name', styles: 'color' } ); // Consumes attribute and style.
	 * viewConsumable.consume( p, { classes: [ 'baz', 'bar' ] } ); // Multiple consumables can be consumed.
	 * viewConsumable.consume( textNode ); // Consumes text node.
	 * viewConsumable.consume( docFragment ); // Consumes document fragment.
	 * ```
	 *
	 * Consuming classes and styles as attribute will test if all added classes/styles can be consumed.
	 *
	 * ```ts
	 * viewConsumable.consume( p, { attributes: 'class' } ); // Consume only if all added classes can be consumed.
	 * viewConsumable.consume( p, { attributes: 'style' } ); // Consume only if all added styles can be consumed.
	 * ```
	 *
	 * @param consumables Used only if first parameter is {@link module:engine/view/element~Element view element} instance.
	 * @param consumables.name If set to true element's name will be included.
	 * @param consumables.attributes Attribute name or array of attribute names.
	 * @param consumables.classes Class name or array of class names.
	 * @param consumables.styles Style name or array of style names.
	 * @returns Returns `true` when all items included in method's call can be consumed,
	 * otherwise returns `false`.
	 */
	public consume( element: Node | DocumentFragment, consumables?: Consumables | Match ): boolean {
		if ( this.test( element, consumables ) ) {
			if ( element.is( '$text' ) || element.is( 'documentFragment' ) ) {
				// For text nodes and document fragments set value to false.
				this._consumables.set( element, false );
			} else {
				// For elements - consume consumables object.
				( this._consumables.get( element ) as ViewElementConsumables ).consume( consumables! );
			}

			return true;
		}

		return false;
	}

	/**
	 * Reverts {@link module:engine/view/element~Element view element}, {@link module:engine/view/text~Text text node} or
	 * {@link module:engine/view/documentfragment~DocumentFragment document fragment} so they can be consumed once again.
	 * Method does not revert items that were never previously added for consumption, even if they are included in
	 * method's call.
	 *
	 * ```ts
	 * viewConsumable.revert( p, { name: true } ); // Reverts element's name.
	 * viewConsumable.revert( p, { attributes: 'name' } ); // Reverts element's attribute.
	 * viewConsumable.revert( p, { classes: 'foobar' } ); // Reverts element's class.
	 * viewConsumable.revert( p, { styles: 'color' } ); // Reverts element's style.
	 * viewConsumable.revert( p, { attributes: 'name', styles: 'color' } ); // Reverts attribute and style.
	 * viewConsumable.revert( p, { classes: [ 'baz', 'bar' ] } ); // Multiple names can be reverted.
	 * viewConsumable.revert( textNode ); // Reverts text node.
	 * viewConsumable.revert( docFragment ); // Reverts document fragment.
	 * ```
	 *
	 * Reverting classes and styles as attribute will revert all classes/styles that were previously added for
	 * consumption.
	 *
	 * ```ts
	 * viewConsumable.revert( p, { attributes: 'class' } ); // Reverts all classes added for consumption.
	 * viewConsumable.revert( p, { attributes: 'style' } ); // Reverts all styles added for consumption.
	 * ```
	 *
	 * @param consumables Used only if first parameter is {@link module:engine/view/element~Element view element} instance.
	 * @param consumables.name If set to true element's name will be included.
	 * @param consumables.attributes Attribute name or array of attribute names.
	 * @param consumables.classes Class name or array of class names.
	 * @param consumables.styles Style name or array of style names.
	 */
	public revert( element: Node, consumables: Consumables ): void {
		const elementConsumables = this._consumables.get( element );

		if ( elementConsumables !== undefined ) {
			if ( element.is( '$text' ) || element.is( 'documentFragment' ) ) {
				// For text nodes and document fragments - set consumable to true.
				this._consumables.set( element, true );
			} else {
				// For elements - revert items from consumables object.
				( elementConsumables as ViewElementConsumables ).revert( consumables );
			}
		}
	}

	/**
	 * Creates consumable object from {@link module:engine/view/element~Element view element}. Consumable object will include
	 * element's name and all its attributes, classes and styles.
	 */
	public static consumablesFromElement( element: Element ): Consumables & { element: Element } {
		const consumables = {
			element,
			name: true,
			attributes: [] as Array<string>,
			classes: [] as Array<string>,
			styles: [] as Array<string>
		};

		const attributes = element.getAttributeKeys();

		for ( const attribute of attributes ) {
			// Skip classes and styles - will be added separately.
			if ( attribute == 'style' || attribute == 'class' ) {
				continue;
			}

			consumables.attributes.push( attribute );
		}

		const classes = element.getClassNames();

		for ( const className of classes ) {
			consumables.classes.push( className );
		}

		const styles = element.getStyleNames();

		for ( const style of styles ) {
			consumables.styles.push( style );
		}

		return consumables;
	}

	/**
	 * Creates {@link module:engine/conversion/viewconsumable~ViewConsumable ViewConsumable} instance from
	 * {@link module:engine/view/node~Node node} or {@link module:engine/view/documentfragment~DocumentFragment document fragment}.
	 * Instance will contain all elements, child nodes, attributes, styles and classes added for consumption.
	 *
	 * @param from View node or document fragment from which `ViewConsumable` will be created.
	 * @param instance If provided, given `ViewConsumable` instance will be used
	 * to add all consumables. It will be returned instead of a new instance.
	 */
	public static createFrom( from: Node | DocumentFragment, instance?: ViewConsumable ): ViewConsumable {
		if ( !instance ) {
			instance = new ViewConsumable();
		}

		if ( from.is( '$text' ) ) {
			instance.add( from );

			return instance;
		}

		// Add `from` itself, if it is an element.
		if ( from.is( 'element' ) ) {
			instance.add( from, ViewConsumable.consumablesFromElement( from ) );
		}

		if ( from.is( 'documentFragment' ) ) {
			instance.add( from );
		}

		for ( const child of ( from as Element | DocumentFragment ).getChildren() ) {
			instance = ViewConsumable.createFrom( child, instance );
		}

		return instance;
	}
}

export interface Consumables {

	/**
	 * If set to true element's name will be included.
	 */
	name?: boolean;

	/**
	 * Attribute name or array of attribute names.
	 */
	attributes?: string | Array<string>;

	/**
	 * Class name or array of class names.
	 */
	classes?: string | Array<string>;

	/**
	 * Style name or array of style names.
	 */
	styles?: string | Array<string>;
}

const CONSUMABLE_TYPES = [ 'attributes', 'classes', 'styles' ] as const;

type ConsumableType = ( typeof CONSUMABLE_TYPES )[ number ];

/**
 * This is a private helper-class for {@link module:engine/conversion/viewconsumable~ViewConsumable}.
 * It represents and manipulates consumable parts of a single {@link module:engine/view/element~Element}.
 */
export class ViewElementConsumables {
	public readonly element: Node | DocumentFragment;

	/**
	 * Flag indicating if name of the element can be consumed.
	 */
	private _canConsumeName: boolean | null;

	/**
	 * Contains maps of element's consumables: attributes, classes and styles.
	 */
	private readonly _consumables: Record<ConsumableType, Map<string, boolean>>;

	/**
	 * Creates ViewElementConsumables instance.
	 *
	 * @param from View node or document fragment from which `ViewElementConsumables` is being created.
	 */
	constructor( from: Node | DocumentFragment ) {
		this.element = from;
		this._canConsumeName = null;
		this._consumables = {
			attributes: new Map(),
			styles: new Map(),
			classes: new Map()
		};
	}

	/**
	 * Adds consumable parts of the {@link module:engine/view/element~Element view element}.
	 * Element's name itself can be marked to be consumed (when element's name is consumed its attributes, classes and
	 * styles still could be consumed):
	 *
	 * ```ts
	 * consumables.add( { name: true } );
	 * ```
	 *
	 * Attributes classes and styles:
	 *
	 * ```ts
	 * consumables.add( { attributes: 'title', classes: 'foo', styles: 'color' } );
	 * consumables.add( { attributes: [ 'title', 'name' ], classes: [ 'foo', 'bar' ] );
	 * ```
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing `style` and `class` in consumables object.
	 *
	 * @param consumables Object describing which parts of the element can be consumed.
	 * @param consumables.name If set to `true` element's name will be added as consumable.
	 * @param consumables.attributes Attribute name or array of attribute names to add as consumable.
	 * @param consumables.classes Class name or array of class names to add as consumable.
	 * @param consumables.styles Style name or array of style names to add as consumable.
	 */
	public add( consumables: Consumables ): void {
		if ( consumables.name ) {
			this._canConsumeName = true;
		}

		for ( const type of CONSUMABLE_TYPES ) {
			if ( type in consumables ) {
				this._add( type, consumables[ type ]! );
			}
		}
	}

	/**
	 * Tests if parts of the {@link module:engine/view/node~Node view node} can be consumed.
	 *
	 * Element's name can be tested:
	 *
	 * ```ts
	 * consumables.test( { name: true } );
	 * ```
	 *
	 * Attributes classes and styles:
	 *
	 * ```ts
	 * consumables.test( { attributes: 'title', classes: 'foo', styles: 'color' } );
	 * consumables.test( { attributes: [ 'title', 'name' ], classes: [ 'foo', 'bar' ] );
	 * ```
	 *
	 * @param consumables Object describing which parts of the element should be tested.
	 * @param consumables.name If set to `true` element's name will be tested.
	 * @param consumables.attributes Attribute name or array of attribute names to test.
	 * @param consumables.classes Class name or array of class names to test.
	 * @param consumables.styles Style name or array of style names to test.
	 * @returns `true` when all tested items can be consumed, `null` when even one of the items
	 * was never marked for consumption and `false` when even one of the items was already consumed.
	 */
	public test( consumables: Consumables | Match ): boolean | null {
		// Check if name can be consumed.
		if ( consumables.name && !this._canConsumeName ) {
			return this._canConsumeName;
		}

		for ( const type of CONSUMABLE_TYPES ) {
			if ( type in consumables ) {
				const value = this._test( type, consumables[ type ]! );

				if ( value !== true ) {
					return value;
				}
			}
		}

		// Return true only if all can be consumed.
		return true;
	}

	/**
	 * Consumes parts of {@link module:engine/view/element~Element view element}. This function does not check if consumable item
	 * is already consumed - it consumes all consumable items provided.
	 * Element's name can be consumed:
	 *
	 * ```ts
	 * consumables.consume( { name: true } );
	 * ```
	 *
	 * Attributes classes and styles:
	 *
	 * ```ts
	 * consumables.consume( { attributes: 'title', classes: 'foo', styles: 'color' } );
	 * consumables.consume( { attributes: [ 'title', 'name' ], classes: [ 'foo', 'bar' ] );
	 * ```
	 *
	 * @param consumables Object describing which parts of the element should be consumed.
	 * @param consumables.name If set to `true` element's name will be consumed.
	 * @param consumables.attributes Attribute name or array of attribute names to consume.
	 * @param consumables.classes Class name or array of class names to consume.
	 * @param consumables.styles Style name or array of style names to consume.
	 */
	public consume( consumables: Consumables | Match ): void {
		if ( consumables.name ) {
			this._canConsumeName = false;
		}

		for ( const type of CONSUMABLE_TYPES ) {
			if ( type in consumables ) {
				this._consume( type, consumables[ type ]! );
			}
		}
	}

	/**
	 * Revert already consumed parts of {@link module:engine/view/element~Element view Element}, so they can be consumed once again.
	 * Element's name can be reverted:
	 *
	 * ```ts
	 * consumables.revert( { name: true } );
	 * ```
	 *
	 * Attributes classes and styles:
	 *
	 * ```ts
	 * consumables.revert( { attributes: 'title', classes: 'foo', styles: 'color' } );
	 * consumables.revert( { attributes: [ 'title', 'name' ], classes: [ 'foo', 'bar' ] );
	 * ```
	 *
	 * @param consumables Object describing which parts of the element should be reverted.
	 * @param consumables.name If set to `true` element's name will be reverted.
	 * @param consumables.attributes Attribute name or array of attribute names to revert.
	 * @param consumables.classes Class name or array of class names to revert.
	 * @param consumables.styles Style name or array of style names to revert.
	 */
	public revert( consumables: Consumables ): void {
		if ( consumables.name ) {
			this._canConsumeName = true;
		}

		for ( const type of CONSUMABLE_TYPES ) {
			if ( type in consumables ) {
				this._revert( type, consumables[ type ]! );
			}
		}
	}

	/**
	 * Helper method that adds consumables of a given type: attribute, class or style.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * type is provided - it should be handled separately by providing actual style/class type.
	 *
	 * @param type Type of the consumable item: `attributes`, `classes` or `styles`.
	 * @param item Consumable item or array of items.
	 */
	private _add( type: ConsumableType, item: string | Array<string> ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( const name of items ) {
			if ( type === 'attributes' && ( name === 'class' || name === 'style' ) ) {
				/**
				 * Class and style attributes should be handled separately in
				 * {@link module:engine/conversion/viewconsumable~ViewConsumable#add `ViewConsumable#add()`}.
				 *
				 * What you have done is trying to use:
				 *
				 *		consumables.add( { attributes: [ 'class', 'style' ] } );
				 *
				 * While each class and style should be registered separately:
				 *
				 *		consumables.add( { classes: 'some-class', styles: 'font-weight' } );
				 *
				 * @error viewconsumable-invalid-attribute
				 */
				throw new CKEditorError( 'viewconsumable-invalid-attribute', this );
			}

			consumables.set( name, true );

			if ( type === 'styles' ) {
				for ( const alsoName of this.element.document.stylesProcessor.getRelatedStyles( name ) ) {
					consumables.set( alsoName, true );
				}
			}
		}
	}

	/**
	 * Helper method that tests consumables of a given type: attribute, class or style.
	 *
	 * @param type Type of the consumable item: `attributes`, `classes` or `styles`.
	 * @param item Consumable item or array of items.
	 * @returns Returns `true` if all items can be consumed, `null` when one of the items cannot be
	 * consumed and `false` when one of the items is already consumed.
	 */
	private _test( type: ConsumableType, item: string | Array<string> ): boolean | null {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( const name of items ) {
			if ( type === 'attributes' && ( name === 'class' || name === 'style' ) ) {
				const consumableName = name == 'class' ? 'classes' : 'styles';

				// Check all classes/styles if class/style attribute is tested.
				const value = this._test( consumableName, [ ...this._consumables[ consumableName ].keys() ] );

				if ( value !== true ) {
					return value;
				}
			} else {
				const value = consumables.get( name );
				// Return null if attribute is not found.
				if ( value === undefined ) {
					return null;
				}

				if ( !value ) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Helper method that consumes items of a given type: attribute, class or style.
	 *
	 * @param type Type of the consumable item: `attributes`, `classes` or `styles`.
	 * @param item Consumable item or array of items.
	 */
	private _consume( type: ConsumableType, item: string | Array<string> ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( const name of items ) {
			if ( type === 'attributes' && ( name === 'class' || name === 'style' ) ) {
				const consumableName = name == 'class' ? 'classes' : 'styles';

				// If class or style is provided for consumption - consume them all.
				this._consume( consumableName, [ ...this._consumables[ consumableName ].keys() ] );
			} else {
				consumables.set( name, false );

				if ( type == 'styles' ) {
					for ( const toConsume of this.element.document.stylesProcessor.getRelatedStyles( name ) ) {
						consumables.set( toConsume, false );
					}
				}
			}
		}
	}

	/**
	 * Helper method that reverts items of a given type: attribute, class or style.
	 *
	 * @param type Type of the consumable item: `attributes`, `classes` or , `styles`.
	 * @param item Consumable item or array of items.
	 */
	private _revert( type: ConsumableType, item: string | Array<string> ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( const name of items ) {
			if ( type === 'attributes' && ( name === 'class' || name === 'style' ) ) {
				const consumableName = name == 'class' ? 'classes' : 'styles';

				// If class or style is provided for reverting - revert them all.
				this._revert( consumableName, [ ...this._consumables[ consumableName ].keys() ] );
			} else {
				const value = consumables.get( name );

				if ( value === false ) {
					consumables.set( name, true );
				}
			}
		}
	}
}
