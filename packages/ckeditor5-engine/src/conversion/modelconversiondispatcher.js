/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/modelconversiondispatcher
 */

import Consumable from './modelconsumable';
import Range from '../model/range';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import extend from '@ckeditor/ckeditor5-utils/src/lib/lodash/extend';

/**
 * `ModelConversionDispatcher` is a central point of model conversion, which is a process of reacting to changes
 * in the model and firing a set of events. Callbacks listening to those events are called converters. Those
 * converters role is to convert the model changes to changes in view (for example, adding view nodes or
 * changing attributes on view elements).
 *
 * During conversion process, `ModelConversionDispatcher` fires events, basing on state of the model and prepares
 * data for those events. It is important to understand that those events are connected with changes done on model,
 * for example: "node has been inserted" or "attribute has changed". This is in contrary to view to model conversion,
 * where we convert view state (view nodes) to a model tree.
 *
 * The events are prepared basing on a diff created by {@link module:engine/model/differ~Differ Differ}, which buffers them
 * and then passes to `ModelConversionDispatcher` as a diff between old model state and new model state.
 *
 * Note, that because changes are converted there is a need to have a mapping between model structure and view structure.
 * To map positions and elements during model to view conversion use {@link module:engine/conversion/mapper~Mapper}.
 *
 * `ModelConversionDispatcher` fires following events for model tree changes:
 * * {@link #event:insert insert} if a range of nodes has been inserted to the model tree,
 * * {@link #event:remove remove} if a range of nodes has been removed from the model tree,
 * * {@link #event:attribute attribute} if attribute has been added, changed or removed from a model node.
 *
 * For {@link #event:insert insert} and {@link #event:attribute attribute}, `ModelConversionDispatcher` generates
 * {@link module:engine/conversion/modelconsumable~ModelConsumable consumables}. These are used to have a control
 * over which changes has been already consumed. It is useful when some converters overwrite other or converts multiple
 * changes (for example converts insertion of an element and also converts that element's attributes during insertion).
 *
 * Additionally, `ModelConversionDispatcher` fires events for {@link module:engine/model/markerscollection~Marker marker} changes:
 * * {@link #event:addMarker} if a marker has been added,
 * * {@link #event:removeMarker} if a marker has been removed.
 *
 * Note, that changing a marker is done through removing the marker from the old range, and adding on the new range,
 * so both those events are fired.
 *
 * Finally, `ModelConversionDispatcher` also handles firing events for {@link module:engine/model/selection model selection}
 * conversion:
 * * {@link #event:selection} which converts selection from model to view,
 * * {@link #event:selectionAttribute} which is fired for every selection attribute,
 * * {@link #event:selectionMarker} which is fired for every marker which contains selection.
 *
 * Unlike model tree and markers, events for selection are not fired for changes but for selection state.
 *
 * When providing custom listeners for `ModelConversionDispatcher` remember to check whether given change has not been
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} yet.
 *
 * When providing custom listeners for `ModelConversionDispatcher` keep in mind that any callback that had
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} a value from a consumable and
 * converted the change should also stop the event (for efficiency purposes).
 *
 * Example of a custom converter for `ModelConversionDispatcher`:
 *
 *		// We will convert inserting "paragraph" model element into the model.
 *		modelDispatcher.on( 'insert:paragraph', ( evt, data, consumable, conversionApi ) => {
 *			// Remember to check whether the change has not been consumed yet and consume it.
 *			if ( consumable.consume( data.item, 'insert' ) ) {
 *				return;
 *			}
 *
 *			// Translate position in model to position in view.
 *			const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *
 *			// Create <p> element that will be inserted in view at `viewPosition`.
 *			const viewElement = new ViewElement( 'p' );
 *
 *			// Bind the newly created view element to model element so positions will map accordingly in future.
 *			conversionApi.mapper.bindElements( data.item, viewElement );
 *
 *			// Add the newly created view element to the view.
 *			viewWriter.insert( viewPosition, viewElement );
 *
 *			// Remember to stop the event propagation.
 *			evt.stop();
 *		} );
 *
 * Callback that overrides other callback:
 *
 *		// Special converter for `linkHref` attribute added on custom `quote` element. Note, that this
 *		// attribute may be the same as the attribute added by other features (link feature in this case).
 *		// It might be even added by that feature! It makes sense that a part of content that is a quote is linked
 *		// to an external source so it makes sense that link feature works on the custom quote element.
 *		// However, we have to make sure that the attributes added by link feature are correctly converted.
 *		// To block default `linkHref` conversion we have to:
 *		// 1) add this callback with higher priority than link feature callback,
 *		// 2) consume `linkHref` attribute add change.
 *		modelConversionDispatcher.on( 'attribute:linkHref:quote', ( evt, data, consumable, conversionApi ) => {
 *			if ( consumable.consume( data.item, 'attribute:linkHref' ) ) {
 *				return;
 *			}
 *
 *			// Create a button that will represent the `linkHref` attribute.
 *			let viewSourceBtn = new ViewElement( 'a', {
 *				href: data.item.getAttribute( 'linkHref' ),
 *				title: 'source',
 *				class: 'source'
 *			} );
 *
 *			// Insert the button using writer API.
 *			// Note that attribute conversion is fired after insert conversion.
 *			// This means that we are safe to assume that the model `quote` element has already been converter to view.
 *			// `data.item` is model element on which attribute changed.
 *			const viewQuote = conversionApi.mapper.toViewElement( data.item );
 *			// Put `viewSourceBtn` at the end of quote.
 *			const position = ViewPosition.createAt( viewQuote, 'end' );
 *			viewWriter.insert( position, viewSourceBtn );
 *
 *			evt.stop();
 *		}, { priority: 'high' } );
 */
