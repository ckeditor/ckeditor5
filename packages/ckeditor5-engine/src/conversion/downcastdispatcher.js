/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/downcastdispatcher
 */

import Consumable from './modelconsumable';
import Range from '../model/range';
import Position, { getNodeAfterPosition, getTextNodeAtPosition } from '../model/position';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The downcast dispatcher is a central point of downcasting (conversion from the model to the view), which is a process of reacting
 * to changes in the model and firing a set of events. Callbacks listening to these events are called converters. The
 * converters' role is to convert the model changes to changes in view (for example, adding view nodes or
 * changing attributes on view elements).
 *
 * During the conversion process, downcast dispatcher fires events basing on the state of the model and prepares
 * data for these events. It is important to understand that the events are connected with the changes done on the model,
 * for example: "a node has been inserted" or "an attribute has changed". This is in contrary to upcasting (a view-to-model conversion)
 * where you convert the view state (view nodes) to a model tree.
 *
 * The events are prepared basing on a diff created by {@link module:engine/model/differ~Differ Differ}, which buffers them
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
 * downcast dispatcher generates {@link module:engine/conversion/modelconsumable~ModelConsumable consumables}.
 * These are used to have control over which changes have already been consumed. It is useful when some converters
 * overwrite others or convert multiple changes (for example, it converts an insertion of an element and also converts that
 * element's attributes during the insertion).
 *
 * Additionally, downcast dispatcher fires events for {@link module:engine/model/markercollection~Marker marker} changes:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker} &ndash; If a marker was added.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:removeMarker} &ndash; If a marker was removed.
 *
 * Note that changing a marker is done through removing the marker from the old range and adding it to the new range,
 * so both events are fired.
 *
 * Finally, downcast dispatcher also handles firing events for the {@link module:engine/model/selection model selection}
 * conversion:
 *
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:selection}
 * &ndash; Converts the selection from the model to the view.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:attribute}
 * &ndash; Fired for every selection attribute.
 * * {@link module:engine/conversion/downcastdispatcher~DowncastDispatcher#event:addMarker}
 * &ndash; Fired for every marker that contains a selection.
 *
 * Unlike the model tree and the markers, the events for selection are not fired for changes but for a selection state.
 *
 * When providing custom listeners for a downcast dispatcher, remember to check whether a given change has not been
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} yet.
 *
 * When providing custom listeners for downcast dispatcher, keep in mind that any callback that has
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} a value from a consumable and
 * converted the change should also stop the event (for efficiency purposes).
 *
 * When providing custom listeners for downcast dispatcher, remember to use the provided
 * {@link module:engine/view/downcastwriter~DowncastWriter view downcast writer} to apply changes to the view document.
 *
 * You can read more about conversion in the following guides:
 *
 * * {@glink framework/guides/deep-dive/conversion/conversion-introduction Advanced conversion concepts &mdash; attributes}
 * * {@glink framework/guides/deep-dive/conversion/conversion-extending-output Extending the editor output }
 * * {@glink framework/guides/deep-dive/conversion/custom-element-conversion Custom element conversion}
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
 *
 *			// Remember to stop the event propagation.
 *			evt.stop();
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
		 * An interface passed by the dispatcher to the event callbacks.
		 *
		 * @member {module:engine/conversion/downcastdispatcher~DowncastConversionApi}
		 */
		this.conversionApi = Object.assign( { dispatcher: this }, conversionApi );

		/**
		 * Maps conversion event names that will trigger element reconversion for a given element name.
		 *
		 * @type {Map<String, String>}
		 * @private
		 */
		this._reconversionEventsMapping = new Map();
	}

	/**
	 * Takes a {@link module:engine/model/differ~Differ model differ} object with buffered changes and fires conversion basing on it.
	 *
	 * @param {module:engine/model/differ~Differ} differ The differ object with buffered changes.
	 * @param {module:engine/model/markercollection~MarkerCollection} markers Markers connected with the converted model.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer that should be used to modify the view document.
	 */
	convertChanges( differ, markers, writer ) {
		// Before the view is updated, remove markers which have changed.
		for ( const change of differ.getMarkersToRemove() ) {
			this.convertMarkerRemove( change.name, change.range, writer );
		}

		const changes = this._mapChangesWithAutomaticReconversion( differ );

		// Convert changes that happened on model tree.
		for ( const entry of changes ) {
			if ( entry.type === 'insert' ) {
				this.convertInsert( Range._createFromPositionAndShift( entry.position, entry.length ), writer );
			} else if ( entry.type === 'remove' ) {
				this.convertRemove( entry.position, entry.length, entry.name, writer );
			} else if ( entry.type === 'reconvert' ) {
				this.reconvertElement( entry.element, writer );
			} else {
				// Defaults to 'attribute' change.
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
	 * Starts a conversion of a range insertion.
	 *
	 * For each node in the range, {@link #event:insert `insert` event is fired}. For each attribute on each node,
	 * {@link #event:attribute `attribute` event is fired}.
	 *
	 * @fires insert
	 * @fires attribute
	 * @param {module:engine/model/range~Range} range The inserted range.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer that should be used to modify the view document.
	 */
	convertInsert( range, writer ) {
		this.conversionApi.writer = writer;

		// Create a list of things that can be consumed, consisting of nodes and their attributes.
		this.conversionApi.consumable = this._createInsertConsumable( range );

		// Fire a separate insert event for each node and text fragment contained in the range.
		for ( const data of Array.from( range ).map( walkerValueToEventData ) ) {
			this._convertInsertWithAttributes( data );
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
	 * Starts a conversion of an attribute change on a given `range`.
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
	 * Starts the reconversion of an element. It will:
	 *
	 * * Fire an {@link #event:insert `insert` event} for the element to reconvert.
	 * * Fire an {@link #event:attribute `attribute` event} for element attributes.
	 *
	 * This will not reconvert children of the element if they have existing (already converted) views. For newly inserted child elements
	 * it will behave the same as {@link #convertInsert}.
	 *
	 * Element reconversion is defined by the `triggerBy` configuration for the
	 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`} conversion helper.
	 *
	 * @fires insert
	 * @fires attribute
	 * @param {module:engine/model/element~Element} element The element to be reconverted.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The view writer that should be used to modify the view document.
	 */
	reconvertElement( element, writer ) {
		const elementRange = Range._createOn( element );

		this.conversionApi.writer = writer;

		// Create a list of things that can be consumed, consisting of nodes and their attributes.
		this.conversionApi.consumable = this._createInsertConsumable( elementRange );

		const mapper = this.conversionApi.mapper;
		const currentView = mapper.toViewElement( element );

		// Remove the old view but do not remove mapper mappings - those will be used to revive existing elements.
		writer.remove( currentView );

		// Convert the element - without converting children.
		this._convertInsertWithAttributes( {
			item: element,
			range: elementRange
		} );

		const convertedViewElement = mapper.toViewElement( element );

		// Iterate over children of reconverted element in order to...
		for ( const value of Range._createIn( element ) ) {
			const { item } = value;

			const view = elementOrTextProxyToView( item, mapper );

			// ...either bring back previously converted view...
			if ( view ) {
				// Do not move views that are already in converted element - those might be created by the main element converter in case
				// when main element converts also its direct children.
				if ( view.root !== convertedViewElement.root ) {
					writer.move(
						writer.createRangeOn( view ),
						mapper.toViewPosition( Position._createBefore( item ) )
					);
				}
			}
			// ... or by converting newly inserted elements.
			else {
				this._convertInsertWithAttributes( walkerValueToEventData( value ) );
			}
		}

		// After reconversion is done we can unbind the old view.
		mapper.unbindViewElement( currentView );

		this._clearConversionApi();
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

		this.conversionApi.writer = writer;
		this.conversionApi.consumable = this._createSelectionConsumable( selection, markersAtSelection );

		this.fire( 'selection', { selection }, this.conversionApi );

		if ( !selection.isCollapsed ) {
			this._clearConversionApi();

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
	 * Converts the added marker. Fires the {@link #event:addMarker `addMarker`} event for each item
	 * in the marker's range. If the range is collapsed, a single event is dispatched. See the event description for more details.
	 *
	 * @fires addMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange The marker range.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify the view document.
	 */
	convertMarkerAdd( markerName, markerRange, writer ) {
		// Do not convert if range is in graveyard.
		if ( markerRange.root.rootName == '$graveyard' ) {
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
			this._clearConversionApi();

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
	 * Fires the conversion of the marker removal. Fires the {@link #event:removeMarker `removeMarker`} event with the provided data.
	 *
	 * @fires removeMarker
	 * @param {String} markerName Marker name.
	 * @param {module:engine/model/range~Range} markerRange The marker range.
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer View writer that should be used to modify the view document.
	 */
	convertMarkerRemove( markerName, markerRange, writer ) {
		// Do not convert if range is in graveyard.
		if ( markerRange.root.rootName == '$graveyard' ) {
			return;
		}

		this.conversionApi.writer = writer;

		this.fire( 'removeMarker:' + markerName, { markerName, markerRange }, this.conversionApi );

		this._clearConversionApi();
	}

	/**
	 * Maps the model element "insert" reconversion for given event names. The event names must be fully specified:
	 *
	 * * For "attribute" change event, it should include the main element name, i.e: `'attribute:attributeName:elementName'`.
	 * * For child node change events, these should use the child event name as well, i.e:
	 *     * For adding a node: `'insert:childElementName'`.
	 *     * For removing a node: `'remove:childElementName'`.
	 *
	 * **Note**: This method should not be used directly. The reconversion is defined by the `triggerBy()` configuration of the
	 * `elementToElement()` conversion helper.
	 *
	 * @protected
	 * @param {String} modelName The name of the main model element for which the events will trigger the reconversion.
	 * @param {String} eventName The name of an event that would trigger conversion for a given model element.
	 */
	_mapReconversionTriggerEvent( modelName, eventName ) {
		this._reconversionEventsMapping.set( eventName, modelName );
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume from a given range,
	 * assuming that the range has just been inserted to the model.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range The inserted range.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} The values to consume.
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
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume for a given range.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range The affected range.
	 * @param {String} type Consumable type.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} The values to consume.
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
	 * @param {module:engine/model/selection~Selection} selection The selection to create the consumable from.
	 * @param {Iterable.<module:engine/model/markercollection~Marker>} markers Markers that contain the selection.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} The values to consume.
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

		this.fire( getEventName( type, data ), data, this.conversionApi );
	}

	/**
	 * Clears the conversion API object.
	 *
	 * @private
	 */
	_clearConversionApi() {
		delete this.conversionApi.writer;
		delete this.conversionApi.consumable;
	}

	/**
	 * Internal method for converting element insertion. It will fire events for the inserted element and events for its attributes.
	 *
	 * @private
	 * @fires insert
	 * @fires attribute
	 * @param {Object} data Event data.
	 */
	_convertInsertWithAttributes( data ) {
		this._testAndFire( 'insert', data );

		// Fire a separate addAttribute event for each attribute that was set on inserted items.
		// This is important because most attributes converters will listen only to add/change/removeAttribute events.
		// If we would not add this part, attributes on inserted nodes would not be converted.
		for ( const key of data.item.getAttributeKeys() ) {
			data.attributeKey = key;
			data.attributeOldValue = null;
			data.attributeNewValue = data.item.getAttribute( key );

			this._testAndFire( `attribute:${ key }`, data );
		}
	}

	/**
	 * Returns differ changes together with added "reconvert" type changes for {@link #reconvertElement}. These are defined by
	 * a the `triggerBy()` configuration for the
	 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`} conversion helper.
	 *
	 * This method will remove every mapped insert or remove change with a single "reconvert" change.
	 *
	 * For instance: Having a `triggerBy()` configuration defined for the `<complex>` element that issues this element reconversion on
	 * `foo` and `bar` attributes change, and a set of changes for this element:
	 *
	 *		const differChanges = [
	 *			{ type: 'attribute', attributeKey: 'foo', ... },
	 *			{ type: 'attribute', attributeKey: 'bar', ... },
	 *			{ type: 'attribute', attributeKey: 'baz', ... }
	 *		];
	 *
	 * This method will return:
	 *
	 *		const updatedChanges = [
	 *			{ type: 'reconvert', element: complexElementInstance },
	 *			{ type: 'attribute', attributeKey: 'baz', ... }
	 *		];
	 *
	 * In the example above, the `'baz'` attribute change will fire an {@link #event:attribute attribute event}
	 *
	 * @param {module:engine/model/differ~Differ} differ The differ object with buffered changes.
	 * @returns {Array.<Object>} Updated set of changes.
	 * @private
	 */
	_mapChangesWithAutomaticReconversion( differ ) {
		const itemsToReconvert = new Set();
		const updated = [];

		for ( const entry of differ.getChanges() ) {
			const position = entry.position || entry.range.start;
			// Cached parent - just in case. See https://github.com/ckeditor/ckeditor5/issues/6579.
			const positionParent = position.parent;
			const textNode = getTextNodeAtPosition( position, positionParent );

			// Reconversion is done only on elements so skip text changes.
			if ( textNode ) {
				updated.push( entry );

				continue;
			}

			const element = entry.type === 'attribute' ? getNodeAfterPosition( position, positionParent, null ) : positionParent;

			// Case of text node set directly in root. For now used only in tests but can be possible when enabled in paragraph-like roots.
			// See: https://github.com/ckeditor/ckeditor5/issues/762.
			if ( element.is( '$text' ) ) {
				updated.push( entry );

				continue;
			}

			let eventName;

			if ( entry.type === 'attribute' ) {
				eventName = `attribute:${ entry.attributeKey }:${ element.name }`;
			} else {
				eventName = `${ entry.type }:${ entry.name }`;
			}

			if ( this._isReconvertTriggerEvent( eventName, element.name ) ) {
				if ( itemsToReconvert.has( element ) ) {
					// Element is already reconverted, so skip this change.
					continue;
				}

				itemsToReconvert.add( element );

				// Add special "reconvert" change.
				updated.push( { type: 'reconvert', element } );
			} else {
				updated.push( entry );
			}
		}

		return updated;
	}

	/**
	 * Checks if the resulting change should trigger element reconversion.
	 *
	 * These are defined by a `triggerBy()` configuration for the
	 * {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement `elementToElement()`} conversion helper.
	 *
	 * @private
	 * @param {String} eventName The event name to check.
	 * @param {String} elementName The element name to check.
	 * @returns {Boolean}
	 */
	_isReconvertTriggerEvent( eventName, elementName ) {
		return this._reconversionEventsMapping.get( eventName ) === elementName;
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

function elementOrTextProxyToView( item, mapper ) {
	if ( item.is( 'textProxy' ) ) {
		const mappedPosition = mapper.toViewPosition( Position._createBefore( item ) );
		const positionParent = mappedPosition.parent;

		return positionParent.is( '$text' ) ? positionParent : null;
	}

	return mapper.toViewElement( item );
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
 * An object with an additional configuration which can be used during the conversion process. Available only for data downcast conversion.
 *
 * @member {Object} #options
 */
