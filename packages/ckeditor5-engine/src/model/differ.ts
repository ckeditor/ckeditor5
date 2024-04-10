/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/differ
 */

import Position from './position.js';
import Range from './range.js';

import type { default as MarkerCollection, MarkerData } from './markercollection.js';
import type AttributeOperation from './operation/attributeoperation.js';
import type DocumentFragment from './documentfragment.js';
import type Element from './element.js';
import type InsertOperation from './operation/insertoperation.js';
import type Item from './item.js';
import type MergeOperation from './operation/mergeoperation.js';
import type MoveOperation from './operation/moveoperation.js';
import type Node from './node.js';
import type RootElement from './rootelement.js';
import type Operation from './operation/operation.js';
import type RenameOperation from './operation/renameoperation.js';
import type SplitOperation from './operation/splitoperation.js';
import type RootOperation from './operation/rootoperation.js';
import type RootAttributeOperation from './operation/rootattributeoperation.js';

/**
 * Calculates the difference between two model states.
 *
 * Receives operations that are to be applied on the model document. Marks parts of the model document tree which
 * are changed and saves the state of these elements before the change. Then, it compares saved elements with the
 * changed elements, after all changes are applied on the model document. Calculates the diff between saved
 * elements and new ones and returns a change set.
 */
export default class Differ {
	/**
	 * Reference to the model's marker collection.
	 */
	private readonly _markerCollection: MarkerCollection;

	/**
	 * A map that stores changes that happened in a given element.
	 *
	 * The keys of the map are references to the model elements.
	 * The values of the map are arrays with changes that were done on this element.
	 */
	private readonly _changesInElement: Map<Element | DocumentFragment, Array<ChangeItem>> = new Map();

	/**
	 * A map that stores "element's children snapshots". A snapshot is representing children of a given element before
	 * the first change was applied on that element. Snapshot items are objects with two properties: `name`,
	 * containing the element name (or `'$text'` for a text node) and `attributes` which is a map of the node's attributes.
	 */
	private readonly _elementSnapshots: Map<Element | DocumentFragment, Array<DifferSnapshot>> = new Map();

	/**
	 * A map that stores all changed markers.
	 *
	 * The keys of the map are marker names.
	 * The values of the map are objects with the following properties:
	 * - `oldMarkerData`,
	 * - `newMarkerData`.
	 */
	private readonly _changedMarkers: Map<string, { newMarkerData: MarkerData; oldMarkerData: MarkerData }> = new Map();

	/**
	 * A map that stores all roots that have been changed.
	 *
	 * The keys are the names of the roots while value represents the changes.
	 */
	private readonly _changedRoots: Map<string, DiffItemRoot> = new Map();

	/**
	 * Stores the number of changes that were processed. Used to order the changes chronologically. It is important
	 * when changes are sorted.
	 */
	private _changeCount: number = 0;

	/**
	 * For efficiency purposes, `Differ` stores the change set returned by the differ after {@link #getChanges} call.
	 * Cache is reset each time a new operation is buffered. If the cache has not been reset, {@link #getChanges} will
	 * return the cached value instead of calculating it again.
	 *
	 * This property stores those changes that did not take place in graveyard root.
	 */
	private _cachedChanges: Array<DiffItem> | null = null;

	/**
	 * For efficiency purposes, `Differ` stores the change set returned by the differ after the {@link #getChanges} call.
	 * The cache is reset each time a new operation is buffered. If the cache has not been reset, {@link #getChanges} will
	 * return the cached value instead of calculating it again.
	 *
	 * This property stores all changes evaluated by `Differ`, including those that took place in the graveyard.
	 */
	private _cachedChangesWithGraveyard: Array<DiffItem> | null = null;

	/**
	 * Set of model items that were marked to get refreshed in {@link #_refreshItem}.
	 */
	private _refreshedItems: Set<Item> = new Set();

	/**
	 * Creates a `Differ` instance.
	 *
	 * @param markerCollection Model's marker collection.
	 */
	constructor( markerCollection: MarkerCollection ) {
		this._markerCollection = markerCollection;
	}

	/**
	 * Informs whether there are any changes buffered in `Differ`.
	 */
	public get isEmpty(): boolean {
		return this._changesInElement.size == 0 && this._changedMarkers.size == 0 && this._changedRoots.size == 0;
	}

