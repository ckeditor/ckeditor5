/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/modelconversiondispatcher
 */

import Consumable from './modelconsumable';
import Range from '../model/range';
import TextProxy from '../model/textproxy';
import EmitterMixin from 'ckeditor5-utils/src/emittermixin';
import mix from 'ckeditor5-utils/src/mix';
import extend from 'ckeditor5-utils/src/lib/lodash/extend';

/**
 * `ModelConversionDispatcher` is a central point of {@link module:engine/model/model model} conversion, which is
 * a process of reacting to changes in the model and reflecting them by listeners that listen to those changes.
 * In default application, {@link module:engine/model/model model} is converted to {@link module:engine/view/view view}. This means
 * that changes in the model are reflected by changing the view (i.e. adding view nodes or changing attributes on view elements).
 *
 * During conversion process, `ModelConversionDispatcher` fires data-manipulation events, basing on state of the model and prepares
 * data for those events. It is important to note that the events are connected with "change actions" like "inserting"
 * or "removing" so one might say that we are converting "changes". This is in contrary to view to model conversion,
 * where we convert view nodes (the structure, not "changes" to the view). Note, that because changes are converted
 * and not the structure itself, there is a need to have a mapping between model and the structure on which changes are
 * reflected. To map elements during model to view conversion use {@link module:engine/conversion/mapper~Mapper}.
 *
 * The main use for this class is to listen to {@link module:engine/model/document~Document#event:change Document change event}, process it
 * and then fire specific events telling what exactly has changed. For those events, `ModelConversionDispatcher`
 * creates {@link module:engine/conversion/modelconsumable~ModelConsumable list of consumable values} that should be handled by event
 * callbacks. Those events are listened to by model-to-view converters which convert changes done in the
 * {@link module:engine/model/model model} to changes in the {@link module:engine/view/view view}. `ModelConversionController` also checks
 * the current state of consumables, so it won't fire events for parts of model that were already consumed. This is
 * especially important in callbacks that consume multiple values. See {@link module:engine/conversion/modelconsumable~ModelConsumable}
 * for an example of such callback.
 *
 * Although the primary usage for this class is the model-to-view conversion, `ModelConversionDispatcher` can be used
 * to build custom data processing pipelines that converts model to anything that is needed. Existing model structure can
 * be used to generate events (listening to {@link module:engine/model/document~Document#event:change Document change event} is not
 * required)
 * and custom callbacks can be added to the events (these does not have to be limited to changes in the view).
 *
 * When providing your own event listeners for `ModelConversionDispatcher` keep in mind that any callback that had
 * {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} a value from consumable (and did some changes, i.e. to
 * the view) should also stop the event. This is because whenever a callback is fired it is assumed that there is something
 * to be consumed. Thanks to that approach, you do not have to test whether there is anything to consume at the beginning
 * of your listener callback.
 *
 * Example of providing a converter for `ModelConversionDispatcher`:
 *
 *		// We will convert inserting "paragraph" model element into the model.
 *		modelDispatcher.on( 'insert:paragraph', ( evt, data, consumable, conversionApi ) => {
 *			// Remember to consume the part of consumable.
 *			consumable.consume( data.item, 'insert' );
 *
 *			// Translate position in model to position in the view.
 *			const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
 *
 *			// Create a P element (note that this converter is for inserting P elements -> 'insert:paragraph').
 *			const viewElement = new ViewElement( 'p' );
 *
 *			// Bind the newly created view element to model element so positions will map accordingly in future.
 *			conversionApi.mapper.bindElements( data.item, viewElement );
 *
 *			// Add the newly created view element to the view.
 *			viewWriter.insert( viewPosition, viewElement );
 *
 *			// Remember to stop the event propagation if the data.item was consumed.
 *			evt.stop();
 *		} );
 *
 * Callback that "overrides" other callback:
 *
 *		// Special converter for `linkHref` attribute added on custom `quote` element. Note, that this
 *		// attribute may be the same as the attribute added by other features (link feature in this case).
 *		// It might be even added by that feature! It makes sense that a part of content that is a quote is linked
 *		// to an external source so it makes sense that link feature works on the custom quote element.
 *		// However, we have to make sure that the attributes added by link feature are correctly converted.
 *		// To block default `linkHref` conversion we have to:
 *		// 1) add this callback with higher priority than link feature callback,
 *		// 2) consume `linkHref` attribute add change.
 *		modelConversionDispatcher.on( 'addAttribute:linkHref:quote', ( evt, data, consumable, conversionApi ) => {
 *			consumable.consume( data.item, 'addAttribute:linkHref' );
 *
 *			// Create a button that will represent the `linkHref` attribute.
 *			let viewSourceBtn = new ViewElement( 'a', {
 *				href: data.item.getAttribute( 'linkHref' ),
 *				title: 'source'
 *			} );
 *
 *			// Add a class for the button.
 *			viewSourceBtn.addClass( 'source' );
 *
 *			// Insert the button using writer API.
 *			// If `addAttribute` event is fired by `module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#convertInsert` it
 *			// is fired
 *			// after `data.item` insert conversion was done. If the event is fired due to attribute insertion coming from
 *			// different source, `data.item` already existed. This means we are safe to get `viewQuote` from mapper.
 *			const viewQuote = conversionApi.mapper.toViewElement( data.item );
 *			const position = new ViewPosition( viewQuote, viewQuote.childCount );
 *			viewWriter.insert( position, viewSourceBtn );
 *
 *			evt.stop();
 *		}, { priority: 'high' } );
 */
