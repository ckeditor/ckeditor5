/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/downcastdispatcher
 */

import Consumable from './modelconsumable';
import Range from '../model/range';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { extend } from 'lodash-es';

/**
 * `DowncastDispatcher` is a central point of downcasting (conversion from model to view), which is a process of reacting to changes
 * in the model and firing a set of events. Callbacks listening to those events are called converters. Those
 * converters role is to convert the model changes to changes in view (for example, adding view nodes or
 * changing attributes on view elements).
 *
 * During conversion process, `DowncastDispatcher` fires events, basing on state of the model and prepares
 * data for those events. It is important to understand that those events are connected with changes done on model,
 * for example: "node has been inserted" or "attribute has changed". This is in a contrary to upcasting (view to model conversion),
 * where we convert view state (view nodes) to a model tree.
 *
 * The events are prepared basing on a diff created by {@link module:engine/model/differ~Differ Differ}, which buffers them
 * and then passes to `DowncastDispatcher` as a diff between old model state and new model state.
 *
 * Note, that because changes are converted there is a need to have a mapping between model structure and view structure.
 * To map positions and elements during downcast (model to view conversion) use {@link module:engine/conversion/mapper~Mapper}.
 *
 * `DowncastDispatcher` fires following events for model tree changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert insert}
 * if a range of nodes has been inserted to the model tree,
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove remove}
 * if a range of nodes has been removed from the model tree,
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute attribute}
 * if attribute has been added, changed or removed from a model node.
 *
 * For {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert insert}
 * and {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute attribute},
 * `DowncastDispatcher` generates {@link module:engine/conversion/modelconsumable~ModelConsumable consumables}.
 * These are used to have a control over which changes has been already consumed. It is useful when some converters
 * overwrite other or converts multiple changes (for example converts insertion of an element and also converts that
 * element's attributes during insertion).
 *
 * Additionally, `DowncastDispatcher` fires events for {@link module:engine/model/markercollection~Marker marker} changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker} if a marker has been added,
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:removeMarker} if a marker has been removed.
 *
 * Note, that changing a marker is done through removing the marker from the old range, and adding on the new range,
 * so both those events are fired.
 *
 * Finally, `DowncastDispatcher` also handles firing events for {@link module:engine/model/selection model selection}
 * conversion:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:selection}
 * which converts selection from model to view,
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute}
 * which is fired for every selection attribute,
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}
 * which is fired for every marker which contains selection.
 *
 * Unlike model tree and markers, events for selection are not fired for changes but for selection state.
 *
 * When providing custom listeners for `DowncastDispatcher` remember to check whether given change has not been
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} yet.
 *
 * When providing custom listeners for `DowncastDispatcher` keep in mind that any callback that had
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} a value from a consumable and
 * converted the change should also stop the event (for efficiency purposes).
 *
 * When providing custom listeners for `DowncastDispatcher` remember to use provided
 * {@link module:engine/view/downcastwriter~DowncastWriter view downcast writer} to apply changes to the view document.
 *
 * Example of a custom converter for `DowncastDispatcher`:
 *
 *		// We will convert inserting "paragraph" model element into the model.
 *		downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
 *			// Remember to check whether the change has not been consumed yet and consume it.
 *			if ( conversionApi.consumable.consume( data.item, 'insert' ) ) {
 *				return;
 *			}
 *
 *			// Translate position in model to position in view.
 *			const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *
 *			// Create <p> element that will be inserted in view at `viewPosition`.
 *			const viewElement = conversionApi.writer.createContainerElement( 'p' );
 *
 *			// Bind the newly created view element to model element so positions will map accordingly in future.
 *			conversionApi.mapper.bindElements( data.item, viewElement );
 *
 *			// Add the newly created view element to the view.
 *			conversionApi.writer.insert( viewPosition, viewElement );
 *
 *			// Remember to stop the event propagation.
 *			evt.stop();
 *		} );
 */
export default class DowncastDispatcher {
	/**
	 * Creates a `DowncastDispatcher` instance.
	 *
	 * @see module:engine/conversion/downcastdispatcher~DowncastConversionApi
	 * @param {Object} conversionApi Additional properties for interface that will be passed to events fired
	 * by `DowncastDispatcher`.
	 */
	constructor( conversionApi ) {
		/**
		 * Interface passed by dispatcher to the events callbacks.
		 *
		 * @member {module:engine/conversion/downcastdispatcher~DowncastConversionApi}
		 */
		this.conversionApi = extend( { dispatcher: this }, conversionApi );
	}