	/**
	 * Buffers the given operation. An operation has to be buffered before it is executed.
	 *
	 * @param operationToBuffer An operation to buffer.
	 */
	public bufferOperation( operationToBuffer: Operation ): void {
		// Below we take an operation, check its type, then use its parameters in marking (private) methods.
		// The general rule is to not mark elements inside inserted element. All inserted elements are re-rendered.
		// Marking changes in them would cause a "double" changing then.
		//
		const operation = operationToBuffer as (
			InsertOperation |
			AttributeOperation |
			MoveOperation |
			RenameOperation |
			SplitOperation |
			MergeOperation |
			RootOperation |
			RootAttributeOperation
		);

		// Note: an operation that happens inside a non-loaded root will be ignored. If the operation happens partially inside
		// a non-loaded root, that part will be ignored (this may happen for move or marker operations).
		//
		switch ( operation.type ) {
			case 'insert': {
				if ( this._isInInsertedElement( operation.position.parent ) ) {
					return;
				}

				this._markInsert( operation.position.parent, operation.position.offset, operation.nodes.maxOffset );

				break;
			}
			case 'addAttribute':
			case 'removeAttribute':
			case 'changeAttribute': {
				for ( const item of operation.range.getItems( { shallow: true } ) ) {
					if ( this._isInInsertedElement( item.parent! ) ) {
						continue;
					}

					this._markAttribute( item );
				}

				break;
			}
			case 'remove':
			case 'move':
			case 'reinsert': {
				// When range is moved to the same position then not mark it as a change.
				// See: https://github.com/ckeditor/ckeditor5-engine/issues/1664.
				if (
					operation.sourcePosition.isEqual( operation.targetPosition ) ||
					operation.sourcePosition.getShiftedBy( operation.howMany ).isEqual( operation.targetPosition )
				) {
					return;
				}

				const sourceParentInserted = this._isInInsertedElement( operation.sourcePosition.parent );
				const targetParentInserted = this._isInInsertedElement( operation.targetPosition.parent );

				if ( !sourceParentInserted ) {
					this._markRemove( operation.sourcePosition.parent, operation.sourcePosition.offset, operation.howMany );
				}

				if ( !targetParentInserted ) {
					this._markInsert( operation.targetPosition.parent, operation.getMovedRangeStart().offset, operation.howMany );
				}

				break;
			}
			case 'rename': {
				if ( this._isInInsertedElement( operation.position.parent ) ) {
					return;
				}

				this._markRemove( operation.position.parent, operation.position.offset, 1 );
				this._markInsert( operation.position.parent, operation.position.offset, 1 );

				const range = Range._createFromPositionAndShift( operation.position, 1 );

				for ( const marker of this._markerCollection.getMarkersIntersectingRange( range ) ) {
					const markerData = marker.getData();

					this.bufferMarkerChange( marker.name, markerData, markerData );
				}

				break;
			}
			case 'split': {
				const splitElement = operation.splitPosition.parent;

				// Mark that children of the split element were removed.
				if ( !this._isInInsertedElement( splitElement ) ) {
					this._markRemove( splitElement, operation.splitPosition.offset, operation.howMany );
				}

				// Mark that the new element (split copy) was inserted.
				if ( !this._isInInsertedElement( operation.insertionPosition.parent ) ) {
					this._markInsert( operation.insertionPosition.parent, operation.insertionPosition.offset, 1 );
				}

				// If the split took the element from the graveyard, mark that the element from the graveyard was removed.
				if ( operation.graveyardPosition ) {
					this._markRemove( operation.graveyardPosition.parent, operation.graveyardPosition.offset, 1 );
				}

				break;
			}
			case 'merge': {
				// Mark that the merged element was removed.
				const mergedElement = operation.sourcePosition.parent;

				if ( !this._isInInsertedElement( mergedElement.parent! ) ) {
					this._markRemove( mergedElement.parent!, ( mergedElement as any ).startOffset, 1 );
				}

				// Mark that the merged element was inserted into graveyard.
				const graveyardParent = operation.graveyardPosition.parent;

				this._markInsert( graveyardParent, operation.graveyardPosition.offset, 1 );

				// Mark that children of merged element were inserted at new parent.
				const mergedIntoElement = operation.targetPosition.parent;

				if ( !this._isInInsertedElement( mergedIntoElement ) ) {
					this._markInsert( mergedIntoElement, operation.targetPosition.offset, mergedElement.maxOffset );
				}

				break;
			}
			case 'detachRoot':
			case 'addRoot': {
				const root = operation.affectedSelectable as RootElement;

				if ( !root._isLoaded ) {
					return;
				}

				// Don't buffer if the root state does not change.
				if ( root.isAttached() == operation.isAdd ) {
					return;
				}

				this._bufferRootStateChange( operation.rootName, operation.isAdd );

				break;
			}
			case 'addRootAttribute':
			case 'removeRootAttribute':
			case 'changeRootAttribute': {
				if ( !operation.root._isLoaded ) {
					return;
				}

				const rootName = operation.root.rootName;

				this._bufferRootAttributeChange( rootName, operation.key, operation.oldValue, operation.newValue );

				break;
			}
		}

		// Clear cache after each buffered operation as it is no longer valid.
		this._cachedChanges = null;
	}

	/**
	 * Buffers a marker change.
	 *
	 * @param markerName The name of the marker that changed.
	 * @param oldMarkerData Marker data before the change.
	 * @param newMarkerData Marker data after the change.
	 */
	public bufferMarkerChange( markerName: string, oldMarkerData: MarkerData, newMarkerData: MarkerData ): void {
		if ( oldMarkerData.range && oldMarkerData.range.root.is( 'rootElement' ) && !oldMarkerData.range.root._isLoaded ) {
			oldMarkerData.range = null;
		}

		if ( newMarkerData.range && newMarkerData.range.root.is( 'rootElement' ) && !newMarkerData.range.root._isLoaded ) {
			newMarkerData.range = null;
		}

		let buffered = this._changedMarkers.get( markerName );

		if ( !buffered ) {
			buffered = { newMarkerData, oldMarkerData };

			this._changedMarkers.set( markerName, buffered );
		} else {
			buffered.newMarkerData = newMarkerData;
		}

		if ( buffered.oldMarkerData.range == null && newMarkerData.range == null ) {
			// The marker is going to be removed (`newMarkerData.range == null`) but it did not exist before the first buffered change
			// (`buffered.oldMarkerData.range == null`). In this case, do not keep the marker in buffer at all.
			this._changedMarkers.delete( markerName );
		}
	}

	/**
	 * Returns all markers that should be removed as a result of buffered changes.
	 *
	 * @returns Markers to remove. Each array item is an object containing the `name` and `range` properties.
	 */
	public getMarkersToRemove(): Array<{ name: string; range: Range }> {
		const result = [];

		for ( const [ name, change ] of this._changedMarkers ) {
			if ( change.oldMarkerData.range != null ) {
				result.push( { name, range: change.oldMarkerData.range } );
			}
		}

		return result;
	}

	/**
	 * Returns all markers which should be added as a result of buffered changes.
	 *
	 * @returns Markers to add. Each array item is an object containing the `name` and `range` properties.
	 */
	public getMarkersToAdd(): Array<{ name: string; range: Range }> {
		const result = [];

		for ( const [ name, change ] of this._changedMarkers ) {
			if ( change.newMarkerData.range != null ) {
				result.push( { name, range: change.newMarkerData.range } );
			}
		}

		return result;
	}

	/**
	 * Returns all markers which changed.
	 */
	public getChangedMarkers(): Array<{
		name: string;
		data: {
			oldRange: Range | null;
			newRange: Range | null;
		};
	}> {
		return Array.from( this._changedMarkers ).map( ( [ name, change ] ) => (
			{
				name,
				data: {
					oldRange: change.oldMarkerData.range,
					newRange: change.newMarkerData.range
				}
			}
		) );
	}

