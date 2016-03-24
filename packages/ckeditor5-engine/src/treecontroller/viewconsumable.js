/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import isPlainObject from '../../utils/lib/lodash/isPlainObject.js';
import isArray from '../../utils/lib/lodash/isArray.js';
import ViewElement from '../treeview/element.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * This is a private helper-class for {@link engine.treeController.ViewConsumable}.
 * It represents and manipulates consumable parts of a single {@link engine.treeView.Element}.
 *
 * @private
 * @memberOf engine.treeController
 */
class ViewElementConsumables {

	/**
	 * Creates ViewElementConsumables instance.
	 */
	constructor()  {
		this._canConsumeElement = null;

		this._consumables = {
			attribute: new Map(),
			style: new Map(),
			class: new Map()
		};
	}

	/**
	 * Adds consumable parts of the {@link engine.treeView.Element view Element}.
	 * Element itself can be marked to be consumed (when element is consumed its attributes, classes and styles still
	 * could be consumed):
	 *
	 *		consumables.add( true );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.add( false, { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.add( false, { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Boolean} elementOnly Only element itself should be marked for consumption. If set to `true` - `consumables`
	 * parameter is ignored.
	 * @param {Object} [consumables] Object describing which parts of the element can be consumed.
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names to add as consumable.
	 * @param {String|Array} consumables.class Class name or array of class names to add as consumable.
	 * @param {String|Array} consumables.style Style name or array of style names to add as consumable.
	 */
	add( elementOnly, consumables ) {
		if ( elementOnly ) {
			this._canConsumeElement = true;
		} else {
			for ( let type in consumables ) {
				if ( type in this._consumables ) {
					this._add( type, consumables[ type ] );
				}
			}
		}
	}

	/**
	 * Tests if parts of the {@link engine.treeView.Element view Element} can be consumed. Returns `true` when all tested
	 * items can be consumed, `null` when even one of the items were never marked for consumption and `false` when even
	 * one of the items were already consumed.
	 *
	 * Element itself can be tested:
	 *
	 *		consumables.test( true );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.test( false, { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.test( false, { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Boolean} elementOnly Only element itself should be tested. If set to `true` - `consumables`
	 * parameter is ignored.
	 * @param {Object} [consumables] Object describing which parts of the element should be tested.
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names to test.
	 * @param {String|Array} consumables.class Class name or array of class names to test.
	 * @param {String|Array} consumables.style Style name or array of style names to test.
	 * @returns {Boolean|null} Returns `true` when all tested items can be consumed, `null` when even one of the items
	 * were never marked for consumption and `false` when even one of the items were already consumed.
	 */
	test( elementOnly, consumables ) {
		if ( elementOnly ) {
			return this._canConsumeElement;
		}

		for ( let type in consumables ) {
			if ( type in this._consumables ) {
				const value =  this._test( type, consumables[ type ] );

				if ( value !== true ) {
					return value;
				}
			}
		}

		return true;
	}

	/**
	 * Consumes parts of {@link engine.treeView.Element view Element}. This function does not check if consumable item
	 * is already consumed - it consumes all consumable items provided.
	 * Element itself can be consumed:
	 *
	 *		consumables.consume( true );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.consume( false, { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.consume( false, { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Boolean} elementOnly Only element itself should be consumed. If set to `true` - `consumables`
	 * parameter is ignored.
	 * @param {Object} [consumables] Object describing which parts of the element should be consumed.
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names to consume.
	 * @param {String|Array} consumables.class Class name or array of class names to consume.
	 * @param {String|Array} consumables.style Style name or array of style names to consume.
	 */
	consume( elementOnly, consumables ) {
		if ( elementOnly ) {
			this._canConsumeElement = false;

			return;
		}

		for ( let type in consumables ) {
			if ( type in this._consumables ) {
				this._consume( type, consumables[ type ] );
			}
		}
	}

