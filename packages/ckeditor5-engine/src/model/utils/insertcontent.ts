/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/utils/insertcontent
 */

import DocumentSelection from '../documentselection';
import Element from '../element';
import LivePosition from '../liveposition';
import LiveRange from '../liverange';
import Position from '../position';
import Range from '../range';

import type DocumentFragment from '../documentfragment';
import type Item from '../item';
import type Model from '../model';
import type Schema from '../schema';
import type Writer from '../writer';
import type Node from '../node';
import type Selection from '../selection';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

/**
 * Inserts content into the editor (specified selection) as one would expect the paste functionality to work.
 *
 * It takes care of removing the selected content, splitting elements (if needed), inserting elements and merging elements appropriately.
 *
 * Some examples:
 *
 * ```html
 * <p>x^</p> + <p>y</p> => <p>x</p><p>y</p> => <p>xy[]</p>
 * <p>x^y</p> + <p>z</p> => <p>x</p>^<p>y</p> + <p>z</p> => <p>x</p><p>z</p><p>y</p> => <p>xz[]y</p>
 * <p>x^y</p> + <img /> => <p>x</p>^<p>y</p> + <img /> => <p>x</p><img /><p>y</p>
 * <p>x</p><p>^</p><p>z</p> + <p>y</p> => <p>x</p><p>y[]</p><p>z</p> (no merging)
 * <p>x</p>[<img />]<p>z</p> + <p>y</p> => <p>x</p>^<p>z</p> + <p>y</p> => <p>x</p><p>y[]</p><p>z</p>
 * ```
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
 * @param model The model in context of which the insertion should be performed.
 * @param content The content to insert.
 * @param selectable Selection into which the content should be inserted.
 * @param placeOrOffset Sets place or offset of the selection.
 * @returns Range which contains all the performed changes. This is a range that, if removed,
 * would return the model to the state before the insertion. If no changes were preformed by `insertContent`, returns a range collapsed
 * at the insertion position.
 */
