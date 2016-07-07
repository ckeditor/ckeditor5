/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import TextProxy from '../model/textproxy.js';

/**
 * Manages a list of consumable values for {@link engine.model.Item model items}.
 *
 * Consumables are various aspects of the model. A model item can be broken down into singular properties that might be
 * taken into consideration when converting that item.
 *
 * `ModelConsumable` is used by {@link engine.conversion.ModelConversionDispatcher} while analyzing changed
 * parts of {@link engine.model.Document the document}. The added / changed / removed model items are broken down
 * into singular properties (the item itself and it's attributes). All those parts are saved in `ModelConsumable`. Then,
 * during conversion, when given part of model item is converted (i.e. the view element has been inserted into the view,
 * but without attributes), consumable value is removed from `ModelConsumable`.
 *
 * For model items, `ModelConsumable` stores consumable values of one of following types: `insert`, `addAttribute:<attributeKey>`,
 * `changeAttribute:<attributeKey>`, `removeAttribute:<attributeKey>`.
 *
 * In most cases, it is enough to let {@link engine.conversion.ModelConversionDispatcher} gather consumable values, so
 * there is no need to use {@link engine.conversion.ModelConsumable#add add method} directly. However, it is important to
 * understand how consumable values can be {@link engine.conversion.ModelConsumable#consume consumed}. See
 * {@link engine.conversion.modelToView default model to view converters} for more information.
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
 *		//       ├─ f
 *		//       ├─ o
 *		//       └─ o
 *		//
 *		// View:
 *		//
 *		// <figure>
 *		//   ├─ <img />
 *		//   └─ <caption>
 *		//       └─ foo
 *		modelConversionDispatcher.on( 'insert:image', ( evt, data, consumable, conversionApi ) => {
 *			// First, consume the `image` element.
 *			consumable.consume( data.item, 'insert' );
 *
 *			// Just create normal image element for the view.
 *			// Maybe it will be "decorated" later.
 *			const viewImage = new ViewElement( 'img' );
 *			const insertPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *
 *			// Check if the `image` element has children.
 *			if ( data.item.getChildCount() > 0 ) {
 *				const modelCaption = data.item.getChild( 0 );
 *
 *				// `modelCaption` insertion change is consumed from consumable values.
 *				// It will not be converted by other converters, but it's children (probably some text) will be.
 *				// Through mapping, converters for text will know where to insert contents of `modelCaption`.
 *				if ( consumable.consume( modelCaption, 'insert' ) ) {
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
 *
 * @memberOf engine.conversion
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
		 * @member {Map} engine.conversion.ModelConsumable#_consumable
		 */
		this._consumable = new Map();

		/**
		 * For each {@link engine.model.TextProxy} added to `ModelConsumable`, this registry holds parent
		 * of that `TextProxy` and start and end indices of that `TextProxy`. This allows identification of `TextProxy`
		 * instances that points to the same part of the model but are different instances. Each distinct `TextProxy`
		 * is given unique `Symbol` which is then registered as consumable. This process is transparent for `ModelConsumable`
		 * API user because whenever `TextProxy` is added, tested, consumed or reverted, internal mechanisms of
		 * `ModelConsumable` translates `TextProxy` to that unique `Symbol`.
		 *
		 * @private
		 * @member {Map} engine.conversion.ModelConsumable#_textProxyRegistry
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
	 *		modelConsumable.add( modelSelection, 'selectionAttribute:bold' ); // Add `bold` attribute on `modelSelection` to consumables.
	 *
	 * @param {engine.model.Item|engine.model.Selection} item Model item or selection that has the consumable.
	 * @param {String} type Consumable type.
	 */
	add( item, type ) {
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
	 *		modelConsumable.consume( modelSelection, 'selectionAttribute:bold' ); // Remove `bold` on `modelSelection` from consumables.
	 *
	 * @param {engine.model.Item|engine.model.Selection} item Model item or selection from which consumable will be consumed.
	 * @param {String} type Consumable type.
	 * @returns {Boolean} `true` if consumable value was available and was consumed, `false` otherwise.
	 */
	consume( item, type ) {
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
	 *		modelConsumable.test( modelSelection, 'selectionAttribute:bold' ); // Check if `bold` on `modelSelection` is consumable.
	 *
	 * @param {engine.model.Item|engine.model.Selection} item Model item or selection that will be tested.
	 * @param {String} type Consumable type.
	 * @returns {null|Boolean} `null` if such consumable was never added, `false` if the consumable values was
	 * already consumed or `true` if it was added and not consumed yet.
	 */
	test( item, type ) {
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
	 *		modelConsumable.revert( modelSelection, 'selectionAttribute:bold' ); // Revert consuming `bold` from `modelSelection`.
	 *
	 * @param {engine.model.Item|engine.model.Selection} item Model item or selection that will be reverted.
	 * @param {String} type Consumable type.
	 * @returns {null|Boolean} `true` if consumable has been reversed, `false` otherwise. `null` if the consumable has
	 * never been added.
	 */
	revert( item, type ) {
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
	 * Gets a unique symbol for passed {@link engine.model.TextProxy} instance. All `TextProxy` instances that
	 * have same parent, same start index and same end index will get the same symbol.
	 *
	 * Used internally to correctly consume `TextProxy` instances.
	 *
	 * @private
	 * @param {engine.model.TextProxy} textProxy `TextProxy` instance to get a symbol for.
	 * @returns {Symbol} Symbol representing all equal instances of `TextProxy`.
	 */
	_getSymbolForTextProxy( textProxy ) {
		let symbol = null;

		const startIndex = textProxy.first.getIndex();
		const endIndex = startIndex + textProxy.text.length;
		const parent = textProxy.commonParent;

		const startIndexMap = this._textProxyRegistry.get( startIndex );

		if ( startIndexMap ) {
			const endIndexMap = startIndexMap.get( endIndex );

			if ( endIndexMap ) {
				symbol = endIndexMap.get( parent );
			}
		}

		if ( !symbol ) {
			symbol = this._addSymbolForTextProxy( startIndex, endIndex, parent );
		}

		return symbol;
	}

	/**
	 * Adds a symbol for given properties that characterizes a {@link engine.model.TextProxy} instance.
	 *
	 * Used internally to correctly consume `TextProxy` instances.
	 *
	 * @private
	 * @param {Number} startIndex Text proxy start index in it's parent.
	 * @param {Number} endIndex Text proxy end index in it's parent.
	 * @param {engine.model.Element} parent Text proxy parent.
	 * @returns {Symbol} Symbol generated for given properties.
	 */
	_addSymbolForTextProxy( startIndex, endIndex, parent ) {
		const symbol = Symbol();
		let startIndexMap, endIndexMap;

		startIndexMap = this._textProxyRegistry.get( startIndex );

		if ( !startIndexMap ) {
			startIndexMap = new Map();
			this._textProxyRegistry.set( startIndex, startIndexMap );
		}

		endIndexMap = startIndexMap.get( endIndex );

		if ( !endIndexMap ) {
			endIndexMap = new Map();
			startIndexMap.set( endIndex, endIndexMap );
		}

		endIndexMap.set( parent, symbol );

		return symbol;
	}
}