	/**
	 * Revert already consumed parts of {@link engine.treeView.Element view Element}, so they can be consumed once again.
	 * Element itself can be reverted:
	 *
	 *		consumables.revert( true );
	 *
	 * Attributes classes and styles:
	 *
	 *		consumables.revert( false, { attribute: 'title', class: 'foo', style: 'color' } );
	 *		consumables.revert( false, { attribute: [ 'title', 'name' ], class: [ 'foo', 'bar' ] );
	 *
	 * @param {Boolean} elementOnly Only element itself should be reverted. If set to `true` - `consumables`
	 * parameter is ignored.
	 * @param {Object} [consumables] Object describing which parts of the element should be reverted.
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names to revert.
	 * @param {String|Array} consumables.class Class name or array of class names to revert.
	 * @param {String|Array} consumables.style Style name or array of style names to revert.
	 */
	revert( elementOnly, consumables ) {
		if ( elementOnly ) {
			if ( this._canConsumeElement === false ) {
				this._canConsumeElement = true;
			}

			return;
		}

		for ( let type in consumables ) {
			if ( type in this._consumables ) {
				this._revert( type, consumables[ type ] );
			}
		}
	}

	/**
	 * Helper method that adds consumables from one type: attribute, class or style.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or , `style`.
	 * @param {String|Array} item Consumable item or array of items.
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
	 * Helper method that tests consumables from one type: attribute, class or style.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or , `style`.
	 * @param {String|Array} item Consumable item or array of items.
	 * @returns {Boolean|null} Returns `true` if all items con be consumed, `null` when one of the items cannot be
	 * consumed and `false` when one of the items is already consumed.
	 */
	_test( type, item ) {
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

			const value = consumables.get( name );

			// Return null if attribute is not found.
			if ( value === undefined ) {
				return null;
			}

			if ( !value ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Helper method that consumes items from one type: attribute, class or style.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or , `style`.
	 * @param {String|Array} item Consumable item or array of items.
	 */
	_consume( type, item ) {
		const items = isArray( item ) ? item : [ item ];
		const consumables = this._consumables[ type ];

		for ( let name of items ) {
			consumables.set( name, false );
		}
	}

	/**
	 * Helper method that reverts items from one type: attribute, class or style.
	 *
	 * @private
	 * @param {String} type Type of the consumable item: `attribute`, `class` or , `style`.
	 * @param {String|Array} item Consumable item or array of items.
	 */
	_revert( type, item ) {
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
			const value = consumables.get( name );

			if ( value === false ) {
				consumables.set( name, true );
			}
		}
	}
}

/**
 * Class used for handling consumption of {@link engine.treeView.Element view Elements}.
 * Element and its parts (attributes, classes and styles) can be consumed separately. Consuming an element does not
 * consume its attributes, classes and styles.
 * To add element or its parts use {@link engine.treeController.ViewConsumable#add add method}.
 * To test if element or its parts can be consumed use {@link engine.treeController.ViewConsumable#test test method}.
 * To consume element or its parts use {@link engine.treeController.ViewConsumable#consume consume method}.
 * To revert already consumed element or its parts use {@link engine.treeController.ViewConsumable#revert revert method}.
 *
 *		viewConsumable.add( element ); // Adds element as ready to be consumed.
 *		viewConsumable.test( element ); // Tests if element can be consumed.
 *		viewConsumable.consume( element ); // Consume element.
 *		vievConsumable.revert( element ); // Revert already consumed element.
 *
 * @memberOf engine.treeController
 */
export default class ViewConsumable {

	/**
	 * Creates new ViewConsumable.
	 */
	constructor() {
		/**
		* Map of consumable elements.
		*
		* @protected
		* @member {Map} core.treeController.ViewConsumable#_consumable
		*/
		this._consumables = new Map();
	}