export default function insertContent(
	model: Model,
	content: Item | DocumentFragment,
	selectable?: Selection | DocumentSelection
): Range {
	return model.change( writer => {
		const selection: Selection | DocumentSelection = selectable ? selectable : model.document.selection;

		if ( !selection.isCollapsed ) {
			model.deleteContent( selection, { doNotAutoparagraph: true } );
		}

		const insertion = new Insertion( model, writer, selection.anchor! );
		const fakeMarkerElements = [];

		let nodesToInsert: any;

		if ( content.is( 'documentFragment' ) ) {
			// If document fragment has any markers, these markers should be inserted into the model as well.
			if ( content.markers.size ) {
				const markersPosition = [];

				for ( const [ name, range ] of content.markers ) {
					const { start, end } = range;
					const isCollapsed = start.isEqual( end );

					markersPosition.push(
						{ position: start, name, isCollapsed },
						{ position: end, name, isCollapsed }
					);
				}

				// Markers position is sorted backwards to ensure that the insertion of fake markers will not change
				// the position of the next markers.
				markersPosition.sort( ( { position: posA }, { position: posB } ) => posA.isBefore( posB ) ? 1 : -1 );

				for ( const { position, name, isCollapsed } of markersPosition ) {
					let fakeElement = null;
					let collapsed = null;
					const isAtBeginning = position.parent === content && position.isAtStart;
					const isAtEnd = position.parent === content && position.isAtEnd;

					// We have two ways of handling markers. In general, we want to add temporary <$marker> model elements to
					// represent marker boundaries. These elements will be inserted into content together with the rest
					// of the document fragment. After insertion is done, positions for these elements will be read
					// and proper, actual markers will be created in the model and fake elements will be removed.
					//
					// However, if the <$marker> element is at the beginning or at the end of the document fragment,
					// it may affect how the inserted content is merged with current model, impacting the insertion
					// result. To avoid that, we don't add <$marker> elements at these positions. Instead, we will use
					// `Insertion#getAffectedRange()` to figure out new positions for these marker boundaries.
					if ( !isAtBeginning && !isAtEnd ) {
						fakeElement = writer.createElement( '$marker' );
						writer.insert( fakeElement, position );
					} else if ( isCollapsed ) {
						// Save whether the collapsed marker was at the beginning or at the end of document fragment
						// to know where to create it after the insertion is done.
						collapsed = isAtBeginning ? 'start' as const : 'end' as const;
					}

					fakeMarkerElements.push( {
						name,
						element: fakeElement,
						collapsed
					} );
				}
			}

			nodesToInsert = content.getChildren();
		} else {
			nodesToInsert = [ content ];
		}

		insertion.handleNodes( nodesToInsert );

		let newRange = insertion.getSelectionRange();

		if ( content.is( 'documentFragment' ) && fakeMarkerElements.length ) {
			// After insertion was done, the selection was set but the model contains fake <$marker> elements.
			// These <$marker> elements will be now removed. Because of that, we will need to fix the selection.
			// We will create a live range that will automatically be update as <$marker> elements are removed.
			const selectionLiveRange = newRange ? LiveRange.fromRange( newRange ) : null;

			// Marker name -> [ start position, end position ].
			const markersData: Record<string, Array<Position>> = {};

			// Note: `fakeMarkerElements` are sorted backwards. However, now, we want to handle the markers
			// from the beginning, so that existing <$marker> elements do not affect markers positions.
			// This is why we iterate from the end to the start.
			for ( let i = fakeMarkerElements.length - 1; i >= 0; i-- ) {
				const { name, element, collapsed } = fakeMarkerElements[ i ];
				const isStartBoundary = !markersData[ name ];

				if ( isStartBoundary ) {
					markersData[ name ] = [];
				}

				if ( element ) {
					// Read fake marker element position to learn where the marker should be created.
					const elementPosition = writer.createPositionAt( element, 'before' );

					markersData[ name ].push( elementPosition );

					writer.remove( element );
				} else {
					// If the fake marker element does not exist, it means that the marker boundary was at the beginning or at the end.
					const rangeOnInsertion = insertion.getAffectedRange();

					if ( !rangeOnInsertion ) {
						// If affected range is `null` it means that nothing was in the document fragment or all content was filtered out.
						// Some markers that were in the filtered content may be removed (partially or totally).
						// Let's handle only those markers that were at the beginning or at the end of the document fragment.
						if ( collapsed ) {
							markersData[ name ].push( insertion.position );
						}

						continue;
					}

					if ( collapsed ) {
						// If the marker was collapsed at the beginning or at the end of the document fragment,
						// put both boundaries at the beginning or at the end of inserted range (to keep the marker collapsed).
						markersData[ name ].push( rangeOnInsertion[ collapsed ] );
					} else {
						markersData[ name ].push( isStartBoundary ? rangeOnInsertion.start : rangeOnInsertion.end );
					}
				}
			}

			for ( const [ name, [ start, end ] ] of Object.entries( markersData ) ) {
				// For now, we ignore markers if they are included in the filtered-out content.
				// In the future implementation we will improve that case to create markers that are not filtered out completely.
				if ( start && end && start.root === end.root ) {
					writer.addMarker( name, {
						usingOperation: true,
						affectsData: true,
						range: new Range( start, end )
					} );
				}
			}

			if ( selectionLiveRange ) {
				newRange = selectionLiveRange.toRange();
				selectionLiveRange.detach();
			}
		}

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

		const affectedRange = insertion.getAffectedRange() || model.createRange( selection.anchor! );

		insertion.destroy();

		return affectedRange;
	} );
}

/**
 * Utility class for performing content insertion.
 */
class Insertion {
	/**
	 * The model in context of which the insertion should be performed.
	 */
	public readonly model: Model;

	/**
	 * Batch to which operations will be added.
	 */
	public readonly writer: Writer;

	/**
	 * The position at which (or near which) the next node will be inserted.
	 */
	public position: Position;

	/**
	 * Elements with which the inserted elements can be merged.
	 *
	 * ```html
	 * <p>x^</p><p>y</p> + <p>z</p> (can merge to <p>x</p>)
	 * <p>x</p><p>^y</p> + <p>z</p> (can merge to <p>y</p>)
	 * <p>x^y</p> + <p>z</p> (can merge to <p>xy</p> which will be split during the action,
	 * 						so both its pieces will be added to this set)
	 * ```
	 */
	public readonly canMergeWith: Set<Node | DocumentFragment | null>;

	/**
	 * Schema of the model.
	 */
	public readonly schema: Schema;

	/**
	 * The temporary DocumentFragment used for grouping multiple nodes for single insert operation.
	 */
	private readonly _documentFragment: DocumentFragment;

	/**
	 * The current position in the temporary DocumentFragment.
	 */
	private _documentFragmentPosition: Position;

	/**
	 * The reference to the first inserted node.
	 */
	private _firstNode: Node | null = null;

	/**
	 * The reference to the last inserted node.
	 */
	private _lastNode: Node | null = null;

	/**
	 * The reference to the last auto paragraph node.
	 */
	private _lastAutoParagraph: Element | null = null;