	/**
	 * Takes {@link module:engine/model/differ~Differ model differ} object with buffered changes and fires conversion basing on it.
	 *
	 * @param {module:engine/model/differ~Differ} differ Differ object with buffered changes.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Markers connected with converted model.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertChanges( differ, markers, writer ) {
		// Before the view is updated, remove markers which have changed.
		for ( const change of differ.getMarkersToRemove() ) {
			this.convertMarkerRemove( change.name, change.range, writer );
		}

		// Convert changes that happened on model tree.
		for ( const entry of differ.getChanges() ) {
			if ( entry.type == 'insert' ) {
				this.convertInsert( Range._createFromPositionAndShift( entry.position, entry.length ), writer );
			} else if ( entry.type == 'remove' ) {
				this.convertRemove( entry.position, entry.length, entry.name, writer );
			} else {
				// entry.type == 'attribute'.
				this.convertAttribute( entry.range, entry.attributeKey, entry.attributeOldValue, entry.attributeNewValue, writer );
			}
		}

		for ( const markerName of this.conversionApi.mapper.flushUnboundMarkerNames() ) {
			const markerRange = markers.get( markerName ).getRange();

			this.convertMarkerRemove( markerName, markerRange, writer );
			this.convertMarkerAdd( markerName, markerRange, writer );
		}

		// After the view is updated, convert markers which have changed.
		for ( const change of differ.getMarkersToAdd() ) {
			this.convertMarkerAdd( change.name, change.range, writer );
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
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertInsert( range, writer ) {
		this.conversionApi.writer = writer;

		// Create a list of things that can be consumed, consisting of nodes and their attributes.
		this.conversionApi.consumable = this._createInsertConsumable( range );

		// Fire a separate insert event for each node and text fragment contained in the range.
		for ( const value of range ) {
			const item = value.item;
			const itemRange = Range._createFromPositionAndShift( value.previousPosition, value.length );
			const data = {
				item,
				range: itemRange
			};

			this._testAndFire( 'insert', data );

			// Fire a separate addAttribute event for each attribute that was set on inserted items.
			// This is important because most attributes converters will listen only to add/change/removeAttribute events.
			// If we would not add this part, attributes on inserted nodes would not be converted.
			for ( const key of item.getAttributeKeys() ) {
				data.attributeKey = key;
				data.attributeOldValue = null;
				data.attributeNewValue = item.getAttribute( key );

				this._testAndFire( `attribute:${ key }`, data );
			}
		}

		this._clearConversionApi();
	}

	/**
	 * Fires conversion of a single node removal. Fires {@link #event:remove remove event} with provided data.
	 *
	 * @param {module:engine/model/position~Position} position Position from which node was removed.
	 * @param {Number} length Offset size of removed node.
	 * @param {String} name Name of removed node.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertRemove( position, length, name, writer ) {
		this.conversionApi.writer = writer;

		this.fire( 'remove:' + name, { position, length }, this.conversionApi );

		this._clearConversionApi();
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
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertAttribute( range, key, oldValue, newValue, writer ) {
		this.conversionApi.writer = writer;

		// Create a list with attributes to consume.
		this.conversionApi.consumable = this._createConsumableForRange( range, `attribute:${ key }` );

		// Create a separate attribute event for each node in the range.
		for ( const value of range ) {
			const item = value.item;
			const itemRange = Range._createFromPositionAndShift( value.previousPosition, value.length );
			const data = {
				item,
				range: itemRange,
				attributeKey: key,
				attributeOldValue: oldValue,
				attributeNewValue: newValue
			};

			this._testAndFire( `attribute:${ key }`, data );
		}

		this._clearConversionApi();
	}

	/**
	 * Starts model selection conversion.
	 *
	 * Fires events for given {@link module:engine/model/selection~Selection selection} to start selection conversion.
	 *
	 * @fires selection
	 * @fires addMarker
	 * @fires attribute
	 * @param {module:engine/model/selection~Selection} selection Selection to convert.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Markers connected with converted model.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertSelection( selection, markers, writer ) {
		const markersAtSelection = Array.from( markers.getMarkersAtPosition( selection.getFirstPosition() ) );

		this.conversionApi.writer = writer;
		this.conversionApi.consumable = this._createSelectionConsumable( selection, markersAtSelection );

		this.fire( 'selection', { selection }, this.conversionApi );

		if ( !selection.isCollapsed ) {
			return;
		}

		for ( const marker of markersAtSelection ) {
			const markerRange = marker.getRange();

			if ( !shouldMarkerChangeBeConverted( selection.getFirstPosition(), marker, this.conversionApi.mapper ) ) {
				continue;
			}

			const data = {
				item: selection,
				markerName: marker.name,
				markerRange
			};

			if ( this.conversionApi.consumable.test( selection, 'addMarker:' + marker.name ) ) {
				this.fire( 'addMarker:' + marker.name, data, this.conversionApi );
			}
		}

		for ( const key of selection.getAttributeKeys() ) {
			const data = {
				item: selection,
				range: selection.getFirstRange(),
				attributeKey: key,
				attributeOldValue: null,
				attributeNewValue: selection.getAttribute( key )
			};

			// Do not fire event if the attribute has been consumed.
			if ( this.conversionApi.consumable.test( selection, 'attribute:' + data.attributeKey ) ) {
				this.fire( 'attribute:' + data.attributeKey + ':$text', data, this.conversionApi );
			}
		}

		this._clearConversionApi();
	}

	/**
	 * Converts added marker. Fires {@link #event:addMarker addMarker} event for each item
	 * in marker's range. If range is collapsed single event is dispatched. See event description for more details.
	 *
	 * @fires addMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange Marker range.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertMarkerAdd( markerName, markerRange, writer ) {
		// Do not convert if range is in graveyard or not in the document (e.g. in DocumentFragment).
		if ( !markerRange.root.document || markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		this.conversionApi.writer = writer;

		// In markers' case, event name == consumable name.
		const eventName = 'addMarker:' + markerName;

		//
		// First, fire an event for the whole marker.
		//
		const consumable = new Consumable();
		consumable.add( markerRange, eventName );

		this.conversionApi.consumable = consumable;

		this.fire( eventName, { markerName, markerRange }, this.conversionApi );

		//
		// Do not fire events for each item inside the range if the range got consumed.
		//
		if ( !consumable.test( markerRange, eventName ) ) {
			return;
		}

		//
		// Then, fire an event for each item inside the marker range.
		//
		this.conversionApi.consumable = this._createConsumableForRange( markerRange, eventName );

		for ( const item of markerRange.getItems() ) {
			// Do not fire event for already consumed items.
			if ( !this.conversionApi.consumable.test( item, eventName ) ) {
				continue;
			}

			const data = { item, range: Range._createOn( item ), markerName, markerRange };

			this.fire( eventName, data, this.conversionApi );
		}

		this._clearConversionApi();
	}

	/**
	 * Fires conversion of marker removal. Fires {@link #event:removeMarker removeMarker} event with provided data.
	 *
	 * @fires removeMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange Marker range.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify view document.
	 */
	convertMarkerRemove( markerName, markerRange, writer ) {
		// Do not convert if range is in graveyard or not in the document (e.g. in DocumentFragment).
		if ( !markerRange.root.document || markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		this.conversionApi.writer = writer;

		this.fire( 'removeMarker:' + markerName, { markerName, markerRange }, this.conversionApi );

		this._clearConversionApi();
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
			consumable.add( selection, 'addMarker:' + marker.name );
		}

		for ( const key of selection.getAttributeKeys() ) {
			consumable.add( selection, 'attribute:' + key );
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
	 */
	_testAndFire( type, data ) {
		if ( !this.conversionApi.consumable.test( data.item, type ) ) {
			// Do not fire event if the item was consumed.
			return;
		}

		const name = data.item.name || '$text';

		this.fire( type + ':' + name, data, this.conversionApi );
	}

	/**
	 * Clears conversion API object.
	 *
	 * @private
	 */
	_clearConversionApi() {
		delete this.conversionApi.writer;
		delete this.conversionApi.consumable;
	}

	/**
	 * Fired for inserted nodes.
	 *
	 * `insert` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `insert:name`. `name` is either `'$text'`, when {@link module:engine/model/text~Text a text node} has been inserted,
	 * or {@link module:engine/model/element~Element#name name} of inserted element.
	 *
	 * This way listeners can either listen to a general `insert` event or specific event (for example `insert:paragraph`).
	 *
	 * @event insert
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Inserted item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over inserted item.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in `DowncastDispatcher` constructor.
	 */

	/**
	 * Fired for removed nodes.
	 *
	 * `remove` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `remove:name`. `name` is either `'$text'`, when {@link module:engine/model/text~Text a text node} has been removed,
	 * or the {@link module:engine/model/element~Element#name name} of removed element.
	 *
	 * This way listeners can either listen to a general `remove` event or specific event (for example `remove:paragraph`).
	 *
	 * @event remove
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/position~Position} data.position Position from which the node has been removed.
	 * @param {Number} data.length Offset size of the removed node.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in `DowncastDispatcher` constructor.
	 */

	/**
	 * Fired in the following cases:
	 *
	 * * when an attribute has been added, changed, or removed from a node,
	 * * when a node with an attribute is inserted,
	 * * when collapsed model selection attribute is converted.
	 *
	 * `attribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `attribute:attributeKey:name`. `attributeKey` is the key of added/changed/removed attribute.
	 * `name` is either `'$text'` if change was on {@link module:engine/model/text~Text a text node},
	 * or the {@link module:engine/model/element~Element#name name} of element which attribute has changed.
	 *
	 * This way listeners can either listen to a general `attribute:bold` event or specific event (for example `attribute:src:image`).
	 *
	 * @event attribute
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item|module:engine/model/documentselection~DocumentSelection} data.item Changed item
	 * or converted selection.
	 * @param {module:engine/model/range~Range} data.range Range spanning over changed item or selection range.
	 * @param {String} data.attributeKey Attribute key.
	 * @param {*} data.attributeOldValue Attribute value before the change. This is `null` when selection attribute is converted.
	 * @param {*} data.attributeNewValue New attribute value.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in `DowncastDispatcher` constructor.
	 */

	/**
	 * Fired for {@link module:engine/model/selection~Selection selection} changes.
	 *
	 * @event selection
	 * @param {module:engine/model/selection~Selection} selection Selection that is converted.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in `DowncastDispatcher` constructor.
	 */

	/**
	 * Fired when a new marker is added to the model. Also fired when collapsed model selection that is inside marker is converted.
	 *
	 * `addMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `addMarker:markerName`. By specifying certain marker names, you can make the events even more gradual. For example,
	 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `addMarker:foo` or `addMarker:foo:abc` and
	 * `addMarker:foo:bar` events.
	 *
	 * If the marker range is not collapsed:
	 *
	 * * the event is fired for each item in the marker range one by one,
	 * * `conversionApi.consumable` includes each item of the marker range and the consumable value is same as event name.
	 *
	 * If the marker range is collapsed:
	 *
	 * * there is only one event,
	 * * `conversionApi.consumable` includes marker range with event name.
	 *
	 * If selection inside a marker is converted:
	 *
	 * * there is only one event,
	 * * `conversionApi.consumable` includes selection instance with event name.
	 *
	 * @event addMarker
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item|module:engine/model/selection~Selection} data.item Item inside the new marker or
	 * the selection that is being converted.
	 * @param {module:engine/model/range~Range} [data.range] Range spanning over converted item. Available only in marker conversion, if
	 * the marker range was not collapsed.
	 * @param {module:engine/model/range~Range} data.markerRange Marker range.
	 * @param {String} data.markerName Marker name.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in `DowncastDispatcher` constructor.
	 */

	/**
	 * Fired when marker is removed from the model.
	 *
	 * `removeMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `removeMarker:markerName`. By specifying certain marker names, you can make the events even more gradual. For example,
	 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `removeMarker:foo` or `removeMarker:foo:abc` and
	 * `removeMarker:foo:bar` events.
	 *
	 * @event removeMarker
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/range~Range} data.markerRange Marker range.
	 * @param {String} data.markerName Marker name.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in `DowncastDispatcher` constructor.
	 */
}

mix( DowncastDispatcher, EmitterMixin );

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

/**
 * Conversion interface that is registered for given {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}
 * and is passed as one of parameters when {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher dispatcher}
 * fires it's events.
 *
 * @interface module:engine/conversion/downcastdispatcher~DowncastConversionApi
 */

/**
 * The {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} instance.
 *
 * @member {module:engine/conversion/downcastdispatcher~DowncastDispatcher} #dispatcher
 */

/**
 * Stores information about what parts of processed model item are still waiting to be handled. After a piece of model item
 * was converted, appropriate consumable value should be {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed}.
 *
 * @member {module:engine/conversion/modelconsumable~ModelConsumable} #consumable
 */

/**
 * The {@link module:engine/conversion/mapper~Mapper} instance.
 *
 * @member {module:engine/conversion/mapper~Mapper} #mapper
 */

/**
 * The {@link module:engine/view/downcastwriter~DowncastWriter} instance used to manipulate data during conversion.
 *
 * @member {module:engine/view/downcastwriter~DowncastWriter} #writer
 */
