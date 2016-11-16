/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/insertcontent
 */

import Position from '../model/position.js';
import LivePosition from '../model/liveposition.js';
import Text from '../model/text.js';
import Element from '../model/element.js';
import Range from '../model/range.js';
import log from '../../utils/log.js';

/**
 * Inserts content into the editor (specified selection) as one would expect the paste
 * functionality to work.
 *
 * **Note:** Use {@link module:engine/controller/datacontroller~DataController#insertContent} instead of this function.
 * This function is only exposed to be reusable in algorithms which change the {@link engine.controller.DataController#insertContent}
 * method's behavior.
 *
 * @param {module:engine/controller/datacontroller~DataController} dataController The data controller in context of which the insertion
 * should be performed.
 * @param {module:engine/model/documentfragment~DocumentFragment} content The content to insert.
 * @param {module:engine/model/selection~Selection} selection Selection into which the content should be inserted.
 * @param {module:engine/model/batch~Batch} [batch] Batch to which deltas will be added. If not specified, then
 * changes will be added to a new batch.
 */
export default function insertContent( dataController, content, selection, batch ) {
	if ( !batch ) {
		batch = dataController.model.batch();
	}

	if ( !selection.isCollapsed ) {
		dataController.deleteContent( selection, batch, {
			merge: true
		} );
	}

	const insertion = new Insertion( dataController, batch, selection.anchor );

	insertion.handleNodes( content.getChildren(), {
		// The set of children being inserted is the only set in this context
		// so it's the first and last (it's a hack ;)).
		isFirst: true,
		isLast: true
	} );

	selection.setRanges( insertion.getSelectionRanges() );
}

/**
 * Utility class for performing content insertion.
 *
 * @private
 */