	/**
	 * The array of nodes that should be cleaned of not allowed attributes.
	 */
	private _filterAttributesOf: Array<Node> = [];

	/**
	 * Beginning of the affected range. See {@link module:engine/model/utils/insertcontent~Insertion#getAffectedRange}.
	 */
	private _affectedStart: LivePosition | null = null;

	/**
	 * End of the affected range. See {@link module:engine/model/utils/insertcontent~Insertion#getAffectedRange}.
	 */
	private _affectedEnd: LivePosition | null = null;

	private _nodeToSelect: Node | null = null;

	constructor( model: Model, writer: Writer, position: Position ) {
		this.model = model;
		this.writer = writer;
		this.position = position;
		this.canMergeWith = new Set( [ this.position.parent ] );
		this.schema = model.schema;

		this._documentFragment = writer.createDocumentFragment();
		this._documentFragmentPosition = writer.createPositionAt( this._documentFragment, 0 );
	}

	/**
	 * Handles insertion of a set of nodes.
	 *
	 * @param nodes Nodes to insert.
	 */
	public handleNodes( nodes: Iterable<Node> ): void {
		for ( const node of Array.from( nodes ) ) {
			this._handleNode( node );
		}

		// Insert nodes collected in temporary DocumentFragment.
		this._insertPartialFragment();

		// If there was an auto paragraph then we might need to adjust the end of insertion.
		if ( this._lastAutoParagraph ) {
			this._updateLastNodeFromAutoParagraph( this._lastAutoParagraph );
		}

		// After the content was inserted we may try to merge it with its next sibling if the selection was in it initially.
		// Merging with the previous sibling was performed just after inserting the first node to the document.
		this._mergeOnRight();

		// TMP this will become a post-fixer.
		this.schema.removeDisallowedAttributes( this._filterAttributesOf, this.writer );
		this._filterAttributesOf = [];
	}

	/**
	 * Updates the last node after the auto paragraphing.
	 *
	 * @param node The last auto paragraphing node.
	 */
	private _updateLastNodeFromAutoParagraph( node: Node ): void {
		const positionAfterLastNode = this.writer.createPositionAfter( this._lastNode! );
		const positionAfterNode = this.writer.createPositionAfter( node );

		// If the real end was after the last auto paragraph then update relevant properties.
		if ( positionAfterNode.isAfter( positionAfterLastNode ) ) {
			this._lastNode = node;

			/* istanbul ignore if */
			if ( this.position.parent != node || !this.position.isAtEnd ) {
				// Algorithm's correctness check. We should never end up here but it's good to know that we did.
				// At this point the insertion position should be at the end of the last auto paragraph.
				// Note: This error is documented in other place in this file.
				throw new CKEditorError( 'insertcontent-invalid-insertion-position', this );
			}

			this.position = positionAfterNode;
			this._setAffectedBoundaries( this.position );
		}
	}

	/**
	 * Returns range to be selected after insertion.
	 * Returns `null` if there is no valid range to select after insertion.
	 */
	public getSelectionRange(): Range | null {
		if ( this._nodeToSelect ) {
			return Range._createOn( this._nodeToSelect );
		}

		return this.model.schema.getNearestSelectionRange( this.position );
	}

	/**
	 * Returns a range which contains all the performed changes. This is a range that, if removed, would return the model to the state
	 * before the insertion. Returns `null` if no changes were done.
	 */
	public getAffectedRange(): Range | null {
		if ( !this._affectedStart ) {
			return null;
		}

		return new Range( this._affectedStart, this._affectedEnd );
	}

	/**
	 * Destroys `Insertion` instance.
	 */
	public destroy(): void {
		if ( this._affectedStart ) {
			this._affectedStart.detach();
		}

		if ( this._affectedEnd ) {
			this._affectedEnd.detach();
		}
	}

