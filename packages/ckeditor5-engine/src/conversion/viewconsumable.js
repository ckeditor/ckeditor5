/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import isArray from '../../utils/lib/lodash/isArray.js';
import CKEditorError from '../../utils/ckeditorerror.js';
import ViewElement from '../view/element.js';
import ViewText from '../view/text.js';
import ViewDocumentFragment from '../view/documentfragment.js';

/**
 * This is a private helper-class for {@link engine.conversion.ViewConsumable}.
 * It represents and manipulates consumable parts of a single {@link engine.view.Element}.
 *
 * @private
 * @memberOf engine.conversion
 */
class ViewElementConsumables {

	/**
	 * Creates ViewElementConsumables instance.
	 */
	constructor()  {
		/**
		 * Flag indicating if name of the element can be consumed.
		 *
		 * @private
		 * @member {Boolean} engine.conversion.ViewElementConsumables#_canConsumeName
		 */
		this._canConsumeName = null;

		/**
		 * Contains maps of element's consumables: attributes, classes and styles.
		 *
		 * @private
		 * @member {Object} engine.conversion.ViewElementConsumables#_consumables
		 */
		this._consumables = {
			attribute: new Map(),
			style: new Map(),
			class: new Map()
		};
	}

	/**
	 * Adds consumable parts of the {@link engine.view.Element view element}.
	 * Element's name itself can be marked to be consumed (when element's name is consumed its attributes, classes and
	 * styles still could be consumed):
	 *
	 *		consumables.add( { name: true } );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.add( { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.add( { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing `style` and `class` in consumables object.
	 *
	 * @param {Object} consumables Object describing which parts of the element can be consumed.
	 * @param {Boolean} consumables.name If set to `true` element's name will be added as consumable.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names to add as consumable.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names to add as consumable.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names to add as consumable.
	 */
	add( consumables ) {
		if ( consumables.name ) {
			this._canConsumeName = true;
		}

		for ( let type in this._consumables ) {
			if ( type in consumables ) {
				this._add( type, consumables[ type ] );
			}
		}
	}

	/**
	 * Tests if parts of the {@link engine.view.Element view element} can be consumed.
	 *
	 * Element's name can be tested:
	 *
	 *		consumables.test( { name: true } );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.test( { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.test( { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Object} consumables Object describing which parts of the element should be tested.
	 * @param {Boolean} consumables.name If set to `true` element's name will be tested.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names to test.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names to test.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names to test.
	 * @returns {Boolean|null} `true` when all tested items can be consumed, `null` when even one of the items
	 * was never marked for consumption and `false` when even one of the items was already consumed.
	 */
	test( consumables ) {
		// Check if name can be consumed.
		if ( consumables.name && !this._canConsumeName ) {
			return this._canConsumeName;
		}

		for ( let type in this._consumables ) {
			if ( type in consumables ) {
				const value = this._test( type, consumables[ type ] );

				if ( value !== true ) {
					return value;
				}
			}
		}

		// Return true only if all can be consumed.
		return true;
	}

	/**
	 * Consumes parts of {@link engine.view.Element view element}. This function does not check if consumable item
	 * is already consumed - it consumes all consumable items provided.
	 * Element's name can be consumed:
	 *
	 *		consumables.consume( { name: true } );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.consume( { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.consume( { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Object} consumables Object describing which parts of the element should be consumed.
	 * @param {Boolean} consumables.name If set to `true` element's name will be consumed.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names to consume.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names to consume.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names to consume.
	 */
	consume( consumables ) {
		if ( consumables.name ) {
			this._canConsumeName = false;
		}

		for ( let type in this._consumables ) {
			if ( type in consumables ) {
				this._consume( type, consumables[ type ] );
			}
		}
	}