export default class ModelConversionDispatcher {
	/**
	 * Creates a `ModelConversionDispatcher` instance.
	 *
	 * @param {module:engine/model/model~Model} model Data model.
	 * @param {Object} [conversionApi] Interface passed by dispatcher to the events calls.
	 */
	constructor( model, conversionApi = {} ) {
		/**
		 * Data model instance bound with this dispatcher.
		 *
		 * @private
		 * @member {module:engine/model/model~Model}
		 */
		this._model = model;

		/**
		 * Interface passed by dispatcher to the events callbacks.
		 *
		 * @member {Object}
		 */
		this.conversionApi = extend( { dispatcher: this }, conversionApi );
	}

	/**
	 * Takes {@link module:engine/model/differ~Differ model differ} object with buffered changes and fires conversion basing on it.
	 *
	 * @param {module:engine/model/differ~Differ} differ Differ object with buffered changes.
	 */
	convertChanges( differ ) {
		// First, before changing view structure, remove all markers that has changed.
		for ( const change of differ.getMarkersToRemove() ) {
			this.convertMarkerRemove( change.name, change.range );
		}

		// Convert changes that happened on model tree.
		for ( const entry of differ.getChanges() ) {
			// Skip all the changes that happens in graveyard. These are not converted.
			if ( entry.position.root.rootName == '$graveyard' ) {
				continue;
			}

			if ( entry.type == 'insert' ) {
				this.convertInsert( Range.createFromPositionAndShift( entry.position, entry.length ) );
			} else if ( entry.type == 'remove' ) {
				this.convertRemove( entry.position, entry.length, entry.name );
			} else {
				this.convertAttribute( entry.range, entry.attributeKey, entry.attributeOldValue, entry.attributeNewValue );
			}
		}

		// After the view is updated, convert markers which has changed.
		for ( const change of differ.getMarkersToAdd() ) {
			this.convertMarkerAdd( change.name, change.range );
		}
	}