	/**
	 * Handles insertion of a single node.
	 */
	private _handleNode( node: Node ): void {
		// Let's handle object in a special way.
		// * They should never be merged with other elements.
		// * If they are not allowed in any of the selection ancestors, they could be either autoparagraphed or totally removed.
		if ( this.schema.isObject( node ) ) {
			this._handleObject( node as Element );

			return;
		}

		// Try to find a place for the given node.

		// Check if a node can be inserted in the given position or it would be accepted if a paragraph would be inserted.
		// Inserts the auto paragraph if it would allow for insertion.
		let isAllowed = this._checkAndAutoParagraphToAllowedPosition( node );

		if ( !isAllowed ) {
			// Split the position.parent's branch up to a point where the node can be inserted.
			// If it isn't allowed in the whole branch, then of course don't split anything.
			isAllowed = this._checkAndSplitToAllowedPosition( node );

			if ( !isAllowed ) {
				this._handleDisallowedNode( node );

				return;
			}
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
	 */
	private _insertPartialFragment(): void {
		if ( this._documentFragment.isEmpty ) {
			return;
		}

		const livePosition = LivePosition.fromPosition( this.position, 'toNext' );

		this._setAffectedBoundaries( this.position );

		// If the very first node of the whole insertion process is inserted, insert it separately for OT reasons (undo).
		// Note: there can be multiple calls to `_insertPartialFragment()` during one insertion process.
		// Note: only the very first node can be merged so we have to do separate operation only for it.
		if ( this._documentFragment.getChild( 0 ) == this._firstNode ) {
			this.writer.insert( this._firstNode!, this.position );

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
	 * @param node The object element.
	 */
	private _handleObject( node: Element ): void {
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
	 * @param node The disallowed node which needs to be handled.
	 */
	private _handleDisallowedNode( node: Node ): void {
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
	 * @param node The node to insert.
	 */
	private _appendToFragment( node: Node ): void {
		/* istanbul ignore if */
		if ( !this.schema.checkChild( this.position, node ) ) {
			// Algorithm's correctness check. We should never end up here but it's good to know that we did.
			// Note that it would often be a silent issue if we insert node in a place where it's not allowed.

			/**
			 * Given node cannot be inserted on the given position.
			 *
			 * @error insertcontent-wrong-position
			 * @param node Node to insert.
			 * @param position Position to insert the node at.
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
			this._nodeToSelect = node;
		} else {
			this._nodeToSelect = null;
		}

		this._filterAttributesOf.push( node );
	}

	/**
	 * Sets `_affectedStart` and `_affectedEnd` to the given `position`. Should be used before a change is done during insertion process to
	 * mark the affected range.
	 *
	 * This method is used before inserting a node or splitting a parent node. `_affectedStart` and `_affectedEnd` are also changed
	 * during merging, but the logic there is more complicated so it is left out of this function.
	 */
	private _setAffectedBoundaries( position: Position ): void {
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
	 */
	private _mergeOnLeft(): void {
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
		if ( this._affectedStart!.isEqual( mergePosLeft ) ) {
			this._affectedStart!.detach();
			this._affectedStart = LivePosition._createAt( mergePosLeft.nodeBefore!, 'end', 'toPrevious' );
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
		if ( mergePosLeft.isEqual( this._affectedEnd! ) && this._firstNode === this._lastNode ) {
			this._affectedEnd!.detach();
			this._affectedEnd = LivePosition._createAt( mergePosLeft.nodeBefore!, 'end', 'toNext' );
		}

		this.position = livePosition.toPosition();
		livePosition.detach();

		// After merge elements that were marked by _insert() to be filtered might be gone so
		// we need to mark the new container.
		this._filterAttributesOf.push( this.position.parent as any );

		mergePosLeft.detach();
	}

	/**
	 * Merges the next sibling of the last node if it should be merged.
	 *
	 * After the content was inserted we may try to merge it with its siblings.
	 * This should happen only if the selection was in those elements initially.
	 */
	private _mergeOnRight(): void {
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
		this.position = Position._createAt( mergePosRight.nodeBefore!, 'end' );

		// Explanation of setting position stickiness to `'toPrevious'`:
		// OK:  <p>xx[]</p> + <p>yy</p> => <p>xx[]yy</p> (when sticks to previous)
		// NOK: <p>xx[]</p> + <p>yy</p> => <p>xxyy[]</p> (when sticks to next)
		const livePosition = LivePosition.fromPosition( this.position, 'toPrevious' );

		// See comment in `_mergeOnLeft()` on moving `_affectedStart`.
		if ( this._affectedEnd!.isEqual( mergePosRight ) ) {
			this._affectedEnd!.detach();
			this._affectedEnd = LivePosition._createAt( mergePosRight.nodeBefore!, 'end', 'toNext' );
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
		if ( mergePosRight.getShiftedBy( -1 ).isEqual( this._affectedStart! ) && this._firstNode === this._lastNode ) {
			this._affectedStart!.detach();
			this._affectedStart = LivePosition._createAt( mergePosRight.nodeBefore!, 0, 'toPrevious' );
		}

		this.position = livePosition.toPosition();
		livePosition.detach();

		// After merge elements that were marked by _insert() to be filtered might be gone so
		// we need to mark the new container.
		this._filterAttributesOf.push( this.position.parent as any );

		mergePosRight.detach();
	}

	/**
	 * Checks whether specified node can be merged with previous sibling element.
	 *
	 * @param node The node which could potentially be merged.
	 */
	private _canMergeLeft( node: Element ): boolean {
		const previousSibling = node.previousSibling;

		return ( previousSibling instanceof Element ) &&
			this.canMergeWith.has( previousSibling ) &&
			this.model.schema.checkMerge( previousSibling, node );
	}

	/**
	 * Checks whether specified node can be merged with next sibling element.
	 *
	 * @param node The node which could potentially be merged.
	 */
	private _canMergeRight( node: Element ): boolean {
		const nextSibling = node.nextSibling;

		return ( nextSibling instanceof Element ) &&
			this.canMergeWith.has( nextSibling ) &&
			this.model.schema.checkMerge( node, nextSibling );
	}

	/**
	 * Tries wrapping the node in a new paragraph and inserting it this way.
	 *
	 * @param node The node which needs to be autoparagraphed.
	 */
	private _tryAutoparagraphing( node: Node ): void {
		const paragraph = this.writer.createElement( 'paragraph' );

		// Do not autoparagraph if the paragraph won't be allowed there,
		// cause that would lead to an infinite loop. The paragraph would be rejected in
		// the next _handleNode() call and we'd be here again.
		if ( this._getAllowedIn( this.position.parent as any, paragraph ) && this.schema.checkChild( paragraph, node ) ) {
			paragraph._appendChild( node );
			this._handleNode( paragraph );
		}
	}

	/**
	 * Checks if a node can be inserted in the given position or it would be accepted if a paragraph would be inserted.
	 * It also handles inserting the paragraph.
	 *
	 * @returns Whether an allowed position was found.
	 * `false` is returned if the node isn't allowed at the current position or in auto paragraph, `true` if was.
	 */
	private _checkAndAutoParagraphToAllowedPosition( node: Node ): boolean {
		if ( this.schema.checkChild( this.position.parent as any, node ) ) {
			return true;
		}

		// Do not auto paragraph if the paragraph won't be allowed there,
		// cause that would lead to an infinite loop. The paragraph would be rejected in
		// the next _handleNode() call and we'd be here again.
		if ( !this.schema.checkChild( this.position.parent as any, 'paragraph' ) || !this.schema.checkChild( 'paragraph', node ) ) {
			return false;
		}

		// Insert nodes collected in temporary DocumentFragment if the position parent needs change to process further nodes.
		this._insertPartialFragment();

		// Insert a paragraph and move insertion position to it.
		const paragraph = this.writer.createElement( 'paragraph' );

		this.writer.insert( paragraph, this.position );
		this._setAffectedBoundaries( this.position );

		this._lastAutoParagraph = paragraph;
		this.position = this.writer.createPositionAt( paragraph, 0 );

		return true;
	}

	/**
	 * @returns Whether an allowed position was found.
	 * `false` is returned if the node isn't allowed at any position up in the tree, `true` if was.
	 */
	private _checkAndSplitToAllowedPosition( node: Node ): boolean {
		const allowedIn = this._getAllowedIn( this.position.parent as any, node );

		if ( !allowedIn ) {
			return false;
		}

		// Insert nodes collected in temporary DocumentFragment if the position parent needs change to process further nodes.
		if ( allowedIn != this.position.parent ) {
			this._insertPartialFragment();
		}

		while ( allowedIn != this.position.parent ) {
			if ( this.position.isAtStart ) {
				// If insertion position is at the beginning of the parent, move it out instead of splitting.
				// <p>^Foo</p> -> ^<p>Foo</p>
				const parent: Element = this.position.parent as Element;

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
				this.position = this.writer.createPositionAfter( this.position.parent as Element );
			} else {
				const tempPos = this.writer.createPositionAfter( this.position.parent as Element );

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
	 * @param contextElement The element in which context the node should be checked.
	 * @param childNode The node to check.
	 */
	private _getAllowedIn( contextElement: Element, childNode: Node ): Element | null {
		if ( this.schema.checkChild( contextElement, childNode ) ) {
			return contextElement;
		}

		// If the child wasn't allowed in the context element and the element is a limit there's no point in
		// checking any further towards the root. This is it: the limit is unsplittable and there's nothing
		// we can do about it. Without this check, the algorithm will analyze parent of the limit and may create
		// an illusion of the child being allowed. There's no way to insert it down there, though. It results in
		// infinite loops.
		if ( this.schema.isLimit( contextElement ) ) {
			return null;
		}

		return this._getAllowedIn( contextElement.parent as any, childNode );
	}
}