export default class ModelConversionDispatcher {
	/**
	 * Creates a `ModelConversionDispatcher` that operates using passed API.
	 *
	 * @param {Object} [conversionApi] Interface passed by dispatcher to the events callbacks.
	 */
	constructor( conversionApi = {} ) {
		/**
		 * Interface passed by dispatcher to the events callbacks.
		 *
		 * @member {Object}
		 */
		this.conversionApi = extend( { dispatcher: this }, conversionApi );
	}

	/**
	 * Prepares data and fires a proper event.
	 *
	 * The method is crafted to take use of parameters passed in {@link module:engine/model/document~Document#event:change Document change
	 * event}.
	 *
	 * @see module:engine/model/document~Document#event:change
	 * @fires insert
	 * @fires move
	 * @fires remove
	 * @fires rename
	 * @fires addAttribute
	 * @fires removeAttribute
	 * @fires changeAttribute
	 * @param {String} type Change type.
	 * @param {Object} data Additional information about the change.
	 */
	convertChange( type, data ) {
		// Do not convert changes if they happen in graveyard.
		// Graveyard is a special root that has no view / no other representation and changes done in it should not be converted.
		if ( type !== 'remove' && data.range && data.range.root.rootName == '$graveyard' ) {
			return;
		}

		if ( type == 'remove' && data.sourcePosition.root.rootName == '$graveyard' ) {
			return;
		}

		if ( type == 'rename' && data.element.root.rootName == '$graveyard' ) {
			return;
		}

		// We can safely dispatch changes.
		if ( type == 'insert' || type == 'reinsert' ) {
			this.convertInsertion( data.range );
		} else if ( type == 'move' ) {
			this.convertMove( data.sourcePosition, data.range );
		} else if ( type == 'remove' ) {
			this.convertRemove( data.sourcePosition, data.range );
		} else if ( type == 'addAttribute' || type == 'removeAttribute' || type == 'changeAttribute' ) {
			this.convertAttribute( type, data.range, data.key, data.oldValue, data.newValue );
		} else if ( type == 'rename' ) {
			this.convertRename( data.element, data.oldName );
		}
	}

	/**
	 * Analyzes given range and fires insertion-connected events with data based on that range.
	 *
	 * **Note**: This method will fire separate events for node insertion and attributes insertion. All
	 * attributes that are set on inserted nodes are treated like they were added just after node insertion.
	 *
	 * @fires insert
	 * @fires addAttribute
	 * @param {module:engine/model/range~Range} range Inserted range.
	 */
	convertInsertion( range ) {
		// Create a list of things that can be consumed, consisting of nodes and their attributes.
		const consumable = this._createInsertConsumable( range );

		// Fire a separate insert event for each node and text fragment contained in the range.
		for ( let value of range ) {
			const item = value.item;
			const itemRange = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const data = {
				item: item,
				range: itemRange
			};

			this._testAndFire( 'insert', data, consumable );

			// Fire a separate addAttribute event for each attribute that was set on inserted items.
			// This is important because most attributes converters will listen only to add/change/removeAttribute events.
			// If we would not add this part, attributes on inserted nodes would not be converted.
			for ( let key of item.getAttributeKeys() ) {
				data.attributeKey = key;
				data.attributeOldValue = null;
				data.attributeNewValue = item.getAttribute( key );

				this._testAndFire( 'addAttribute:' + key, data, consumable );
			}
		}
	}

