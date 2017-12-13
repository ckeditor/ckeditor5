/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/differ
 */

import Position from './position';
import Range from './range';

/**
 * Calculates difference between two model states.
 *
 * Receives operations that are to be applied on the model document. Marks parts of the model document tree which
 * are changed and saves those elements state before the change. Then, it compares saved elements with the
 * changed elements, after all changes are applied on the model document. Calculates the diff between saved
 * elements and new ones and returns a changes set.
 */
export default class Differ {
	constructor() {
		/**
		 * A map that stores changes that happened in given element.
		 *
		 * The keys of the map are references to the model elements.
		 * The values of the map are arrays with changes that were done on this element.
		 *
		 * @private
		 * @type {Map}
		 */
		this._changesInElement = new Map();

		/**
		 * A map that stores "element's children snapshots". A snapshot is representing children of given element before
		 * the first change was applied on that element. Snapshot items are objects with two properties: `name`,
		 * containing element name (or `'$text'` for text node) and `attributes` which is a map of a node's attributes.
		 *
		 * @private
		 * @type {Map}
		 */
		this._elementSnapshots = new Map();

		/**
		 * A map that stores all changed markers.
		 *
		 * The keys of the map are marker names.
		 * The values of the map are objects with properties `oldRange` and `newRange`. Those holds the marker range
		 * state before and after the change.
		 *
		 * @private
		 * @type {Map}
		 */
		this._changedMarkers = new Map();

		/**
		 * Stores how many changes has been processed. Used to order changes chronologically. It is important
		 * when changes are sorted.
		 *
		 * @private
		 * @type {Number}
		 */
		this._changeCount = 0;
	}

	/**
	 * Buffers given operation. Operation has to be buffered before it is executed.
	 *
	 * Operation type is checked and it is checked which nodes it will affect. Then those nodes are stored in `Differ`
	 * in the state before the operation is executed.
	 *
	 * @param {module:engine/model/operation/operation~Operation} operation Operation to buffer.
	 */
	bufferOperation( operation ) {
		switch ( operation.type ) {
			case 'insert':
				this._markInsert( operation.position.parent, operation.position.offset, operation.nodes.maxOffset );

				break;
			case 'addAttribute':
			case 'removeAttribute':
			case 'changeAttribute':
				for ( const item of operation.range.getItems() ) {
					this._markAttribute( item );
				}

				break;
			case 'remove':
			case 'move':
			case 'reinsert':
				this._markRemove( operation.sourcePosition.parent, operation.sourcePosition.offset, operation.howMany );
				this._markInsert( operation.targetPosition.parent, operation.getMovedRangeStart().offset, operation.howMany );

				break;
			case 'rename':
				this._markRemove( operation.position.parent, operation.position.offset, 1 );
				this._markInsert( operation.position.parent, operation.position.offset, 1 );

				break;
		}
	}

	/**
	 * Buffers marker change.
	 *
	 * @param {String} markerName Name of marker which changed.
	 * @param {module:engine/model/range~Range|null} oldRange Marker range before the change or `null` if marker was just created.
	 * @param {module:engine/model/range~Range|null} newRange Marker range after the change or `null` if marker was removed.
	 */
	bufferMarkerChange( markerName, oldRange, newRange ) {
		const buffered = this._changedMarkers.get( markerName );

		if ( !buffered ) {
			this._changedMarkers.set( markerName, {
				oldRange,
				newRange
			} );
		} else {
			buffered.newRange = newRange;

			if ( buffered.oldRange == null && buffered.newRange == null ) {
				// The marker is going to be removed (`newRange == null`) but it did not exist before the change set
				// (`buffered.oldRange == null`). In this case, do not keep the marker in buffer at all.
				this._changedMarkers.delete( markerName );
			}
		}
	}

	/**
	 * Returns all markers which should be removed as a result of buffered changes.
	 *
	 * @returns {Array.<Object>} Markers to remove. Each array item is an object containing `name` and `range` property.
	 */
	getMarkersToRemove() {
		const result = [];

		for ( const [ name, change ] of this._changedMarkers ) {
			if ( change.oldRange != null ) {
				result.push( { name, range: change.oldRange } );
			}
		}

		return result;
	}

	/**
	 * Returns all markers which should be added as a result of buffered changes.
	 *
	 * @returns {Array.<Object>} Markers to add. Each array item is an object containing `name` and `range` property.
	 */
	getMarkersToAdd() {
		const result = [];

		for ( const [ name, change ] of this._changedMarkers ) {
			if ( change.newRange != null ) {
				result.push( { name, range: change.newRange } );
			}
		}

		return result;
	}