	/**
	 * Starts conversion of a range insertion.
	 *
	 * For each node in the range, {@link #event:insert insert event is fired}. For each attribute on each node,
	 * {@link #event:attribute attribute event is fired}.
	 *
	 * @fires insert
	 * @fires attribute
	 * @param {module:engine/model/range~Range} range Inserted range.
	 */
	convertInsert( range ) {
		// Create a list of things that can be consumed, consisting of nodes and their attributes.
		const consumable = this._createInsertConsumable( range );

		// Fire a separate insert event for each node and text fragment contained in the range.
		for ( const value of range ) {
			const item = value.item;
			const itemRange = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const data = {
				item,
				range: itemRange
			};

			this._testAndFire( 'insert', data, consumable );

			// Fire a separate addAttribute event for each attribute that was set on inserted items.
			// This is important because most attributes converters will listen only to add/change/removeAttribute events.
			// If we would not add this part, attributes on inserted nodes would not be converted.
			for ( const key of item.getAttributeKeys() ) {
				data.attributeKey = key;
				data.attributeOldValue = null;
				data.attributeNewValue = item.getAttribute( key );

				this._testAndFire( `attribute:${ key }`, data, consumable );
			}
		}
	}

	/**
	 * Fires conversion of a single node removal. Fires {@link #event:remove remove event} with provided data.
	 *
	 * @param {module:engine/model/position~Position} position Position from which node was removed.
	 * @param {Number} length Offset size of removed node.
	 * @param {String} name Name of removed node.
	 */
	convertRemove( position, length, name ) {
		this.fire( 'remove:' + name, { position, length }, this.conversionApi );
	}

	/**
	 * Starts conversion of attribute change on given `range`.
	 *
	 * For each node in the given `range`, {@link #event:attribute attribute event} is fired with the passed data.
	 *
	 * @fires attribute
	 * @param {module:engine/model/range~Range} range Changed range.
	 * @param {String} key Key of the attribute that has changed.
	 * @param {*} oldValue Attribute value before the change or `null` if the attribute has not been set before.
	 * @param {*} newValue New attribute value or `null` if the attribute has been removed.
	 */
	convertAttribute( range, key, oldValue, newValue ) {
		// Create a list with attributes to consume.
		const consumable = this._createConsumableForRange( range, `attribute:${ key }` );

		// Create a separate attribute event for each node in the range.
		for ( const value of range ) {
			const item = value.item;
			const itemRange = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const data = {
				item,
				range: itemRange,
				attributeKey: key,
				attributeOldValue: oldValue,
				attributeNewValue: newValue
			};

			this._testAndFire( `attribute:${ key }`, data, consumable );
		}
	}

	/**
	 * Starts model selection conversion.
	 *
	 * Fires events for given {@link module:engine/model/selection~Selection selection} to start selection conversion.
	 *
	 * @fires selection
	 * @fires selectionMarker
	 * @fires selectionAttribute
	 * @param {module:engine/model/selection~Selection} selection Selection to convert.
	 */
	convertSelection( selection ) {
		const markers = Array.from( this._model.markers.getMarkersAtPosition( selection.getFirstPosition() ) );
		const consumable = this._createSelectionConsumable( selection, markers );

		this.fire( 'selection', { selection }, consumable, this.conversionApi );

		for ( const marker of markers ) {
			const markerRange = marker.getRange();

			if ( !shouldMarkerChangeBeConverted( selection.getFirstPosition(), marker, this.conversionApi.mapper ) ) {
				continue;
			}

			const data = {
				selection,
				markerName: marker.name,
				markerRange
			};

			if ( consumable.test( selection, 'selectionMarker:' + marker.name ) ) {
				this.fire( 'selectionMarker:' + marker.name, data, consumable, this.conversionApi );
			}
		}

		for ( const key of selection.getAttributeKeys() ) {
			const data = {
				selection,
				key,
				value: selection.getAttribute( key )
			};

			// Do not fire event if the attribute has been consumed.
			if ( consumable.test( selection, 'selectionAttribute:' + data.key ) ) {
				this.fire( 'selectionAttribute:' + data.key, data, consumable, this.conversionApi );
			}
		}
	}

