/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/modelconsumable
 */

import TextProxy from '../model/textproxy';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type Item from '../model/item';
import type Selection from '../model/selection';
import type DocumentSelection from '../model/documentselection';
import type Range from '../model/range';

/**
 * Manages a list of consumable values for the {@link module:engine/model/item~Item model items}.
 *
 * Consumables are various aspects of the model. A model item can be broken down into separate, single properties that might be
 * taken into consideration when converting that item.
 *
 * `ModelConsumable` is used by {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} while analyzing the changed
 * parts of {@link module:engine/model/document~Document the document}. The added / changed / removed model items are broken down
 * into singular properties (the item itself and its attributes). All those parts are saved in `ModelConsumable`. Then,
 * during conversion, when the given part of a model item is converted (i.e. the view element has been inserted into the view,
 * but without attributes), the consumable value is removed from `ModelConsumable`.
 *
 * For model items, `ModelConsumable` stores consumable values of one of following types: `insert`, `addattribute:<attributeKey>`,
 * `changeattributes:<attributeKey>`, `removeattributes:<attributeKey>`.
 *
 * In most cases, it is enough to let th {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}
 * gather consumable values, so there is no need to use
 * the {@link module:engine/conversion/modelconsumable~ModelConsumable#add add method} directly.
 * However, it is important to understand how consumable values can be
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed}.
 * See {@link module:engine/conversion/downcasthelpers default downcast converters} for more information.
 *
 * Keep in mind that one conversion event may have multiple callbacks (converters) attached to it. Each of those is
 * able to convert one or more parts of the model. However, when one of those callbacks actually converts
 * something, the others should not, because they would duplicate the results. Using `ModelConsumable` helps to avoid
 * this situation, because callbacks should only convert these values that were not yet consumed from `ModelConsumable`.
 *
 * Consuming multiple values in a single callback:
 *
 * ```ts
 * // Converter for custom `imageBlock` element that might have a `caption` element inside which changes
 * // how the image is displayed in the view:
 * //
 * // Model:
 * //
 * // [imageBlock]
 * //   └─ [caption]
 * //       └─ foo
 * //
 * // View:
 * //
 * // <figure>
 * //   ├─ <img />
 * //   └─ <caption>
 * //       └─ foo
 * modelConversionDispatcher.on( 'insert:imageBlock', ( evt, data, conversionApi ) => {
 * 	// First, consume the `imageBlock` element.
 * 	conversionApi.consumable.consume( data.item, 'insert' );
 *
 * 	// Just create normal image element for the view.
 * 	// Maybe it will be "decorated" later.
 * 	const viewImage = new ViewElement( 'img' );
 * 	const insertPosition = conversionApi.mapper.toViewPosition( data.range.start );
 * 	const viewWriter = conversionApi.writer;
 *
 * 	// Check if the `imageBlock` element has children.
 * 	if ( data.item.childCount > 0 ) {
 * 		const modelCaption = data.item.getChild( 0 );
 *
 * 		// `modelCaption` insertion change is consumed from consumable values.
 * 		// It will not be converted by other converters, but it's children (probably some text) will be.
 * 		// Through mapping, converters for text will know where to insert contents of `modelCaption`.
 * 		if ( conversionApi.consumable.consume( modelCaption, 'insert' ) ) {
 * 			const viewCaption = new ViewElement( 'figcaption' );
 *
 * 			const viewImageHolder = new ViewElement( 'figure', null, [ viewImage, viewCaption ] );
 *
 * 			conversionApi.mapper.bindElements( modelCaption, viewCaption );
 * 			conversionApi.mapper.bindElements( data.item, viewImageHolder );
 * 			viewWriter.insert( insertPosition, viewImageHolder );
 * 		}
 * 	} else {
 * 		conversionApi.mapper.bindElements( data.item, viewImage );
 * 		viewWriter.insert( insertPosition, viewImage );
 * 	}
 *
 * 	evt.stop();
 * } );
 * ```
 */
export default class ModelConsumable {
	/**
	 * Contains list of consumable values.
	 */
	private _consumable = new Map<any, Map<string, boolean>>();

	/**
	 * For each {@link module:engine/model/textproxy~TextProxy} added to `ModelConsumable`, this registry holds a parent
	 * of that `TextProxy` and the start and end indices of that `TextProxy`. This allows identification of the `TextProxy`
	 * instances that point to the same part of the model but are different instances. Each distinct `TextProxy`
	 * is given a unique `Symbol` which is then registered as consumable. This process is transparent for the `ModelConsumable`
	 * API user because whenever `TextProxy` is added, tested, consumed or reverted, the internal mechanisms of
	 * `ModelConsumable` translate `TextProxy` to that unique `Symbol`.
	 */
	private _textProxyRegistry = new Map<number | null, Map<number | null, Map<unknown, symbol>>>();