	/**
	 * Adds {@link engine.treeView.Element view Element} and its parts as ready to be consumed.
	 *
	 *		viewConsumable.add( { element: p } ); // Adds element.
	 *		viewConsumable.add( p ); // Shortcut for adding element.
	 *		viewConsumable.add( { element: p, attribute: 'name' } ); // Adds attribute but not element itself.
	 *		viewConsumable.add( { element: p, class: 'foobar' } ); // Adds class but not element itself.
	 *		viewConsumable.add( { element: p, style: 'color' } ); // Adds style but not element itself.
	 *		viewConsumable.add( { element: p, attribute: 'name', style: 'color' } ); // Adds attribute and style.
	 *		viewConsumable.add( p1, { element: p2, class: 'foobar' } ); // Multiple objects can be provided.
	 *		viewConsumable.consume( { element: p, class: [ 'baz', 'bar' ] } ); // Multiple names can be provided.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-element-missing` when no
	 * {@link engine.treeView.Element view Element} is provided.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing actual style/class.
	 *
	 *		viewConsumable.add( { element: p, attribute: 'style' } ); // This call will throw an exception.
	 *		viewConsumable.add( { element: p, style: 'color' } ); // This is properly handled style.
	 *
	 * @param {...Object} consumables
	 * @param {engine.treeView.Element} consumables.element
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array} consumables.class Class name or array of class names.
	 * @param {String|Array} consumables.style Style name or array of style names.
	 */
	add( ...consumables ) {
		for ( let item of consumables ) {
			const { element, elementOnly } = getElement( item );
			let elementConsumables;

			// Create entry in consumables map for provided element if one is not already present.
			if ( !this._consumables.has( element ) ) {
				elementConsumables = new ViewElementConsumables();
				this._consumables.set( element, elementConsumables );
			} else {
				elementConsumables = this._consumables.get( element );
			}

			elementConsumables.add( elementOnly, item );
		}
	}

	/**
	 * Tests {@link engine.treeView.Element view Element} and its parts to check if can be consumed.
	 * It returns `true` when all items included in method's call can be consumed. Returns `false` when
	 * first already consumed item is found and `null` when first non-consumable item is found.
	 *
	 *		viewConsumable.test( { element: p } ); // Tests element.
	 *		viewConsumable.test( p ); // Shortcut for testing element.
	 *		viewConsumable.test( { element: p, attribute: 'name' } ); // Tests attribute but not element itself.
	 *		viewConsumable.test( { element: p, class: 'foobar' } ); // Tests class but not element itself.
	 *		viewConsumable.test( { element: p, style: 'color' } ); // Tests style but not element itself.
	 *		viewConsumable.test( { element: p, attribute: 'name', style: 'color' } ); // Tests attribute and style.
	 *		viewConsumable.test( p1, { element: p2, class: 'foobar' } ); // Multiple objects can be tested.
	 *		viewConsumable.consume( { element: p, class: [ 'baz', 'bar' ] } ); // Multiple names can be tested.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-element-missing` when no
	 * {@link engine.treeView.Element view Element} is provided.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing actual style/class.
	 *
	 *		viewConsumable.test( { element: p, attribute: 'style' } ); // This call will throw an exception.
	 *		viewConsumable.test( { element: p, style: 'color' } ); // This is properly handled style.
	 *
	 * @param {...Object} consumables
	 * @param {engine.treeView.Element} consumables.element
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array} consumables.class Class name or array of class names.
	 * @param {String|Array} consumables.style Style name or array of style names.
	 * @returns {Boolean|null} Returns `true` when all items included in method's call can be consumed. Returns `false`
	 * when first already consumed item is found and `null` when first non-consumable item is found.
	 */
	test( ...consumables ) {
		for ( let item of consumables ) {
			let result;
			const { element, elementOnly } = getElement( item );

			// Return null if there is no information about provided element.
			if ( !this._consumables.has( element ) ) {
				result = null;
			} else {
				const elementConsumables = this._consumables.get( element );
				result =  elementConsumables.test( elementOnly, item );
			}

			if ( !result ) {
				return result;
			}
		}

		return true;
	}

