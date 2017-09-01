/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/controller/insertcontent
 */

import Position from '../model/position';
import LivePosition from '../model/liveposition';
import Element from '../model/element';
import Range from '../model/range';
import log from '@ckeditor/ckeditor5-utils/src/log';

/**
 * Inserts content into the editor (specified selection) as one would expect the paste
 * functionality to work.
 *
 * **Note:** Use {@link module:engine/controller/datacontroller~DataController#insertContent} instead of this function.
 * This function is only exposed to be reusable in algorithms
 * which change the {@link module:engine/controller/datacontroller~DataController#insertContent}
 * method's behavior.
 *
 * @param {module:engine/controller/datacontroller~DataController} dataController The data controller in context of which the insertion
 * should be performed.
 * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
 * @param {module:engine/model/selection~Selection} selection Selection into which the content should be inserted.
 * @param {module:engine/model/batch~Batch} [batch] Batch to which deltas will be added. If not specified, then
 * changes will be added to a new batch.
 */
export default function insertContent( dataController, content, selection, batch ) {
	if ( !batch ) {
		batch = dataController.model.batch();
	}

	if ( !selection.isCollapsed ) {
		dataController.deleteContent( selection, batch );
	}

	const insertion = new Insertion( dataController, batch, selection.anchor );

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
		selection.setRanges( [ newRange ] );
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
			const node = nodes[ i ];

			this._handleNode( node, {
				isFirst: i === 0 && parentContext.isFirst,
				isLast: ( i === ( nodes.length - 1 ) ) && parentContext.isLast
			} );
		}
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

		return this.dataController.model.getNearestSelectionRange( this.position );
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
		// If the node is an element, try inserting its children (strip the parent).
		if ( node.is( 'element' ) ) {
			this.handleNodes( node.getChildren(), context );
		}
		// If the node is a text and bare text is allowed in current position it means that the node
		// contains disallowed attributes and we have to remove them.
		else if ( this.schema.check( { name: '$text', inside: this.position } ) ) {
			removeDisallowedAttributes( [ node ], this.position, this.schema );
			this._handleNode( node, context );
		}
		// If text is not allowed, try autoparagraphing.
		else {
			this._tryAutoparagraphing( node, context );
		}
	}

	/**
	 * @param {module:engine/model/node~Node} node The node to insert.
	 */
	_insert( node ) {
		/* istanbul ignore if */
		if ( !this._checkIsAllowed( node, this.position ) ) {
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
		if ( this._checkIsObject( node ) && !this.schema.check( { name: '$text', inside: this.position } ) ) {
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

			// We need to check and strip disallowed attributes in all nested nodes because after merge
			// some attributes could end up in a path where are disallowed.
			const parent = position.nodeBefore;
			removeDisallowedAttributes( parent.getChildren(), Position.createAt( parent ), this.schema, this.batch );

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

			this.batch.merge( mergePosRight );

			// We need to check and strip disallowed attributes in all nested nodes because after merge
			// some attributes could end up in a place where are disallowed.
			removeDisallowedAttributes( position.parent.getChildren(), position, this.schema, this.batch );

			this.position = Position.createFromPosition( position );
			position.detach();
		}

		mergePosLeft.detach();
		mergePosRight.detach();

		// When there was no merge we need to check and strip disallowed attributes in all nested nodes of
		// just inserted node because some attributes could end up in a place where are disallowed.
		if ( !mergeLeft && !mergeRight ) {
			removeDisallowedAttributes( node.getChildren(), Position.createAt( node ), this.schema, this.batch );
		}
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
		if ( this._getAllowedIn( paragraph, this.position.parent ) ) {
			// When node is a text and is disallowed by schema it means that contains disallowed attributes
			// and we need to remove them.
			if ( node.is( 'text' ) && !this._checkIsAllowed( node, [ paragraph ] ) ) {
				removeDisallowedAttributes( [ node ], [ paragraph ], this.schema );
			}

			if ( this._checkIsAllowed( node, [ paragraph ] ) ) {
				paragraph.appendChildren( node );
				this._handleNode( paragraph, context );
			}
		}
	}

	/**
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
			if ( this.schema.limits.has( this.position.parent.name ) ) {
				return false;
			}

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
	 * @param {module:engine/model/schema~SchemaPath} path
	 */
	_checkIsAllowed( node, path ) {
		return this.schema.check( {
			name: getNodeSchemaName( node ),
			attributes: Array.from( node.getAttributeKeys() ),
			inside: path
		} );
	}

	/**
	 * Checks whether according to the schema this is an object type element.
	 *
	 * @param {module:engine/model/node~Node} node The node to check.
	 */
	_checkIsObject( node ) {
		return this.schema.objects.has( getNodeSchemaName( node ) );
	}
}

// Gets a name under which we should check this node in the schema.
//
// @param {module:engine/model/node~Node} node The node.
// @returns {String} Node name.
function getNodeSchemaName( node ) {
	return node.is( 'text' ) ? '$text' : node.name;
}

// Removes disallowed by schema attributes from given nodes. When batch parameter is provided then
// attributes will be removed by creating AttributeDeltas otherwise attributes will be removed
// directly from provided nodes.
//
// @param {Array<module:engine/model/node~Node>} nodes Nodes that will be filtered.
// @param {module:engine/model/schema~SchemaPath} inside Path inside which schema will be checked.
// @param {module:engine/model/schema~Schema} schema Schema instance uses for element validation.
// @param {module:engine/model/batch~Batch} [batch] Batch to which the deltas will be added.
function removeDisallowedAttributes( nodes, inside, schema, batch ) {
	for ( const node of nodes ) {
		const name = getNodeSchemaName( node );

		// When node with attributes is not allowed in current position.
		if ( !schema.check( { name, inside, attributes: Array.from( node.getAttributeKeys() ) } ) ) {
			// Let's remove attributes one by one.
			// This should be improved to check all combination of attributes.
			for ( const attribute of node.getAttributeKeys() ) {
				if ( !schema.check( { name, inside, attributes: attribute } ) ) {
					if ( batch ) {
						batch.removeAttribute( node, attribute );
					} else {
						node.removeAttribute( attribute );
					}
				}
			}
		}

		if ( node.is( 'element' ) ) {
			removeDisallowedAttributes( node.getChildren(), Position.createAt( node ), schema, batch );
		}
	}
}
