/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/insertcontent
 */

import Position from '../position';
import LivePosition from '../liveposition';
import Element from '../element';
import Range from '../range';
import DocumentSelection from '../documentselection';
import Selection from '../selection';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * Inserts content into the editor (specified selection) as one would expect the paste functionality to work.
 *
 * It takes care of removing the selected content, splitting elements (if needed), inserting elements and merging elements appropriately.
 *
 * Some examples:
 *
 * 		<p>x^</p> + <p>y</p> => <p>x</p><p>y</p> => <p>xy[]</p>
 * 		<p>x^y</p> + <p>z</p> => <p>x</p>^<p>y</p> + <p>z</p> => <p>x</p><p>z</p><p>y</p> => <p>xz[]y</p>
 * 		<p>x^y</p> + <img /> => <p>x</p>^<p>y</p> + <img /> => <p>x</p><img /><p>y</p>
 * 		<p>x</p><p>^</p><p>z</p> + <p>y</p> => <p>x</p><p>y[]</p><p>z</p> (no merging)
 * 		<p>x</p>[<img />]<p>z</p> + <p>y</p> => <p>x</p>^<p>z</p> + <p>y</p> => <p>x</p><p>y[]</p><p>z</p>
 *
 * If an instance of {@link module:engine/model/selection~Selection} is passed as `selectable` it will be modified
 * to the insertion selection (equal to a range to be selected after insertion).
 *
 * If `selectable` is not passed, the content will be inserted using the current selection of the model document.
 *
 * **Note:** Use {@link module:engine/model/model~Model#insertContent} instead of this function.
 * This function is only exposed to be reusable in algorithms which change the {@link module:engine/model/model~Model#insertContent}
 * method's behavior.
 *
 * @param {module:engine/model/model~Model} model The model in context of which the insertion
 * should be performed.
 * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
 * @param {module:engine/model/selection~Selectable} [selectable=model.document.selection]
 * Selection into which the content should be inserted.
 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
 * @returns {module:engine/model/range~Range} Range which contains all the performed changes. This is a range that, if removed,
 * would return the model to the state before the insertion. If no changes were preformed by `insertContent`, returns a range collapsed
 * at the insertion position.
 */
export default function insertContent( model, content, selectable, placeOrOffset ) {
	return model.change( writer => {
		let selection;

		if ( !selectable ) {
			selection = model.document.selection;
		} else if ( selectable instanceof Selection || selectable instanceof DocumentSelection ) {
			selection = selectable;
		} else {
			selection = writer.createSelection( selectable, placeOrOffset );
		}

		if ( !selection.isCollapsed ) {
			model.deleteContent( selection, { doNotAutoparagraph: true } );
		}

		const insertion = new Insertion( model, writer, selection.anchor );

		let nodesToInsert;

		if ( content.is( 'documentFragment' ) ) {
			nodesToInsert = content.getChildren();
		} else {
			nodesToInsert = [ content ];
		}

		insertion.handleNodes( nodesToInsert );

		const newRange = insertion.getSelectionRange();

		/* istanbul ignore else */
		if ( newRange ) {
			if ( selection instanceof DocumentSelection ) {
				writer.setSelection( newRange );
			} else {
				selection.setTo( newRange );
			}
		} else {
			// We are not testing else because it's a safe check for unpredictable edge cases:
			// an insertion without proper range to select.
			//
			// @if CK_DEBUG // console.warn( 'Cannot determine a proper selection range after insertion.' );
		}

		const affectedRange = insertion.getAffectedRange() || model.createRange( selection.anchor );

		insertion.destroy();

		return affectedRange;
	} );
}

/**
 * Utility class for performing content insertion.
 *
 * @private
 */
class Insertion {
	constructor( model, writer, position ) {
		/**
		 * The model in context of which the insertion should be performed.
		 *
		 * @member {module:engine/model~Model} #model
		 */
		this.model = model;

		/**
		 * Batch to which operations will be added.
		 *
		 * @member {module:engine/controller/writer~Batch} #writer
		 */
		this.writer = writer;

		/**
		 * The position at which (or near which) the next node will be inserted.
		 *
		 * @member {module:engine/model/position~Position} #position
		 */
		this.position = position;

		/**
		 * Elements with which the inserted elements can be merged.
		 *
		 *		<p>x^</p><p>y</p> + <p>z</p> (can merge to <p>x</p>)
		 *		<p>x</p><p>^y</p> + <p>z</p> (can merge to <p>y</p>)
		 *		<p>x^y</p> + <p>z</p> (can merge to <p>xy</p> which will be split during the action,
		 *								so both its pieces will be added to this set)
		 *
		 *
		 * @member {Set} #canMergeWith
		 */
		this.canMergeWith = new Set( [ this.position.parent ] );

		/**
		 * Schema of the model.
		 *
		 * @member {module:engine/model/schema~Schema} #schema
		 */
		this.schema = model.schema;

		/**
		 * The temporary DocumentFragment used for grouping multiple nodes for single insert operation.
		 *
		 * @private
		 * @type {module:engine/model/documentfragment~DocumentFragment}
		 */
		this._documentFragment = writer.createDocumentFragment();

		/**
		 * The current position in the temporary DocumentFragment.
		 *
		 * @private
		 * @type {module:engine/model/position~Position}
		 */
		this._documentFragmentPosition = writer.createPositionAt( this._documentFragment, 0 );

		/**
		 * The reference to the first inserted node.
		 *
		 * @private
		 * @type {module:engine/model/node~Node}
		 */
		this._firstNode = null;

		/**
		 * The reference to the last inserted node.
		 *
		 * @private
		 * @type {module:engine/model/node~Node}
		 */
		this._lastNode = null;

		/**
		 * The array of nodes that should be cleaned of not allowed attributes.
		 *
		 * @private
		 * @type {Array.<module:engine/model/node~Node>}
		 */
		this._filterAttributesOf = [];

		/**
		 * Beginning of the affected range. See {@link module:engine/model/utils/insertcontent~Insertion#getAffectedRange}.
		 *
		 * @private
		 * @member {module:engine/model/liveposition~LivePosition|null} #_affectedStart
		 */
		this._affectedStart = null;

		/**
		 * End of the affected range. See {@link module:engine/model/utils/insertcontent~Insertion#getAffectedRange}.
		 *
		 * @private
		 * @member {module:engine/model/liveposition~LivePosition|null} #_affectedEnd
		 */
		this._affectedEnd = null;
	}

	/**
	 * Handles insertion of a set of nodes.
	 *
	 * @param {Iterable.<module:engine/model/node~Node>} nodes Nodes to insert.
	 */
	handleNodes( nodes ) {
		for ( const node of Array.from( nodes ) ) {
			this._handleNode( node );
		}

		// Insert nodes collected in temporary DocumentFragment.
		this._insertPartialFragment();

		// After the content was inserted we may try to merge it with its next sibling if the selection was in it initially.
		// Merging with the previous sibling was performed just after inserting the first node to the document.
		this._mergeOnRight();

		// TMP this will become a post-fixer.
		this.schema.removeDisallowedAttributes( this._filterAttributesOf, this.writer );
		this._filterAttributesOf = [];
	}

	/**
	 * Returns range to be selected after insertion.
	 * Returns `null` if there is no valid range to select after insertion.
	 *
	 * @returns {module:engine/model/range~Range|null}
	 */
	getSelectionRange() {
		if ( this.nodeToSelect ) {
			return Range._createOn( this.nodeToSelect );
		}

		return this.model.schema.getNearestSelectionRange( this.position );
	}

	/**
	 * Returns a range which contains all the performed changes. This is a range that, if removed, would return the model to the state
	 * before the insertion. Returns `null` if no changes were done.
	 *
	 * @returns {module:engine/model/range~Range|null}
	 */
	getAffectedRange() {
		if ( !this._affectedStart ) {
			return null;
		}

		return new Range( this._affectedStart, this._affectedEnd );
	}

	/**
	 * Destroys `Insertion` instance.
	 */
	destroy() {
		if ( this._affectedStart ) {
			this._affectedStart.detach();
		}

		if ( this._affectedEnd ) {
			this._affectedEnd.detach();
		}
	}

	/**
	 * Handles insertion of a single node.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node
	 */
	_handleNode( node ) {
		// Let's handle object in a special way.
		// * They should never be merged with other elements.
		// * If they are not allowed in any of the selection ancestors, they could be either autoparagraphed or totally removed.
		if ( this.schema.isObject( node ) ) {
			this._handleObject( node );

			return;
		}

		// Try to find a place for the given node.
		// Split the position.parent's branch up to a point where the node can be inserted.
		// If it isn't allowed in the whole branch, then of course don't split anything.
		const isAllowed = this._checkAndSplitToAllowedPosition( node );

		if ( !isAllowed ) {
			this._handleDisallowedNode( node );

			return;
		}

		// Add node to the current temporary DocumentFragment.
		this._appendToFragment( node );

		// Store the first and last nodes for easy access for merging with sibling nodes.
		if ( !this._firstNode ) {
			this._firstNode = node;
		}

		this._lastNode = node;
	}

	/**
	 * Inserts the temporary DocumentFragment into the model.
	 *
	 * @private
	 */
	_insertPartialFragment() {
		if ( this._documentFragment.isEmpty ) {
			return;
		}

		const livePosition = LivePosition.fromPosition( this.position, 'toNext' );

		this._setAffectedBoundaries( this.position );

		// If the very first node of the whole insertion process is inserted, insert it separately for OT reasons (undo).
		// Note: there can be multiple calls to `_insertPartialFragment()` during one insertion process.
		// Note: only the very first node can be merged so we have to do separate operation only for it.
		if ( this._documentFragment.getChild( 0 ) == this._firstNode ) {
			this.writer.insert( this._firstNode, this.position );

			// We must merge the first node just after inserting it to avoid problems with OT.
			// (See: https://github.com/ckeditor/ckeditor5/pull/8773#issuecomment-760945652).
			this._mergeOnLeft();

			this.position = livePosition.toPosition();
		}

		// Insert the remaining nodes from document fragment.
		if ( !this._documentFragment.isEmpty ) {
			this.writer.insert( this._documentFragment, this.position );
		}

		this._documentFragmentPosition = this.writer.createPositionAt( this._documentFragment, 0 );

		this.position = livePosition.toPosition();
		livePosition.detach();
	}

	/**
	 * @private
	 * @param {module:engine/model/element~Element} node The object element.
	 */
	_handleObject( node ) {
		// Try finding it a place in the tree.
		if ( this._checkAndSplitToAllowedPosition( node ) ) {
			this._appendToFragment( node );
		}
		// Try autoparagraphing.
		else {
			this._tryAutoparagraphing( node );
		}
	}

	/**
	 * @private
	 * @param {module:engine/model/node~Node} node The disallowed node which needs to be handled.
	 */
	_handleDisallowedNode( node ) {
		// If the node is an element, try inserting its children (strip the parent).
		if ( node.is( 'element' ) ) {
			this.handleNodes( node.getChildren() );
		}
		// If text is not allowed, try autoparagraphing it.
		else {
			this._tryAutoparagraphing( node );
		}
	}

	/**
	 * Append a node to the temporary DocumentFragment.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node to insert.
	 */
	_appendToFragment( node ) {
		/* istanbul ignore if */
		if ( !this.schema.checkChild( this.position, node ) ) {
			// Algorithm's correctness check. We should never end up here but it's good to know that we did.
			// Note that it would often be a silent issue if we insert node in a place where it's not allowed.

			/**
			 * Given node cannot be inserted on the given position.
			 *
			 * @error insertcontent-wrong-position
			 * @param {module:engine/model/node~Node} node Node to insert.
			 * @param {module:engine/model/position~Position} position Position to insert the node at.
			 */
			throw new CKEditorError(
				'insertcontent-wrong-position',
				this,
				{ node, position: this.position }
			);
		}

		this.writer.insert( node, this._documentFragmentPosition );
		this._documentFragmentPosition = this._documentFragmentPosition.getShiftedBy( node.offsetSize );

		// The last inserted object should be selected because we can't put a collapsed selection after it.
		if ( this.schema.isObject( node ) && !this.schema.checkChild( this.position, '$text' ) ) {
			this.nodeToSelect = node;
		} else {
			this.nodeToSelect = null;
		}

		this._filterAttributesOf.push( node );
	}

	/**
	 * Sets `_affectedStart` and `_affectedEnd` to the given `position`. Should be used before a change is done during insertion process to
	 * mark the affected range.
	 *
	 * This method is used before inserting a node or splitting a parent node. `_affectedStart` and `_affectedEnd` are also changed
	 * during merging, but the logic there is more complicated so it is left out of this function.
	 *
	 * @private
	 * @param {module:engine/model/position~Position} position
	 */
	_setAffectedBoundaries( position ) {
		// Set affected boundaries stickiness so that those position will "expand" when something is inserted in between them:
		// <paragraph>Foo][bar</paragraph> -> <paragraph>Foo]xx[bar</paragraph>
		// This is why it cannot be a range but two separate positions.
		if ( !this._affectedStart ) {
			this._affectedStart = LivePosition.fromPosition( position, 'toPrevious' );
		}

		// If `_affectedEnd` is before the new boundary position, expand `_affectedEnd`. This can happen if first inserted node was
		// inserted into the parent but the next node is moved-out of that parent:
		// (1) <paragraph>Foo][</paragraph> -> <paragraph>Foo]xx[</paragraph>
		// (2) <paragraph>Foo]xx[</paragraph> -> <paragraph>Foo]xx</paragraph><widget></widget>[
		if ( !this._affectedEnd || this._affectedEnd.isBefore( position ) ) {
			if ( this._affectedEnd ) {
				this._affectedEnd.detach();
			}

			this._affectedEnd = LivePosition.fromPosition( position, 'toNext' );
		}
	}

	/**
	 * Merges the previous sibling of the first node if it should be merged.
	 *
	 * After the content was inserted we may try to merge it with its siblings.
	 * This should happen only if the selection was in those elements initially.
	 *
	 * @private
	 */
	_mergeOnLeft() {
		const node = this._firstNode;

		if ( !( node instanceof Element ) ) {
			return;
		}

		if ( !this._canMergeLeft( node ) ) {
			return;
		}

		const mergePosLeft = LivePosition._createBefore( node );
		mergePosLeft.stickiness = 'toNext';

		const livePosition = LivePosition.fromPosition( this.position, 'toNext' );

		// If `_affectedStart` is sames as merge position, it means that the element "marked" by `_affectedStart` is going to be
		// removed and its contents will be moved. This won't transform `LivePosition` so `_affectedStart` needs to be moved
		// by hand to properly reflect affected range. (Due to `_affectedStart` and `_affectedEnd` stickiness, the "range" is
		// shown as `][`).
		//
		// Example - insert `<paragraph>Abc</paragraph><paragraph>Xyz</paragraph>` at the end of `<paragraph>Foo^</paragraph>`:
		//
		// <paragraph>Foo</paragraph><paragraph>Bar</paragraph>   -->
		// <paragraph>Foo</paragraph>]<paragraph>Abc</paragraph><paragraph>Xyz</paragraph>[<paragraph>Bar</paragraph>   -->
		// <paragraph>Foo]Abc</paragraph><paragraph>Xyz</paragraph>[<paragraph>Bar</paragraph>
		//
		// Note, that if we are here then something must have been inserted, so `_affectedStart` and `_affectedEnd` have to be set.
		if ( this._affectedStart.isEqual( mergePosLeft ) ) {
			this._affectedStart.detach();
			this._affectedStart = LivePosition._createAt( mergePosLeft.nodeBefore, 'end', 'toPrevious' );
		}

		// We need to update the references to the first and last nodes if they will be merged into the previous sibling node
		// because the reference would point to the removed node.
		//
		// <p>A^A</p> + <p>X</p>
		//
		// <p>A</p>^<p>A</p>
		// <p>A</p><p>X</p><p>A</p>
		// <p>AX</p><p>A</p>
		// <p>AXA</p>
		if ( this._firstNode === this._lastNode ) {
			this._firstNode = mergePosLeft.nodeBefore;
			this._lastNode = mergePosLeft.nodeBefore;
		}

		this.writer.merge( mergePosLeft );

		// If only one element (the merged one) is in the "affected range", also move the affected range end appropriately.
		//
		// Example - insert `<paragraph>Abc</paragraph>` at the of `<paragraph>Foo^</paragraph>`:
		//
		// <paragraph>Foo</paragraph><paragraph>Bar</paragraph>   -->
		// <paragraph>Foo</paragraph>]<paragraph>Abc</paragraph>[<paragraph>Bar</paragraph>   -->
		// <paragraph>Foo]Abc</paragraph>[<paragraph>Bar</paragraph>   -->
		// <paragraph>Foo]Abc[</paragraph><paragraph>Bar</paragraph>
		if ( mergePosLeft.isEqual( this._affectedEnd ) && this._firstNode === this._lastNode ) {
			this._affectedEnd.detach();
			this._affectedEnd = LivePosition._createAt( mergePosLeft.nodeBefore, 'end', 'toNext' );
		}

		this.position = livePosition.toPosition();
		livePosition.detach();

		// After merge elements that were marked by _insert() to be filtered might be gone so
		// we need to mark the new container.
		this._filterAttributesOf.push( this.position.parent );

		mergePosLeft.detach();
	}

	/**
	 * Merges the next sibling of the last node if it should be merged.
	 *
	 * After the content was inserted we may try to merge it with its siblings.
	 * This should happen only if the selection was in those elements initially.
	 *
	 * @private
	 */
	_mergeOnRight() {
		const node = this._lastNode;

		if ( !( node instanceof Element ) ) {
			return;
		}

		if ( !this._canMergeRight( node ) ) {
			return;
		}

		const mergePosRight = LivePosition._createAfter( node );
		mergePosRight.stickiness = 'toNext';

		/* istanbul ignore if */
		if ( !this.position.isEqual( mergePosRight ) ) {
			// Algorithm's correctness check. We should never end up here but it's good to know that we did.
			// At this point the insertion position should be after the node we'll merge. If it isn't,
			// it should need to be secured as in the left merge case.
			/**
			 * An internal error occurred when merging inserted content with its siblings.
			 * The insertion position should equal the merge position.
			 *
			 * If you encountered this error, report it back to the CKEditor 5 team
			 * with as many details as possible regarding the content being inserted and the insertion position.
			 *
			 * @error insertcontent-invalid-insertion-position
			 */
			throw new CKEditorError( 'insertcontent-invalid-insertion-position', this );
		}

		// Move the position to the previous node, so it isn't moved to the graveyard on merge.
		// <p>x</p>[]<p>y</p> => <p>x[]</p><p>y</p>
		this.position = Position._createAt( mergePosRight.nodeBefore, 'end' );

		// Explanation of setting position stickiness to `'toPrevious'`:
		// OK:  <p>xx[]</p> + <p>yy</p> => <p>xx[]yy</p> (when sticks to previous)
		// NOK: <p>xx[]</p> + <p>yy</p> => <p>xxyy[]</p> (when sticks to next)
		const livePosition = LivePosition.fromPosition( this.position, 'toPrevious' );

		// See comment in `_mergeOnLeft()` on moving `_affectedStart`.
		if ( this._affectedEnd.isEqual( mergePosRight ) ) {
			this._affectedEnd.detach();
			this._affectedEnd = LivePosition._createAt( mergePosRight.nodeBefore, 'end', 'toNext' );
		}

		// We need to update the references to the first and last nodes if they will be merged into the previous sibling node
		// because the reference would point to the removed node.
		//
		// <p>A^A</p> + <p>X</p>
		//
		// <p>A</p>^<p>A</p>
		// <p>A</p><p>X</p><p>A</p>
		// <p>AX</p><p>A</p>
		// <p>AXA</p>
		if ( this._firstNode === this._lastNode ) {
			this._firstNode = mergePosRight.nodeBefore;
			this._lastNode = mergePosRight.nodeBefore;
		}

		this.writer.merge( mergePosRight );

		// See comment in `_mergeOnLeft()` on moving `_affectedStart`.
		if ( mergePosRight.getShiftedBy( -1 ).isEqual( this._affectedStart ) && this._firstNode === this._lastNode ) {
			this._affectedStart.detach();
			this._affectedStart = LivePosition._createAt( mergePosRight.nodeBefore, 0, 'toPrevious' );
		}

		this.position = livePosition.toPosition();
		livePosition.detach();

		// After merge elements that were marked by _insert() to be filtered might be gone so
		// we need to mark the new container.
		this._filterAttributesOf.push( this.position.parent );

		mergePosRight.detach();
	}

	/**
	 * Checks whether specified node can be merged with previous sibling element.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node which could potentially be merged.
	 * @returns {Boolean}
	 */
	_canMergeLeft( node ) {
		const previousSibling = node.previousSibling;

		return ( previousSibling instanceof Element ) &&
			this.canMergeWith.has( previousSibling ) &&
			this.model.schema.checkMerge( previousSibling, node );
	}

	/**
	 * Checks whether specified node can be merged with next sibling element.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node which could potentially be merged.
	 * @returns {Boolean}
	 */
	_canMergeRight( node ) {
		const nextSibling = node.nextSibling;

		return ( nextSibling instanceof Element ) &&
			this.canMergeWith.has( nextSibling ) &&
			this.model.schema.checkMerge( node, nextSibling );
	}

	/**
	 * Tries wrapping the node in a new paragraph and inserting it this way.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node which needs to be autoparagraphed.
	 */
	_tryAutoparagraphing( node ) {
		const paragraph = this.writer.createElement( 'paragraph' );

		// Do not autoparagraph if the paragraph won't be allowed there,
		// cause that would lead to an infinite loop. The paragraph would be rejected in
		// the next _handleNode() call and we'd be here again.
		if ( this._getAllowedIn( paragraph, this.position.parent ) && this.schema.checkChild( paragraph, node ) ) {
			paragraph._appendChild( node );
			this._handleNode( paragraph );
		}
	}

	/**
	 * @private
	 * @param {module:engine/model/node~Node} node
	 * @returns {Boolean} Whether an allowed position was found.
	 * `false` is returned if the node isn't allowed at any position up in the tree, `true` if was.
	 */
	_checkAndSplitToAllowedPosition( node ) {
		const allowedIn = this._getAllowedIn( node, this.position.parent );

		if ( !allowedIn ) {
			return false;
		}

		// Insert nodes collected in temporary DocumentFragment if the position parent needs change to process further nodes.
		if ( allowedIn != this.position.parent ) {
			this._insertPartialFragment();
		}

		while ( allowedIn != this.position.parent ) {
			// If a parent which we'd need to leave is a limit element, break.
			if ( this.schema.isLimit( this.position.parent ) ) {
				return false;
			}

			if ( this.position.isAtStart ) {
				// If insertion position is at the beginning of the parent, move it out instead of splitting.
				// <p>^Foo</p> -> ^<p>Foo</p>
				const parent = this.position.parent;

				this.position = this.writer.createPositionBefore( parent );

				// Special case – parent is empty (<p>^</p>).
				//
				// 1. parent.isEmpty
				// We can remove the element after moving insertion position out of it.
				//
				// 2. parent.parent === allowedIn
				// However parent should remain in place when allowed element is above limit element in document tree.
				// For example there shouldn't be allowed to remove empty paragraph from tableCell, when is pasted
				// content allowed in $root.
				if ( parent.isEmpty && parent.parent === allowedIn ) {
					this.writer.remove( parent );
				}
			} else if ( this.position.isAtEnd ) {
				// If insertion position is at the end of the parent, move it out instead of splitting.
				// <p>Foo^</p> -> <p>Foo</p>^
				this.position = this.writer.createPositionAfter( this.position.parent );
			} else {
				const tempPos = this.writer.createPositionAfter( this.position.parent );

				this._setAffectedBoundaries( this.position );
				this.writer.split( this.position );

				this.position = tempPos;

				this.canMergeWith.add( this.position.nodeAfter );
			}
		}

		return true;
	}

	/**
	 * Gets the element in which the given node is allowed. It checks the passed element and all its ancestors.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node to check.
	 * @param {module:engine/model/element~Element} element The element in which the node's correctness should be checked.
	 * @returns {module:engine/model/element~Element|null}
	 */
	_getAllowedIn( node, element ) {
		if ( this.schema.checkChild( element, node ) ) {
			return element;
		}

		if ( element.parent ) {
			return this._getAllowedIn( node, element.parent );
		}

		return null;
	}
}