class Insertion {
	constructor( dataController, batch, position ) {
		/**
		 * The data controller in context of which the insertion should be performed.
		 *
		 * @member {module:engine/controller/datacontroller~DataController} #dataController
		 */
		this.dataController = dataController;

		/**
		 * Batch to which deltas will be added.
		 *
		 * @member {module:engine/controller/batch~Batch} #batch
		 */
		this.batch = batch;

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
		this.schema = dataController.model.schema;
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
			const node = nodes[ i ].clone();

			this._handleNode( node, {
				isFirst: i === 0 && parentContext.isFirst,
				isLast: ( i === ( nodes.length - 1 ) ) && parentContext.isLast
			} );
		}
	}

	/**
	 * Returns a range to be selected after insertion.
	 *
	 * @returns {module:engine/model/range~Range}
	 */
	getSelectionRanges() {
		if ( this.nodeToSelect ) {
			return [ Range.createOn( this.nodeToSelect ) ];
		} else {
			const document = this.dataController.model;
			const selectionPosition = document.getNearestSelectionPosition( this.position );

			return [ new Range( selectionPosition ) ];
		}
	}

	/**
	 * Handles insertion of a single node.
	 *
	 * @param {module:engine/model/node~Node} node
	 * @param {Object} context
	 * @param {Boolean} context.isFirst Whether the given node is the first one in the content to be inserted.
	 * @param {Boolean} context.isLast Whether the given node is the last one in the content to be inserted.
	 */
	_handleNode( node, context ) {
		// Let's handle object in a special way.
		// * They should never be merged with other elements.
		// * If they are not allowed in any of the selection ancestors, they could be either autoparagraphed or totally removed.
		if ( this._checkIsObject( node ) ) {
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
	 * @param {module:engine/model/node~Node} node The disallowed node which needs to be handled.
	 * @param {Object} context
	 */
	_handleDisallowedNode( node, context ) {
		// Try inserting its children (strip the parent).
		if ( node instanceof Element ) {
			this.handleNodes( node.getChildren(), context );
		}
		// Try autoparagraphing.
		else {
			this._tryAutoparagraphing( node, context );
		}
	}

	/**
	 * @param {module:engine/model/node~Node} node The node to insert.
	 */
	_insert( node ) {
		/* istanbul ignore if */
		if ( !this._checkIsAllowed( node, [ this.position.parent ] ) ) {
			// Algorithm's correctness check. We should never end up here but it's good to know that we did.
			// Note that it would often be a silent issue if we insert node in a place where it's not allowed.
			log.error(
				'insertcontent-wrong-position: The node cannot be inserted on the given position.',
				{ node, position: this.position }
			);

			return;
		}

		const livePos = LivePosition.createFromPosition( this.position );

		this.batch.insert( this.position, node );

		this.position = Position.createFromPosition( livePos );
		livePos.detach();

		// The last inserted object should be selected because we can't put a collapsed selection after it.
		if ( this._checkIsObject( node ) && !this.schema.check( { name: '$text', inside: [ this.position.parent ] } ) ) {
			this.nodeToSelect = node;
		} else {
			this.nodeToSelect = null;
		}
	}

	/**
	 * @param {module:engine/model/node~Node} node The node which could potentially be merged.
	 * @param {Object} context
	 */
	_mergeSiblingsOf( node, context ) {
		if ( !( node instanceof Element ) ) {
			return;
		}

		const mergeLeft = context.isFirst && ( node.previousSibling instanceof Element ) && this.canMergeWith.has( node.previousSibling );
		const mergeRight = context.isLast && ( node.nextSibling instanceof Element ) && this.canMergeWith.has( node.nextSibling );
		const mergePosLeft = LivePosition.createBefore( node );
		const mergePosRight = LivePosition.createAfter( node );

		if ( mergeLeft ) {
			const position = LivePosition.createFromPosition( this.position );

			this.batch.merge( mergePosLeft );

			this.position = Position.createFromPosition( position );
			position.detach();
		}

		if ( mergeRight ) {
			let position;

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
			position = new LivePosition( this.position.root, this.position.path, 'sticksToPrevious' );

			this.batch.merge( mergePosRight );

			this.position = Position.createFromPosition( position );
			position.detach();
		}

		mergePosLeft.detach();
		mergePosRight.detach();
	}

	/**
	 * Tries wrapping the node in a new paragraph and inserting it this way.
	 *
	 * @param {module:engine/model/node~Node} node The node which needs to be autoparagraphed.
	 * @param {Object} context
	 */
	_tryAutoparagraphing( node, context ) {
		const paragraph = new Element( 'paragraph' );

		// Do not autoparagraph if the paragraph won't be allowed there,
		// cause that would lead to an infinite loop. The paragraph would be rejected in
		// the next _handleNode() call and we'd be here again.
		if ( this._getAllowedIn( paragraph, this.position.parent ) && this._checkIsAllowed( node, [ paragraph ] ) ) {
			paragraph.appendChildren( node );

			this._handleNode( paragraph, context );
		}
	}

	/**
	 * @param {module:engine/model/node~Node} node
	 */
	_checkAndSplitToAllowedPosition( node ) {
		const allowedIn = this._getAllowedIn( node, this.position.parent );

		if ( !allowedIn ) {
			return false;
		}

		while ( allowedIn != this.position.parent ) {
			if ( this.position.isAtStart ) {
				const parent = this.position.parent;
				this.position = Position.createBefore( parent );

				// Special case – parent is empty (<p>^</p>) so isAtStart == isAtEnd == true.
				// We can remove the element after moving selection out of it.
				if ( parent.isEmpty ) {
					this.batch.remove( parent );
				}
			} else if ( this.position.isAtEnd ) {
				this.position = Position.createAfter( this.position.parent );
			} else {
				const tempPos = Position.createAfter( this.position.parent );

				this.batch.split( this.position );

				this.position = tempPos;

				this.canMergeWith.add( this.position.nodeAfter );
			}
		}

		return true;
	}

	/**
	 * Gets the element in which the given node is allowed. It checks the passed element and all its ancestors.
	 *
	 * @param {module:engine/model/node~Node} node The node to check.
	 * @param {module:engine/model/element~Element} element The element in which the node's correctness should be checked.
	 * @returns {module:engine/model/element~Element|null}
	 */
	_getAllowedIn( node, element ) {
		if ( this._checkIsAllowed( node, [ element ] ) ) {
			return element;
		}

		if ( element.parent ) {
			return this._getAllowedIn( node, element.parent );
		}

		return null;
	}

	/**
	 * Check whether the given node is allowed in the specified schema path.
	 *
	 * @param {module:engine/model/node~Node} node
	 * @param {module:engine/model/schemapath~SchemaPath} path
	 */
	_checkIsAllowed( node, path ) {
		return this.schema.check( {
			name: this._getNodeSchemaName( node ),
			attributes: Array.from( node.getAttributeKeys() ),
			inside: path
		} );
	}

	/**
	 * Checks wether according to the schema this is an object type element.
	 *
	 * @param {module:engine/model/node~Node} node The node to check.
	 */
	_checkIsObject( node ) {
		return this.schema.objects.has( this._getNodeSchemaName( node ) );
	}

	/**
	 * Gets a name under which we should check this node in the schema.
	 *
	 * @param {module:engine/model/node~Node} node The node.
	 */
	_getNodeSchemaName( node ) {
		if ( node instanceof Text ) {
			return '$text';
		}

		return node.name;
	}
}
