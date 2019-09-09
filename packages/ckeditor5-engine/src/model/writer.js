/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/writer
 */

import AttributeOperation from './operation/attributeoperation';
import DetachOperation from './operation/detachoperation';
import InsertOperation from './operation/insertoperation';
import MarkerOperation from './operation/markeroperation';
import MoveOperation from './operation/moveoperation';
import RenameOperation from './operation/renameoperation';
import RootAttributeOperation from './operation/rootattributeoperation';
import SplitOperation from './operation/splitoperation';
import MergeOperation from './operation/mergeoperation';

import DocumentFragment from './documentfragment';
import Text from './text';
import Element from './element';
import RootElement from './rootelement';
import Position from './position';
import Range from './range.js';
import DocumentSelection from './documentselection';

import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * The model can only be modified by using the writer. It should be used whenever you want to create a node, modify
 * child nodes, attributes or text, set the selection's position and its attributes.
 *
 * The instance of the writer is only available in the {@link module:engine/model/model~Model#change `change()`} or
 * {@link module:engine/model/model~Model#enqueueChange `enqueueChange()`}.
 *
 *		model.change( writer => {
 *			writer.insertText( 'foo', paragraph, 'end' );
 *		} );
 *
 * Note that the writer should never be stored and used outside of the `change()` and
 * `enqueueChange()` blocks.
 *
 * Note that writer's methods do not check the {@link module:engine/model/schema~Schema}. It is possible
 * to create incorrect model structures by using the writer. Read more about in
 * {@glink framework/guides/deep-dive/schema#who-checks-the-schema "Who checks the schema?"}.
 *
 * @see module:engine/model/model~Model#change
 * @see module:engine/model/model~Model#enqueueChange
 */
export default class Writer {
	/**
	 * Creates a writer instance.
	 *
	 * **Note:** It is not recommended to use it directly. Use {@link module:engine/model/model~Model#change `Model#change()`} or
	 * {@link module:engine/model/model~Model#enqueueChange `Model#enqueueChange()`} instead.
	 *
	 * @protected
	 * @param {module:engine/model/model~Model} model
	 * @param {module:engine/model/batch~Batch} batch
	 */
	constructor( model, batch ) {
		/**
		 * Instance of the model on which this writer operates.
		 *
		 * @readonly
		 * @type {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * The batch to which this writer will add changes.
		 *
		 * @readonly
		 * @type {module:engine/model/batch~Batch}
		 */
		this.batch = batch;
	}

	/**
	 * Creates a new {@link module:engine/model/text~Text text node}.
	 *
	 *		writer.createText( 'foo' );
	 *		writer.createText( 'foo', { bold: true } );
	 *
	 * @param {String} data Text data.
	 * @param {Object} [attributes] Text attributes.
	 * @returns {module:engine/model/text~Text} Created text node.
	 */
	createText( data, attributes ) {
		return new Text( data, attributes );
	}

	/**
	 * Creates a new {@link module:engine/model/element~Element element}.
	 *
	 *		writer.createElement( 'paragraph' );
	 *		writer.createElement( 'paragraph', { alignment: 'center' } );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @returns {module:engine/model/element~Element} Created element.
	 */
	createElement( name, attributes ) {
		return new Element( name, attributes );
	}

	/**
	 * Creates a new {@link module:engine/model/documentfragment~DocumentFragment document fragment}.
	 *
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Created document fragment.
	 */
	createDocumentFragment() {
		return new DocumentFragment();
	}

	/**
	 * Inserts item on given position.
	 *
	 *		const paragraph = writer.createElement( 'paragraph' );
	 *		writer.insert( paragraph, position );
	 *
	 * Instead of using position you can use parent and offset:
	 *
	 *		const text = writer.createText( 'foo' );
	 *		writer.insert( text, paragraph, 5 );
	 *
	 * You can also use `end` instead of the offset to insert at the end:
	 *
	 *		const text = writer.createText( 'foo' );
	 *		writer.insert( text, paragraph, 'end' );
	 *
	 * Or insert before or after another element:
	 *
	 *		const paragraph = writer.createElement( 'paragraph' );
	 *		writer.insert( paragraph, anotherParagraph, 'after' );
	 *
	 * These parameters works the same way as {@link #createPositionAt `writer.createPositionAt()`}.
	 *
	 * Note that if the item already has parent it will be removed from the previous parent.
	 *
	 * Note that you cannot re-insert a node from a document to a different document or a document fragment. In this case,
	 * `model-writer-insert-forbidden-move` is thrown.
	 *
	 * If you want to move {@link module:engine/model/range~Range range} instead of an
	 * {@link module:engine/model/item~Item item} use {@link module:engine/model/writer~Writer#move `Writer#move()`}.
	 *
	 * **Note:** For a paste-like content insertion mechanism see
	 * {@link module:engine/model/model~Model#insertContent `model.insertContent()`}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/documentfragment~DocumentFragment} item Item or document
	 * fragment to insert.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * second parameter is a {@link module:engine/model/item~Item model item}.
	 */
	insert( item, itemOrPosition, offset = 0 ) {
		this._assertWriterUsedCorrectly();

		if ( item instanceof Text && item.data == '' ) {
			return;
		}

		const position = Position._createAt( itemOrPosition, offset );

		// If item has a parent already.
		if ( item.parent ) {
			// We need to check if item is going to be inserted within the same document.
			if ( isSameTree( item.root, position.root ) ) {
				// If it's we just need to move it.
				this.move( Range._createOn( item ), position );

				return;
			}
			// If it isn't the same root.
			else {
				if ( item.root.document ) {
					/**
					 * Cannot move a node from a document to a different tree.
					 * It is forbidden to move a node that was already in a document outside of it.
					 *
					 * @error model-writer-insert-forbidden-move
					 */
					throw new CKEditorError(
						'model-writer-insert-forbidden-move: ' +
						'Cannot move a node from a document to a different tree. ' +
						'It is forbidden to move a node that was already in a document outside of it.',
						this
					);
				} else {
					// Move between two different document fragments or from document fragment to a document is possible.
					// In that case, remove the item from it's original parent.
					this.remove( item );
				}
			}
		}

		const version = position.root.document ? position.root.document.version : null;

		const insert = new InsertOperation( position, item, version );

		if ( item instanceof Text ) {
			insert.shouldReceiveAttributes = true;
		}

		this.batch.addOperation( insert );
		this.model.applyOperation( insert );

		// When element is a DocumentFragment we need to move its markers to Document#markers.
		if ( item instanceof DocumentFragment ) {
			for ( const [ markerName, markerRange ] of item.markers ) {
				// We need to migrate marker range from DocumentFragment to Document.
				const rangeRootPosition = Position._createAt( markerRange.root, 0 );
				const range = new Range(
					markerRange.start._getCombined( rangeRootPosition, position ),
					markerRange.end._getCombined( rangeRootPosition, position )
				);

				const options = { range, usingOperation: true, affectsData: true };

				if ( this.model.markers.has( markerName ) ) {
					this.updateMarker( markerName, options );
				} else {
					this.addMarker( markerName, options );
				}
			}
		}
	}

	/**
	 * Creates and inserts text on given position. You can optionally set text attributes:
	 *
	 *		writer.insertText( 'foo', position );
	 *		writer.insertText( 'foo', { bold: true }, position );
	 *
	 * Instead of using position you can use parent and offset or define that text should be inserted at the end
	 * or before or after other node:
	 *
	 *		// Inserts 'foo' in paragraph, at offset 5:
	 *		writer.insertText( 'foo', paragraph, 5 );
	 *		// Inserts 'foo' at the end of a paragraph:
	 *		writer.insertText( 'foo', paragraph, 'end' );
	 *		// Inserts 'foo' after an image:
	 *		writer.insertText( 'foo', image, 'after' );
	 *
	 * These parameters work in the same way as {@link #createPositionAt `writer.createPositionAt()`}.
	 *
	 * @param {String} data Text data.
	 * @param {Object} [attributes] Text attributes.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * third parameter is a {@link module:engine/model/item~Item model item}.
	 */
	insertText( text, attributes, itemOrPosition, offset ) {
		if ( attributes instanceof DocumentFragment || attributes instanceof Element || attributes instanceof Position ) {
			this.insert( this.createText( text ), attributes, itemOrPosition );
		} else {
			this.insert( this.createText( text, attributes ), itemOrPosition, offset );
		}
	}

	/**
	 * Creates and inserts element on given position. You can optionally set attributes:
	 *
	 *		writer.insertElement( 'paragraph', position );
	 *		writer.insertElement( 'paragraph', { alignment: 'center' }, position );
	 *
	 * Instead of using position you can use parent and offset or define that text should be inserted at the end
	 * or before or after other node:
	 *
	 *		// Inserts paragraph in the root at offset 5:
	 *		writer.insertElement( 'paragraph', root, 5 );
	 *		// Inserts paragraph at the end of a blockquote:
	 *		writer.insertElement( 'paragraph', blockquote, 'end' );
	 *		// Inserts after an image:
	 *		writer.insertElement( 'paragraph', image, 'after' );
	 *
	 * These parameters works the same way as {@link #createPositionAt `writer.createPositionAt()`}.
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * third parameter is a {@link module:engine/model/item~Item model item}.
	 */
	insertElement( name, attributes, itemOrPosition, offset ) {
		if ( attributes instanceof DocumentFragment || attributes instanceof Element || attributes instanceof Position ) {
			this.insert( this.createElement( name ), attributes, itemOrPosition );
		} else {
			this.insert( this.createElement( name, attributes ), itemOrPosition, offset );
		}
	}

	/**
	 * Inserts item at the end of the given parent.
	 *
	 *		const paragraph = writer.createElement( 'paragraph' );
	 *		writer.append( paragraph, root );
	 *
	 * Note that if the item already has parent it will be removed from the previous parent.
	 *
	 * If you want to move {@link module:engine/model/range~Range range} instead of an
	 * {@link module:engine/model/item~Item item} use {@link module:engine/model/writer~Writer#move `Writer#move()`}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/documentfragment~DocumentFragment}
	 * item Item or document fragment to insert.
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} parent
	 */
	append( item, parent ) {
		this.insert( item, parent, 'end' );
	}

	/**
	 * Creates text node and inserts it at the end of the parent. You can optionally set text attributes:
	 *
	 *		writer.appendText( 'foo', paragraph );
	 *		writer.appendText( 'foo', { bold: true }, paragraph );
	 *
	 * @param {String} text Text data.
	 * @param {Object} [attributes] Text attributes.
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} parent
	 */
	appendText( text, attributes, parent ) {
		if ( attributes instanceof DocumentFragment || attributes instanceof Element ) {
			this.insert( this.createText( text ), attributes, 'end' );
		} else {
			this.insert( this.createText( text, attributes ), parent, 'end' );
		}
	}

	/**
	 * Creates element and inserts it at the end of the parent. You can optionally set attributes:
	 *
	 *		writer.appendElement( 'paragraph', root );
	 *		writer.appendElement( 'paragraph', { alignment: 'center' }, root );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} parent
	 */
	appendElement( name, attributes, parent ) {
		if ( attributes instanceof DocumentFragment || attributes instanceof Element ) {
			this.insert( this.createElement( name ), attributes, 'end' );
		} else {
			this.insert( this.createElement( name, attributes ), parent, 'end' );
		}
	}

	/**
	 * Sets value of the attribute with given key on a {@link module:engine/model/item~Item model item}
	 * or on a {@link module:engine/model/range~Range range}.
	 *
	 * @param {String} key Attribute key.
	 * @param {*} value Attribute new value.
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range on which the attribute will be set.
	 */
	setAttribute( key, value, itemOrRange ) {
		this._assertWriterUsedCorrectly();

		if ( itemOrRange instanceof Range ) {
			const ranges = itemOrRange.getMinimalFlatRanges();

			for ( const range of ranges ) {
				setAttributeOnRange( this, key, value, range );
			}
		} else {
			setAttributeOnItem( this, key, value, itemOrRange );
		}
	}

	/**
	 * Sets values of attributes on a {@link module:engine/model/item~Item model item}
	 * or on a {@link module:engine/model/range~Range range}.
	 *
	 *		writer.setAttributes( {
	 *			bold: true,
	 *			italic: true
	 *		}, range );
	 *
	 * @param {Object} attributes Attributes keys and values.
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range on which the attributes will be set.
	 */
	setAttributes( attributes, itemOrRange ) {
		for ( const [ key, val ] of toMap( attributes ) ) {
			this.setAttribute( key, val, itemOrRange );
		}
	}

	/**
	 * Removes an attribute with given key from a {@link module:engine/model/item~Item model item}
	 * or from a {@link module:engine/model/range~Range range}.
	 *
	 * @param {String} key Attribute key.
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range from which the attribute will be removed.
	 */
	removeAttribute( key, itemOrRange ) {
		this._assertWriterUsedCorrectly();

		if ( itemOrRange instanceof Range ) {
			const ranges = itemOrRange.getMinimalFlatRanges();

			for ( const range of ranges ) {
				setAttributeOnRange( this, key, null, range );
			}
		} else {
			setAttributeOnItem( this, key, null, itemOrRange );
		}
	}

	/**
	 * Removes all attributes from all elements in the range or from the given item.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range from which all attributes will be removed.
	 */
	clearAttributes( itemOrRange ) {
		this._assertWriterUsedCorrectly();

		const removeAttributesFromItem = item => {
			for ( const attribute of item.getAttributeKeys() ) {
				this.removeAttribute( attribute, item );
			}
		};

		if ( !( itemOrRange instanceof Range ) ) {
			removeAttributesFromItem( itemOrRange );
		} else {
			for ( const item of itemOrRange.getItems() ) {
				removeAttributesFromItem( item );
			}
		}
	}

	/**
	 * Moves all items in the source range to the target position.
	 *
	 *		writer.move( sourceRange, targetPosition );
	 *
	 * Instead of the target position you can use parent and offset or define that range should be moved to the end
	 * or before or after chosen item:
	 *
	 *		// Moves all items in the range to the paragraph at offset 5:
	 *		writer.move( sourceRange, paragraph, 5 );
	 *		// Moves all items in the range to the end of a blockquote:
	 *		writer.move( sourceRange, blockquote, 'end' );
	 *		// Moves all items in the range to a position after an image:
	 *		writer.move( sourceRange, image, 'after' );
	 *
	 * These parameters works the same way as {@link #createPositionAt `writer.createPositionAt()`}.
	 *
	 * Note that items can be moved only within the same tree. It means that you can move items within the same root
	 * (element or document fragment) or between {@link module:engine/model/document~Document#roots documents roots},
	 * but you can not move items from document fragment to the document or from one detached element to another. Use
	 * {@link module:engine/model/writer~Writer#insert} in such cases.
	 *
	 * @param {module:engine/model/range~Range} range Source range.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * second parameter is a {@link module:engine/model/item~Item model item}.
	 */
	move( range, itemOrPosition, offset ) {
		this._assertWriterUsedCorrectly();

		if ( !( range instanceof Range ) ) {
			/**
			 * Invalid range to move.
			 *
			 * @error writer-move-invalid-range
			 */
			throw new CKEditorError( 'writer-move-invalid-range: Invalid range to move.', this );
		}

		if ( !range.isFlat ) {
			/**
			 * Range to move is not flat.
			 *
			 * @error writer-move-range-not-flat
			 */
			throw new CKEditorError( 'writer-move-range-not-flat: Range to move is not flat.', this );
		}

		const position = Position._createAt( itemOrPosition, offset );

		// Do not move anything if the move target is same as moved range start.
		if ( position.isEqual( range.start ) ) {
			return;
		}

		// If part of the marker is removed, create additional marker operation for undo purposes.
		this._addOperationForAffectedMarkers( 'move', range );

		if ( !isSameTree( range.root, position.root ) ) {
			/**
			 * Range is going to be moved within not the same document. Please use
			 * {@link module:engine/model/writer~Writer#insert insert} instead.
			 *
			 * @error writer-move-different-document
			 */
			throw new CKEditorError( 'writer-move-different-document: Range is going to be moved between different documents.', this );
		}

		const version = range.root.document ? range.root.document.version : null;
		const operation = new MoveOperation( range.start, range.end.offset - range.start.offset, position, version );

		this.batch.addOperation( operation );
		this.model.applyOperation( operation );
	}

	/**
	 * Removes given model {@link module:engine/model/item~Item item} or {@link module:engine/model/range~Range range}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange Model item or range to remove.
	 */
	remove( itemOrRange ) {
		this._assertWriterUsedCorrectly();

		const rangeToRemove = itemOrRange instanceof Range ? itemOrRange : Range._createOn( itemOrRange );
		const ranges = rangeToRemove.getMinimalFlatRanges().reverse();

		for ( const flat of ranges ) {
			// If part of the marker is removed, create additional marker operation for undo purposes.
			this._addOperationForAffectedMarkers( 'move', flat );

			applyRemoveOperation( flat.start, flat.end.offset - flat.start.offset, this.batch, this.model );
		}
	}

	/**
	 * Merges two siblings at the given position.
	 *
	 * Node before and after the position have to be an element. Otherwise `writer-merge-no-element-before` or
	 * `writer-merge-no-element-after` error will be thrown.
	 *
	 * @param {module:engine/model/position~Position} position Position between merged elements.
	 */
	merge( position ) {
		this._assertWriterUsedCorrectly();

		const nodeBefore = position.nodeBefore;
		const nodeAfter = position.nodeAfter;

		// If part of the marker is removed, create additional marker operation for undo purposes.
		this._addOperationForAffectedMarkers( 'merge', position );

		if ( !( nodeBefore instanceof Element ) ) {
			/**
			 * Node before merge position must be an element.
			 *
			 * @error writer-merge-no-element-before
			 */
			throw new CKEditorError( 'writer-merge-no-element-before: Node before merge position must be an element.', this );
		}

		if ( !( nodeAfter instanceof Element ) ) {
			/**
			 * Node after merge position must be an element.
			 *
			 * @error writer-merge-no-element-after
			 */
			throw new CKEditorError( 'writer-merge-no-element-after: Node after merge position must be an element.', this );
		}

		if ( !position.root.document ) {
			this._mergeDetached( position );
		} else {
			this._merge( position );
		}
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createPositionFromPath `Model#createPositionFromPath()`}.
	 *
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} root Root of the position.
	 * @param {Array.<Number>} path Position path. See {@link module:engine/model/position~Position#path}.
	 * @param {module:engine/model/position~PositionStickiness} [stickiness='toNone'] Position stickiness.
	 * See {@link module:engine/model/position~PositionStickiness}.
	 * @returns {module:engine/model/position~Position}
	 */
	createPositionFromPath( root, path, stickiness ) {
		return this.model.createPositionFromPath( root, path, stickiness );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createPositionAt `Model#createPositionAt()`}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 * @returns {module:engine/model/position~Position}
	 */
	createPositionAt( itemOrPosition, offset ) {
		return this.model.createPositionAt( itemOrPosition, offset );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createPositionAfter `Model#createPositionAfter()`}.
	 *
	 * @param {module:engine/model/item~Item} item Item after which the position should be placed.
	 * @returns {module:engine/model/position~Position}
	 */
	createPositionAfter( item ) {
		return this.model.createPositionAfter( item );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createPositionBefore `Model#createPositionBefore()`}.
	 *
	 * @param {module:engine/model/item~Item} item Item after which the position should be placed.
	 * @returns {module:engine/model/position~Position}
	 */
	createPositionBefore( item ) {
		return this.model.createPositionBefore( item );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createRange `Model#createRange()`}.
	 *
	 * @param {module:engine/model/position~Position} start Start position.
	 * @param {module:engine/model/position~Position} [end] End position. If not set, range will be collapsed at `start` position.
	 * @returns {module:engine/model/range~Range}
	 */
	createRange( start, end ) {
		return this.model.createRange( start, end );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createRangeIn `Model#createRangeIn()`}.
	 *
	 * @param {module:engine/model/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/model/range~Range}
	 */
	createRangeIn( element ) {
		return this.model.createRangeIn( element );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createRangeOn `Model#createRangeOn()`}.
	 *
	 * @param {module:engine/model/element~Element} element Element which is a parent for the range.
	 * @returns {module:engine/model/range~Range}
	 */
	createRangeOn( element ) {
		return this.model.createRangeOn( element );
	}

	/**
	 * Shortcut for {@link module:engine/model/model~Model#createSelection `Model#createSelection()`}.
	 *
	 * @param {module:engine/model/selection~Selectable} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @returns {module:engine/model/selection~Selection}
	 */
	createSelection( selectable, placeOrOffset, options ) {
		return this.model.createSelection( selectable, placeOrOffset, options );
	}

	/**
	 * Performs merge action in a detached tree.
	 *
	 * @private
	 * @param {module:engine/model/position~Position} position Position between merged elements.
	 */
	_mergeDetached( position ) {
		const nodeBefore = position.nodeBefore;
		const nodeAfter = position.nodeAfter;

		this.move( Range._createIn( nodeAfter ), Position._createAt( nodeBefore, 'end' ) );
		this.remove( nodeAfter );
	}

	/**
	 * Performs merge action in a non-detached tree.
	 *
	 * @private
	 * @param {module:engine/model/position~Position} position Position between merged elements.
	 */
	_merge( position ) {
		const targetPosition = Position._createAt( position.nodeBefore, 'end' );
		const sourcePosition = Position._createAt( position.nodeAfter, 0 );

		const graveyard = position.root.document.graveyard;
		const graveyardPosition = new Position( graveyard, [ 0 ] );

		const version = position.root.document.version;

		const merge = new MergeOperation( sourcePosition, position.nodeAfter.maxOffset, targetPosition, graveyardPosition, version );

		this.batch.addOperation( merge );
		this.model.applyOperation( merge );
	}

	/**
	 * Renames the given element.
	 *
	 * @param {module:engine/model/element~Element} element The element to rename.
	 * @param {String} newName New element name.
	 */
	rename( element, newName ) {
		this._assertWriterUsedCorrectly();

		if ( !( element instanceof Element ) ) {
			/**
			 * Trying to rename an object which is not an instance of Element.
			 *
			 * @error writer-rename-not-element-instance
			 */
			throw new CKEditorError(
				'writer-rename-not-element-instance: Trying to rename an object which is not an instance of Element.',
				this
			);
		}

		const version = element.root.document ? element.root.document.version : null;
		const renameOperation = new RenameOperation( Position._createBefore( element ), element.name, newName, version );

		this.batch.addOperation( renameOperation );
		this.model.applyOperation( renameOperation );
	}

	/**
	 * Splits elements starting from the given position and going to the top of the model tree as long as given
	 * `limitElement` is reached. When `limitElement` is not defined then only the parent of the given position will be split.
	 *
	 * The element needs to have a parent. It cannot be a root element nor a document fragment.
	 * The `writer-split-element-no-parent` error will be thrown if you try to split an element with no parent.
	 *
	 * @param {module:engine/model/position~Position} position Position of split.
	 * @param {module:engine/model/node~Node} [limitElement] Stop splitting when this element will be reached.
	 * @returns {Object} result Split result.
	 * @returns {module:engine/model/position~Position} result.position Position between split elements.
	 * @returns {module:engine/model/range~Range} result.range Range that stars from the end of the first split element and ends
	 * at the beginning of the first copy element.
	 */
	split( position, limitElement ) {
		this._assertWriterUsedCorrectly();

		let splitElement = position.parent;

		if ( !splitElement.parent ) {
			/**
			 * Element with no parent can not be split.
			 *
			 * @error writer-split-element-no-parent
			 */
			throw new CKEditorError( 'writer-split-element-no-parent: Element with no parent can not be split.', this );
		}

		// When limit element is not defined lets set splitElement parent as limit.
		if ( !limitElement ) {
			limitElement = splitElement.parent;
		}

		if ( !position.parent.getAncestors( { includeSelf: true } ).includes( limitElement ) ) {
			throw new CKEditorError( 'writer-split-invalid-limit-element: Limit element is not a position ancestor.', this );
		}

		// We need to cache elements that will be created as a result of the first split because
		// we need to create a range from the end of the first split element to the beginning of the
		// first copy element. This should be handled by LiveRange but it doesn't work on detached nodes.
		let firstSplitElement, firstCopyElement;

		do {
			const version = splitElement.root.document ? splitElement.root.document.version : null;
			const howMany = splitElement.maxOffset - position.offset;
			const split = new SplitOperation( position, howMany, null, version );

			this.batch.addOperation( split );
			this.model.applyOperation( split );

			// Cache result of the first split.
			if ( !firstSplitElement && !firstCopyElement ) {
				firstSplitElement = splitElement;
				firstCopyElement = position.parent.nextSibling;
			}

			position = this.createPositionAfter( position.parent );
			splitElement = position.parent;
		} while ( splitElement !== limitElement );

		return {
			position,
			range: new Range( Position._createAt( firstSplitElement, 'end' ), Position._createAt( firstCopyElement, 0 ) )
		};
	}

	/**
	 * Wraps the given range with the given element or with a new element (if a string was passed).
	 *
	 * **Note:** range to wrap should be a "flat range" (see {@link module:engine/model/range~Range#isFlat `Range#isFlat`}).
	 * If not, an error will be thrown.
	 *
	 * @param {module:engine/model/range~Range} range Range to wrap.
	 * @param {module:engine/model/element~Element|String} elementOrString Element or name of element to wrap the range with.
	 */
	wrap( range, elementOrString ) {
		this._assertWriterUsedCorrectly();

		if ( !range.isFlat ) {
			/**
			 * Range to wrap is not flat.
			 *
			 * @error writer-wrap-range-not-flat
			 */
			throw new CKEditorError( 'writer-wrap-range-not-flat: Range to wrap is not flat.', this );
		}

		const element = elementOrString instanceof Element ? elementOrString : new Element( elementOrString );

		if ( element.childCount > 0 ) {
			/**
			 * Element to wrap with is not empty.
			 *
			 * @error writer-wrap-element-not-empty
			 */
			throw new CKEditorError( 'writer-wrap-element-not-empty: Element to wrap with is not empty.', this );
		}

		if ( element.parent !== null ) {
			/**
			 * Element to wrap with is already attached to a tree model.
			 *
			 * @error writer-wrap-element-attached
			 */
			throw new CKEditorError( 'writer-wrap-element-attached: Element to wrap with is already attached to tree model.', this );
		}

		this.insert( element, range.start );

		// Shift the range-to-wrap because we just inserted an element before that range.
		const shiftedRange = new Range( range.start.getShiftedBy( 1 ), range.end.getShiftedBy( 1 ) );

		this.move( shiftedRange, Position._createAt( element, 0 ) );
	}

	/**
	 * Unwraps children of the given element – all its children are moved before it and then the element is removed.
	 * Throws error if you try to unwrap an element which does not have a parent.
	 *
	 * @param {module:engine/model/element~Element} element Element to unwrap.
	 */
	unwrap( element ) {
		this._assertWriterUsedCorrectly();

		if ( element.parent === null ) {
			/**
			 * Trying to unwrap an element which has no parent.
			 *
			 * @error writer-unwrap-element-no-parent
			 */
			throw new CKEditorError( 'writer-unwrap-element-no-parent: Trying to unwrap an element which has no parent.', this );
		}

		this.move( Range._createIn( element ), this.createPositionAfter( element ) );
		this.remove( element );
	}

	/**
	 * Adds a {@link module:engine/model/markercollection~Marker marker}. Marker is a named range, which tracks
	 * changes in the document and updates its range automatically, when model tree changes.
	 *
	 * As the first parameter you can set marker name.
	 *
	 * The required `options.usingOperation` parameter lets you decide if the marker should be managed by operations or not. See
	 * {@link module:engine/model/markercollection~Marker marker class description} to learn about the difference between
	 * markers managed by operations and not-managed by operations.
	 *
	 * The `options.affectsData` parameter, which defaults to `false`, allows you to define if a marker affects the data. It should be
	 * `true` when the marker change changes the data returned by the
	 * {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`} method.
	 * When set to `true` it fires the {@link module:engine/model/document~Document#event:change:data `change:data`} event.
	 * When set to `false` it fires the {@link module:engine/model/document~Document#event:change `change`} event.
	 *
	 * Create marker directly base on marker's name:
	 *
	 *		addMarker( markerName, { range, usingOperation: false } );
	 *
	 * Create marker using operation:
	 *
	 *		addMarker( markerName, { range, usingOperation: true } );
	 *
	 * Create marker that affects the editor data:
	 *
	 *		addMarker( markerName, { range, usingOperation: false, affectsData: true } );
	 *
	 * Note: For efficiency reasons, it's best to create and keep as little markers as possible.
	 *
	 * @see module:engine/model/markercollection~Marker
	 * @param {String} name Name of a marker to create - must be unique.
	 * @param {Object} options
	 * @param {Boolean} options.usingOperation Flag indicating that the marker should be added by MarkerOperation.
	 * See {@link module:engine/model/markercollection~Marker#managedUsingOperations}.
	 * @param {module:engine/model/range~Range} options.range Marker range.
	 * @param {Boolean} [options.affectsData=false] Flag indicating that the marker changes the editor data.
	 * @returns {module:engine/model/markercollection~Marker} Marker that was set.
	 */
	addMarker( name, options ) {
		this._assertWriterUsedCorrectly();

		if ( !options || typeof options.usingOperation != 'boolean' ) {
			/**
			 * The `options.usingOperation` parameter is required when adding a new marker.
			 *
			 * @error writer-addMarker-no-usingOperation
			 */
			throw new CKEditorError(
				'writer-addMarker-no-usingOperation: The options.usingOperation parameter is required when adding a new marker.',
				this
			);
		}

		const usingOperation = options.usingOperation;
		const range = options.range;
		const affectsData = options.affectsData === undefined ? false : options.affectsData;

		if ( this.model.markers.has( name ) ) {
			/**
			 * Marker with provided name already exists.
			 *
			 * @error writer-addMarker-marker-exists
			 */
			throw new CKEditorError( 'writer-addMarker-marker-exists: Marker with provided name already exists.', this );
		}

		if ( !range ) {
			/**
			 * Range parameter is required when adding a new marker.
			 *
			 * @error writer-addMarker-no-range
			 */
			throw new CKEditorError(
				'writer-addMarker-no-range: Range parameter is required when adding a new marker.',
				this
			);
		}

		if ( !usingOperation ) {
			return this.model.markers._set( name, range, usingOperation, affectsData );
		}

		applyMarkerOperation( this, name, null, range, affectsData );

		return this.model.markers.get( name );
	}

	/**
	 * Adds, updates or refreshes a {@link module:engine/model/markercollection~Marker marker}. Marker is a named range, which tracks
	 * changes in the document and updates its range automatically, when model tree changes. Still, it is possible to change the
	 * marker's range directly using this method.
	 *
	 * As the first parameter you can set marker name or instance. If none of them is provided, new marker, with a unique
	 * name is created and returned.
	 *
	 * As the second parameter you can set the new marker data or leave this parameter as empty which will just refresh
	 * the marker by triggering downcast conversion for it. Refreshing the marker is useful when you want to change
	 * the marker {@link module:engine/view/element~Element view element} without changing any marker data.
	 *
	 * 		let isCommentActive = false;
	 *
	 * 		model.conversion.markerToHighlight( {
	 * 			model: 'comment',
	 *			view: data => {
	 *				const classes = [ 'comment-marker' ];
	 *
	 *				if ( isCommentActive ) {
	 *					classes.push( 'comment-marker--active' );
	 *				}
	 *
	 *				return { classes };
	 *			}
	 * 		} );
	 *
	 * 		// Change the property that indicates if marker is displayed as active or not.
	 * 		isCommentActive = true;
	 *
	 * 		// And refresh the marker to convert it with additional class.
	 * 		model.change( writer => writer.updateMarker( 'comment' ) );
	 *
	 * The `options.usingOperation` parameter lets you change if the marker should be managed by operations or not. See
	 * {@link module:engine/model/markercollection~Marker marker class description} to learn about the difference between
	 * markers managed by operations and not-managed by operations. It is possible to change this option for an existing marker.
	 *
	 * The `options.affectsData` parameter, which defaults to `false`, allows you to define if a marker affects the data. It should be
	 * `true` when the marker change changes the data returned by
	 * the {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`} method.
	 * When set to `true` it fires the {@link module:engine/model/document~Document#event:change:data `change:data`} event.
	 * When set to `false` it fires the {@link module:engine/model/document~Document#event:change `change`} event.
	 *
	 * Update marker directly base on marker's name:
	 *
	 *		updateMarker( markerName, { range } );
	 *
	 * Update marker using operation:
	 *
	 *		updateMarker( marker, { range, usingOperation: true } );
	 *		updateMarker( markerName, { range, usingOperation: true } );
	 *
	 * Change marker's option (start using operations to manage it):
	 *
	 *		updateMarker( marker, { usingOperation: true } );
	 *
	 * Change marker's option (inform the engine, that the marker does not affect the data anymore):
	 *
	 *		updateMarker( markerName, { affectsData: false } );
	 *
	 * @see module:engine/model/markercollection~Marker
	 * @param {String|module:engine/model/markercollection~Marker} markerOrName Name of a marker to update, or a marker instance.
	 * @param {Object} [options] If options object is not defined then marker will be refreshed by triggering
	 * downcast conversion for this marker with the same data.
	 * @param {module:engine/model/range~Range} [options.range] Marker range to update.
	 * @param {Boolean} [options.usingOperation] Flag indicated whether the marker should be added by MarkerOperation.
	 * See {@link module:engine/model/markercollection~Marker#managedUsingOperations}.
	 * @param {Boolean} [options.affectsData] Flag indicating that the marker changes the editor data.
	 */
	updateMarker( markerOrName, options ) {
		this._assertWriterUsedCorrectly();

		const markerName = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;
		const currentMarker = this.model.markers.get( markerName );

		if ( !currentMarker ) {
			/**
			 * Marker with provided name does not exists.
			 *
			 * @error writer-updateMarker-marker-not-exists
			 */
			throw new CKEditorError( 'writer-updateMarker-marker-not-exists: Marker with provided name does not exists.', this );
		}

		if ( !options ) {
			this.model.markers._refresh( currentMarker );

			return;
		}

		const hasUsingOperationDefined = typeof options.usingOperation == 'boolean';
		const affectsDataDefined = typeof options.affectsData == 'boolean';

		// Use previously defined marker's affectsData if the property is not provided.
		const affectsData = affectsDataDefined ? options.affectsData : currentMarker.affectsData;

		if ( !hasUsingOperationDefined && !options.range && !affectsDataDefined ) {
			/**
			 * One of the options is required - provide range, usingOperations or affectsData.
			 *
			 * @error writer-updateMarker-wrong-options
			 */
			throw new CKEditorError(
				'writer-updateMarker-wrong-options: One of the options is required - provide range, usingOperations or affectsData.',
				this
			);
		}

		const currentRange = currentMarker.getRange();
		const updatedRange = options.range ? options.range : currentRange;

		if ( hasUsingOperationDefined && options.usingOperation !== currentMarker.managedUsingOperations ) {
			// The marker type is changed so it's necessary to create proper operations.
			if ( options.usingOperation ) {
				// If marker changes to a managed one treat this as synchronizing existing marker.
				// Create `MarkerOperation` with `oldRange` set to `null`, so reverse operation will remove the marker.
				applyMarkerOperation( this, markerName, null, updatedRange, affectsData );
			} else {
				// If marker changes to a marker that do not use operations then we need to create additional operation
				// that removes that marker first.
				applyMarkerOperation( this, markerName, currentRange, null, affectsData );

				// Although not managed the marker itself should stay in model and its range should be preserver or changed to passed range.
				this.model.markers._set( markerName, updatedRange, undefined, affectsData );
			}

			return;
		}

		// Marker's type doesn't change so update it accordingly.
		if ( currentMarker.managedUsingOperations ) {
			applyMarkerOperation( this, markerName, currentRange, updatedRange, affectsData );
		} else {
			this.model.markers._set( markerName, updatedRange, undefined, affectsData );
		}
	}

	/**
	 * Removes given {@link module:engine/model/markercollection~Marker marker} or marker with given name.
	 * The marker is removed accordingly to how it has been created, so if the marker was created using operation,
	 * it will be destroyed using operation.
	 *
	 * @param {module:engine/model/markercollection~Marker|String} markerOrName Marker or marker name to remove.
	 */
	removeMarker( markerOrName ) {
		this._assertWriterUsedCorrectly();

		const name = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;

		if ( !this.model.markers.has( name ) ) {
			/**
			 * Trying to remove marker which does not exist.
			 *
			 * @error writer-removeMarker-no-marker
			 */
			throw new CKEditorError( 'writer-removeMarker-no-marker: Trying to remove marker which does not exist.', this );
		}

		const marker = this.model.markers.get( name );

		if ( !marker.managedUsingOperations ) {
			this.model.markers._remove( name );

			return;
		}

		const oldRange = marker.getRange();

		applyMarkerOperation( this, name, oldRange, null, marker.affectsData );
	}

	/**
	 * Sets the document's selection (ranges and direction) to the specified location based on the given
	 * {@link module:engine/model/selection~Selectable selectable} or creates an empty selection if no arguments were passed.
	 *
	 *		// Sets selection to the given range.
	 *		const range = writer.createRange( start, end );
	 *		writer.setSelection( range );
	 *
	 *		// Sets selection to given ranges.
	 *		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( star2, end2 ) ];
	 *		writer.setSelection( range );
	 *
	 *		// Sets selection to other selection.
	 *		const otherSelection = writer.createSelection();
	 *		writer.setSelection( otherSelection );
	 *
	 *		// Sets selection to the given document selection.
	 *		const documentSelection = model.document.selection;
	 *		writer.setSelection( documentSelection );
	 *
	 *		// Sets collapsed selection at the given position.
	 *		const position = writer.createPosition( root, path );
	 *		writer.setSelection( position );
	 *
	 *		// Sets collapsed selection at the position of the given node and an offset.
	 *		writer.setSelection( paragraph, offset );
	 *
	 * Creates a range inside an {@link module:engine/model/element~Element element} which starts before the first child of
 	 * that element and ends after the last child of that element.
	 *
	 *		writer.setSelection( paragraph, 'in' );
	 *
	 * Creates a range on an {@link module:engine/model/item~Item item} which starts before the item and ends just after the item.
	 *
	 *		writer.setSelection( paragraph, 'on' );
	 *
	 *		// Removes all selection's ranges.
	 *		writer.setSelection( null );
	 *
	 * `Writer#setSelection()` allow passing additional options (`backward`) as the last argument.
	 *
	 *		// Sets selection as backward.
	 *		writer.setSelection( range, { backward: true } );
	 *
	 * Throws `writer-incorrect-use` error when the writer is used outside the `change()` block.
	 *
	 * @param {module:engine/model/selection~Selectable} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 */
	setSelection( selectable, placeOrOffset, options ) {
		this._assertWriterUsedCorrectly();

		this.model.document.selection._setTo( selectable, placeOrOffset, options );
	}

	/**
	 * Moves {@link module:engine/model/documentselection~DocumentSelection#focus} to the specified location.
	 *
	 * The location can be specified in the same form as
	 * {@link #createPositionAt `writer.createPositionAt()`} parameters.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	setSelectionFocus( itemOrPosition, offset ) {
		this._assertWriterUsedCorrectly();

		this.model.document.selection._setFocus( itemOrPosition, offset );
	}

	/**
	 * Sets attribute(s) on the selection. If attribute with the same key already is set, it's value is overwritten.
	 *
	 * Using key and value pair:
	 *
	 * 	writer.setSelectionAttribute( 'italic', true );
	 *
	 * Using key-value object:
	 *
	 * 	writer.setSelectionAttribute( { italic: true, bold: false } );
	 *
	 * Using iterable object:
	 *
	 * 	writer.setSelectionAttribute( new Map( [ [ 'italic', true ] ] ) );
	 *
	 * @param {String|Object|Iterable.<*>} keyOrObjectOrIterable Key of the attribute to set
	 * or object / iterable of key => value attribute pairs.
	 * @param {*} [value] Attribute value.
	 */
	setSelectionAttribute( keyOrObjectOrIterable, value ) {
		this._assertWriterUsedCorrectly();

		if ( typeof keyOrObjectOrIterable === 'string' ) {
			this._setSelectionAttribute( keyOrObjectOrIterable, value );
		} else {
			for ( const [ key, value ] of toMap( keyOrObjectOrIterable ) ) {
				this._setSelectionAttribute( key, value );
			}
		}
	}

	/**
	 * Removes attribute(s) with given key(s) from the selection.
	 *
	 * Remove one attribute:
	 *
	 *		writer.removeSelectionAttribute( 'italic' );
	 *
	 * Remove multiple attributes:
	 *
	 *		writer.removeSelectionAttribute( [ 'italic', 'bold' ] );
	 *
	 * @param {String|Iterable.<String>} keyOrIterableOfKeys Key of the attribute to remove or an iterable of attribute keys to remove.
	 */
	removeSelectionAttribute( keyOrIterableOfKeys ) {
		this._assertWriterUsedCorrectly();

		if ( typeof keyOrIterableOfKeys === 'string' ) {
			this._removeSelectionAttribute( keyOrIterableOfKeys );
		} else {
			for ( const key of keyOrIterableOfKeys ) {
				this._removeSelectionAttribute( key );
			}
		}
	}

	/**
	 * Temporarily changes the {@link module:engine/model/documentselection~DocumentSelection#isGravityOverridden gravity}
	 * of the selection from left to right.
	 *
	 * The gravity defines from which direction the selection inherits its attributes. If it's the default left gravity,
	 * then the selection (after being moved by the user) inherits attributes from its left-hand side.
	 * This method allows to temporarily override this behavior by forcing the gravity to the right.
	 *
	 * For the following model fragment:
	 *
	 *		<$text bold="true" linkHref="url">bar[]</$text><$text bold="true">biz</$text>
	 *
	 * * Default gravity: selection will have the `bold` and `linkHref` attributes.
	 * * Overridden gravity: selection will have `bold` attribute.
	 *
	 * **Note**: It returns an unique identifier which is required to restore the gravity. It guarantees the symmetry
	 * of the process.
	 *
	 * @returns {String} The unique id which allows restoring the gravity.
	 */
	overrideSelectionGravity() {
		return this.model.document.selection._overrideGravity();
	}

	/**
	 * Restores {@link ~Writer#overrideSelectionGravity} gravity to default.
	 *
	 * Restoring the gravity is only possible using the unique identifier returned by
	 * {@link ~Writer#overrideSelectionGravity}. Note that the gravity remains overridden as long as won't be restored
	 * the same number of times it was overridden.
	 *
	 * @param {String} uid The unique id returned by {@link ~Writer#overrideSelectionGravity}.
	 */
	restoreSelectionGravity( uid ) {
		this.model.document.selection._restoreGravity( uid );
	}

	/**
	 * @private
	 * @param {String} key Key of the attribute to remove.
	 * @param {*} value Attribute value.
	 */
	_setSelectionAttribute( key, value ) {
		const selection = this.model.document.selection;

		// Store attribute in parent element if the selection is collapsed in an empty node.
		if ( selection.isCollapsed && selection.anchor.parent.isEmpty ) {
			const storeKey = DocumentSelection._getStoreAttributeKey( key );

			this.setAttribute( storeKey, value, selection.anchor.parent );
		}

		selection._setAttribute( key, value );
	}

	/**
	 * @private
	 * @param {String} key Key of the attribute to remove.
	 */
	_removeSelectionAttribute( key ) {
		const selection = this.model.document.selection;

		// Remove stored attribute from parent element if the selection is collapsed in an empty node.
		if ( selection.isCollapsed && selection.anchor.parent.isEmpty ) {
			const storeKey = DocumentSelection._getStoreAttributeKey( key );

			this.removeAttribute( storeKey, selection.anchor.parent );
		}

		selection._removeAttribute( key );
	}

	/**
	 * Throws `writer-detached-writer-tries-to-modify-model` error when the writer is used outside of the `change()` block.
	 *
	 * @private
	 */
	_assertWriterUsedCorrectly() {
		/**
		 * Trying to use a writer outside a {@link module:engine/model/model~Model#change `change()` or
		 * {@link module:engine/model/model~Model#enqueueChange `enqueueChange()`} blocks.
		 *
		 * The writer can only be used inside these blocks which ensures that the model
		 * can only be changed during such "sessions".
		 *
		 * @error writer-incorrect-use
		 */
		if ( this.model._currentWriter !== this ) {
			throw new CKEditorError( 'writer-incorrect-use: Trying to use a writer outside the change() block.', this );
		}
	}

	/**
	 * For given action `type` and `positionOrRange` where the action happens, this function finds all affected markers
	 * and applies a marker operation with the new marker range equal to the current range. Thanks to this, the marker range
	 * can be later correctly processed during undo.
	 *
	 * @private
	 * @param {'move'|'merge'} type Writer action type.
	 * @param {module:engine/model/position~Position|module:engine/model/range~Range} positionOrRange Position or range
	 * where the writer action happens.
	 */
	_addOperationForAffectedMarkers( type, positionOrRange ) {
		for ( const marker of this.model.markers ) {
			if ( !marker.managedUsingOperations ) {
				continue;
			}

			const markerRange = marker.getRange();
			let isAffected = false;

			if ( type == 'move' ) {
				isAffected =
					positionOrRange.containsPosition( markerRange.start ) ||
					positionOrRange.start.isEqual( markerRange.start ) ||
					positionOrRange.containsPosition( markerRange.end ) ||
					positionOrRange.end.isEqual( markerRange.end );
			} else {
				// if type == 'merge'.
				const elementBefore = positionOrRange.nodeBefore;
				const elementAfter = positionOrRange.nodeAfter;

				//               Start:  <p>Foo[</p><p>Bar]</p>
				//         After merge:  <p>Foo[Bar]</p>
				// After undoing split:  <p>Foo</p><p>[Bar]</p>     <-- incorrect, needs remembering for undo.
				//
				const affectedInLeftElement = markerRange.start.parent == elementBefore && markerRange.start.isAtEnd;

				//               Start:  <p>[Foo</p><p>]Bar</p>
				//         After merge:  <p>[Foo]Bar</p>
				// After undoing split:  <p>[Foo]</p><p>Bar</p>     <-- incorrect, needs remembering for undo.
				//
				const affectedInRightElement = markerRange.end.parent == elementAfter && markerRange.end.offset == 0;

				//               Start:  <p>[Foo</p>]<p>Bar</p>
				//         After merge:  <p>[Foo]Bar</p>
				// After undoing split:  <p>[Foo]</p><p>Bar</p>     <-- incorrect, needs remembering for undo.
				//
				const affectedAfterLeftElement = markerRange.end.nodeAfter == elementAfter;

				//               Start:  <p>Foo</p>[<p>Bar]</p>
				//         After merge:  <p>Foo[Bar]</p>
				// After undoing split:  <p>Foo</p><p>[Bar]</p>     <-- incorrect, needs remembering for undo.
				//
				const affectedBeforeRightElement = markerRange.start.nodeAfter == elementAfter;

				isAffected = affectedInLeftElement || affectedInRightElement || affectedAfterLeftElement || affectedBeforeRightElement;
			}

			if ( isAffected ) {
				this.updateMarker( marker.name, { range: markerRange } );
			}
		}
	}
}

// Sets given attribute to each node in given range. When attribute value is null then attribute will be removed.
//
// Because attribute operation needs to have the same attribute value on the whole range, this function splits
// the range into smaller parts.
//
// Given `range` must be flat.
//
// @private
// @param {module:engine/model/writer~Writer} writer
// @param {String} key Attribute key.
// @param {*} value Attribute new value.
// @param {module:engine/model/range~Range} range Model range on which the attribute will be set.
function setAttributeOnRange( writer, key, value, range ) {
	const model = writer.model;
	const doc = model.document;

	// Position of the last split, the beginning of the new range.
	let lastSplitPosition = range.start;

	// Currently position in the scanning range. Because we need value after the position, it is not a current
	// position of the iterator but the previous one (we need to iterate one more time to get the value after).
	let position;

	// Value before the currently position.
	let valueBefore;

	// Value after the currently position.
	let valueAfter;

	for ( const val of range.getWalker( { shallow: true } ) ) {
		valueAfter = val.item.getAttribute( key );

		// At the first run of the iterator the position in undefined. We also do not have a valueBefore, but
		// because valueAfter may be null, valueBefore may be equal valueAfter ( undefined == null ).
		if ( position && valueBefore != valueAfter ) {
			// if valueBefore == value there is nothing to change, so we add operation only if these values are different.
			if ( valueBefore != value ) {
				addOperation();
			}

			lastSplitPosition = position;
		}

		position = val.nextPosition;
		valueBefore = valueAfter;
	}

	// Because position in the loop is not the iterator position (see let position comment), the last position in
	// the while loop will be last but one position in the range. We need to check the last position manually.
	if ( position instanceof Position && position != lastSplitPosition && valueBefore != value ) {
		addOperation();
	}

	function addOperation() {
		const range = new Range( lastSplitPosition, position );
		const version = range.root.document ? doc.version : null;
		const operation = new AttributeOperation( range, key, valueBefore, value, version );

		writer.batch.addOperation( operation );
		model.applyOperation( operation );
	}
}

// Sets given attribute to the given node. When attribute value is null then attribute will be removed.
//
// @private
// @param {module:engine/model/writer~Writer} writer
// @param {String} key Attribute key.
// @param {*} value Attribute new value.
// @param {module:engine/model/item~Item} item Model item on which the attribute will be set.
function setAttributeOnItem( writer, key, value, item ) {
	const model = writer.model;
	const doc = model.document;
	const previousValue = item.getAttribute( key );
	let range, operation;

	if ( previousValue != value ) {
		const isRootChanged = item.root === item;

		if ( isRootChanged ) {
			// If we change attributes of root element, we have to use `RootAttributeOperation`.
			const version = item.document ? doc.version : null;

			operation = new RootAttributeOperation( item, key, previousValue, value, version );
		} else {
			range = new Range( Position._createBefore( item ), writer.createPositionAfter( item ) );

			const version = range.root.document ? doc.version : null;

			operation = new AttributeOperation( range, key, previousValue, value, version );
		}

		writer.batch.addOperation( operation );
		model.applyOperation( operation );
	}
}

// Creates and applies marker operation to {@link module:engine/model/operation/operation~Operation operation}.
//
// @private
// @param {module:engine/model/writer~Writer} writer
// @param {String} name Marker name.
// @param {module:engine/model/range~Range} oldRange Marker range before the change.
// @param {module:engine/model/range~Range} newRange Marker range after the change.
// @param {Boolean} affectsData
function applyMarkerOperation( writer, name, oldRange, newRange, affectsData ) {
	const model = writer.model;
	const doc = model.document;

	const operation = new MarkerOperation( name, oldRange, newRange, model.markers, affectsData, doc.version );

	writer.batch.addOperation( operation );
	model.applyOperation( operation );
}

// Creates `MoveOperation` or `DetachOperation` that removes `howMany` nodes starting from `position`.
// The operation will be applied on given model instance and added to given operation instance.
//
// @private
// @param {module:engine/model/position~Position} position Position from which nodes are removed.
// @param {Number} howMany Number of nodes to remove.
// @param {Batch} batch Batch to which the operation will be added.
// @param {module:engine/model/model~Model} model Model instance on which operation will be applied.
function applyRemoveOperation( position, howMany, batch, model ) {
	let operation;

	if ( position.root.document ) {
		const doc = model.document;
		const graveyardPosition = new Position( doc.graveyard, [ 0 ] );

		operation = new MoveOperation( position, howMany, graveyardPosition, doc.version );
	} else {
		operation = new DetachOperation( position, howMany );
	}

	batch.addOperation( operation );
	model.applyOperation( operation );
}

// Returns `true` if both root elements are the same element or both are documents root elements.
//
// Elements in the same tree can be moved (for instance you can move element form one documents root to another, or
// within the same document fragment), but when element supposed to be moved from document fragment to the document, or
// to another document it should be removed and inserted to avoid problems with OT. This is because features like undo or
// collaboration may track changes on the document but ignore changes on detached fragments and should not get
// unexpected `move` operation.
function isSameTree( rootA, rootB ) {
	// If it is the same root this is the same tree.
	if ( rootA === rootB ) {
		return true;
	}

	// If both roots are documents root it is operation within the document what we still treat as the same tree.
	if ( rootA instanceof RootElement && rootB instanceof RootElement ) {
		return true;
	}

	return false;
}
