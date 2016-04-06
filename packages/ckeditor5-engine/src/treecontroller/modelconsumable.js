/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Manages a list of consumable values for {@link engine.treeModel.Item model items}.
 *
 * Consumables are various aspects of the model items. A model item can be broken down into singular properties
 * that might be taken into consideration when converting that item.
 *
 * `ModelConsumable` is used by {@link engine.treeController.ModelConversionDispatcher} while analyzing changed
 * parts of {@link engine.treeModel.Document the document}. The added / changed / removed model items are broken down
 * into singular properties (the item itself and it's attributes). All those parts are saved in `ModelConsumable`. Then,
 * during conversion, when given part of model item is converted (i.e. the view element has been inserted into the view,
 * but without attributes), consumable value is removed from `ModelConsumable`.
 *
 * Although `ModelConsumable` might store consumable values of any type (see {@link engine.treeController.ModelConsumable#add}),
 * the commonly used ones are similar to events names fired by {@link engine.treeController.ModelConversionDispatcher}:
 * `insert`, `addAttribute:<attributeKey>`, `changeAttribute:<attributeKey>`, `removeAttribute:<attributeKey>`.
 *
 * Most commonly, {@link engine.treeController.ModelConsumable#add add method} will be used only by
 * {@link engine.treeController.ModelConversionDispatcher} to gather consumable values. However, it is important to
 * understand how consumable values can be {@link engine.treeController.ModelConsumable#consume consumed}. See also:
 * {@link engine.treeController.modelToView}.
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
 *		modelConversionDispatcher.on( 'insert:element:image', ( evt, data, consumable, conversionApi ) => {
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
 *					const viewCaption = new ViewElement( 'figuaption' );
 *
 *					const viewImageHolder = new ViewElement( 'figure', null, [ viewImage, viewCaption ] );
 *
 *					conversionApi.mapper.bindElements( modelCaption, viewCaption );
 *					conversionApi.mapper.bindElements( data.item, viewImageHolder );
 *					conversionApi.writer.insert( insertPosition, viewImageHolder );
 *				}
 *			} else {
 *				conversionApi.mapper.bindElements( data.item, viewImage );
 *				conversionApi.writer.insert( insertPosition, viewImage );
 *			}
 *
 *			evt.stop();
 *		} );
 *
 * @memberOf engine.treeController
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
		 * @member {Map} engine.treeController.ModelConsumable#_consumable.
		 */
		this._consumable = new Map();
	}

	/**
	 * Adds a consumable value to the consumables list and links it with given model item.
	 *
	 *		modelConsumable.add( modelElement, 'insert' ); // Add `modelElement` insertion change to consumable values.
	 *		modelConsumable.add( modelElement, 'addAttribute:bold' ); // Add `bold` attribute insertion on `modelElement` change.
	 *		modelConsumable.add( modelElement, 'removeAttribute:bold' ); // Add `bold` attribute removal on `modelElement` change.
	 *
	 * @param {engine.treeModel.Item} item Model item that has the consumable.
	 * @param {String} type Consumable type.
	 */
	add( item, type ) {
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
	 *
	 * @param {engine.treeModel.Item} item Model item from which consumable will be consumed.
	 * @param {String} type Consumable type.
	 * @returns {Boolean} `true` if consumable value was available and was consumed, `false` otherwise.
	 */
	consume( item, type ) {
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
	 *
	 * @param {engine.treeModel.Item} item Model item that will be tested.
	 * @param {String} type Consumable type.
	 * @returns {null|Boolean} `null` if such consumable was never added, `false` if the consumable values was
	 * already consumed or `true` if it was added and not consumed yet.
	 */
	test( item, type ) {
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
	 *
	 * @param {engine.treeModel.Item} item Model item that will be tested.
	 * @param {String} type Consumable type.
	 * @returns {null|Boolean} `true` if consumable has been reversed, `false` otherwise. `null` if the consumable has
	 * never been added.
	 */
	revert( item, type ) {
		const test = this.test( item, type );

		if ( test === false ) {
			this._consumable.get( item ).set( type, true );

			return true;
		} else if ( test === true ) {
			return false;
		}

		return null;
	}
}