	/**
	 * Revert already consumed parts of {@link engine.view.Element view Element}, so they can be consumed once again.
	 * Element's name can be reverted:
	 *
	 *		consumables.revert( { name: true } );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.revert( { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.revert( { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Object} consumables Object describing which parts of the element should be reverted.
	 * @param {Boolean} consumables.name If set to `true` element's name will be reverted.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names to revert.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names to revert.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names to revert.
	 */
	revert( consumables ) {
		if ( consumables.name ) {
			this._canConsumeName = true;
		}

		for ( let type in this._consumables ) {
			if ( type in consumables ) {
				this._revert( type, consumables[ type ] );
			}
		}
	}

	/**
	 * Helper method that adds consumables of a given type: attribute, class or style.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * type is provided - it should be handled separately by providing actual style/class type.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or `style`.
	 * @param {String|Array.<String>} item Consumable item or array of items.
	 */
	_add( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) ) {
				/**
				 * Class and style attributes should be handled separately.
				 *
				 * @error viewconsumable-invalid-attribute
				 */
				throw new CKEditorError( 'viewconsumable-invalid-attribute: Classes and styles should be handled separately.' );
			}

			consumables.set( name, true );
		}
	}

	/**
	 * Helper method that tests consumables of a given type: attribute, class or style.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or `style`.
	 * @param {String|Array.<String>} item Consumable item or array of items.
	 * @returns {Boolean|null} Returns `true` if all items can be consumed, `null` when one of the items cannot be
	 * consumed and `false` when one of the items is already consumed.
	 */
	_test( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) )  {
				// Check all classes/styles if class/style attribute is tested.
				const value = this._test( name, [ ...this._consumables[ name ].keys() ] );

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
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or `style`.
	 * @param {String|Array.<String>} item Consumable item or array of items.
	 */
	_consume( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) ) {
				// If class or style is provided for consumption - consume them all.
				this._consume( name, [ ...this._consumables[ name ].keys() ] );
			} else {
				consumables.set( name, false );
			}
		}
	}

	/**
	 * Helper method that reverts items of a given type: attribute, class or style.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or , `style`.
	 * @param {String|Array.<String>} item Consumable item or array of items.
	 */
	_revert( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			if ( type === 'attribute' && ( name === 'class' || name === 'style' ) ) {
				// If class or style is provided for reverting - revert them all.
				this._revert( name, [ ...this._consumables[ name ].keys() ] );
			} else {
				const value = consumables.get( name );

				if ( value === false ) {
					consumables.set( name, true );
				}
			}
		}
	}
}

/**
 * Class used for handling consumption of view {@link engine.view.Element elements},
 * {@link engine.view.Text text nodes} and {@link engine.view.DocumentFragment document fragments}.
 * Element's name and its parts (attributes, classes and styles) can be consumed separately. Consuming an element's name
 * does not consume its attributes, classes and styles.
 * To add items for consumption use {@link engine.conversion.ViewConsumable#add add method}.
 * To test items use {@link engine.conversion.ViewConsumable#test test method}.
 * To consume items use {@link engine.conversion.ViewConsumable#consume consume method}.
 * To revert already consumed items use {@link engine.conversion.ViewConsumable#revert revert method}.
 *
 *		viewConsumable.add( element, { name: true } ); // Adds element's name as ready to be consumed.
 *		viewConsumable.add( textNode ); // Adds text node for consumption.
 *		viewConsumable.add( docFragment ); // Adds document fragment for consumption.
 *		viewConsumable.test( element, { name: true }  ); // Tests if element's name can be consumed.
 *		viewConsumable.test( textNode ); // Tests if text node can be consumed.
 *		viewConsumable.test( docFragment ); // Tests if document fragment can be consumed.
 *		viewConsumable.consume( element, { name: true }  ); // Consume element's name.
 *		viewConsumable.consume( textNode ); // Consume text node.
 *		viewConsumable.consume( docFragment ); // Consume document fragment.
 *		viewConsumable.revert( element, { name: true }  ); // Revert already consumed element's name.
 *		viewConsumable.revert( textNode ); // Revert already consumed text node.
 *		viewConsumable.revert( docFragment ); // Revert already consumed document fragment.
 *
 * @memberOf engine.conversion
 */