	/**
	 * Calculates diff between old model tree state (before all the buffered operations) and the new model tree state
	 * (actual one). Should be called after all buffered operations are executed.
	 *
	 * The diff set is returned as an array of diff items, each describing a change done on model. The items are sorted by
	 * the position on which the change happened. If a position {@link module:engine/model/position~Position#isBefore is before}
	 * another one, it will be on an earlier index in the diff set.
	 *
	 * @returns {Array.<Object>} Diff between old and new model tree state.
	 */
	getChanges() {
		// Will contain returned results.
		const diffSet = [];

		// Check all changed elements.
		for ( const element of this._changesInElement.keys() ) {
			// If the element is inside other changed element, skip changes in this element.
			if ( this._isInsertedOrRemoved( element ) ) {
				continue;
			}

			// Get changes for this element and sort them.
			const changes = this._changesInElement.get( element ).sort( ( a, b ) => {
				if ( a.offset === b.offset ) {
					if ( a.type != b.type ) {
						return a.type == 'remove' ? -1 : 1;
					}

					return 0;
				}

				return a.offset < b.offset ? -1 : 1;
			} );

			// Get children of this element before any change was applied on it.
			const snapshotChildren = this._elementSnapshots.get( element );
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
					diffSet.push( this._getInsertDiff( element, i, elementChildren[ i ].name ) );

					i++;
				} else if ( action === 'r' ) {
					// Generate diff item for this element and insert it into the diff set.
					diffSet.push( this._getRemoveDiff( element, i, snapshotChildren[ j ].name ) );

					j++;
				} else if ( action === 'a' ) {
					// Take attributes from saved and current children.
					const elementAttributes = elementChildren[ i ].attributes;
					const snapshotAttributes = snapshotChildren[ j ].attributes;
					let range;

					if ( elementChildren[ i ].name == '$text' ) {
						range = Range.createFromParentsAndOffsets( element, i, element, i + 1 );
					} else {
						const index = element.offsetToIndex( i );
						range = Range.createFromParentsAndOffsets( element, i, element.getChild( index ), 0 );
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
			if ( a.position.root != b.position.root ) {
				return a.position.root.rootName < b.position.root.rootName ? -1 : 1;
			}

			// If change happens at the same position...
			if ( a.position.isEqual( b.position ) ) {
				// Keep chronological order of operations.
				return a.changeCount < b.changeCount ? -1 : 1;
			}

			// If positions differ, position "on the left" should be earlier in the result.
			return a.position.isBefore( b.position ) ? -1 : 1;
		} );

		// Glue together multiple changes (mostly on text nodes).
		for ( let i = 1; i < diffSet.length; i++ ) {
			const prevDiff = diffSet[ i - 1 ];
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
				prevDiff.position.parent == thisDiff.position.parent &&
				prevDiff.range.isFlat && thisDiff.range.isFlat &&
				prevDiff.position.offset + prevDiff.length == thisDiff.position.offset &&
				prevDiff.attributeKey == thisDiff.attributeKey &&
				prevDiff.attributeOldValue == thisDiff.attributeOldValue &&
				prevDiff.attributeNewValue == thisDiff.attributeNewValue;

			if ( isConsecutiveTextRemove || isConsecutiveTextAdd || isConsecutiveAttributeChange ) {
				diffSet[ i - 1 ].length++;

				if ( isConsecutiveAttributeChange ) {
					diffSet[ i - 1 ].range.end = diffSet[ i - 1 ].range.end.getShiftedBy( 1 );
				}

				diffSet.splice( i, 1 );
				i--;
			}
		}

		// Remove `changeCount` property from diff items. It is used only for sorting and is internal thing.
		for ( const item of diffSet ) {
			delete item.changeCount;
		}

		this._changeCount = 0;

		return diffSet;
	}

	/**
	 * Resets `Differ`. Removes all buffered changes.
	 */
	reset() {
		this._changesInElement.clear();
		this._elementSnapshots.clear();
		this._changedMarkers.clear();
	}

	/**
	 * Checks whether given element is inserted or removed or one of its ancestor is inserted or removed. Used to
	 * filter out sub-changes in elements that are changed itself.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} element Element to check.
	 * @returns {Boolean}
	 */
	_isInsertedOrRemoved( element ) {
		let parent = element.parent;

		// Check all ancestors of given element.
		while ( parent ) {
			// Get the checked element's offset.
			const offset = element.startOffset;

			if ( this._changesInElement.has( parent ) ) {
				const changes = this._changesInElement.get( parent );

				// If there were changes in that element's ancestor, check all of them.
				for ( const change of changes ) {
					// Skip attribute changes. We are interested only if the element was inserted or removed.
					if ( change.type == 'attribute' ) {
						continue;
					}

					if ( change.offset <= offset && change.offset + change.howMany > offset ) {
						return true;
					}
				}
			}

			// Move up.
			parent = parent.parent;
			element = element.parent;
		}

		return false;
	}

