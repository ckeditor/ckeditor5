/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/modelconsumable
 */

import TextProxy from '../model/textproxy';

/**
 * Manages a list of consumable values for {@link module:engine/model/item~Item model items}.
 *
 * Consumables are various aspects of the model. A model item can be broken down into singular properties that might be
 * taken into consideration when converting that item.
 *
 * `ModelConsumable` is used by {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} while analyzing changed
 * parts of {@link module:engine/model/document~Document the document}. The added / changed / removed model items are broken down
 * into singular properties (the item itself and it's attributes). All those parts are saved in `ModelConsumable`. Then,
 * during conversion, when given part of model item is converted (i.e. the view element has been inserted into the view,
 * but without attributes), consumable value is removed from `ModelConsumable`.
 *
 * For model items, `ModelConsumable` stores consumable values of one of following types: `insert`, `addattribute:<attributeKey>`,
 * `changeattributes:<attributeKey>`, `removeattributes:<attributeKey>`.
 *
 * In most cases, it is enough to let {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}
 * gather consumable values, so there is no need to use
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#add add method} directly.
 * However, it is important to understand how consumable values can be
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed}.
 * See {@link module:engine/conversion/downcasthelpers default downcast converters} for more information.
 *
 * Keep in mind, that one conversion event may have multiple callbacks (converters) attached to it. Each of those is
 * able to convert one or more parts of the model. However, when one of those callbacks actually converts
 * something, other should not, because they would duplicate the results. Using `ModelConsumable` helps avoiding
 * this situation, because callbacks should only convert those values, which were not yet consumed from `ModelConsumable`.
 *
 * Consuming multiple values in a single callback:
 *
 *		// Converter for custom `image` element that might have a `caption` element inside which changes
 *		// how the image is displayed in the view:
 *		//
 *		// Model:
 *		//
 *		// [image]
 *		//   └─ [caption]
 *		//       └─ foo
 *		//
 *		// View:
 *		//
 *		// <figure>
 *		//   ├─ <img />
 *		//   └─ <caption>
 *		//       └─ foo
 *		modelConversionDispatcher.on( 'insert:image', ( evt, data, conversionApi ) => {
 *			// First, consume the `image` element.
 *			conversionApi.consumable.consume( data.item, 'insert' );
 *
 *			// Just create normal image element for the view.
 *			// Maybe it will be "decorated" later.
 *			const viewImage = new ViewElement( 'img' );
 *			const insertPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *			const viewWriter = conversionApi.writer;
 *
 *			// Check if the `image` element has children.
 *			if ( data.item.childCount > 0 ) {
 *				const modelCaption = data.item.getChild( 0 );
 *
 *				// `modelCaption` insertion change is consumed from consumable values.
 *				// It will not be converted by other converters, but it's children (probably some text) will be.
 *				// Through mapping, converters for text will know where to insert contents of `modelCaption`.
 *				if ( conversionApi.consumable.consume( modelCaption, 'insert' ) ) {
 *					const viewCaption = new ViewElement( 'figcaption' );
 *
 *					const viewImageHolder = new ViewElement( 'figure', null, [ viewImage, viewCaption ] );
 *
 *					conversionApi.mapper.bindElements( modelCaption, viewCaption );
 *					conversionApi.mapper.bindElements( data.item, viewImageHolder );
 *					viewWriter.insert( insertPosition, viewImageHolder );
 *				}
 *			} else {
 *				conversionApi.mapper.bindElements( data.item, viewImage );
 *				viewWriter.insert( insertPosition, viewImage );
 *			}
 *
 *			evt.stop();
 *		} );
 */
