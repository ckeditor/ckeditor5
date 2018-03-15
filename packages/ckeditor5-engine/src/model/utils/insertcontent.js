/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/utils/insertcontent
 */

import Position from '../position';
import LivePosition from '../liveposition';
import Element from '../element';
import Range from '../range';
import log from '@ckeditor/ckeditor5-utils/src/log';
import DocumentSelection from '../documentselection';

/**
 * Inserts content into the editor (specified selection) as one would expect the paste
 * functionality to work.
 *
 * **Note:** Use {@link module:engine/model/model~Model#insertContent} instead of this function.
 * This function is only exposed to be reusable in algorithms
 * which change the {@link module:engine/model/model~Model#insertContent}
 * method's behavior.
 *
 * @param {module:engine/model/model~Model} model The model in context of which the insertion
 * should be performed.
 * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * Selection into which the content should be inserted.
 */
export default function insertContent( model, content, selection ) {
	model.change( writer => {
		if ( !selection.isCollapsed ) {
			model.deleteContent( selection );
		}

		const insertion = new Insertion( model, writer, selection.anchor );

		let nodesToInsert;

		if ( content.is( 'documentFragment' ) ) {
			nodesToInsert = content.getChildren();
		} else {
			nodesToInsert = [ content ];
		}

		insertion.handleNodes( nodesToInsert, {
			// The set of children being inserted is the only set in this context
			// so it's the first and last (it's a hack ;)).
			isFirst: true,
			isLast: true
		} );

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

			/**
			 * Cannot determine a proper selection range after insertion.
			 *
			 * @warning insertcontent-no-range
			 */
			log.warn( 'insertcontent-no-range: Cannot determine a proper selection range after insertion.' );
		}
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
		 * Batch to which deltas will be added.
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

		this._filterAttributesOf = [];
	}

	/**
	 * Handles insertion of a set of nodes.
	 *
	 * @param {Iterable.<module:engine/model/node~Node>} nodes Nodes to insert.
	 * @param {Object} parentContext Context in which parent of these nodes was supposed to be inserted.
	 * If the parent context is passed it means that the parent element was stripped (was not allowed).
	 */
	handleNodes( nodes, parentContext ) {
		nodes = Array.from( nodes );

		for ( let i = 0; i < nodes.length; i++ ) {
			const node = nodes[ i ];

			this._handleNode( node, {
				isFirst: i === 0 && parentContext.isFirst,
				isLast: ( i === ( nodes.length - 1 ) ) && parentContext.isLast
			} );
		}

		// TMP this will become a postfixer.
		this.schema.removeDisallowedAttributes( this._filterAttributesOf, this.writer );
		this._filterAttributesOf = [];
	}

	/**
	 * Returns range to be selected after insertion.
	 * Returns null if there is no valid range to select after insertion.
	 *
	 * @returns {module:engine/model/range~Range|null}
	 */
	getSelectionRange() {
		if ( this.nodeToSelect ) {
			return Range.createOn( this.nodeToSelect );
		}

		return this.model.schema.getNearestSelectionRange( this.position );
	}

	/**
	 * Handles insertion of a single node.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node
	 * @param {Object} context
	 * @param {Boolean} context.isFirst Whether the given node is the first one in the content to be inserted.
	 * @param {Boolean} context.isLast Whether the given node is the last one in the content to be inserted.
	 */
	_handleNode( node, context ) {
		// Let's handle object in a special way.
		// * They should never be merged with other elements.
		// * If they are not allowed in any of the selection ancestors, they could be either autoparagraphed or totally removed.
		if ( this.schema.isObject( node ) ) {
			this._handleObject( node, context );

			return;
		}

		// Try to find a place for the given node.
		// Split the position.parent's branch up to a point where the node can be inserted.
		// If it isn't allowed in the whole branch, then of course don't split anything.
		const isAllowed = this._checkAndSplitToAllowedPosition( node, context );

		if ( !isAllowed ) {
			this._handleDisallowedNode( node, context );

			return;
		}

		this._insert( node );

		// After the node was inserted we may try to merge it with its siblings.
		// This should happen only if it was the first and/or last of the nodes (so only with boundary nodes)
		// and only if the selection was in those elements initially.
		//
		// E.g.:
		// <p>x^</p> + <p>y</p> => <p>x</p><p>y</p> => <p>xy[]</p>
		// and:
		// <p>x^y</p> + <p>z</p> => <p>x</p>^<p>y</p> + <p>z</p> => <p>x</p><p>y</p><p>z</p> => <p>xy[]z</p>
		// but:
		// <p>x</p><p>^</p><p>z</p> + <p>y</p> => <p>x</p><p>y</p><p>z</p> (no merging)
		// <p>x</p>[<img>]<p>z</p> + <p>y</p> => <p>x</p><p>y</p><p>z</p> (no merging, note: after running deletetContents
		//																	 it's exactly the same case as above)
		this._mergeSiblingsOf( node, context );
	}

	/**
	 * @private
	 * @param {module:engine/model/element~Element} node The object element.
	 * @param {Object} context
	 */
	_handleObject( node, context ) {
		// Try finding it a place in the tree.
		if ( this._checkAndSplitToAllowedPosition( node ) ) {
			this._insert( node );
		}
		// Try autoparagraphing.
		else {
			this._tryAutoparagraphing( node, context );
		}
	}

	/**
	 * @private
	 * @param {module:engine/model/node~Node} node The disallowed node which needs to be handled.
	 * @param {Object} context
	 */
	_handleDisallowedNode( node, context ) {
		// If the node is an element, try inserting its children (strip the parent).
		if ( node.is( 'element' ) ) {
			this.handleNodes( node.getChildren(), context );
		}
		// If text is not allowed, try autoparagraphing it.
		else {
			this._tryAutoparagraphing( node, context );
		}
	}

	/**
	 * @private
	 * @param {module:engine/model/node~Node} node The node to insert.
	 */
	_insert( node ) {
		/* istanbul ignore if */
		if ( !this.schema.checkChild( this.position, node ) ) {
			// Algorithm's correctness check. We should never end up here but it's good to know that we did.
			// Note that it would often be a silent issue if we insert node in a place where it's not allowed.
			log.error(
				'insertcontent-wrong-position: The node cannot be inserted on the given position.',
				{ node, position: this.position }
			);

			return;
		}

		const livePos = LivePosition.createFromPosition( this.position );

		this.writer.insert( node, this.position );

		this.position = Position.createFromPosition( livePos );
		livePos.detach();

		// The last inserted object should be selected because we can't put a collapsed selection after it.
		if ( this.schema.isObject( node ) && !this.schema.checkChild( this.position, '$text' ) ) {
			this.nodeToSelect = node;
		} else {
			this.nodeToSelect = null;
		}

		this._filterAttributesOf.push( node );
	}

	/**
	 * @private
	 * @param {module:engine/model/node~Node} node The node which could potentially be merged.
	 * @param {Object} context
	 */
	_mergeSiblingsOf( node, context ) {
		if ( !( node instanceof Element ) ) {
			return;
		}

		const mergeLeft = this._canMergeLeft( node, context );
		const mergeRight = this._canMergeRight( node, context );
		const mergePosLeft = LivePosition.createBefore( node );
		const mergePosRight = LivePosition.createAfter( node );

		if ( mergeLeft ) {
			const position = LivePosition.createFromPosition( this.position );

			this.writer.merge( mergePosLeft );

			this.position = Position.createFromPosition( position );
			position.detach();
		}

		if ( mergeRight ) {
			/* istanbul ignore if */
			if ( !this.position.isEqual( mergePosRight ) ) {
				// Algorithm's correctness check. We should never end up here but it's good to know that we did.
				// At this point the insertion position should be after the node we'll merge. If it isn't,
				// it should need to be secured as in the left merge case.
				log.error( 'insertcontent-wrong-position-on-merge: The insertion position should equal the merge position' );
			}

			// Move the position to the previous node, so it isn't moved to the graveyard on merge.
			// <p>x</p>[]<p>y</p> => <p>x[]</p><p>y</p>
			this.position = Position.createAt( mergePosRight.nodeBefore, 'end' );

			// OK:  <p>xx[]</p> + <p>yy</p> => <p>xx[]yy</p> (when sticks to previous)
			// NOK: <p>xx[]</p> + <p>yy</p> => <p>xxyy[]</p> (when sticks to next)
			const position = new LivePosition( this.position.root, this.position.path, 'sticksToPrevious' );

			this.writer.merge( mergePosRight );

			this.position = Position.createFromPosition( position );
			position.detach();
		}

		if ( mergeLeft || mergeRight ) {
			// After merge elements that were marked by _insert() to be filtered might be gone so
			// we need to mark the new container.
			this._filterAttributesOf.push( this.position.parent );
		}

		mergePosLeft.detach();
		mergePosRight.detach();
	}

	/**
	 * Checks whether specified node can be merged with previous sibling element.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node which could potentially be merged.
	 * @param {Object} context
	 * @returns {Boolean}
	 */
	_canMergeLeft( node, context ) {
		const previousSibling = node.previousSibling;

		return context.isFirst &&
			( previousSibling instanceof Element ) &&
			this.canMergeWith.has( previousSibling ) &&
			this.model.schema.checkMerge( previousSibling, node );
	}

	/**
	 * Checks whether specified node can be merged with next sibling element.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node which could potentially be merged.
	 * @param {Object} context
	 * @returns {Boolean}
	 */
	_canMergeRight( node, context ) {
		const nextSibling = node.nextSibling;

		return context.isLast &&
			( nextSibling instanceof Element ) &&
			this.canMergeWith.has( nextSibling ) &&
			this.model.schema.checkMerge( node, nextSibling );
	}

	/**
	 * Tries wrapping the node in a new paragraph and inserting it this way.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node The node which needs to be autoparagraphed.
	 * @param {Object} context
	 */
	_tryAutoparagraphing( node, context ) {
		const paragraph = this.writer.createElement( 'paragraph' );

		// Do not autoparagraph if the paragraph won't be allowed there,
		// cause that would lead to an infinite loop. The paragraph would be rejected in
		// the next _handleNode() call and we'd be here again.
		if ( this._getAllowedIn( paragraph, this.position.parent ) && this.schema.checkChild( paragraph, node ) ) {
			paragraph._appendChildren( node );
			this._handleNode( paragraph, context );
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

		while ( allowedIn != this.position.parent ) {
			// If a parent which we'd need to leave is a limit element, break.
			if ( this.schema.isLimit( this.position.parent ) ) {
				return false;
			}

			if ( this.position.isAtStart ) {
				const parent = this.position.parent;
				this.position = Position.createBefore( parent );

				// Special case – parent is empty (<p>^</p>) so isAtStart == isAtEnd == true.
				// We can remove the element after moving selection out of it.
				if ( parent.isEmpty ) {
					this.writer.remove( parent );
				}
			} else if ( this.position.isAtEnd ) {
				this.position = Position.createAfter( this.position.parent );
			} else {
				const tempPos = Position.createAfter( this.position.parent );

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