	/**
	 * Saves and handles insert change.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} parent
	 * @param {Number} offset
	 * @param {Number} howMany
	 */
	_markInsert( parent, offset, howMany ) {
		const changeItem = { type: 'insert', offset, howMany, count: this._changeCount++ };

		this._markChange( parent, changeItem );
	}

	/**
	 * Saves and handles remove change.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} parent
	 * @param {Number} offset
	 * @param {Number} howMany
	 */
	_markRemove( parent, offset, howMany ) {
		const changeItem = { type: 'remove', offset, howMany, count: this._changeCount++ };

		this._markChange( parent, changeItem );
	}

	/**
	 * Saves and handles attribute change.
	 *
	 * @private
	 * @param {module:engine/model/item~Item} item
	 */
	_markAttribute( item ) {
		const changeItem = { type: 'attribute', offset: item.startOffset, howMany: item.offsetSize, count: this._changeCount++ };

		this._markChange( item.parent, changeItem );
	}

	/**
	 * Saves and handles a model change.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} parent
	 * @param {Object} changeItem
	 */
	_markChange( parent, changeItem ) {
		// First, make a snapshot of this parent's children (it will be made only if it was not made before).
		this._makeSnapshot( parent );

		// Then, get all changes that already were done on the element (empty array if this is the first change).
		const changes = this._getChangesForElement( parent );

		// Then, look through all the changes, and transform them or the new change.
		for ( const oldChange of changes ) {
			this._handleChange( changeItem, oldChange, changes );
		}

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
	 * Gets an array of changes that were already saved for given element.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} element
	 * @returns {Array.<Object>}
	 */
	_getChangesForElement( element ) {
		let changes;

		if ( this._changesInElement.has( element ) ) {
			changes = this._changesInElement.get( element );
		} else {
			changes = [];

			this._changesInElement.set( element, changes );
		}

		return changes;
	}

	/**
	 * Saves a children snapshot for given element.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} element
	 */
	_makeSnapshot( element ) {
		if ( !this._elementSnapshots.has( element ) ) {
			this._elementSnapshots.set( element, _getChildrenSnapshot( element.getChildren() ) );
		}
	}