export default class ViewConsumable {

	/**
	 * Creates new ViewConsumable.
	 */
	constructor() {
		/**
		 * Map of consumable elements. If {@link engine.view.Element element} is used as a key,
		 * {@link engine.conversion.ViewElementConsumables ViewElementConsumables} instance is stored as value.
		 * For {@link engine.view.Text text nodes} and {@link engine.view.DocumentFragment document fragments}
		 * boolean value is stored as value.
		 *
		 * @protected
		 * @member {Map.<engine.conversion.ViewElementConsumables|Boolean>} engine.conversion.ViewConsumable#_consumables
		*/
		this._consumables = new Map();
	}

	/**
	 * Adds {@link engine.view.Element view element}, {@link engine.view.Text text node} or
	 * {@link engine.view.DocumentFragment document fragment} as ready to be consumed.
	 *
	 *		viewConsumable.add( p, { name: true } ); // Adds element's name to consume.
	 *		viewConsumable.add( p, { attribute: 'name' } ); // Adds element's attribute.
	 *		viewConsumable.add( p, { class: 'foobar' } ); // Adds element's class.
	 *		viewConsumable.add( p, { style: 'color' } ); // Adds element's style
	 *		viewConsumable.add( p, { attribute: 'name', style: 'color' } ); // Adds attribute and style.
	 *		viewConsumable.add( p, { class: [ 'baz', 'bar' ] } ); // Multiple consumables can be provided.
	 *		viewConsumable.add( textNode ); // Adds text node to consume.
	 *		viewConsumable.add( docFragment ); // Adds document fragment to consume.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing actual style/class.
	 *
	 *		viewConsumable.add( p, { attribute: 'style' } ); // This call will throw an exception.
	 *		viewConsumable.add( p, { style: 'color' } ); // This is properly handled style.
	 *
	 * @param {engine.view.Element|engine.view.Text|engine.view.DocumentFragment} element
	 * @param {Object} [consumables] Used only if first parameter is {@link engine.view.Element view element} instance.
	 * @param {Boolean} consumables.name If set to true element's name will be included.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names.
	 */
	add( element, consumables ) {
		let elementConsumables;

		// For text nodes and document fragments just mark them as consumable.
		if ( element instanceof ViewText || element instanceof ViewDocumentFragment ) {
			this._consumables.set( element, true );

			return;
		}

		// For elements create new ViewElementConsumables or update already existing one.
		if ( !this._consumables.has( element ) ) {
			elementConsumables = new ViewElementConsumables();
			this._consumables.set( element, elementConsumables );
		} else {
			elementConsumables = this._consumables.get( element );
		}

		elementConsumables.add( consumables );
	}