	/**
	 * Checks whether some of the buffered changes affect the editor data.
	 *
	 * Types of changes which affect the editor data:
	 *
	 * * model structure changes,
	 * * attribute changes,
	 * * a root is added or detached,
	 * * changes of markers which were defined as `affectsData`,
	 * * changes of markers' `affectsData` property.
	 */
	public hasDataChanges(): boolean {
		if ( this.getChanges().length ) {
			return true;
		}

		if ( this._changedRoots.size > 0 ) {
			return true;
		}

		for ( const { newMarkerData, oldMarkerData } of this._changedMarkers.values() ) {
			if ( newMarkerData.affectsData !== oldMarkerData.affectsData ) {
				return true;
			}

			if ( newMarkerData.affectsData ) {
				const markerAdded = newMarkerData.range && !oldMarkerData.range;
				const markerRemoved = !newMarkerData.range && oldMarkerData.range;
				const markerChanged = newMarkerData.range && oldMarkerData.range && !newMarkerData.range.isEqual( oldMarkerData.range );

				if ( markerAdded || markerRemoved || markerChanged ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Calculates the diff between the old model tree state (the state before the first buffered operations since the last {@link #reset}
	 * call) and the new model tree state (actual one). It should be called after all buffered operations are executed.
	 *
	 * The diff set is returned as an array of {@link module:engine/model/differ~DiffItem diff items}, each describing a change done
	 * on the model. The items are sorted by the position on which the change happened. If a position
	 * {@link module:engine/model/position~Position#isBefore is before} another one, it will be on an earlier index in the diff set.
	 *
	 * **Note**: Elements inside inserted element will not have a separate diff item, only the top most element change will be reported.
	 *
	 * Because calculating the diff is a costly operation, the result is cached. If no new operation was buffered since the
	 * previous {@link #getChanges} call, the next call will return the cached value.
	 *
	 * @param options Additional options.
	 * @param options.includeChangesInGraveyard If set to `true`, also changes that happened
	 * in the graveyard root will be returned. By default, changes in the graveyard root are not returned.
	 * @returns Diff between the old and the new model tree state.
	 */
	public getChanges( options: { includeChangesInGraveyard?: boolean } = {} ): Array<DiffItem> {
		// If there are cached changes, just return them instead of calculating changes again.
		if ( this._cachedChanges ) {
			if ( options.includeChangesInGraveyard ) {
				return this._cachedChangesWithGraveyard!.slice();
			} else {
				return this._cachedChanges.slice();
			}
		}

		// Will contain returned results.
		let diffSet: Array<DiffItem & DiffItemInternal> = [];

		// Check all changed elements.
		for ( const element of this._changesInElement.keys() ) {
			// Get changes for this element and sort them.
			const changes = this._changesInElement.get( element )!.sort( ( a, b ) => {
				if ( a.offset === b.offset ) {
					if ( a.type != b.type ) {
						// If there are multiple changes at the same position, "remove" change should be first.
						// If the order is different, for example, we would first add some nodes and then removed them
						// (instead of the nodes that we should remove).
						return a.type == 'remove' ? -1 : 1;
					}

					return 0;
				}

				return a.offset < b.offset ? -1 : 1;
			} );

			// Get children of this element before any change was applied on it.
			const snapshotChildren = this._elementSnapshots.get( element )!;
			// Get snapshot of current element's children.
			const elementChildren = _getChildrenSnapshot( element.getChildren() );

			// Generate actions basing on changes done on element.
			const actions = _generateActionsFromChanges( snapshotChildren.length, changes );

			let i = 0; // Iterator in `elementChildren` array -- iterates through current children of element.
			let j = 0; // Iterator in `snapshotChildren` array -- iterates through old children of element.

			// Process every action.
			for ( const action of actions ) {
				if ( action === 'i' ) {
					// Generate diff item for this element and insert it into the diff set.
					diffSet.push( this._getInsertDiff( element, i, elementChildren[ i ] ) );

					i++;
				} else if ( action === 'r' ) {
					// Generate diff item for this element and insert it into the diff set.
					diffSet.push( this._getRemoveDiff( element, i, snapshotChildren[ j ] ) );

					j++;
				} else if ( action === 'a' ) {
					// Take attributes from saved and current children.
					const elementAttributes = elementChildren[ i ].attributes;
					const snapshotAttributes = snapshotChildren[ j ].attributes;
					let range;

					if ( elementChildren[ i ].name == '$text' ) {
						range = new Range( Position._createAt( element, i ), Position._createAt( element, i + 1 ) );
					} else {
						const index = element.offsetToIndex( i );
						range = new Range( Position._createAt( element, i ), Position._createAt( element.getChild( index )!, 0 ) );
					}

					// Generate diff items for this change (there might be multiple attributes changed and
					// there is a single diff for each of them) and insert them into the diff set.
					diffSet.push( ...this._getAttributesDiff( range, snapshotAttributes, elementAttributes ) );

					i++;
					j++;
				} else {
					// `action` is 'equal'. Child not changed.
					i++;
					j++;
				}
			}
		}

		// Then, sort the changes by the position (change at position before other changes is first).
		diffSet.sort( ( a, b ) => {
			// If the change is in different root, we don't care much, but we'd like to have all changes in given
			// root "together" in the array. So let's just sort them by the root name. It does not matter which root
			// will be processed first.
			if ( a.position!.root != b.position!.root ) {
				return a.position!.root.rootName! < b.position!.root.rootName! ? -1 : 1;
			}

			// If change happens at the same position...
			if ( a.position!.isEqual( b.position! ) ) {
				// Keep chronological order of operations.
				return a.changeCount! - b.changeCount!;
			}

			// If positions differ, position "on the left" should be earlier in the result.
			return a.position!.isBefore( b.position! ) ? -1 : 1;
		} );

		// Glue together multiple changes (mostly on text nodes).
		for ( let i = 1, prevIndex = 0; i < diffSet.length; i++ ) {
			const prevDiff = diffSet[ prevIndex ];
			const thisDiff = diffSet[ i ];

			// Glue remove changes if they happen on text on same position.
			const isConsecutiveTextRemove =
				prevDiff.type == 'remove' && thisDiff.type == 'remove' &&
				prevDiff.name == '$text' && thisDiff.name == '$text' &&
				prevDiff.position.isEqual( thisDiff.position );

			// Glue insert changes if they happen on text on consecutive fragments.
			const isConsecutiveTextAdd =
				prevDiff.type == 'insert' && thisDiff.type == 'insert' &&
				prevDiff.name == '$text' && thisDiff.name == '$text' &&
				prevDiff.position.parent == thisDiff.position.parent &&
				prevDiff.position.offset + prevDiff.length == thisDiff.position.offset;

			// Glue attribute changes if they happen on consecutive fragments and have same key, old value and new value.
			const isConsecutiveAttributeChange =
				prevDiff.type == 'attribute' && thisDiff.type == 'attribute' &&
				prevDiff.position!.parent == thisDiff.position!.parent &&
				prevDiff.range.isFlat && thisDiff.range.isFlat &&
				( prevDiff.position!.offset + prevDiff.length! ) == thisDiff.position!.offset &&
				prevDiff.attributeKey == thisDiff.attributeKey &&
				prevDiff.attributeOldValue == thisDiff.attributeOldValue &&
				prevDiff.attributeNewValue == thisDiff.attributeNewValue;

			if ( isConsecutiveTextRemove || isConsecutiveTextAdd || isConsecutiveAttributeChange ) {
				prevDiff.length!++;

				if ( isConsecutiveAttributeChange ) {
					( prevDiff.range as any ).end = prevDiff.range.end.getShiftedBy( 1 );
				}

				diffSet[ i ] = null as any;
			} else {
				prevIndex = i;
			}
		}

		diffSet = diffSet.filter( v => v );

		// Remove `changeCount` property from diff items. It is used only for sorting and is internal thing.
		for ( const item of diffSet ) {
			delete item.changeCount;

			if ( item.type == 'attribute' ) {
				delete item.position;
				delete item.length;
			}
		}

		this._changeCount = 0;

		// Cache changes.
		this._cachedChangesWithGraveyard = diffSet;
		this._cachedChanges = diffSet.filter( _changesInGraveyardFilter );

		if ( options.includeChangesInGraveyard ) {
			return this._cachedChangesWithGraveyard.slice();
		} else {
			return this._cachedChanges.slice();
		}
	}

	/**
	 * Returns all roots that have changed (either were attached, or detached, or their attributes changed).
	 *
	 * @returns Diff between the old and the new roots state.
	 */
	public getChangedRoots(): Array<DiffItemRoot> {
		return Array.from( this._changedRoots.values() ).map( diffItem => {
			const entry = { ...diffItem };

			if ( entry.state !== undefined ) {
				// The root was attached or detached -- do not return its attributes changes.
				// If the root was attached, it should be handled as a whole, together with its attributes, the same way as model nodes.
				// If the root was detached, its attributes should be discarded anyway.
				//
				// Keep in mind that filtering must happen on this stage (when retrieving changes). If filtering happens on-the-fly as
				// the attributes change, it may lead to incorrect situation, e.g.: detach root, change attribute, re-attach root.
				// In this case, attribute change cannot be filtered. After the root is re-attached, the attribute change must be kept.
				delete entry.attributes;
			}

			return entry;
		} );
	}

	/**
	 * Returns a set of model items that were marked to get refreshed.
	 */
	public getRefreshedItems(): Set<Item> {
		return new Set( this._refreshedItems );
	}

	/**
	 * Resets `Differ`. Removes all buffered changes.
	 */
	public reset(): void {
		this._changesInElement.clear();
		this._elementSnapshots.clear();
		this._changedMarkers.clear();
		this._changedRoots.clear();
		this._refreshedItems = new Set();
		this._cachedChanges = null;
	}

	/**
	 * Buffers the root state change after the root was attached or detached
	 */
	private _bufferRootStateChange( rootName: string, isAttached: boolean ): void {
		if ( !this._changedRoots.has( rootName ) ) {
			this._changedRoots.set( rootName, { name: rootName, state: isAttached ? 'attached' : 'detached' } );

			return;
		}

		const diffItem = this._changedRoots.get( rootName )!;

		if ( diffItem.state !== undefined ) {
			// Root `state` can only toggle between one of the values and no value. It cannot be any other way,
			// because if the root was originally attached it can only become detached. Then, if it is re-attached in the same batch of
			// changes, it gets back to "no change" (which means no value). Same if the root was originally detached.
			delete diffItem.state;

			if ( diffItem.attributes === undefined ) {
				// If there is no `state` change and no `attributes` change, remove the entry.
				this._changedRoots.delete( rootName );
			}
		} else {
			diffItem.state = isAttached ? 'attached' : 'detached';
		}
	}

	/**
	 * Buffers a root attribute change.
	 */
	private _bufferRootAttributeChange( rootName: string, key: string, oldValue: unknown, newValue: unknown ): void {
		const diffItem: DiffItemRoot = this._changedRoots.get( rootName ) || { name: rootName };
		const attrs: Record<string, { oldValue: unknown; newValue: unknown }> = diffItem.attributes || {};

		if ( attrs[ key ] ) {
			// If this attribute or metadata was already changed earlier and is changed again, check to what value it is changed.
			const attrEntry = attrs[ key ];

			if ( newValue === attrEntry.oldValue ) {
				// If it was changed back to the old value, remove the entry.
				delete attrs[ key ];
			} else {
				// If it was changed to a different value, update the entry.
				attrEntry.newValue = newValue;
			}
		} else {
			// If this attribute or metadata was not set earlier, add an entry.
			attrs[ key ] = { oldValue, newValue };
		}

		if ( Object.entries( attrs ).length === 0 ) {
			// If attributes or metadata changes set became empty, remove it from the diff item.
			delete diffItem.attributes;

			if ( diffItem.state === undefined ) {
				// If there is no `state` change and no `attributes` change, remove the entry.
				this._changedRoots.delete( rootName );
			}
		} else {
			// Make sure that, if a new object in the structure was created, it gets set.
			diffItem.attributes = attrs;

			this._changedRoots.set( rootName, diffItem );
		}
	}

	/**
	 * Marks the given `item` in differ to be "refreshed". It means that the item will be marked as removed and inserted
	 * in the differ changes set, so it will be effectively re-converted when the differ changes are handled by a dispatcher.
	 *
	 * @internal
	 * @param item Item to refresh.
	 */
	public _refreshItem( item: Item ): void {
		if ( this._isInInsertedElement( item.parent! ) ) {
			return;
		}

		this._markRemove( item.parent!, item.startOffset!, item.offsetSize );
		this._markInsert( item.parent!, item.startOffset!, item.offsetSize );

		this._refreshedItems.add( item );

		const range = Range._createOn( item );

		for ( const marker of this._markerCollection.getMarkersIntersectingRange( range ) ) {
			const markerData = marker.getData();

			this.bufferMarkerChange( marker.name, markerData, markerData );
		}

		// Clear cache after each buffered operation as it is no longer valid.
		this._cachedChanges = null;
	}

	/**
	 * Buffers all the data related to given root like it was all just added to the editor.
	 *
	 * Following changes are buffered:
	 *
	 * * root is attached,
	 * * all root content is inserted,
	 * * all root attributes are added,
	 * * all markers inside the root are added.
	 *
	 * @internal
	 */
	public _bufferRootLoad( root: RootElement ): void {
		if ( !root.isAttached() ) {
			return;
		}

		this._bufferRootStateChange( root.rootName, true );
		this._markInsert( root, 0, root.maxOffset );

		// Buffering root attribute changes makes sense and is actually needed, even though we buffer root state change above.
		// Because the root state change is buffered, the root attributes changes are not returned by the differ.
		// But, if the root attribute is removed in the same change block, or the root is detached, then the differ results would be wrong.
		//
		for ( const key of root.getAttributeKeys() ) {
			this._bufferRootAttributeChange( root.rootName, key, null, root.getAttribute( key ) );
		}

		for ( const marker of this._markerCollection ) {
			if ( marker.getRange().root == root ) {
				const markerData = marker.getData();

				this.bufferMarkerChange( marker.name, { ...markerData, range: null }, markerData );
			}
		}
	}

	/**
	 * Saves and handles an insert change.
	 */
	private _markInsert( parent: Element | DocumentFragment, offset: number, howMany: number ) {
		if ( parent.root.is( 'rootElement' ) && !parent.root._isLoaded ) {
			return;
		}

		const changeItem = { type: 'insert', offset, howMany, count: this._changeCount++ } as const;

		this._markChange( parent, changeItem );
	}

	/**
	 * Saves and handles a remove change.
	 */
	private _markRemove( parent: Element | DocumentFragment, offset: number, howMany: number ) {
		if ( parent.root.is( 'rootElement' ) && !parent.root._isLoaded ) {
			return;
		}

		const changeItem = { type: 'remove', offset, howMany, count: this._changeCount++ } as const;

		this._markChange( parent, changeItem );

		this._removeAllNestedChanges( parent, offset, howMany );
	}

	/**
	 * Saves and handles an attribute change.
	 */
	private _markAttribute( item: Item ): void {
		if ( item.root.is( 'rootElement' ) && !item.root._isLoaded ) {
			return;
		}

		const changeItem = { type: 'attribute', offset: item.startOffset!, howMany: item.offsetSize, count: this._changeCount++ } as const;

		this._markChange( item.parent as Element, changeItem );
	}

	/**
	 * Saves and handles a model change.
	 */
	private _markChange( parent: Element | DocumentFragment, changeItem: ChangeItem ): void {
		// First, make a snapshot of this parent's children (it will be made only if it was not made before).
		this._makeSnapshot( parent );

		// Then, get all changes that already were done on the element (empty array if this is the first change).
		const changes = this._getChangesForElement( parent );

		// Then, look through all the changes, and transform them or the new change.
		this._handleChange( changeItem, changes );

		// Add the new change.
		changes.push( changeItem );

		// Remove incorrect changes. During transformation some change might be, for example, included in another.
		// In that case, the change will have `howMany` property set to `0` or less. We need to remove those changes.
		for ( let i = 0; i < changes.length; i++ ) {
			if ( changes[ i ].howMany < 1 ) {
				changes.splice( i, 1 );

				i--;
			}
		}
	}

	/**
	 * Gets an array of changes that have already been saved for a given element.
	 */
	private _getChangesForElement( element: Element | DocumentFragment ): Array<ChangeItem> {
		let changes: Array<ChangeItem>;

		if ( this._changesInElement.has( element ) ) {
			changes = this._changesInElement.get( element )!;
		} else {
			changes = [];

			this._changesInElement.set( element, changes );
		}

		return changes;
	}

	/**
	 * Saves a children snapshot for a given element.
	 */
	private _makeSnapshot( element: Element | DocumentFragment ): void {
		if ( !this._elementSnapshots.has( element ) ) {
			this._elementSnapshots.set( element, _getChildrenSnapshot( element.getChildren() ) );
		}
	}

	/**
	 * For a given newly saved change, compares it with a change already done on the element and modifies the incoming
	 * change and/or the old change.
	 *
	 * @param inc Incoming (new) change.
	 * @param changes An array containing all the changes done on that element.
	 */
	private _handleChange( inc: ChangeItem, changes: Array<ChangeItem> ): void {
		// We need a helper variable that will store how many nodes are to be still handled for this change item.
		// `nodesToHandle` (how many nodes still need to be handled) and `howMany` (how many nodes were affected)
		// needs to be differentiated.
		//
		// This comes up when there are multiple changes that are affected by `inc` change item.
		//
		// For example: assume two insert changes: `{ offset: 2, howMany: 1 }` and `{ offset: 5, howMany: 1 }`.
		// Assume that `inc` change is remove `{ offset: 2, howMany: 2, nodesToHandle: 2 }`.
		//
		// Then, we:
		// - "forget" about first insert change (it is "eaten" by remove),
		// - because of that, at the end we will want to remove only one node (`nodesToHandle = 1`),
		// - but still we have to change offset of the second insert change from `5` to `3`!
		//
		// So, `howMany` does not change throughout items transformation and keeps information about how many nodes were affected,
		// while `nodesToHandle` means how many nodes need to be handled after the change item is transformed by other changes.
		inc.nodesToHandle = inc.howMany;

		for ( const old of changes ) {
			const incEnd = inc.offset + inc.howMany;
			const oldEnd = old.offset + old.howMany;

			if ( inc.type == 'insert' ) {
				if ( old.type == 'insert' ) {
					if ( inc.offset <= old.offset ) {
						old.offset += inc.howMany;
					} else if ( inc.offset < oldEnd ) {
						old.howMany += inc.nodesToHandle;
						inc.nodesToHandle = 0;
					}
				}

				if ( old.type == 'remove' ) {
					if ( inc.offset < old.offset ) {
						old.offset += inc.howMany;
					}
				}

				if ( old.type == 'attribute' ) {
					if ( inc.offset <= old.offset ) {
						old.offset += inc.howMany;
					} else if ( inc.offset < oldEnd ) {
						// This case is more complicated, because attribute change has to be split into two.
						// Example (assume that uppercase and lowercase letters mean different attributes):
						//
						// initial state:		abcxyz
						// attribute change:	aBCXYz
						// incoming insert:		aBCfooXYz
						//
						// Change ranges cannot intersect because each item has to be described exactly (it was either
						// not changed, inserted, removed, or its attribute was changed). That's why old attribute
						// change has to be split and both parts has to be handled separately from now on.
						const howMany = old.howMany;

						old.howMany = inc.offset - old.offset;

						// Add the second part of attribute change to the beginning of processed array so it won't
						// be processed again in this loop.
						changes.unshift( {
							type: 'attribute',
							offset: incEnd,
							howMany: howMany - old.howMany,
							count: this._changeCount++
						} );
					}
				}
			}

			if ( inc.type == 'remove' ) {
				if ( old.type == 'insert' ) {
					if ( incEnd <= old.offset ) {
						old.offset -= inc.howMany;
					} else if ( incEnd <= oldEnd ) {
						if ( inc.offset < old.offset ) {
							const intersectionLength = incEnd - old.offset;

							old.offset = inc.offset;

							old.howMany -= intersectionLength;
							inc.nodesToHandle -= intersectionLength;
						} else {
							old.howMany -= inc.nodesToHandle;
							inc.nodesToHandle = 0;
						}
					} else {
						if ( inc.offset <= old.offset ) {
							inc.nodesToHandle -= old.howMany;
							old.howMany = 0;
						} else if ( inc.offset < oldEnd ) {
							const intersectionLength = oldEnd - inc.offset;

							old.howMany -= intersectionLength;
							inc.nodesToHandle -= intersectionLength;
						}
					}
				}

				if ( old.type == 'remove' ) {
					if ( incEnd <= old.offset ) {
						old.offset -= inc.howMany;
					} else if ( inc.offset < old.offset ) {
						inc.nodesToHandle += old.howMany;
						old.howMany = 0;
					}
				}

				if ( old.type == 'attribute' ) {
					if ( incEnd <= old.offset ) {
						old.offset -= inc.howMany;
					} else if ( inc.offset < old.offset ) {
						const intersectionLength = incEnd - old.offset;

						old.offset = inc.offset;
						old.howMany -= intersectionLength;
					} else if ( inc.offset < oldEnd ) {
						if ( incEnd <= oldEnd ) {
							// On first sight in this case we don't need to split attribute operation into two.
							// However the changes set is later converted to actions (see `_generateActionsFromChanges`).
							// For that reason, no two changes may intersect.
							// So we cannot have an attribute change that "contains" remove change.
							// Attribute change needs to be split.
							const howMany = old.howMany;

							old.howMany = inc.offset - old.offset;

							const howManyAfter = howMany - old.howMany - inc.nodesToHandle;

							// Add the second part of attribute change to the beginning of processed array so it won't
							// be processed again in this loop.
							changes.unshift( {
								type: 'attribute',
								offset: inc.offset,
								howMany: howManyAfter,
								count: this._changeCount++
							} );
						} else {
							old.howMany -= oldEnd - inc.offset;
						}
					}
				}
			}

			if ( inc.type == 'attribute' ) {
				// In case of attribute change, `howMany` should be kept same as `nodesToHandle`. It's not an error.
				if ( old.type == 'insert' ) {
					if ( inc.offset < old.offset && incEnd > old.offset ) {
						if ( incEnd > oldEnd ) {
							// This case is similar to a case described when incoming change was insert and old change was attribute.
							// See comment above.
							//
							// This time incoming change is attribute. We need to split incoming change in this case too.
							// However this time, the second part of the attribute change needs to be processed further
							// because there might be other changes that it collides with.
							const attributePart = {
								type: 'attribute',
								offset: oldEnd,
								howMany: incEnd - oldEnd,
								count: this._changeCount++
							} as const;

							this._handleChange( attributePart, changes );

							changes.push( attributePart );
						}

						inc.nodesToHandle = old.offset - inc.offset;
						inc.howMany = inc.nodesToHandle;
					} else if ( inc.offset >= old.offset && inc.offset < oldEnd ) {
						if ( incEnd > oldEnd ) {
							inc.nodesToHandle = incEnd - oldEnd;
							inc.offset = oldEnd;
						} else {
							inc.nodesToHandle = 0;
						}
					}
				}

				if ( old.type == 'remove' ) {
					// This is a case when attribute change "contains" remove change.
					// The attribute change needs to be split into two because changes cannot intersect.
					if ( inc.offset < old.offset && incEnd > old.offset ) {
						const attributePart = {
							type: 'attribute',
							offset: old.offset,
							howMany: incEnd - old.offset,
							count: this._changeCount++
						} as const;

						this._handleChange( attributePart, changes );

						changes.push( attributePart );

						inc.nodesToHandle = old.offset - inc.offset;
						inc.howMany = inc.nodesToHandle;
					}
				}

				if ( old.type == 'attribute' ) {
					// There are only two conflicting scenarios possible here:
					if ( inc.offset >= old.offset && incEnd <= oldEnd ) {
						// `old` change includes `inc` change, or they are the same.
						inc.nodesToHandle = 0;
						inc.howMany = 0;
						inc.offset = 0;
					} else if ( inc.offset <= old.offset && incEnd >= oldEnd ) {
						// `inc` change includes `old` change.
						old.howMany = 0;
					}
				}
			}
		}

		inc.howMany = inc.nodesToHandle;
		delete inc.nodesToHandle;
	}

	/**
	 * Returns an object with a single insert change description.
	 *
	 * @param parent The element in which the change happened.
	 * @param offset The offset at which change happened.
	 * @param elementSnapshot The snapshot of the removed element a character.
	 * @returns The diff item.
	 */
	private _getInsertDiff(
		parent: Element | DocumentFragment,
		offset: number,
		elementSnapshot: DifferSnapshot
	): DiffItemInsert & DiffItemInternal {
		return {
			type: 'insert',
			position: Position._createAt( parent, offset ),
			name: elementSnapshot.name,
			attributes: new Map( elementSnapshot.attributes ),
			length: 1,
			changeCount: this._changeCount++,
			_element: elementSnapshot.element
		};
	}

	/**
	 * Returns an object with a single remove change description.
	 *
	 * @param parent The element in which change happened.
	 * @param offset The offset at which change happened.
	 * @param elementSnapshot The snapshot of the removed element a character.
	 * @returns The diff item.
	 */
	private _getRemoveDiff(
		parent: Element | DocumentFragment,
		offset: number,
		elementSnapshot: DifferSnapshot
	): DiffItemRemove & DiffItemInternal {
		return {
			type: 'remove',
			position: Position._createAt( parent, offset ),
			name: elementSnapshot.name,
			attributes: new Map( elementSnapshot.attributes ),
			length: 1,
			changeCount: this._changeCount++,
			_element: elementSnapshot.element
		};
	}

	/**
	 * Returns an array of objects where each one is a single attribute change description.
	 *
	 * @param range The range where the change happened.
	 * @param oldAttributes A map, map iterator or compatible object that contains attributes before the change.
	 * @param newAttributes A map, map iterator or compatible object that contains attributes after the change.
	 * @returns An array containing one or more diff items.
	 */
	private _getAttributesDiff(
		range: Range,
		oldAttributes: Map<string, unknown>,
		newAttributes: Map<string, unknown>
	): Array<DiffItemAttribute & DiffItemInternal> {
		// Results holder.
		const diffs: Array<DiffItemAttribute & DiffItemInternal> = [];

		// Clone new attributes as we will be performing changes on this object.
		newAttributes = new Map( newAttributes );

		// Look through old attributes.
		for ( const [ key, oldValue ] of oldAttributes ) {
			// Check what is the new value of the attribute (or if it was removed).
			const newValue = newAttributes.has( key ) ? newAttributes.get( key ) : null;

			// If values are different (or attribute was removed)...
			if ( newValue !== oldValue ) {
				// Add diff item.
				diffs.push( {
					type: 'attribute',
					position: range.start,
					range: range.clone(),
					length: 1,
					attributeKey: key,
					attributeOldValue: oldValue,
					attributeNewValue: newValue,
					changeCount: this._changeCount++
				} );
			}

			// Prevent returning two diff items for the same change.
			newAttributes.delete( key );
		}

		// Look through new attributes that weren't handled above.
		for ( const [ key, newValue ] of newAttributes ) {
			// Each of them is a new attribute. Add diff item.
			diffs.push( {
				type: 'attribute',
				position: range.start,
				range: range.clone(),
				length: 1,
				attributeKey: key,
				attributeOldValue: null,
				attributeNewValue: newValue,
				changeCount: this._changeCount++
			} );
		}

		return diffs;
	}

	/**
	 * Checks whether given element or any of its parents is an element that is buffered as an inserted element.
	 */
	private _isInInsertedElement( element: Element | DocumentFragment ): boolean {
		const parent = element.parent;

		if ( !parent ) {
			return false;
		}

		const changes = this._changesInElement.get( parent );
		const offset = element.startOffset;

		if ( changes ) {
			for ( const change of changes ) {
				if ( change.type == 'insert' && offset! >= change.offset && offset! < change.offset + change.howMany ) {
					return true;
				}
			}
		}

		return this._isInInsertedElement( parent );
	}

	/**
	 * Removes deeply all buffered changes that are registered in elements from range specified by `parent`, `offset`
	 * and `howMany`.
	 */
	private _removeAllNestedChanges( parent: Element | DocumentFragment, offset: number, howMany: number ) {
		const range = new Range( Position._createAt( parent, offset ), Position._createAt( parent, offset + howMany ) );

		for ( const item of range.getItems( { shallow: true } ) ) {
			if ( item.is( 'element' ) ) {
				this._elementSnapshots.delete( item );
				this._changesInElement.delete( item );

				this._removeAllNestedChanges( item, 0, item.maxOffset );
			}
		}
	}
}

interface ChangeItem {
	type: 'insert' | 'remove' | 'attribute';
	offset: number;
	howMany: number;
	count: number;
	nodesToHandle?: number;
}

/**
 * Returns an array that is a copy of passed child list with the exception that text nodes are split to one or more
 * objects, each representing one character and attributes set on that character.
 */
function _getChildrenSnapshot( children: Iterable<Node> ): Array<DifferSnapshot> {
	const snapshot: Array<DifferSnapshot> = [];

	for ( const child of children ) {
		if ( child.is( '$text' ) ) {
			for ( let i = 0; i < child.data.length; i++ ) {
				snapshot.push( {
					name: '$text',
					attributes: new Map( child.getAttributes() )
				} );
			}
		} else {
			snapshot.push( {
				name: ( child as Element ).name,
				attributes: new Map( child.getAttributes() ),
				element: child as Element
			} );
		}
	}

	return snapshot;
}

/**
 * Generates array of actions for given changes set.
 * It simulates what `diff` function does.
 * Generated actions are:
 * - 'e' for 'equal' - when item at that position did not change,
 * - 'i' for 'insert' - when item at that position was inserted,
 * - 'r' for 'remove' - when item at that position was removed,
 * - 'a' for 'attribute' - when item at that position has it attributes changed.
 *
 * Example (assume that uppercase letters have bold attribute, compare with function code):
 *
 * children before:	fooBAR
 * children after:	foxybAR
 *
 * changes: type: remove, offset: 1, howMany: 1
 *			type: insert, offset: 2, howMany: 2
 *			type: attribute, offset: 4, howMany: 1
 *
 * expected actions: equal (f), remove (o), equal (o), insert (x), insert (y), attribute (b), equal (A), equal (R)
 *
 * steps taken by th script:
 *
 * 1. change = "type: remove, offset: 1, howMany: 1"; offset = 0; oldChildrenHandled = 0
 *    1.1 between this change and the beginning is one not-changed node, fill with one equal action, one old child has been handled
 *    1.2 this change removes one node, add one remove action
 *    1.3 change last visited `offset` to 1
 *    1.4 since an old child has been removed, one more old child has been handled
 *    1.5 actions at this point are: equal, remove
 *
 * 2. change = "type: insert, offset: 2, howMany: 2"; offset = 1; oldChildrenHandled = 2
 *    2.1 between this change and previous change is one not-changed node, add equal action, another one old children has been handled
 *    2.2 this change inserts two nodes, add two insert actions
 *    2.3 change last visited offset to the end of the inserted range, that is 4
 *    2.4 actions at this point are: equal, remove, equal, insert, insert
 *
 * 3. change = "type: attribute, offset: 4, howMany: 1"; offset = 4, oldChildrenHandled = 3
 *    3.1 between this change and previous change are no not-changed nodes
 *    3.2 this change changes one node, add one attribute action
 *    3.3 change last visited `offset` to the end of change range, that is 5
 *    3.4 since an old child has been changed, one more old child has been handled
 *    3.5 actions at this point are: equal, remove, equal, insert, insert, attribute
 *
 * 4. after loop oldChildrenHandled = 4, oldChildrenLength = 6 (fooBAR is 6 characters)
 *    4.1 fill up with two equal actions
 *
 * The result actions are: equal, remove, equal, insert, insert, attribute, equal, equal.
 */
function _generateActionsFromChanges( oldChildrenLength: number, changes: Array<ChangeItem> ) {
	const actions: Array<string> = [];

	let offset = 0;
	let oldChildrenHandled = 0;

	// Go through all buffered changes.
	for ( const change of changes ) {
		// First, fill "holes" between changes with "equal" actions.
		if ( change.offset > offset ) {
			for ( let i = 0; i < change.offset - offset; i++ ) {
				actions.push( 'e' );
			}

			oldChildrenHandled += change.offset - offset;
		}

		// Then, fill up actions accordingly to change type.
		if ( change.type == 'insert' ) {
			for ( let i = 0; i < change.howMany; i++ ) {
				actions.push( 'i' );
			}

			// The last handled offset is after inserted range.
			offset = change.offset + change.howMany;
		} else if ( change.type == 'remove' ) {
			for ( let i = 0; i < change.howMany; i++ ) {
				actions.push( 'r' );
			}

			// The last handled offset is at the position where the nodes were removed.
			offset = change.offset;
			// We removed `howMany` old nodes, update `oldChildrenHandled`.
			oldChildrenHandled += change.howMany;
		} else {
			actions.push( ...'a'.repeat( change.howMany ).split( '' ) );

			// The last handled offset is at the position after the changed range.
			offset = change.offset + change.howMany;
			// We changed `howMany` old nodes, update `oldChildrenHandled`.
			oldChildrenHandled += change.howMany;
		}
	}

	// Fill "equal" actions at the end of actions set. Use `oldChildrenHandled` to see how many children
	// has not been changed / removed at the end of their parent.
	if ( oldChildrenHandled < oldChildrenLength ) {
		for ( let i = 0; i < oldChildrenLength - oldChildrenHandled - offset; i++ ) {
			actions.push( 'e' );
		}
	}

	return actions;
}

/**
 * Filter callback for Array.filter that filters out change entries that are in graveyard.
 */
function _changesInGraveyardFilter( entry: DiffItem ) {
	const posInGy = 'position' in entry && entry.position!.root.rootName == '$graveyard';
	const rangeInGy = 'range' in entry && entry.range.root.rootName == '$graveyard';

	return !posInGy && !rangeInGy;
}

interface DifferSnapshot {
	element?: Element;
	name: string;
	attributes: Map<string, unknown>;
}

/**
 * The single diff item.
 *
 * Could be one of:
 *
 * * {@link module:engine/model/differ~DiffItemInsert `DiffItemInsert`},
 * * {@link module:engine/model/differ~DiffItemRemove `DiffItemRemove`},
 * * {@link module:engine/model/differ~DiffItemAttribute `DiffItemAttribute`}.
 */
export type DiffItem = DiffItemInsert | DiffItemRemove | DiffItemAttribute;

/**
 * A single diff item for inserted nodes.
 */
export interface DiffItemInsert {

	/**
	 * The type of diff item.
	 */
	type: 'insert';

	/**
	 * Reference to the model element that was inserted.
	 *
	 * Undefined if the diff item is related to text node insertion.
	 *
	 * @internal
	 */
	_element?: Element;

	/**
	 * The name of the inserted elements or `'$text'` for a text node.
	 */
	name: string;

	/**
	 * Map of attributes that were set on the item while it was inserted.
	 */
	attributes: Map<string, unknown>;

	/**
	 * The position where the node was inserted.
	 */
	position: Position;

	/**
	 * The length of an inserted text node. For elements, it is always 1 as each inserted element is counted as a one.
	 */
	length: number;
}

/**
 * A single diff item for removed nodes.
 */
export interface DiffItemRemove {

	/**
	 * The type of diff item.
	 */
	type: 'remove';

	/**
	 * Reference to the model element that was removed.
	 *
	 * Undefined if the diff item is related to text node deletion.
	 *
	 * Note that this element will have the state after all changes has been performed on the model, not before. For example, if a paragraph
	 * was first renamed to `heading1`, and then removed, `element.name` will be `heading1`. Similarly, with attributes. Also, you should
	 * not read the element's position, as it will no longer point to the original element position.
	 *
	 * Instead, you should use {@link ~DiffItemRemove#name `DiffItemRemove#name`},
	 * {@link ~DiffItemRemove#attributes `DiffItemRemove#attributes`}, and {@link ~DiffItemRemove#position `DiffItemRemove#position`}.
	 *
	 * This property should be only used to check instance reference equality. For example, if you want to detect that some particular
	 * element was removed, you can check `_element` property. You can use it together with {@link ~DiffItemInsert#_element `#_element`} on
	 * insert diff items to detect move, refresh, or rename changes.
	 *
	 * @internal
	 */
	_element?: Element;

	/**
	 * The name of the removed element or `'$text'` for a text node.
	 */
	name: string;

	/**
	 * Map of attributes that were set on the item while it was removed.
	 */
	attributes: Map<string, unknown>;

	/**
	 * The position where the node was removed.
	 */
	position: Position;

	/**
	 * The length of a removed text node. For elements, it is always 1, as each removed element is counted as a one.
	 */
	length: number;
}

/**
 * A single diff item for attribute change.
 */
export interface DiffItemAttribute {

	/**
	 * The type of diff item.
	 */
	type: 'attribute';

	/**
	 * The name of the changed attribute.
	 */
	attributeKey: string;

	/**
	 * An attribute previous value (before change).
	 */
	attributeOldValue: unknown;

	/**
	 * An attribute new value (after change).
	 */
	attributeNewValue: unknown;

	/**
	 * The range where the change happened.
	 */
	range: Range;
}

/**
 * A single diff item for a changed root.
 */
export interface DiffItemRoot {

	/**
	 * Name of the changed root.
	 */
	name: string;

	/**
	 * Set accordingly if the root got attached or detached. Otherwise, not set.
	 */
	state?: 'attached' | 'detached';

	/**
	 * Keeps all attribute changes that happened on the root.
	 *
	 * The keys are keys of the changed attributes. The values are objects containing the attribute value before the change
	 * (`oldValue`) and after the change (`newValue`).
	 *
	 * Note, that if the root state changed (`state` is set), then `attributes` property will not be set. All attributes should be
	 * handled together with the root being attached or detached.
	 */
	attributes?: Record<string, { oldValue: unknown; newValue: unknown }>;
}

interface DiffItemInternal {
	changeCount?: number;
	position?: Position;
	length?: number;
}