	/**
	 * Fires move event with data based on passed values.
	 *
	 * @fires move
	 * @param {module:engine/model/position~Position} sourcePosition Position from where the range has been moved.
	 * @param {module:engine/model/range~Range} range Moved range (after move).
	 */
	convertMove( sourcePosition, range ) {
		// Keep in mind that move dispatcher expects flat range.
		const consumable = this._createConsumableForRange( range, 'move' );

		const items = Array.from( range.getItems( { shallow: true } ) );
		const inSameParent = sourcePosition.parent == range.start.parent;
		const targetsAfter = range.start.isAfter( sourcePosition );

		let offset = 0;

		for ( let item of items ) {
			const data = {
				sourcePosition: sourcePosition,
				targetPosition: inSameParent && targetsAfter ? range.end : range.start.getShiftedBy( offset ),
				item: item
			};

			offset += data.item.offsetSize;

			this._testAndFire( 'move', data, consumable );
		}
	}

	/**
	 * Fires remove event with data based on passed values.
	 *
	 * @fires remove
	 * @param {module:engine/model/position~Position} sourcePosition Position from where the range has been removed.
	 * @param {module:engine/model/range~Range} range Removed range (after remove, in {@link module:engine/model/document~Document#graveyard
	 * graveyard root}).
	 */
	convertRemove( sourcePosition, range ) {
		const consumable = this._createConsumableForRange( range, 'remove' );

		for ( let item of range.getItems( { shallow: true } ) ) {
			const data = {
				sourcePosition: sourcePosition,
				item: item
			};

			this._testAndFire( 'remove', data, consumable );
		}
	}

	/**
	 * Analyzes given attribute change and fires attributes-connected events with data based on passed values.
	 *
	 * @fires addAttribute
	 * @fires removeAttribute
	 * @fires changeAttribute
	 * @param {String} type Change type. Possible values: `addAttribute`, `removeAttribute`, `changeAttribute`.
	 * @param {module:engine/model/range~Range} range Changed range.
	 * @param {String} key Attribute key.
	 * @param {*} oldValue Attribute value before the change or `null` if attribute has not been set.
	 * @param {*} newValue New attribute value or `null` if attribute has been removed.
	 */
	convertAttribute( type, range, key, oldValue, newValue ) {
		// Create a list with attributes to consume.
		const consumable = this._createConsumableForRange( range, type + ':' + key );

		// Create a separate attribute event for each node in the range.
		for ( let value of range ) {
			const item = value.item;
			const itemRange = Range.createFromPositionAndShift( value.previousPosition, value.length );
			const data = {
				item: item,
				range: itemRange,
				attributeKey: key,
				attributeOldValue: oldValue,
				attributeNewValue: newValue
			};

			this._testAndFire( type + ':' + key, data, consumable, this.conversionApi );
		}
	}

	/**
	 * Fires rename event with data based on passed values.
	 *
	 * @fires rename
	 * @param {module:engine/view/element~Element} element Renamed element.
	 * @param {String} oldName Name of the renamed element before it was renamed.
	 */
	convertRename( element, oldName ) {
		const consumable = new Consumable();
		consumable.add( element, 'rename' );

		const data = { element, oldName };
		this.fire( 'rename:' + element.name + ':' + oldName, data, consumable, this.conversionApi );
	}

	/**
	 * Fires events for given {@link module:engine/model/selection~Selection selection} to start selection conversion.
	 *
	 * @fires selection
	 * @fires selectionAttribute
	 * @param {module:engine/model/selection~Selection} selection Selection to convert.
	 */
	convertSelection( selection ) {
		const consumable = this._createSelectionConsumable( selection );
		const data = {
			selection: selection
		};

		this.fire( 'selection', data, consumable, this.conversionApi );

		for ( let key of selection.getAttributeKeys() ) {
			data.key = key;
			data.value = selection.getAttribute( key );

			// Do not fire event if the attribute has been consumed.
			if ( consumable.test( selection, 'selectionAttribute:' + data.key ) ) {
				this.fire( 'selectionAttribute:' + data.key, data, consumable, this.conversionApi );
			}
		}
	}

