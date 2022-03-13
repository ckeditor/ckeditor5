/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/downcastdispatcher
 */

import Consumable from './modelconsumable';
import Range from '../model/range';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The downcast dispatcher is a central point of downcasting (conversion from the model to the view), which is a process of reacting
 * to changes in the model and firing a set of events. The callbacks listening to these events are called converters. The
 * converters' role is to convert the model changes to changes in view (for example, adding view nodes or
 * changing attributes on view elements).
 *
 * During the conversion process, downcast dispatcher fires events basing on the state of the model and prepares
 * data for these events. It is important to understand that the events are connected with the changes done on the model,
 * for example: "a node has been inserted" or "an attribute has changed". This is in contrary to upcasting (a view-to-model conversion)
 * where you convert the view state (view nodes) to a model tree.
 *
 * The events are prepared basing on a diff created by the {@link module:engine/model/differ~Differ Differ}, which buffers them
 * and then passes to the downcast dispatcher as a diff between the old model state and the new model state.
 *
 * Note that because the changes are converted, there is a need to have a mapping between the model structure and the view structure.
 * To map positions and elements during the downcast (a model-to-view conversion), use {@link module:engine/conversion/mapper~Mapper}.
 *
 * Downcast dispatcher fires the following events for model tree changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`} &ndash;
 * If a range of nodes was inserted to the model tree.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:remove `remove`} &ndash;
 * If a range of nodes was removed from the model tree.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`} &ndash;
 * If an attribute was added, changed or removed from a model node.
 *
 * For {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:insert `insert`}
 * and {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`},
 * the downcast dispatcher generates {@link module:engine/conversion/modelconsumable~ModelConsumable consumables}.
 * These are used to have control over which changes have already been consumed. It is useful when some converters
 * overwrite others or convert multiple changes (for example, it converts an insertion of an element and also converts that
 * element's attributes during the insertion).
 *
 * Additionally, downcast dispatcher fires events for {@link module:engine/model/markercollection~Marker marker} changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker `addMarker`} &ndash; If a marker was added.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:removeMarker `removeMarker`} &ndash; If a marker was
 * removed.
 *
 * Note that changing a marker is done through removing the marker from the old range and adding it to the new range,
 * so both of these events are fired.
 *
 * Finally, a downcast dispatcher also handles firing events for the {@link module:engine/model/selection model selection}
 * conversion:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:selection `selection`}
 * &ndash; Converts the selection from the model to the view.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute `attribute`}
 * &ndash; Fired for every selection attribute.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker `addMarker`}
 * &ndash; Fired for every marker that contains a selection.
 *
 * Unlike the model tree and the markers, the events for selection are not fired for changes but for a selection state.
 *
 * When providing custom listeners for a downcast dispatcher, remember to check whether a given change has not been
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} yet.
 *
 * When providing custom listeners for a downcast dispatcher, keep in mind that you **should not** stop the event. If you stop it,
 * then the default converter at the `lowest` priority will not trigger the conversion of this node's attributes and child nodes.
 *
 * When providing custom listeners for a downcast dispatcher, remember to use the provided
 * {@link module:engine/view/downcastwriter~DowncastWriter view downcast writer} to apply changes to the view document.
 *
 * You can read more about conversion in the following guide:
 *
 * * {@glink framework/guides/deep-dive/conversion/downcast Downcast conversion}
 *
 * An example of a custom converter for the downcast dispatcher:
 *
 *		// You will convert inserting a "paragraph" model element into the model.
 *		downcastDispatcher.on( 'insert:paragraph', ( evt, data, conversionApi ) => {
 *			// Remember to check whether the change has not been consumed yet and consume it.
 *			if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
 *				return;
 *			}
 *
 *			// Translate the position in the model to a position in the view.
 *			const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *
 *			// Create a <p> element that will be inserted into the view at the `viewPosition`.
 *			const viewElement = conversionApi.writer.createContainerElement( 'p' );
 *
 *			// Bind the newly created view element to the model element so positions will map accordingly in the future.
 *			conversionApi.mapper.bindElements( data.item, viewElement );
 *
 *			// Add the newly created view element to the view.
 *			conversionApi.writer.insert( viewPosition, viewElement );
 *		} );
 */
export default class DowncastDispatcher {
	/**
	 * Creates a downcast dispatcher instance.
	 *
	 * @see module:engine/conversion/downcastdispatcher~DowncastConversionApi
	 * @param {Object} conversionApi Additional properties for an interface that will be passed to events fired
	 * by the downcast dispatcher.
	 */
	constructor( conversionApi ) {
		/**
		 * A template for an interface passed by the dispatcher to the event callbacks.
		 *
		 * @protected
		 * @member {module:engine/conversion/downcastdispatcher~DowncastConversionApi}
		 */
		this._conversionApi = { dispatcher: this, ...conversionApi };

		/**
		 * A map of already fired events for a given `ModelConsumable`.
		 *
		 * @private
		 * @member {WeakMap.<module:engine/conversion/downcastdispatcher~DowncastConversionApi,Map>}
		 */
		this._firedEventsMap = new WeakMap();
	}

	/**
	 * Converts changes buffered in the given {@link module:engine/model/differ~Differ model differ}
	 * and fires conversion events based on it.
	 *
	 * @fires insert
	 * @fires remove
	 * @fires attribute
	 * @fires addMarker
 	 * @fires removeMarker
	 * @fires reduceChanges
	 * @param {module:engine/model/differ~Differ} differ The differ object with buffered changes.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Markers related to the model fragment to convert.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer that should be used to modify the view document.
	 */
	convertChanges( differ, markers, writer ) {
		const conversionApi = this._createConversionApi( writer, differ.getRefreshedItems() );

		// Before the view is updated, remove markers which have changed.
		for ( const change of differ.getMarkersToRemove() ) {
			this._convertMarkerRemove( change.name, change.range, conversionApi );
		}

		// Let features modify the change list (for example to allow reconversion).
		const changes = this._reduceChanges( differ.getChanges() );

		// Convert changes that happened on model tree.
		for ( const entry of changes ) {
			if ( entry.type === 'insert' ) {
				this._convertInsert( Range._createFromPositionAndShift( entry.position, entry.length ), conversionApi );
			} else if ( entry.type === 'reinsert' ) {
				this._convertReinsert( Range._createFromPositionAndShift( entry.position, entry.length ), conversionApi );
			} else if ( entry.type === 'remove' ) {
				this._convertRemove( entry.position, entry.length, entry.name, conversionApi );
			} else {
				// Defaults to 'attribute' change.
				this._convertAttribute( entry.range, entry.attributeKey, entry.attributeOldValue, entry.attributeNewValue, conversionApi );
			}
		}

		for ( const markerName of conversionApi.mapper.flushUnboundMarkerNames() ) {
			const markerRange = markers.get( markerName ).getRange();

			this._convertMarkerRemove( markerName, markerRange, conversionApi );
			this._convertMarkerAdd( markerName, markerRange, conversionApi );
		}

		// After the view is updated, convert markers which have changed.
		for ( const change of differ.getMarkersToAdd() ) {
			this._convertMarkerAdd( change.name, change.range, conversionApi );
		}

		// Remove mappings for all removed view elements.
		conversionApi.mapper.flushDeferredBindings();

		// Verify if all insert consumables were consumed.
		conversionApi.consumable.verifyAllConsumed( 'insert' );
	}

	/**
	 * Starts a conversion of a model range and the provided markers.
	 *
	 * @fires insert
	 * @fires attribute
	 * @fires addMarker
	 * @param {module:engine/model/range~Range} range The inserted range.
	 * @param {Map<String,module:engine/model/range~Range>} markers The map of markers that should be down-casted.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer that should be used to modify the view document.
	 * @param {Object} [options] Optional options object passed to `convertionApi.options`.
	 */
	convert( range, markers, writer, options = {} ) {
		const conversionApi = this._createConversionApi( writer, undefined, options );

		this._convertInsert( range, conversionApi );

		for ( const [ name, range ] of markers ) {
			this._convertMarkerAdd( name, range, conversionApi );
		}

		// Verify if all insert consumables were consumed.
		conversionApi.consumable.verifyAllConsumed( 'insert' );
	}

	/**
	 * Starts the model selection conversion.
	 *
	 * Fires events for a given {@link module:engine/model/selection~Selection selection} to start the selection conversion.
	 *
	 * @fires selection
	 * @fires addMarker
	 * @fires attribute
	 * @param {module:engine/model/selection~Selection} selection The selection to convert.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Markers connected with the converted model.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify the view document.
	 */
	convertSelection( selection, markers, writer ) {
		const markersAtSelection = Array.from( markers.getMarkersAtPosition( selection.getFirstPosition() ) );

		const conversionApi = this._createConversionApi( writer );

		this._addConsumablesForSelection( conversionApi.consumable, selection, markersAtSelection );

		this.fire( 'selection', { selection }, conversionApi );

		if ( !selection.isCollapsed ) {
			return;
		}

		for ( const marker of markersAtSelection ) {
			const markerRange = marker.getRange();

			if ( !shouldMarkerChangeBeConverted( selection.getFirstPosition(), marker, conversionApi.mapper ) ) {
				continue;
			}

			const data = {
				item: selection,
				markerName: marker.name,
				markerRange
			};

			if ( conversionApi.consumable.test( selection, 'addMarker:' + marker.name ) ) {
				this.fire( 'addMarker:' + marker.name, data, conversionApi );
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
			if ( conversionApi.consumable.test( selection, 'attribute:' + data.attributeKey ) ) {
				this.fire( 'attribute:' + data.attributeKey + ':$text', data, conversionApi );
			}
		}
	}

	/**
	 * Fires insertion conversion of a range of nodes.
	 *
	 * For each node in the range, {@link #event:insert `insert` event is fired}. For each attribute on each node,
	 * {@link #event:attribute `attribute` event is fired}.
	 *
	 * @protected
	 * @fires insert
	 * @fires attribute
	 * @param {module:engine/model/range~Range} range The inserted range.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 * @param {Object} [options]
	 * @param {Boolean} [options.doNotAddConsumables=false] Whether the ModelConsumable should not get populated
	 * for items in the provided range.
	 */
	_convertInsert( range, conversionApi, options = {} ) {
		if ( !options.doNotAddConsumables ) {
			// Collect a list of things that can be consumed, consisting of nodes and their attributes.
			this._addConsumablesForInsert( conversionApi.consumable, Array.from( range ) );
		}

		// Fire a separate insert event for each node and text fragment contained in the range.
		for ( const data of Array.from( range.getWalker( { shallow: true } ) ).map( walkerValueToEventData ) ) {
			this._testAndFire( 'insert', data, conversionApi );
		}
	}

	/**
	 * Fires conversion of a single node removal. Fires {@link #event:remove remove event} with provided data.
	 *
	 * @protected
	 * @param {module:engine/model/position~Position} position Position from which node was removed.
	 * @param {Number} length Offset size of removed node.
	 * @param {String} name Name of removed node.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_convertRemove( position, length, name, conversionApi ) {
		this.fire( 'remove:' + name, { position, length }, conversionApi );
	}

	/**
	 * Starts a conversion of an attribute change on a given `range`.
	 *
	 * For each node in the given `range`, {@link #event:attribute attribute event} is fired with the passed data.
	 *
	 * @protected
	 * @fires attribute
	 * @param {module:engine/model/range~Range} range Changed range.
	 * @param {String} key Key of the attribute that has changed.
	 * @param {*} oldValue Attribute value before the change or `null` if the attribute has not been set before.
	 * @param {*} newValue New attribute value or `null` if the attribute has been removed.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_convertAttribute( range, key, oldValue, newValue, conversionApi ) {
		// Create a list with attributes to consume.
		this._addConsumablesForRange( conversionApi.consumable, range, `attribute:${ key }` );

		// Create a separate attribute event for each node in the range.
		for ( const value of range ) {
			const data = {
				item: value.item,
				range: Range._createFromPositionAndShift( value.previousPosition, value.length ),
				attributeKey: key,
				attributeOldValue: oldValue,
				attributeNewValue: newValue
			};

			this._testAndFire( `attribute:${ key }`, data, conversionApi );
		}
	}

	/**
	 * Fires re-insertion conversion (with a `reconversion` flag passed to `insert` events)
	 * of a range of elements (only elements on the range depth, without children).
	 *
	 * For each node in the range on its depth (without children), {@link #event:insert `insert` event} is fired.
	 * For each attribute on each node, {@link #event:attribute `attribute` event} is fired.
	 *
	 * @protected
	 * @fires insert
	 * @fires attribute
	 * @param {module:engine/model/range~Range} range The range to reinsert.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_convertReinsert( range, conversionApi ) {
		// Convert the elements - without converting children.
		const walkerValues = Array.from( range.getWalker( { shallow: true } ) );

		// Collect a list of things that can be consumed, consisting of nodes and their attributes.
		this._addConsumablesForInsert( conversionApi.consumable, walkerValues );

		// Fire a separate insert event for each node and text fragment contained shallowly in the range.
		for ( const data of walkerValues.map( walkerValueToEventData ) ) {
			this._testAndFire( 'insert', { ...data, reconversion: true }, conversionApi );
		}
	}

	/**
	 * Converts the added marker. Fires the {@link #event:addMarker `addMarker`} event for each item
	 * in the marker's range. If the range is collapsed, a single event is dispatched. See the event description for more details.
	 *
	 * @protected
	 * @fires addMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange The marker range.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_convertMarkerAdd( markerName, markerRange, conversionApi ) {
		// Do not convert if range is in graveyard.
		if ( markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		// In markers' case, event name == consumable name.
		const eventName = 'addMarker:' + markerName;

		//
		// First, fire an event for the whole marker.
		//
		conversionApi.consumable.add( markerRange, eventName );

		this.fire( eventName, { markerName, markerRange }, conversionApi );

		//
		// Do not fire events for each item inside the range if the range got consumed.
		// Also consume the whole marker consumable if it wasn't consumed.
		//
		if ( !conversionApi.consumable.consume( markerRange, eventName ) ) {
			return;
		}

		//
		// Then, fire an event for each item inside the marker range.
		//
		this._addConsumablesForRange( conversionApi.consumable, markerRange, eventName );

		for ( const item of markerRange.getItems() ) {
			// Do not fire event for already consumed items.
			if ( !conversionApi.consumable.test( item, eventName ) ) {
				continue;
			}

			const data = { item, range: Range._createOn( item ), markerName, markerRange };

			this.fire( eventName, data, conversionApi );
		}
	}

	/**
	 * Fires the conversion of the marker removal. Fires the {@link #event:removeMarker `removeMarker`} event with the provided data.
	 *
	 * @protected
	 * @fires removeMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange The marker range.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_convertMarkerRemove( markerName, markerRange, conversionApi ) {
		// Do not convert if range is in graveyard.
		if ( markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		this.fire( 'removeMarker:' + markerName, { markerName, markerRange }, conversionApi );
	}

	/**
	 * Fires the reduction of changes buffered in the {@link module:engine/model/differ~Differ `Differ`}.
	 *
	 * Features can replace selected {@link module:engine/model/differ~DiffItem `DiffItem`}s with `reinsert` entries to trigger
	 * reconversion. The {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
	 * `DowncastHelpers.elementToStructure()`} is using this event to trigger reconversion.
	 *
	 * @private
	 * @fires reduceChanges
	 * @param {Iterable.<module:engine/model/differ~DiffItem>} changes
	 * @returns {Iterable.<module:engine/model/differ~DiffItem>}
	 */
	_reduceChanges( changes ) {
		const data = { changes };

		this.fire( 'reduceChanges', data );

		return data.changes;
	}

	/**
	 * Populates provided {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume from a given range,
	 * assuming that the range has just been inserted to the model.
	 *
	 * @private
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable The consumable.
	 * @param {Iterable.<module:engine/model/treewalker~TreeWalkerValue>} walkerValues The walker values for the inserted range.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} The values to consume.
	 */
	_addConsumablesForInsert( consumable, walkerValues ) {
		for ( const value of walkerValues ) {
			const item = value.item;

			// Add consumable if it wasn't there yet.
			if ( consumable.test( item, 'insert' ) === null ) {
				consumable.add( item, 'insert' );

				for ( const key of item.getAttributeKeys() ) {
					consumable.add( item, 'attribute:' + key );
				}
			}
		}

		return consumable;
	}

	/**
	 * Populates provided {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume for a given range.
	 *
	 * @private
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable The consumable.
	 * @param {module:engine/model/range~Range} range The affected range.
	 * @param {String} type Consumable type.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} The values to consume.
	 */
	_addConsumablesForRange( consumable, range, type ) {
		for ( const item of range.getItems() ) {
			consumable.add( item, type );
		}

		return consumable;
	}

	/**
	 * Populates provided {@link module:engine/conversion/modelconsumable~ModelConsumable} with selection consumable values.
	 *
	 * @private
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable The consumable.
	 * @param {module:engine/model/selection~Selection} selection The selection to create the consumable from.
	 * @param {Iterable.<module:engine/model/markercollection~Marker>} markers Markers that contain the selection.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} The values to consume.
	 */
	_addConsumablesForSelection( consumable, selection, markers ) {
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
	 * Tests whether given event wasn't already fired and if so, fires it.
	 *
	 * @private
	 * @fires insert
	 * @fires attribute
	 * @param {String} type Event type.
	 * @param {Object} data Event data.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_testAndFire( type, data, conversionApi ) {
		const eventName = getEventName( type, data );
		const itemKey = data.item.is( '$textProxy' ) ? conversionApi.consumable._getSymbolForTextProxy( data.item ) : data.item;

		const eventsFiredForConversion = this._firedEventsMap.get( conversionApi );
		const eventsFiredForItem = eventsFiredForConversion.get( itemKey );

		if ( !eventsFiredForItem ) {
			eventsFiredForConversion.set( itemKey, new Set( [ eventName ] ) );
		} else if ( !eventsFiredForItem.has( eventName ) ) {
			eventsFiredForItem.add( eventName );
		} else {
			return;
		}

		this.fire( eventName, data, conversionApi );
	}

	/**
	 * Fires not already fired events for setting attributes on just inserted item.
	 *
	 * @private
	 * @param {module:engine/model/item~Item} item The model item to convert attributes for.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi The conversion API object.
	 */
	_testAndFireAddAttributes( item, conversionApi ) {
		const data = {
			item,
			range: Range._createOn( item )
		};

		for ( const key of data.item.getAttributeKeys() ) {
			data.attributeKey = key;
			data.attributeOldValue = null;
			data.attributeNewValue = data.item.getAttribute( key );

			this._testAndFire( `attribute:${ key }`, data, conversionApi );
		}
	}

	/**
	 * Builds an instance of the {@link module:engine/conversion/downcastdispatcher~DowncastConversionApi} from a template and a given
	 * {@link module:engine/view/downcastwriter~DowncastWriter `DowncastWriter`} and options object.
	 *
	 * @private
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify the view document.
	 * @param {Set.<module:engine/model/element~Element>} [refreshedItems] A set of model elements that should not reuse their
	 * previous view representations.
	 * @param {Object} [options] Optional options passed to `convertionApi.options`.
	 * @return {module:engine/conversion/downcastdispatcher~DowncastConversionApi} The conversion API object.
	 */
	_createConversionApi( writer, refreshedItems = new Set(), options = {} ) {
		const conversionApi = {
			...this._conversionApi,
			consumable: new Consumable(),
			writer,
			options,
			convertItem: item => this._convertInsert( Range._createOn( item ), conversionApi ),
			convertChildren: element => this._convertInsert( Range._createIn( element ), conversionApi, { doNotAddConsumables: true } ),
			convertAttributes: item => this._testAndFireAddAttributes( item, conversionApi ),
			canReuseView: viewElement => !refreshedItems.has( conversionApi.mapper.toModelElement( viewElement ) )
		};

		this._firedEventsMap.set( conversionApi, new Map() );

		return conversionApi;
	}

	/**
	 * Fired to enable reducing (transforming) changes buffered in the {@link module:engine/model/differ~Differ `Differ`} before
	 * {@link #convertChanges `convertChanges()`} will fire any conversion events.
	 *
	 * For instance, a feature can replace selected {@link module:engine/model/differ~DiffItem `DiffItem`}s with a `reinsert` entry
	 * to trigger reconversion of an element when e.g. its attribute has changes.
	 * The {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure
	 * `DowncastHelpers.elementToStructure()`} helper is using this event to trigger reconversion of an element when the element,
	 * its attributes or direct children changed.
	 *
	 * @param {Object} data
	 * @param {Iterable.<module:engine/model/differ~DiffItem>} data.changes A buffered changes to get reduced.
	 * @event reduceChanges
	 */

	/**
	 * Fired for inserted nodes.
	 *
	 * `insert` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `insert:name`. `name` is either `'$text'`, when {@link module:engine/model/text~Text a text node} has been inserted,
	 * or {@link module:engine/model/element~Element#name name} of inserted element.
	 *
	 * This way, the listeners can either listen to a general `insert` event or specific event (for example `insert:paragraph`).
	 *
	 * @event insert
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item The inserted item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over inserted item.
	 * @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi Conversion interface
	 * to be used by callback, passed in the `DowncastDispatcher` constructor.
	 */

	/**
	 * Fired for removed nodes.
	 *
	 * `remove` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `remove:name`. `name` is either `'$text'`, when a {@link module:engine/model/text~Text a text node} has been removed,
	 * or the {@link module:engine/model/element~Element#name name} of removed element.
	 *
	 * This way, listeners can either listen to a general `remove` event or specific event (for example `remove:paragraph`).
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
	 * * when a collapsed model selection attribute is converted.
	 *
	 * `attribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `attribute:attributeKey:name`. `attributeKey` is the key of added/changed/removed attribute.
	 * `name` is either `'$text'` if change was on {@link module:engine/model/text~Text a text node},
	 * or the {@link module:engine/model/element~Element#name name} of element which attribute has changed.
	 *
	 * This way listeners can either listen to a general `attribute:bold` event or specific event (for example `attribute:src:imageBlock`).
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
	 * Fired when a new marker is added to the model. Also fired when a collapsed model selection that is inside a marker is converted.
	 *
	 * `addMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `addMarker:markerName`. By specifying certain marker names, you can make the events even more gradual. For example,
	 * if markers are named `foo:abc`, `foo:bar`, then it is possible to listen to `addMarker:foo` or `addMarker:foo:abc` and
	 * `addMarker:foo:bar` events.
	 *
	 * If the marker range is not collapsed:
	 *
	 * * the event is fired for each item in the marker range one by one,
	 * * `conversionApi.consumable` includes each item of the marker range and the consumable value is same as the event name.
	 *
	 * If the marker range is collapsed:
	 *
	 * * there is only one event,
	 * * `conversionApi.consumable` includes marker range with the event name.
	 *
	 * If the selection inside a marker is converted:
	 *
	 * * there is only one event,
	 * * `conversionApi.consumable` includes the selection instance with the event name.
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
	 * Fired when a marker is removed from the model.
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

function getEventName( type, data ) {
	const name = data.item.name || '$text';

	return `${ type }:${ name }`;
}

function walkerValueToEventData( value ) {
	const item = value.item;
	const itemRange = Range._createFromPositionAndShift( value.previousPosition, value.length );

	return {
		item,
		range: itemRange
	};
}

/**
 * Conversion interface that is registered for given {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher}
 * and is passed as one of parameters when {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher dispatcher}
 * fires its events.
 *
 * @interface module:engine/conversion/downcastdispatcher~DowncastConversionApi
 */

/**
 * The {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher} instance.
 *
 * @member {module:engine/conversion/downcastdispatcher~DowncastDispatcher} #dispatcher
 */

/**
 * Stores the information about what parts of a processed model item are still waiting to be handled. After a piece of a model item was
 * converted, an appropriate consumable value should be {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed}.
 *
 * @member {module:engine/conversion/modelconsumable~ModelConsumable} #consumable
 */

/**
 * The {@link module:engine/conversion/mapper~Mapper} instance.
 *
 * @member {module:engine/conversion/mapper~Mapper} #mapper
 */

/**
 * The {@link module:engine/model/schema~Schema} instance set for the model that is downcast.
 *
 * @member {module:engine/model/schema~Schema} #schema
 */

/**
 * The {@link module:engine/view/downcastwriter~DowncastWriter} instance used to manipulate the data during conversion.
 *
 * @member {module:engine/view/downcastwriter~DowncastWriter} #writer
 */

/**
 * Triggers conversion of a specified item.
 * This conversion is triggered within (as a separate process of) the parent conversion.
 *
 * @method #convertItem
 * @param {module:engine/model/item~Item} item The model item to trigger nested insert conversion on.
 */

/**
 * Triggers conversion of children of a specified element.
 *
 * @method #convertChildren
 * @param {module:engine/model/element~Element} element The model element to trigger children insert conversion on.
 */

/**
 * Triggers conversion of attributes of a specified item.
 *
 * @method #convertAttributes
 * @param {module:engine/model/item~Item} item The model item to trigger attribute conversion on.
 */

/**
 * An object with an additional configuration which can be used during the conversion process. Available only for data downcast conversion.
 *
 * @member {Object} #options
 */