	/**
	 * Tests if {@link engine.view.Element view element}, {@link engine.view.Text text node} or
	 * {@link engine.view.DocumentFragment document fragment} can be consumed.
	 * It returns `true` when all items included in method's call can be consumed. Returns `false` when
	 * first already consumed item is found and `null` when first non-consumable item is found.
	 *
	 *		viewConsumable.test( p, { name: true } ); // Tests element's name.
	 *		viewConsumable.test( p, { attribute: 'name' } ); // Tests attribute.
	 *		viewConsumable.test( p, { class: 'foobar' } ); // Tests class.
	 *		viewConsumable.test( p, { style: 'color' } ); // Tests style.
	 *		viewConsumable.test( p, { attribute: 'name', style: 'color' } ); // Tests attribute and style.
	 *		viewConsumable.test( p, { class: [ 'baz', 'bar' ] } ); // Multiple consumables can be tested.
	 *		viewConsumable.test( textNode ); // Tests text node.
	 *		viewConsumable.test( docFragment ); // Tests document fragment.
	 *
	 * Testing classes and styles as attribute will test if all added classes/styles can be consumed.
	 *
	 *		viewConsumable.test( p, { attribute: 'class' } ); // Tests if all added classes can be consumed.
	 *		viewConsumable.test( p, { attribute: 'style' } ); // Tests if all added styles can be consumed.
	 *
	 * @param {engine.view.Element|engine.view.Text|engine.view.DocumentFragment} element
	 * @param {Object} [consumables] Used only if first parameter is {@link engine.view.Element view element} instance.
	 * @param {Boolean} consumables.name If set to true element's name will be included.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names.
	 * @returns {Boolean|null} Returns `true` when all items included in method's call can be consumed. Returns `false`
	 * when first already consumed item is found and `null` when first non-consumable item is found.
	 */
	test( element, consumables ) {
		const elementConsumables = this._consumables.get( element );

		if ( elementConsumables === undefined ) {
			return null;
		}

		// For text nodes and document fragments return stored boolean value.
		if ( element instanceof ViewText || element instanceof ViewDocumentFragment ) {
			return elementConsumables;
		}

		// For elements test consumables object.
		return elementConsumables.test( consumables );
	}

	/**
	 * Consumes {@link engine.view.Element view element}, {@link engine.view.Text text node} or
	 * {@link engine.view.DocumentFragment document fragment}.
	 * It returns `true` when all items included in method's call can be consumed, otherwise returns `false`.
	 *
	 *		viewConsumable.consume( p, { name: true } ); // Consumes element's name.
	 *		viewConsumable.consume( p, { attribute: 'name' } ); // Consumes element's attribute.
	 *		viewConsumable.consume( p, { class: 'foobar' } ); // Consumes element's class.
	 *		viewConsumable.consume( p, { style: 'color' } ); // Consumes element's style.
	 *		viewConsumable.consume( p, { attribute: 'name', style: 'color' } ); // Consumes attribute and style.
	 *		viewConsumable.consume( p, { class: [ 'baz', 'bar' ] } ); // Multiple consumables can be consumed.
	 *		viewConsumable.consume( textNode ); // Consumes text node.
	 *		viewConsumable.consume( docFragment ); // Consumes document fragment.
	 *
	 * Consuming classes and styles as attribute will test if all added classes/styles can be consumed.
	 *
	 *		viewConsumable.consume( p, { attribute: 'class' } ); // Consume only if all added classes can be consumed.
	 *		viewConsumable.consume( p, { attribute: 'style' } ); // Consume only if all added styles can be consumed.
	 *
	 * @param {engine.view.Element|engine.view.Text|engine.view.DocumentFragment} element
	 * @param {Object} [consumables] Used only if first parameter is {@link engine.view.Element view element} instance.
	 * @param {Boolean} consumables.name If set to true element's name will be included.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names.
	 * @returns {Boolean} Returns `true` when all items included in method's call can be consumed,
	 * otherwise returns `false`.
	 */
	consume( element, consumables ) {
		if ( this.test( element, consumables ) ) {
			if ( element instanceof ViewText || element instanceof ViewDocumentFragment ) {
				// For text nodes and document fragments set value to false.
				this._consumables.set( element, false );
			} else {
				// For elements - consume consumables object.
				this._consumables.get( element ).consume( consumables );
			}

			return true;
		}

		return false;
	}