	/**
	 * Adds a consumable value to the consumables list and links it with a given model item.
	 *
	 * ```ts
	 * modelConsumable.add( modelElement, 'insert' ); // Add `modelElement` insertion change to consumable values.
	 * modelConsumable.add( modelElement, 'addAttribute:bold' ); // Add `bold` attribute insertion on `modelElement` change.
	 * modelConsumable.add( modelElement, 'removeAttribute:bold' ); // Add `bold` attribute removal on `modelElement` change.
	 * modelConsumable.add( modelSelection, 'selection' ); // Add `modelSelection` to consumable values.
	 * modelConsumable.add( modelRange, 'range' ); // Add `modelRange` to consumable values.
	 * ```
	 *
	 * @param item Model item, range or selection that has the consumable.
	 * @param type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
	 * Second colon and everything after will be cut. Passing event name is a safe and good practice.
	 */
	public add(
		item: Item | Selection | DocumentSelection | Range,
		type: string
	): void {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item ) as any;
		}

		if ( !this._consumable.has( item ) ) {
			this._consumable.set( item, new Map() );
		}

		this._consumable.get( item )!.set( type, true );
	}

	/**
	 * Removes a given consumable value from a given model item.
	 *
	 * ```ts
	 * modelConsumable.consume( modelElement, 'insert' ); // Remove `modelElement` insertion change from consumable values.
	 * modelConsumable.consume( modelElement, 'addAttribute:bold' ); // Remove `bold` attribute insertion on `modelElement` change.
	 * modelConsumable.consume( modelElement, 'removeAttribute:bold' ); // Remove `bold` attribute removal on `modelElement` change.
	 * modelConsumable.consume( modelSelection, 'selection' ); // Remove `modelSelection` from consumable values.
	 * modelConsumable.consume( modelRange, 'range' ); // Remove 'modelRange' from consumable values.
	 * ```
	 *
	 * @param item Model item, range or selection from which consumable will be consumed.
	 * @param type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
	 * Second colon and everything after will be cut. Passing event name is a safe and good practice.
	 * @returns `true` if consumable value was available and was consumed, `false` otherwise.
	 */
	public consume(
		item: Item | Selection | DocumentSelection | Range,
		type: string
	): boolean {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item ) as any;
		}

		if ( this.test( item, type ) ) {
			this._consumable.get( item )!.set( type, false );

			return true;
		} else {
			return false;
		}
	}

	/**
	 * Tests whether there is a consumable value of a given type connected with a given model item.
	 *
	 * ```ts
	 * modelConsumable.test( modelElement, 'insert' ); // Check for `modelElement` insertion change.
	 * modelConsumable.test( modelElement, 'addAttribute:bold' ); // Check for `bold` attribute insertion on `modelElement` change.
	 * modelConsumable.test( modelElement, 'removeAttribute:bold' ); // Check for `bold` attribute removal on `modelElement` change.
	 * modelConsumable.test( modelSelection, 'selection' ); // Check if `modelSelection` is consumable.
	 * modelConsumable.test( modelRange, 'range' ); // Check if `modelRange` is consumable.
	 * ```
	 *
	 * @param item Model item, range or selection to be tested.
	 * @param type Consumable type. Will be normalized to a proper form, that is either `<word>` or `<part>:<part>`.
	 * Second colon and everything after will be cut. Passing event name is a safe and good practice.
	 * @returns `null` if such consumable was never added, `false` if the consumable values was
	 * already consumed or `true` if it was added and not consumed yet.
	 */
	public test(
		item: Item | Selection | DocumentSelection | Range,
		type: string
	): boolean | null {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item ) as any;
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
	 * Reverts consuming of a consumable value.
	 *
	 * ```ts
	 * modelConsumable.revert( modelElement, 'insert' ); // Revert consuming `modelElement` insertion change.
	 * modelConsumable.revert( modelElement, 'addAttribute:bold' ); // Revert consuming `bold` attribute insert from `modelElement`.
	 * modelConsumable.revert( modelElement, 'removeAttribute:bold' ); // Revert consuming `bold` attribute remove from `modelElement`.
	 * modelConsumable.revert( modelSelection, 'selection' ); // Revert consuming `modelSelection`.
	 * modelConsumable.revert( modelRange, 'range' ); // Revert consuming `modelRange`.
	 * ```
	 *
	 * @param item Model item, range or selection to be reverted.
	 * @param type Consumable type.
	 * @returns `true` if consumable has been reversed, `false` otherwise. `null` if the consumable has
	 * never been added.
	 */
	public revert(
		item: Item | Selection | DocumentSelection | Range,
		type: string
	): boolean | null {
		type = _normalizeConsumableType( type );

		if ( item instanceof TextProxy ) {
			item = this._getSymbolForTextProxy( item ) as any;
		}

		const test = this.test( item, type );

		if ( test === false ) {
			this._consumable.get( item )!.set( type, true );

			return true;
		} else if ( test === true ) {
			return false;
		}

		return null;
	}

	/**
	 * Verifies if all events from the specified group were consumed.
	 *
	 * @param eventGroup The events group to verify.
	 */
	public verifyAllConsumed( eventGroup: string ): void {
		const items = [];

		for ( const [ item, consumables ] of this._consumable ) {
			for ( const [ event, canConsume ] of consumables ) {
				const eventPrefix = event.split( ':' )[ 0 ];

				if ( canConsume && eventGroup == eventPrefix ) {
					items.push( {
						event,
						item: item.name || item.description
					} );
				}
			}
		}

		if ( items.length ) {
			/**
			 * Some of the {@link module:engine/model/item~Item model items} were not consumed while downcasting the model to view.
			 *
			 * This might be the effect of:
			 *
			 * * A missing converter for some model elements. Make sure that you registered downcast converters for all model elements.
			 * * A custom converter that does not consume converted items. Make sure that you
			 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} all model elements that you converted
			 * from the model to the view.
			 * * A custom converter that called `event.stop()`. When providing a custom converter, keep in mind that you should not stop
			 * the event. If you stop it then the default converter at the `lowest` priority will not trigger the conversion of this node's
			 * attributes and child nodes.
			 *
			 * @error conversion-model-consumable-not-consumed
			 * @param {Array.<module:engine/model/item~Item>} items Items that were not consumed.
			 */
			throw new CKEditorError( 'conversion-model-consumable-not-consumed', null, { items } );
		}
	}

	/**
	 * Gets a unique symbol for the passed {@link module:engine/model/textproxy~TextProxy} instance. All `TextProxy` instances that
	 * have same parent, same start index and same end index will get the same symbol.
	 *
	 * Used internally to correctly consume `TextProxy` instances.
	 *
	 * @internal
	 * @param textProxy `TextProxy` instance to get a symbol for.
	 * @returns Symbol representing all equal instances of `TextProxy`.
	 */
	public _getSymbolForTextProxy( textProxy: TextProxy ): symbol {
		let symbol = null;

		const startMap = this._textProxyRegistry.get( textProxy.startOffset );

		if ( startMap ) {
			const endMap = startMap.get( textProxy.endOffset );

			if ( endMap ) {
				symbol = endMap.get( textProxy.parent );
			}
		}

		if ( !symbol ) {
			symbol = this._addSymbolForTextProxy( textProxy );
		}

		return symbol;
	}

	/**
	 * Adds a symbol for the given {@link module:engine/model/textproxy~TextProxy} instance.
	 *
	 * Used internally to correctly consume `TextProxy` instances.
	 *
	 * @param textProxy Text proxy instance.
	 * @returns Symbol generated for given `TextProxy`.
	 */
	private _addSymbolForTextProxy( textProxy: TextProxy ): symbol {
		const start = textProxy.startOffset;
		const end = textProxy.endOffset;
		const parent = textProxy.parent;

		const symbol = Symbol( '$textProxy:' + textProxy.data );
		let startMap: Map<number | null, Map<unknown, symbol>> | undefined;
		let endMap: Map<unknown, symbol> | undefined;

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

/**
 * Returns a normalized consumable type name from the given string. A normalized consumable type name is a string that has
 * at most one colon, for example: `insert` or `addMarker:highlight`. If a string to normalize has more "parts" (more colons),
 * the further parts are dropped, for example: `addattribute:bold:$text` -> `addattributes:bold`.
 *
 * @param type Consumable type.
 * @returns Normalized consumable type.
 */
function _normalizeConsumableType( type: string ) {
	const parts = type.split( ':' );

	// For inserts allow passing event name, it's stored in the context of a specified element so the element name is not needed.
	if ( parts[ 0 ] == 'insert' ) {
		return parts[ 0 ];
	}

	// Markers are identified by the whole name (otherwise we would consume the whole markers group).
	if ( parts[ 0 ] == 'addMarker' || parts[ 0 ] == 'removeMarker' ) {
		return type;
	}

	return parts.length > 1 ? parts[ 0 ] + ':' + parts[ 1 ] : parts[ 0 ];
}