	/**
	 * For given newly saved change, compares it with a change already done on the element and modifies the incoming
	 * change and/or the old change.
	 *
	 * @private
	 * @param {Object} inc Incoming (new) change.
	 * @param {Object} old Old change (already done on the element).
	 * @param {Array.<Object>} changes Array containing all the changes done on that element.
	 */
	_handleChange( inc, old, changes ) {
		const incEnd = inc.offset + inc.howMany;
		const oldEnd = old.offset + old.howMany;

		if ( inc.type == 'insert' ) {
			if ( old.type == 'insert' ) {
				if ( inc.offset <= old.offset ) {
					old.offset += inc.howMany;
				} else if ( inc.offset < oldEnd ) {
					old.howMany += inc.howMany;
					inc.howMany = 0;
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
					const howMany = old.howMany;

					old.howMany = inc.offset - old.offset;

					// Unshift to prevent further processing of this change.
					changes.unshift( { type: 'attribute', offset: incEnd, howMany: howMany - old.howMany, count: this._changeCount++ } );
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
						inc.howMany -= intersectionLength;
					} else {
						old.howMany -= inc.howMany;
						inc.howMany = 0;
					}
				} else {
					if ( inc.offset <= old.offset ) {
						inc.howMany = inc.howMany - old.howMany;
						old.howMany = 0;
					} else if ( inc.offset < oldEnd ) {
						const intersectionLength = oldEnd - inc.offset;

						old.howMany -= intersectionLength;
						inc.howMany -= intersectionLength;
					}
				}
			}

			if ( old.type == 'remove' ) {
				if ( inc.offset + inc.howMany <= old.offset ) {
					old.offset -= inc.howMany;
				} else if ( inc.offset < old.offset ) {
					old.offset = inc.offset;
					old.howMany += inc.howMany;

					inc.howMany = 0;
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
						const howMany = old.howMany;

						old.howMany = inc.offset - old.offset;

						const howManyAfter = howMany - old.howMany - inc.howMany;

						// Unshift to prevent further processing of this change.
						changes.unshift( { type: 'attribute', offset: inc.offset, howMany: howManyAfter, count: this._changeCount++ } );
					} else {
						old.howMany -= oldEnd - inc.offset;
					}
				}
			}
		}

		if ( inc.type == 'attribute' ) {
			if ( old.type == 'insert' ) {
				if ( inc.offset < old.offset && incEnd > old.offset ) {
					if ( incEnd > oldEnd ) {
						const changeItem = { type: 'attribute', offset: oldEnd, howMany: incEnd - oldEnd, count: this._changeCount++ };

						for ( const oldChange of changes ) {
							this._handleChange( changeItem, oldChange, changes );
						}

						changes.push( changeItem );
					}

					inc.howMany = old.offset - inc.offset;
				} else if ( inc.offset >= old.offset && inc.offset < oldEnd ) {
					if ( incEnd > oldEnd ) {
						inc.howMany = incEnd - oldEnd;
						inc.offset = oldEnd;
					} else {
						inc.howMany = 0;
					}
				}
			}

			if ( old.type == 'attribute' ) {
				if ( inc.offset >= old.offset && incEnd <= oldEnd ) {
					inc.howMany = 0;
				}
			}
		}
	}

	/**
	 * Returns an object with a single insert change description.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} parent Element in which change happened.
	 * @param {Number} offset Offset at which change happened.
	 * @param {String} name Removed element name or `'$text'` for character.
	 * @returns {Object} Diff item.
	 */
	_getInsertDiff( parent, offset, name ) {
		return {
			type: 'insert',
			position: Position.createFromParentAndOffset( parent, offset ),
			name,
			length: 1,
			changeCount: this._changeCount++
		};
	}

	/**
	 * Returns an object with a single remove change description.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} parent Element in which change happened.
	 * @param {Number} offset Offset at which change happened.
	 * @param {String} name Removed element name or `'$text'` for character.
	 * @returns {Object} Diff item.
	 */
	_getRemoveDiff( parent, offset, name ) {
		return {
			type: 'remove',
			position: Position.createFromParentAndOffset( parent, offset ),
			name,
			length: 1,
			changeCount: this._changeCount++
		};
	}

	/**
	 * Returns an array of objects that each is a single attribute change description.
	 *
	 * @private
	 * @param {module:engine/model/range~Range} range Range on which change happened.
	 * @param {Map} oldAttributes Map, map iterator or compatible object that contains attributes before change.
	 * @param {Map} newAttributes Map, map iterator or compatible object that contains attributes after change.
	 * @returns {Array.<Object>} Array containing one or more diff items.
	 */
	_getAttributesDiff( range, oldAttributes, newAttributes ) {
		// Results holder.
		const diffs = [];

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
					range: Range.createFromRange( range ),
					length: 1,
					attributeKey: key,
					attributeOldValue: oldValue,
					attributeNewValue: newValue,
					changeCount: this._changeCount++
				} );

				// Prevent returning two diff items for the same change.
				newAttributes.delete( key );
			}
		}

		// Look through new attributes that weren't handled above.
		for ( const [ key, newValue ] of newAttributes ) {
			// Each of them is a new attribute. Add diff item.
			diffs.push( {
				type: 'attribute',
				position: range.start,
				range: Range.createFromRange( range ),
				length: 1,
				attributeKey: key,
				attributeOldValue: null,
				attributeNewValue: newValue,
				changeCount: this._changeCount++
			} );
		}

		return diffs;
	}
}

// Returns an array that is a copy of passed child list with the exception that text nodes are split to one or more
// objects, each representing one character and attributes set on that character.
function _getChildrenSnapshot( children ) {
	const snapshot = [];

	for ( const child of children ) {
		if ( child.is( 'text' ) ) {
			for ( let i = 0; i < child.data.length; i++ ) {
				snapshot.push( {
					name: '$text',
					attributes: new Map( child.getAttributes() )
				} );
			}
		} else {
			snapshot.push( {
				name: child.name,
				attributes: new Map( child.getAttributes() )
			} );
		}
	}

	return snapshot;
}

// Generates array of actions for given changes set.
// It simulates what `diff` function does.
// Generated actions are:
// - 'e' for 'equal' - when item at that position did not change,
// - 'i' for 'insert' - when item at that position was inserted,
// - 'r' for 'remove' - when item at that position was removed,
// - 'a' for 'attribute' - when item at that position has it attributes changed.
function _generateActionsFromChanges( oldChildrenLength, changes ) {
	const actions = [];

	let offset = 0;
	let oldChildrenHandled = 0;

	for ( const change of changes ) {
		if ( change.offset > offset ) {
			actions.push( ...'e'.repeat( change.offset - offset ).split( '' ) );

			oldChildrenHandled += change.offset - offset;
		}

		if ( change.type == 'insert' ) {
			actions.push( ...'i'.repeat( change.howMany ).split( '' ) );

			offset = change.offset + change.howMany;
		} else if ( change.type == 'remove' ) {
			actions.push( ...'r'.repeat( change.howMany ).split( '' ) );

			offset = change.offset;
			oldChildrenHandled += change.howMany;
		} else {
			actions.push( ...'a'.repeat( change.howMany ).split( '' ) );

			offset = change.offset + change.howMany;
			oldChildrenHandled += change.howMany;
		}
	}

	if ( oldChildrenHandled < oldChildrenLength ) {
		actions.push( ...'e'.repeat( oldChildrenLength - oldChildrenHandled ).split( '' ) );
	}

	return actions;
}