	/**
	 * Consumes provided {@link engine.treeView.Element view Element} and its parts.
	 * It returns `true` when all items included in method's call can be consumed, otherwise returns `false`.
	 *
	 *		viewConsumable.consume( { element: p } ); // Consumes element.
	 *		viewConsumable.consume( p ); // Shortcut for consuming element.
	 *		viewConsumable.consume( { element: p, attribute: 'name' } ); // Consumes attribute but not element itself.
	 *		viewConsumable.consume( { element: p, class: 'foobar' } ); // Consumes class but not element itself.
	 *		viewConsumable.consume( { element: p, style: 'color' } ); // Consumes style but not element itself.
	 *		viewConsumable.consume( { element: p, attribute: 'name', style: 'color' } ); // Consumes attribute and style.
	 *		viewConsumable.consume( p1, { element: p2, class: 'foobar' } ); // Multiple objects can be consumed.
	 *		viewConsumable.consume( { element: p, class: [ 'baz', 'bar' ] } ); // Multiple names can be consumed.
	 *
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-element-missing` when no
	 * {@link engine.treeView.Element view Element} is provided.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing actual style/class.
	 *
	 *		viewConsumable.consume( { element: p, attribute: 'style' } ); // This call will throw an exception.
	 *		viewConsumable.consume( { element: p, style: 'color' } ); // This is properly handled style.
	 *
	 * @param {...Object} consumables
	 * @param {engine.treeView.Element} consumables.element
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array} consumables.class Class name or array of class names.
	 * @param {String|Array} consumables.style Style name or array of style names.
	 * @returns {Boolean|null} Returns `true` when all items included in method's call can be consumed,
	 * otherwise returns `false`.
	 */
	consume( ...description ) {
		// Consume only if all provided descriptions can be consumed.
		if ( !this.test( ...description ) ) {
			return false;
		}

		for ( let item of description ) {
			const { element, elementOnly } = getElement( item );
			const elementConsumables = this._consumables.get( element );

			elementConsumables.consume( elementOnly, item );
		}

		return true;
	}

	/**
	 * Reverts provided {@link engine.treeView.Element view Element} and its parts so they can be consumed once again.
	 * Method does not revert items that were never previously added for consumption.
	 *
	 *		viewConsumable.revert( { element: p } ); // Reverts element.
	 *		viewConsumable.revert( p ); // Shortcut for reverting element.
	 *		viewConsumable.revert( { element: p, attribute: 'name' } ); // Reverts attribute but not element itself.
	 *		viewConsumable.revert( { element: p, class: 'foobar' } ); // Reverts class but not element itself.
	 *		viewConsumable.revert( { element: p, style: 'color' } ); // Reverts style but not element itself.
	 *		viewConsumable.revert( { element: p, attribute: 'name', style: 'color' } ); // Reverts attribute and style.
	 *		viewConsumable.revert( p1, { element: p2, class: 'foobar' } ); // Multiple objects can be reverted.
	 *		viewConsumable.revert( { element: p, class: [ 'baz', 'bar' ] } ); // Multiple names can be reverted.
	 *
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-element-missing` when no
	 * {@link engine.treeView.Element view Element} is provided.
	 *
	 * Throws {@link utils.CKEditorError CKEditorError} `viewconsumable-invalid-attribute` when `class` or `style`
	 * attribute is provided - it should be handled separately by providing actual style/class.
	 *
	 *		viewConsumable.revert( { element: p, attribute: 'style' } ); // This call will throw an exception.
	 *		viewConsumable.revert( { element: p, style: 'color' } ); // This is properly handled style.
	 *
	 * @param {...Object} consumables
	 * @param {engine.treeView.Element} consumables.element
	 * @param {String|Array} consumables.attribute Attribute name or array of attribute names.
	 * @param {String|Array} consumables.class Class name or array of class names.
	 * @param {String|Array} consumables.style Style name or array of style names.
	 */
	revert( ...consumables ) {
		for ( let item of consumables ) {
			const { element, elementOnly } = getElement( item );

			// Return null if there is no information about provided element.
			if ( this._consumables.has( element ) ) {
				const elementConsumables = this._consumables.get( element );
				elementConsumables.revert( elementOnly, item );
			}
		}
	}
}

// Helper function that extracts {@link engine.treeView.Element} from consumables object.
// Element can be provided directly or as `element` key of an object.
//
// @private
// @param {Object|engine.treeView.Element} consumables
// @returns {Object} info Object with element and information if it is only key in the object.
// @returns {engine.treeView.Element} info.element Element found in provided object.
// @returns {Boolean} info.elementOnly Is `true` when element is only item provided in `consumables` object.
function getElement( consumables ) {
	// Element can be provided as a stand alone parameter or inside consumables object.
	if ( consumables instanceof ViewElement ) {
		return { element: consumables, elementOnly: true };
	}

	if ( isPlainObject( consumables ) && consumables.element instanceof ViewElement ) {
		return { element: consumables.element, elementOnly: Object.keys( consumables ).length === 1 };
	}

	/**
	 * Tree view Element must be provided.
	 *
	 * @error viewconsumable-element-missing
	 */
	throw new CKEditorError( 'viewconsumable-element-missing: Tree view Element is not provided.' );
}