export default class ModelConsumable {
	/**
	 * Creates an empty consumables list.
	 */
	constructor() {
		/**
		 * Contains list of consumable values.
		 *
		 * @private
		 * @member {Map} module:engine/conversion/modelconsumable~ModelConsumable#_consumable
		 */
		this._consumable = new Map();

		/**
		 * For each {@link module:engine/model/textproxy~TextProxy} added to `ModelConsumable`, this registry holds parent
		 * of that `TextProxy` and start and end indices of that `TextProxy`. This allows identification of `TextProxy`
		 * instances that points to the same part of the model but are different instances. Each distinct `TextProxy`
		 * is given unique `Symbol` which is then registered as consumable. This process is transparent for `ModelConsumable`
		 * API user because whenever `TextProxy` is added, tested, consumed or reverted, internal mechanisms of
		 * `ModelConsumable` translates `TextProxy` to that unique `Symbol`.
		 *
		 * @private
		 * @member {Map} module:engine/conversion/modelconsumable~ModelConsumable#_textProxyRegistry
		 */
		this._textProxyRegistry = new Map();
	}

	/**
	 * Adds a consumable value to the consumables list and links it with given model item.
	 *
	 *		modelConsumable.add( modelElement, 'insert' ); // Add `modelElement` insertion change to consumable values.
	 *		modelConsumable.add( modelElement, 'addAttribute:bold' ); // Add `bold` attribute insertion on `modelElement` change.
	 *		modelConsumable.add( modelElement, 'removeAttribute:bold' ); // Add `bold` attribute removal on `modelElement` change.
	 *		modelConsumable.add( modelSelection, 'selection' ); // Add `modelSelection` to consumable values.
	 *		modelConsumable.add( modelRange, 'range' ); // Add `modelRange` to consumable values.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/selection~Selection|module:engine/model/range~Range} item
	 * Model item, range or selection that has the consumable.
	 * @param {String} type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
	 * Second colon and everything after will be cut. Passing event name is a safe and good practice.
	 */
	add( item, type ) {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item );
		}

		if ( !this._consumable.has( item ) ) {
			this._consumable.set( item, new Map() );
		}

		this._consumable.get( item ).set( type, true );
	}

	/**
	 * Removes given consumable value from given model item.
	 *
	 *		modelConsumable.consume( modelElement, 'insert' ); // Remove `modelElement` insertion change from consumable values.
	 *		modelConsumable.consume( modelElement, 'addAttribute:bold' ); // Remove `bold` attribute insertion on `modelElement` change.
	 *		modelConsumable.consume( modelElement, 'removeAttribute:bold' ); // Remove `bold` attribute removal on `modelElement` change.
	 *		modelConsumable.consume( modelSelection, 'selection' ); // Remove `modelSelection` from consumable values.
	 *		modelConsumable.consume( modelRange, 'range' ); // Remove 'modelRange' from consumable values.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/selection~Selection|module:engine/model/range~Range} item
	 * Model item, range or selection from which consumable will be consumed.
	 * @param {String} type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
	 * Second colon and everything after will be cut. Passing event name is a safe and good practice.
	 * @returns {Boolean} `true` if consumable value was available and was consumed, `false` otherwise.
	 */
	consume( item, type ) {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item );
		}

		if ( this.test( item, type ) ) {
			this._consumable.get( item ).set( type, false );

			return true;
		} else {
			return false;
		}
	}

	/**
	 * Tests whether there is a consumable value of given type connected with given model item.
	 *
	 *		modelConsumable.test( modelElement, 'insert' ); // Check for `modelElement` insertion change.
	 *		modelConsumable.test( modelElement, 'addAttribute:bold' ); // Check for `bold` attribute insertion on `modelElement` change.
	 *		modelConsumable.test( modelElement, 'removeAttribute:bold' ); // Check for `bold` attribute removal on `modelElement` change.
	 *		modelConsumable.test( modelSelection, 'selection' ); // Check if `modelSelection` is consumable.
	 *		modelConsumable.test( modelRange, 'range' ); // Check if `modelRange` is consumable.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/selection~Selection|module:engine/model/range~Range} item
	 * Model item, range or selection to be tested.
	 * @param {String} type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
	 * Second colon and everything after will be cut. Passing event name is a safe and good practice.
	 * @returns {null|Boolean} `null` if such consumable was never added, `false` if the consumable values was
	 * already consumed or `true` if it was added and not consumed yet.
	 */
	test( item, type ) {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item );
		}

		const itemConsumables = this._consumable.get( item );

		if ( itemConsumables === undefined ) {
			return null;
		}

		const value = itemConsumables.get( type );

		if ( value === undefined ) {
			return null;
		}

		return value;
	}

	/**
	 * Reverts consuming of consumable value.
	 *
	 *		modelConsumable.revert( modelElement, 'insert' ); // Revert consuming `modelElement` insertion change.
	 *		modelConsumable.revert( modelElement, 'addAttribute:bold' ); // Revert consuming `bold` attribute insert from `modelElement`.
	 *		modelConsumable.revert( modelElement, 'removeAttribute:bold' ); // Revert consuming `bold` attribute remove from `modelElement`.
	 *		modelConsumable.revert( modelSelection, 'selection' ); // Revert consuming `modelSelection`.
	 *		modelConsumable.revert( modelRange, 'range' ); // Revert consuming `modelRange`.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/selection~Selection|module:engine/model/range~Range} item
	 * Model item, range or selection to be reverted.
	 * @param {String} type Consumable type.
	 * @returns {null|Boolean} `true` if consumable has been reversed, `false` otherwise. `null` if the consumable has
	 * never been added.
	 */
	revert( item, type ) {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item );
		}

		const test = this.test( item, type );

		if ( test === false ) {
			this._consumable.get( item ).set( type, true );

			return true;
		} else if ( test === true ) {
			return false;
		}

		return null;
	}

	/**
	 * Gets a unique symbol for passed {@link module:engine/model/textproxy~TextProxy} instance. All `TextProxy` instances that
	 * have same parent, same start index and same end index will get the same symbol.
	 *
	 * Used internally to correctly consume `TextProxy` instances.
	 *
	 * @private
	 * @param {module:engine/model/textproxy~TextProxy} textProxy `TextProxy` instance to get a symbol for.
	 * @returns {Symbol} Symbol representing all equal instances of `TextProxy`.
	 */
	_getSymbolForTextProxy( textProxy ) {
		let symbol = null;

		const startMap = this._textProxyRegistry.get( textProxy.startOffset );

		if ( startMap ) {
			const endMap = startMap.get( textProxy.endOffset );

			if ( endMap ) {
				symbol = endMap.get( textProxy.parent );
			}
		}

		if ( !symbol ) {
			symbol = this._addSymbolForTextProxy( textProxy.startOffset, textProxy.endOffset, textProxy.parent );
		}

		return symbol;
	}

	/**
	 * Adds a symbol for given properties that characterizes a {@link module:engine/model/textproxy~TextProxy} instance.
	 *
	 * Used internally to correctly consume `TextProxy` instances.
	 *
	 * @private
	 * @param {Number} startIndex Text proxy start index in it's parent.
	 * @param {Number} endIndex Text proxy end index in it's parent.
	 * @param {module:engine/model/element~Element} parent Text proxy parent.
	 * @returns {Symbol} Symbol generated for given properties.
	 */
	_addSymbolForTextProxy( start, end, parent ) {
		const symbol = Symbol( 'textProxySymbol' );
		let startMap, endMap;

		startMap = this._textProxyRegistry.get( start );

		if ( !startMap ) {
			startMap = new Map();
			this._textProxyRegistry.set( start, startMap );
		}

		endMap = startMap.get( end );

		if ( !endMap ) {
			endMap = new Map();
			startMap.set( end, endMap );
		}

		endMap.set( parent, symbol );

		return symbol;
	}
}

// Returns a normalized consumable type name from given string. A normalized consumable type name is a string that has
// at most one colon, for example: `insert` or `addMarker:highlight`. If string to normalize has more "parts" (more colons),
// the other parts are dropped, for example: `addattribute:bold:$text` -> `addattributes:bold`.
//
// @param {String} type Consumable type.
// @returns {String} Normalized consumable type.
function _normalizeConsumableType( type ) {
	const parts = type.split( ':' );

	return parts.length > 1 ? parts[ 0 ] + ':' + parts[ 1 ] : parts[ 0 ];
}