	/**
	 * Fires event for given marker change.
	 *
	 * @fires addMarker
	 * @fires removeMarker
	 * @param {String} type Change type.
	 * @param {String} name Marker name.
	 * @param {module:engine/model/range~Range} range Marker range.
	 */
	convertMarker( type, name, range ) {
		const consumable = this._createMarkerConsumable( type, range );
		const data = { name, range };

		this.fire( type + ':' + name, data, consumable, this.conversionApi );
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with values to consume from given range, assuming that
	 * given range has just been inserted to the model.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Inserted range.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createInsertConsumable( range ) {
		const consumable = new Consumable();

		for ( let value of range ) {
			const item = value.item;

			consumable.add( item, 'insert' );

			for ( let key of item.getAttributeKeys() ) {
				consumable.add( item, 'addAttribute:' + key );
			}
		}

		return consumable;
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with values of given `type`
	 * for each item from given `range`.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Affected range.
	 * @param {String} type Consumable type.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createConsumableForRange( range, type ) {
		const consumable = new Consumable();

		for ( let item of range.getItems() ) {
			consumable.add( item, type );
		}

		return consumable;
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} with selection consumable values.
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} selection Selection to create consumable from.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createSelectionConsumable( selection ) {
		const consumable = new Consumable();

		consumable.add( selection, 'selection' );

		for ( let key of selection.getAttributeKeys() ) {
			consumable.add( selection, 'selectionAttribute:' + key );
		}

		return consumable;
	}

	/**
	 * Creates {@link module:engine/conversion/modelconsumable~ModelConsumable} for adding or removing marker on given `range`.
	 *
	 * @private
	 * @param {'addMarker'|'removeMarker'} type Change type.
	 * @param {module:engine/model/range~Range} range Range on which marker was added or removed.
	 * @returns {module:engine/conversion/modelconsumable~ModelConsumable} Values to consume.
	 */
	_createMarkerConsumable( type, range ) {
		const consumable = new Consumable();

		consumable.add( range, type );

		return consumable;
	}

	/**
	 * Tests passed `consumable` to check whether given event can be fired and if so, fires it.
	 *
	 * @private
	 * @fires insert
	 * @fires addAttribute
	 * @fires removeAttribute
	 * @fires changeAttribute
	 * @param {String} type Event type.
	 * @param {Object} data Event data.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 */
	_testAndFire( type, data, consumable ) {
		if ( !consumable.test( data.item, type ) ) {
			// Do not fire event if the item was consumed.
			return;
		}

		if ( type === 'insert' || type === 'remove' || type == 'move' ) {
			if ( data.item instanceof TextProxy ) {
				// Example: insert:$text.
				this.fire( type + ':$text', data, consumable, this.conversionApi );
			} else {
				// Example: insert:paragraph.
				this.fire( type + ':' + data.item.name, data, consumable, this.conversionApi );
			}
		} else {
			// Example addAttribute:alt:img.
			// Example addAttribute:bold:$text.
			const name = data.item.name || '$text';

			this.fire( type + ':' + name, data, consumable, this.conversionApi );
		}
	}

	/**
	 * Fired for inserted nodes.
	 *
	 * `insert` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `insert:<type>:<elementName>`. `type` is either `text` when one or more characters has been inserted or `element`
	 * when {@link module:engine/model/element~Element} has been inserted. If `type` is `element`, `elementName` is added and is
	 * equal to the {@link module:engine/model/element~Element#name name} of inserted element. This way listeners can either
	 * listen to very general `insert` event or, i.e., very specific `insert:paragraph` event, which is fired only for
	 * model elements with name `paragraph`.
	 *
	 * @event insert
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Inserted item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over inserted item.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for moved nodes.
	 *
	 * @event move
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/position~Position} data.sourcePosition Position from where the range has been moved.
	 * @param {module:engine/model/range~Range} data.range Moved range (after move).
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for removed nodes.
	 *
	 * @event remove
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/position~Position} data.sourcePosition Position from where the range has been removed.
	 * @param {module:engine/model/range~Range} data.range Removed range (in {@link module:engine/model/document~Document#graveyard graveyard
	 * root}).
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for renamed element.
	 *
	 * @event rename
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/element~Element} data.element Renamed element.
	 * @param {String} data.oldName Old name of the renamed element.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when attribute has been added on a node.
	 *
	 * `addAttribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `addAttribute:<attributeKey>:<elementName>`. `attributeKey` is the key of added attribute. `elementName` is
	 * equal to the {@link module:engine/model/element~Element#name name} of the element which got the attribute. This way listeners
	 * can either listen to adding certain attribute, i.e. `addAttribute:bold`, or be more specific, i.e. `addAttribute:link:img`.
	 *
	 * @event addAttribute
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Changed item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over changed item.
	 * @param {String} data.attributeKey Attribute key.
	 * @param {null} data.attributeOldValue Attribute value before the change - always `null`. Kept for the sake of unifying events.
	 * @param {*} data.attributeNewValue New attribute value.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when attribute has been removed from a node.
	 *
	 * `removeAttribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `removeAttribute:<attributeKey>:<elementName>`. `attributeKey` is the key of removed attribute. `elementName` is
	 * equal to the {@link module:engine/model/element~Element#name name} of the element which got the attribute removed. This way listeners
	 * can either listen to removing certain attribute, i.e. `removeAttribute:bold`, or be more specific, i.e. `removeAttribute:link:img`.
	 *
	 * @event removeAttribute
	 * @param {Object} data Additional information about the change.
	 * @param {module:engine/model/item~Item} data.item Changed item.
	 * @param {module:engine/model/range~Range} data.range Range spanning over changed item.
	 * @param {String} data.attributeKey Attribute key.
	 * @param {*} data.attributeOldValue Attribute value before it was removed.
	 * @param {null} data.attributeNewValue New attribute value - always `null`. Kept for the sake of unifying events.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when attribute of a node has been changed.
	 *
	 * `changeAttribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `changeAttribute:<attributeKey>:<elementName>`. `attributeKey` is the key of changed attribute. `elementName` is
	 * equal to the {@link module:engine/model/element~Element#name name} of the element which got the attribute changed. This way listeners
	 * can either listen to changing certain attribute, i.e. `changeAttribute:link`, or be more specific, i.e. `changeAttribute:link:img`.
	 *
	 * @event changeAttribute
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
	 * @param {module:engine/model/selection~Selection} selection `Selection` instance that is converted.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired for {@link module:engine/model/selection~Selection selection} attributes changes.
	 *
	 * `selectionAttribute` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `selectionAttribute:<attributeKey>`. `attributeKey` is the key of selection attribute. This way listen can listen to
	 * certain attribute, i.e. `addAttribute:bold`.
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
	 * markers can be named `foo:abc`, `foo:bar`, then it is possible to listen to `addMarker:foo` or `addMarker:foo:abc` and
	 * `addMarker:foo:bar` events.
	 *
	 * @event addMarker
	 * @param {Object} data Additional information about the change.
	 * @param {String} data.name Marker name.
	 * @param {module:engine/model/range~Range} data.range Marker range.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */

	/**
	 * Fired when marker is removed from the model.
	 *
	 * `removeMarker` is a namespace for a class of events. Names of actually called events follow this pattern:
	 * `removeMarker:<markerName>`. By specifying certain marker names, you can make the events even more gradual. For example,
	 * markers can be named `foo:abc`, `foo:bar`, then it is possible to listen to `removeMarker:foo` or `removeMarker:foo:abc` and
	 * `removeMarker:foo:bar` events.
	 *
	 * @event removeMarker
	 * @param {Object} data Additional information about the change.
	 * @param {String} data.name Marker name.
	 * @param {module:engine/model/range~Range} data.range Marker range.
	 * @param {module:engine/conversion/modelconsumable~ModelConsumable} consumable Values to consume.
	 * @param {Object} conversionApi Conversion interface to be used by callback, passed in `ModelConversionDispatcher` constructor.
	 */
}

mix( ModelConversionDispatcher, EmitterMixin );
