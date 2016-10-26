/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// import { stringify as stringifyModel } from '../dev-utils/model.js';

import Position from '../model/position.js';
import LivePosition from '../model/liveposition.js';
import Text from '../model/text.js';
import Element from '../model/element.js';
import Range from '../model/range.js';
import log from '../../utils/log.js';

/**
 * TODO
 *
 * @method engine.dataController.insertContent
 * @param {engine.DataController} dataController
 * @param {engine.model.Batch} batch Batch to which deltas will be added.
 * @param {engine.model.Selection} selection Selection into which the content should be inserted.
 * The selection should be collapsed.
 * @param {engine.model.DocumentFragment} content The content to insert.
 */
export default function insertContent( dataController, batch, selection, content ) {
	if ( !selection.isCollapsed ) {
		dataController.model.composer.deleteContents( batch, selection, {
			merge: true
		} );
	}

	// Convert the pasted content to a model document fragment.
	// Convertion is contextual, but in this case we need an "all allowed" context and for that
	// we use the $clipboardHolder item.
	const modelFragment = dataController.viewToModel.convert( content, {
		context: [ '$clipboardHolder' ]
	} );

	// console.log( stringifyModel( modelFragment ) );

	const insertion = new Insertion( dataController, batch, selection.anchor );

	insertion.handleNodes( modelFragment.getChildren() );

	selection.setRanges( insertion.getSelectionRanges() );
}

class Insertion {
	constructor( dataController, batch, position ) {
		this.dataController = dataController;
		this.batch = batch;
		this.position = position;
		this.canMergeWith = new Set( [ this.position.parent ] );

		this.schema = dataController.model.schema;
	}

	handleNodes( nodes, parentContext ) {
		nodes = Array.from( nodes );

		if ( !parentContext ) {
			parentContext = {
				isFirst: true,
				isLast: true
			};
		}

		for ( let i = 0; i < nodes.length; i++ ) {
			const node = nodes[ i ].clone();

			this.handleNode( node, {
				isFirst: i === 0 && parentContext.isFirst,
				isLast: ( i === ( nodes.length - 1 ) ) && parentContext.isLast
			} );
		}
	}

	handleNode( node, context = {} ) {
		context.isElement = ( node instanceof Element );
		context.isObject = this._checkIsObject( node );

		if ( context.isObject ) {
			this._handleObject( node, context );

			return;
		}

		const isAllowed = this._splitToAllowedPosition( node, context );

		if ( !isAllowed ) {
			// Try inserting its children (strip the parent).
			if ( context.isElement ) {
				this.handleNodes( node.getChildren(), context );
			}
			// Try autoparagraphing.
			else {
				const paragraph = new Element( 'paragraph' );

				// Do not autoparagraph if the paragraph won't be allowed there,
				// cause that would lead to an infinite loop. The paragraph would be rejected in
				// the next handleNode() call and we'd be here again.
				if ( this._getAllowedIn( paragraph, this.position.parent ) ) {
					paragraph.appendChildren( node );

					this.handleNode( paragraph, context );
				}
			}

			return;
		}

		this._insert( node );

		if ( context.isElement ) {
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

				if ( this.position.isEqual( mergePosRight ) ) {
					this.position = Position.createAt( mergePosRight.nodeBefore, 'end' );

					// <p>xx[]</p> + <p>yy</p> => <p>xx[]yy</p> (when stick to previous)
					// <p>xx[]</p> + <p>yy</p> => <p>xxyy[]</p> (when sticks to next)
					position = new LivePosition( this.position.root, this.position.path, 'STICKS_TO_PREVIOUS' );
				} else {
					position = LivePosition.createFromPosition( this.position );
				}

				this.batch.merge( mergePosRight );

				this.position = Position.createFromPosition( position );
				position.detach();
			}

			mergePosLeft.detach();
			mergePosRight.detach();
		}
	}

	getSelectionRanges() {
		if ( this.nodeToSelect ) {
			return [ Range.createOn( this.nodeToSelect ) ];
		} else {
			const searchRange = new Range( Position.createAt( this.position.root ), this.position );

			for ( const position of searchRange.getPositions( { direction: 'backward' } ) ) {
				if ( this.schema.check( { name: '$text', inside: position } ) ) {
					return [ new Range( position ) ];
				}
			}

			log.error( 'insertcontent-no-selection-position: It was not possible to find a position for the resulting selection.' );

			return [ new Range( this.position ) ];
		}
	}

	_handleObject( node, context ) {
		if ( this._splitToAllowedPosition( node ) ) {
			this._insert( node );
		} else {
			const paragraph = new Element( 'paragraph' );

			// Do not autoparagraph if the paragraph won't be allowed there,
			// cause that would lead to an infinite loop. The paragraph would be rejected in
			// the next handleNode() call and we'd be here again.
			if ( this._getAllowedIn( paragraph, this.position.parent ) && this._checkIsAllowed( node, [ paragraph ] ) ) {
				paragraph.appendChildren( node );

				this.handleNode( paragraph, context );
			}
		}
	}

	_insert( node ) {
		if ( !this._checkIsAllowed( node, [ this.position.parent ] ) ) {
			// The code should never get here. If it does, it means that we have a bug which
			// may be silent if we don't log this (the model may still work after insertion).
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

		// The last inserted "block" object should be selected
		// because we can't put a collapsed selection after it.
		if ( this._checkIsObject( node ) && !this.schema.check( { name: '$text', inside: [ this.position.parent ] } ) ) {
			this.nodeToSelect = node;
		} else {
			this.nodeToSelect = null;
		}
	}

	_splitToAllowedPosition( node ) {
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
	 * Get the element or the first of its ancestors in which the given node is allowed.
	 *
	 * @param {engine.model.Node}
	 * @param {engine.model.Element} element
	 * @returns {engine.model.Element|null}
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
	 * @param {engine.model.Node}
	 * @param {engine.model.SchemaPath} path
	 */
	_checkIsAllowed( node, path ) {
		return this.schema.check( {
			name: this._getNodeSchemaName( node ),
			attributes: Array.from( node.getAttributeKeys() ),
			inside: path
		} );
	}

	_checkIsObject( node ) {
		return this.schema.objects.has( this._getNodeSchemaName( node ) );
	}

	_getNodeSchemaName( node ) {
		if ( node instanceof Text ) {
			return '$text';
		}

		return node.name;
	}
}