	/**
	 * Converts added marker. Fires {@link #event:addMarker addMarker} event for each item
	 * in marker's range. If range is collapsed single event is dispatched. See event description for more details.
	 *
	 * @fires addMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange Marker range.
	 */
	convertMarkerAdd( markerName, markerRange ) {
		// Do not convert if range is in graveyard or not in the document (e.g. in DocumentFragment).
		if ( !markerRange.root.document || markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		// In markers' case, event name == consumable name.
		const eventName = 'addMarker:' + markerName;

		// When range is collapsed - fire single event with collapsed range in consumable.
		if ( markerRange.isCollapsed ) {
			const consumable = new Consumable();
			consumable.add( markerRange, eventName );

			this.fire( eventName, {
				markerName,
				markerRange
			}, consumable, this.conversionApi );

			return;
		}

		// Create consumable for each item in range.
		const consumable = this._createConsumableForRange( markerRange, eventName );

		// Create separate event for each node in the range.
		for ( const item of markerRange.getItems() ) {
			// Do not fire event for already consumed items.
			if ( !consumable.test( item, eventName ) ) {
				continue;
			}

			const data = { item, range: Range.createOn( item ), markerName, markerRange };

			this.fire( eventName, data, consumable, this.conversionApi );
		}
	}

	/**
	 * Fires conversion of marker removal. Fires {@link #event:removeMarker removeMarker} event with provided data.
	 *
	 * @fires removeMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange Marker range.
	 */
	convertMarkerRemove( markerName, markerRange ) {
		// Do not convert if range is in graveyard or not in the document (e.g. in DocumentFragment).
		if ( !markerRange.root.document || markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		this.fire( 'removeMarker:' + markerName, { markerName, markerRange }, this.conversionApi );
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume from given range,
	 * assuming that the range has just been inserted to the model.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Inserted range.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createInsertConsumable( range ) {
		const consumable = new Consumable();

		for ( const value of range ) {
			const item = value.item;

			consumable.add( item, 'insert' );

			for ( const key of item.getAttributeKeys() ) {
				consumable.add( item, 'attribute:' + key );
			}
		}

		return consumable;
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume for given range.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Affected range.
	 * @param {String} type Consumable type.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createConsumableForRange( range, type ) {
		const consumable = new Consumable();

		for ( const item of range.getItems() ) {
			consumable.add( item, type );
		}

		return consumable;
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with selection consumable values.
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} selection Selection to create consumable from.
	 * @param {Iterable.<module:engine/model/markercollection~Marker>} markers Markers which contains selection.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createSelectionConsumable( selection, markers ) {
		const consumable = new Consumable();

		consumable.add( selection, 'selection' );

		for ( const marker of markers ) {
			consumable.add( selection, 'selectionMarker:' + marker.name );
		}

		for ( const key of selection.getAttributeKeys() ) {
			consumable.add( selection, 'selectionAttribute:' + key );
		}

		return consumable;
	}

	/**
	 * Tests passed `consumable` to check whether given event can be fired and if so, fires it.
	 *
	 * @private
	 * @fires insert
	 * @fires attribute
	 * @param {String} type Event type.
	 * @param {Object} data Event data.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 */
	_testAndFire( type, data, consumable ) {
		if ( !consumable.test( data.item, type ) ) {
			// Do not fire event if the item was consumed.
			return;
		}

		const name = data.item.name || '$text';

		this.fire( type + ':' + name, data, consumable, this.conversionApi );
	}

	/**
	 * Fired for inserted nodes.
	 *
	 * `insert` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `insert:<name>`. `name` is either `'$text'`, when {@link module:engine/model/text~Text a text node} has been inserted,
	 * or {@link module:engine/model/element~Element#name name} of inserted element.
	 *
	 * This way listeners can either listen to a general `insert` event or specific event (for example `insert:paragraph`).
	 *
	 * @event insert
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Inserted item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over inserted item.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for removed nodes.
	 *
	 * `remove` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `remove:<name>`. `name` is either `'$text'`, when {@link module:engine/model/text~Text a text node} has been removed,
	 * or the {@link module:engine/model/element~Element#name name} of removed element.
	 *
	 * This way listeners can either listen to a general `remove` event or specific event (for example `remove:paragraph`).
	 *
	 * @event remove
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/position~Position} data.sourcePosition Position from where the range has been removed.
	 * @param {module:engine/model/range~Range} data.range Removed range (in {@link module:engine/model/document~Document#graveyard
	 * graveyard root}).
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when attribute has been added/changed/removed from a node.
	 *
	 * `attribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `attribute:<attributeKey>:<name>`. `attributeKey` is the key of added/changed/removed attribute.
	 * `name` is either `'$text'` if change was on {@link module:engine/model/text~Text a text node},
	 * or the {@link module:engine/model/element~Element#name name} of element which attribute has changed.
	 *
	 * This way listeners can either listen to a general `attribute:bold` event or specific event (for example `attribute:src:image`).
	 *
	 * @event attribute
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Changed item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over changed item.
	 * @param {String} data.attributeKey Attribute key.
	 * @param {*} data.attributeOldValue Attribute value before the change.
	 * @param {*} data.attributeNewValue New attribute value.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for {@link module:engine/model/selection~Selection selection} changes.
	 *
	 * @event selection
	 * @param {module:engine/model/selection~Selection} selection Selection that is converted.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for {@link module:engine/model/selection~Selection selection} attributes changes.
	 *
	 * `selectionAttribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `selectionAttribute:<attributeKey>`. `attributeKey` is the key of selection attribute. This way listen can listen to
	 * certain attribute, i.e. `selectionAttribute:bold`.
	 *
	 * @event selectionAttribute
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/selection~Selection} data.selection Selection that is converted.
	 * @param {String} data.attributeKey Key of changed attribute.
	 * @param {*} data.attributeValue Value of changed attribute.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when a new marker is added to the model.
	 *
	 * `addMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `addMarker:<markerName>`. By specifying certain marker names, you can make the events even more gradual. For example,
	 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `addMarker:foo` or `addMarker:foo:abc` and
	 * `addMarker:foo:bar` events.
	 *
	 * The event is fired for each item in the marker range, one by one.
	 *
	 * @event addMarker
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Item inside the new marker.
	 * @param {module:engine/model/range~Range} data.range Range spanning over converted item.
	 * @param {module:engine/model/range~Range} data.range Marker range.
	 * @param {String} data.markerName Marker name.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when marker is removed from the model.
	 *
	 * `removeMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `removeMarker:<markerName>`. By specifying certain marker names, you can make the events even more gradual. For example,
	 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `removeMarker:foo` or `removeMarker:foo:abc` and
	 * `removeMarker:foo:bar` events.
	 *
	 * @event removeMarker
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/range~Range} data.range Marker range.
	 * @param {String} data.markerName Marker name.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */
}

mix( ModelConversionDispatcher, EmitterMixin );

// Helper function, checks whether change of `marker` at `modelPosition` should be converted. Marker changes are not
// converted if they happen inside an element with custom conversion method.
//
// @param {module:engine/model/position~Position} modelPosition
// @param {module:engine/model/markercollection~Marker} marker
// @param {module:engine/conversion/mapper~Mapper} mapper
// @returns {Boolean}
function shouldMarkerChangeBeConverted( modelPosition, marker, mapper ) {
	const range = marker.getRange();
	const ancestors = Array.from( modelPosition.getAncestors() );
	ancestors.shift(); // Remove root element. It cannot be passed to `model.Range#containsItem`.
	ancestors.reverse();

	const hasCustomHandling = ancestors.some( element => {
		if ( range.containsItem( element ) ) {
			const viewElement = mapper.toViewElement( element );

			return !!viewElement.getCustomProperty( 'addHighlight' );
		}
	} );

	return !hasCustomHandling;
}