	/**
	 * Reverts {@link engine.view.Element view element}, {@link engine.view.Text text node} or
	 * {@link engine.view.DocumentFragment document fragment} so they can be consumed once again.
	 * Method does not revert items that were never previously added for consumption, even if they are included in
	 * method's call.
	 *
	 *		viewConsumable.revert( p, { name: true } ); // Reverts element's name.
	 *		viewConsumable.revert( p, { attribute: 'name' } ); // Reverts element's attribute.
	 *		viewConsumable.revert( p, { class: 'foobar' } ); // Reverts element's class.
	 *		viewConsumable.revert( p, { style: 'color' } ); // Reverts element's style.
	 *		viewConsumable.revert( p, { attribute: 'name', style: 'color' } ); // Reverts attribute and style.
	 *		viewConsumable.revert( p, { class: [ 'baz', 'bar' ] } ); // Multiple names can be reverted.
	 *		viewConsumable.revert( textNode ); // Reverts text node.
	 *		viewConsumable.revert( docFragment ); // Reverts document fragment.
	 *
	 * Reverting classes and styles as attribute will revert all classes/styles that were previously added for
	 * consumption.
	 *
	 *		viewConsumable.revert( p, { attribute: 'class' } ); // Reverts all classes added for consumption.
	 *		viewConsumable.revert( p, { attribute: 'style' } ); // Reverts all styles added for consumption.
	 *
	 * @param {engine.view.Element|engine.view.Text|engine.view.DocumentFragment} element
	 * @param {Object} [consumables] Used only if first parameter is {@link engine.view.Element view element} instance.
	 * @param {Boolean} consumables.name If set to true element's name will be included.
	 * @param {String|Array.<String>} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array.<String>} consumables.class Class name or array of class names.
	 * @param {String|Array.<String>} consumables.style Style name or array of style names.
	 */
	revert( element, consumables ) {
		const elementConsumables = this._consumables.get( element );

		if ( elementConsumables !== undefined ) {
			if ( element instanceof ViewText || element instanceof ViewDocumentFragment ) {
				// For text nodes and document fragments - set consumable to true.
				this._consumables.set( element, true );
			} else {
				// For elements - revert items from consumables object.
				elementConsumables.revert( consumables );
			}
		}
	}

	/**
	 * Creates consumable object from {@link engine.view.Element view element}. Consumable object will include
	 * element's name and all its attributes, classes and styles.
	 *
	 * @static
	 * @param {engine.view.Element} element
	 * @returns {Object} consumables
	 */
	static consumablesFromElement( element ) {
		const consumables = {
			name: true,
			attribute: [],
			class: [],
			style: []
		};

		const attributes = element.getAttributeKeys();

		for ( let attribute of attributes ) {
			// Skip classes and styles - will be added separately.
			if ( attribute == 'style' || attribute == 'class' ) {
				continue;
			}

			consumables.attribute.push( attribute );
		}

		const classes = element.getClassNames();

		for ( let className of classes ) {
			consumables.class.push( className );
		}

		const styles = element.getStyleNames();

		for ( let style of styles ) {
			consumables.style.push( style );
		}

		return consumables;
	}

	/**
	 * Creates {@link engine.conversion.ViewConsumable ViewConsumable} instance from
	 * {@link engine.view.Element element} or {@link engine.view.DocumentFragment document fragment}.
	 * Instance will contain all elements, child nodes, attributes, styles and classes added for consumption.
	 *
	 * @static
	 * @param {engine.view.Element|engine.view.DocumentFragment} from View element or document fragment
	 * from which `ViewConsumable` will be created.
	 * @param {engine.conversion.ViewConsumable} [instance] If provided, given `ViewConsumable` instance will be used
	 * to add all consumables. It will be returned instead of a new instance.
	 */
	static createFrom( from, instance ) {
		if ( !instance ) {
			instance = new ViewConsumable();
		}

		if ( from instanceof ViewText ) {
			instance.add( from );

			return instance;
		}

		// Add `from` itself, if it is an element.
		if ( from instanceof ViewElement ) {
			instance.add( from, ViewConsumable.consumablesFromElement( from ) );
		}

		if ( from instanceof ViewDocumentFragment ) {
			instance.add( from );
		}

		for ( let child of from.getChildren() ) {
			instance = ViewConsumable.createFrom( child, instance );
		}

		return instance;
	}
}
