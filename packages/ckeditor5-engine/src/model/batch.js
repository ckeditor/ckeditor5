/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/batch
 */

import AttributeDelta from './delta/attributedelta';
import InsertDelta from './delta/insertdelta';
import MarkerDelta from './delta/markerdelta';
import MergeDelta from './delta/mergedelta';
import MoveDelta from './delta/movedelta';
import RemoveDelta from './delta/removedelta';
import RenameDelta from './delta/renamedelta';
import RootAttributeDelta from './delta/rootattributedelta';
import SplitDelta from './delta/splitdelta';
import UnwrapDelta from './delta/unwrapdelta';
import WeakInsertDelta from './delta/weakinsertdelta';
import WrapDelta from './delta/wrapdelta';

import AttributeOperation from './operation/attributeoperation';
import DetachOperation from './operation/detachoperation';
import InsertOperation from './operation/insertoperation';
import MarkerOperation from './operation/markeroperation';
import MoveOperation from './operation/moveoperation';
import RemoveOperation from './operation/removeoperation';
import RenameOperation from './operation/renameoperation';
import RootAttributeOperation from './operation/rootattributeoperation';

import DocumentFragment from './documentfragment';
import Text from './text';
import Element from './element';
import RootElement from './rootelement';
import Position from './position';
import Range from './range.js';

import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * `Batch` instance groups document changes ({@link module:engine/model/delta/delta~Delta deltas}). All deltas grouped in a single `Batch`
 * can be reverted together, so you can think about `Batch` as of a single undo step. If you want to extend given undo step you
 * can call another method on the same `Batch` object. If you want to create a separate undo step you can create a new `Batch`.
 *
 * For example to create two separate undo steps you can call:
 *
 *		doc.batch().insert( firstPosition, 'foo' );
 *		doc.batch().insert( secondPosition, 'bar' );
 *
 * To create a single undo step:
 *
 *		const batch = doc.batch();
 *		batch.insert( firstPosition, 'foo' );
 *		batch.insert( secondPosition, 'bar' );
 *
 */
export default class Batch {
	/**
	 * Creates `Batch` instance. Not recommended to use directly, use {@link module:engine/model/document~Document#batch} instead.
	 *
	 * @param {module:engine/model/document~Document} document Document which this Batch changes.
	 * @param {'transparent'|'default'} [type='default'] Type of the batch.
	 */
	constructor( document, type = 'default' ) {
		/**
		 * Document which this batch changes.
		 *
		 * @readonly
		 * @member {module:engine/model/document~Document} module:engine/model/batch~Batch#document
		 */
		this.document = document;

		/**
		 * Array of deltas which compose this batch.
		 *
		 * @readonly
		 * @member {Array.<module:engine/model/delta/delta~Delta>} module:engine/model/batch~Batch#deltas
		 */
		this.deltas = [];

		/**
		 * Type of the batch.
		 *
		 * Can be one of the following values:
		 * * `'default'` - all "normal" batches, most commonly used type.
		 * * `'transparent'` - batch that should be ignored by other features, i.e. initial batch or collaborative editing changes.
		 *
		 * @readonly
		 * @member {'transparent'|'default'} module:engine/model/batch~Batch#type
		 */
		this.type = type;
	}

	/**
	 * Returns this batch base version, which is equal to the base version of first delta in the batch.
	 * If there are no deltas in the batch, it returns `null`.
	 *
	 * @readonly
	 * @type {Number|null}
	 */
	get baseVersion() {
		return this.deltas.length > 0 ? this.deltas[ 0 ].baseVersion : null;
	}

	/**
	 * Adds delta to the batch instance. All modification methods (insert, remove, split, etc.) use this method
	 * to add created deltas.
	 *
	 * @param {module:engine/model/delta/delta~Delta} delta Delta to add.
	 * @return {module:engine/model/delta/delta~Delta} Added delta.
	 */
	addDelta( delta ) {
		delta.batch = this;
		this.deltas.push( delta );

		return delta;
	}

	/**
	 * Gets an iterable collection of operations.
	 *
	 * @returns {Iterable.<module:engine/model/operation/operation~Operation>}
	 */
	* getOperations() {
		for ( const delta of this.deltas ) {
			yield* delta.operations;
		}
	}

	/**
	 * Creates a new {@link module:engine/model/text~Text text node}.
	 *
	 *		batch.createText( 'foo' );
	 *		batch.createText( 'foo', { bold: true } );
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
	 *		batch.createElement( 'paragraph' );
	 *		batch.createElement( 'paragraph', { 'alignment': 'center' } );
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
	 *		const paragraph = batch.createElement( 'paragraph' );
	 *		batch.insert( paragraph, position );
	 *
	 * Instead of using position you can use parent and offset:
	 *
	 * 		const text = batch.createText( 'foo' );
	 *		batch.insert( text, paragraph, 5 );
	 *
	 * You can also use 'end' instead of the offset to insert at the end:
	 *
	 * 		const text = batch.createText( 'foo' );
	 *		batch.insert( text, paragraph, 'end' );
	 *
	 * Or insert before or after another element:
	 *
	 * 		const anotherParagraph = batch.createElement( 'paragraph' );
	 *		batch.insert( anotherParagraph, paragraph, 'after' );
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position#createAt}.
	 *
	 * Note that if the item already has parent it will be removed from the previous parent.
	 *
	 * If you want to move {@link module:engine/model/range~Range range} instead of an
	 * {@link module:engine/model/item~Item item} use {@link module:engine/model/batch~Batch#move batch}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/documentfragment~DocumentFragment}
	 * item Item or document fragment to insert.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * second parameter is a {@link module:engine/model/item~Item model item}.
	 */
	insert( item, itemOrPosition, offset ) {
		const position = Position.createAt( itemOrPosition, offset );

		// For text that has no parent we need to make a WeakInsert.
		const delta = item instanceof Text && !item.parent ? new WeakInsertDelta() : new InsertDelta();

		// If item has a parent already.
		if ( item.parent ) {
			// We need to check if item is going to be inserted within the same document.
			if ( isSameTree( item.root, position.root ) ) {
				// If it's we just need to move it.
				this.move( Range.createOn( item ), position );

				return;
			}
			// If it isn't the same root.
			else {
				// We need to remove this item from old position first.
				this.remove( item );
			}
		}

		const insert = new InsertOperation( position, item, this.document.version );

		this.addDelta( delta );
		delta.addOperation( insert );
		this.document.applyOperation( insert );

		// When element is a DocumentFragment we need to move its markers to Document#markers.
		if ( item instanceof DocumentFragment ) {
			for ( const [ markerName, markerRange ] of item.markers ) {
				// We need to migrate marker range from DocumentFragment to Document.
				const rangeRootPosition = Position.createAt( markerRange.root );
				const range = new Range(
					markerRange.start._getCombined( rangeRootPosition, position ),
					markerRange.end._getCombined( rangeRootPosition, position )
				);

				this.setMarker( markerName, range );
			}
		}
	}

	/**
	 * Creates and inserts text on given position. You can optionally set text attributes:
	 *
	 *		batch.insertText( 'foo', position );
	 *		batch.insertText( 'foo', { 'bold': true }, position );
	 *
	 * Instead of using position you can use parent and offset or define that text should be inserted at the end
	 * or before or after other node:
	 *
	 * 		batch.insertText( 'foo', paragraph, 5 );
	 *		batch.insertText( 'foo', paragraph, 'end' ); // insets at the end of the paragraph
	 *		batch.insertText( 'foo', image, 'after' ); // inserts after image
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position#createAt}.
	 *
	 * @param {String} data Text data.
	 * @param {Object} [attributes] Text attributes.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
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
	 *		batch.insertElement( 'paragraph', position );
	 *		batch.insertElement( 'paragraph', { 'alignment': 'center' }, position );
	 *
	 * Instead of using position you can use parent and offset or define that text should be inserted at the end
	 * or before or after other node:
	 *
	 * 		batch.insertElement( 'paragraph', paragraph, 5 );
	 *		batch.insertElement( 'paragraph', blockquote, 'end' ); // insets at the end of the blockquote
	 *		batch.insertElement( 'paragraph', image, 'after' ); // inserts after image
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position#createAt}.
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
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
	 *		const paragraph = batch.createElement( 'paragraph' );
	 *		batch.append( paragraph, root );
	 *
	 * Note that if the item already has parent it will be removed from the previous parent.
	 *
	 * If you want to move {@link module:engine/model/range~Range range} instead of an
	 * {@link module:engine/model/item~Item item} use {@link module:engine/model/batch~Batch#move batch}.
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
	 *		batch.appendText( 'foo', paragraph );
	 *		batch.appendText( 'foo', { 'bold': true }, paragraph );
	 *
	 * @param {String} data Text data.
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
	 *		batch.appendElement( 'paragraph', root );
	 *		batch.appendElement( 'paragraph', { 'alignment': 'center' }, root );
	 *
	 * @param {String} name Name of the element.
	 * @param {Object} [attributes] Elements attributes.
	 * @param {module:engine/model/element~Element|module:engine/model/documentfragment~DocumentFragment} parent
	 */
	appendElement( text, attributes, parent ) {
		if ( attributes instanceof DocumentFragment || attributes instanceof Element ) {
			this.insert( this.createElement( text ), attributes, 'end' );
		} else {
			this.insert( this.createElement( text, attributes ), parent, 'end' );
		}
	}

	/**
	 * Sets value of the attribute with given key on a {@link module:engine/model/item~Item model item}
	 * or on a {@link module:engine/model/range~Range range}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range on which the attribute will be set.
	 * @param {String} key Attribute key.
	 * @param {*} value Attribute new value.
	 */
	setAttribute( itemOrRange, key, value ) {
		if ( itemOrRange instanceof Range ) {
			setAttributeToRange( this, key, value, itemOrRange );
		} else {
			setAttributeToItem( this, key, value, itemOrRange );
		}
	}

	/**
	 * Sets values of attributes on a {@link module:engine/model/item~Item model item}
	 * or on a {@link module:engine/model/range~Range range}.
	 *
	 *		batch.setAttributes( range, {
	 *			'bold': true,
	 *			'italic': true
	 *		} );
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range on which the attributes will be set.
	 * @param {Object} attributes Attributes keys and values.
	 */
	setAttributes( itemOrRange, attributes ) {
		for ( const [ key, val ] of toMap( attributes ) ) {
			this.setAttribute( itemOrRange, key, val );
		}
	}

	/**
	 * Removes an attribute with given key from a {@link module:engine/model/item~Item model item}
	 * or from a {@link module:engine/model/range~Range range}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range from which the attribute will be removed.
	 * @method module:engine/model/batch~Batch#removeAttribute
	 * @param {String} key Attribute key.
	 */
	removeAttribute( itemOrRange, key ) {
		if ( itemOrRange instanceof Range ) {
			setAttributeToRange( this, key, null, itemOrRange );
		} else {
			setAttributeToItem( this, key, null, itemOrRange );
		}
	}

	/**
	 * Removes all attributes from all elements in the range or from the given item.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange
	 * Model item or range from which all attributes will be removed.
	 */
	clearAttributes( itemOrRange ) {
		const removeAttributesFromItem = item => {
			for ( const attribute of item.getAttributeKeys() ) {
				this.removeAttribute( item, attribute );
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
	 *		batch.move( sourceRange, targetPosition );
	 *
	 * Instead of the target position you can use parent and offset or define that range should be moved to the end
	 * or before or after chosen item:
	 *
	 * 		batch.move( sourceRange, paragraph, 5 ); // moves all items in the range to the paragraph at offset 5
	 *		batch.move( sourceRange, blockquote, 'end' ); // moves all items in the range at the end of the blockquote
	 *		batch.move( sourceRange, image, 'after' ); // moves all items in the range after the image
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position#createAt}.
	 *
	 * Note that items can be moved only within the same tree. It means that you can move items within the same root
	 * (element or document fragment) or between {@link module:engine/model/document~Document#roots documents roots},
	 * but you can not move items from document fragment to the document or from one detached element to another. Use
	 * {@link module:engine/model/batch~Batch#insert} in such cases.
	 *
	 * @param {module:engine/model/range~Range} range Source range.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * second parameter is a {@link module:engine/model/item~Item model item}.
	 */
	move( range, itemOrPosition, offset ) {
		if ( !( range instanceof Range ) ) {
			/**
			 * Invalid range to move.
			 *
			 * @error batch-move-invalid-range
			 */
			throw new CKEditorError( 'batch-move-invalid-range: Invalid range to move.' );
		}

		if ( !range.isFlat ) {
			/**
			 * Range to move is not flat.
			 *
			 * @error batch-move-range-not-flat
			 */
			throw new CKEditorError( 'batch-move-range-not-flat: Range to move is not flat.' );
		}

		const position = Position.createAt( itemOrPosition, offset );

		if ( !isSameTree( range.root, position.root ) ) {
			/**
			 * Range is going to be moved within not the same document. Please use
			 * {@link module:engine/model/batch~Batch#insert insert} instead.
			 *
			 * @error batch-move-different-document
			 */
			throw new CKEditorError( 'batch-move-different-document: Range is going to be moved between different documents.' );
		}

		const delta = new MoveDelta();
		this.addDelta( delta );

		const operation = new MoveOperation( range.start, range.end.offset - range.start.offset, position, this.document.version );
		delta.addOperation( operation );
		this.document.applyOperation( operation );
	}

	/**
	 * Removes given model {@link module:engine/model/item~Item item} or {@link module:engine/model/range~Range range}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange Model item or range to remove.
	 */
	remove( itemOrRange ) {
		const addRemoveDelta = ( position, howMany ) => {
			const delta = new RemoveDelta();
			this.addDelta( delta );
			let operation;

			if ( position.root.document ) {
				const graveyard = this.document.graveyard;
				const gyPosition = new Position( graveyard, [ 0 ] );

				operation = new RemoveOperation( position, howMany, gyPosition, this.document.version );
			} else {
				operation = new DetachOperation( position, howMany, this.document.version );
			}

			delta.addOperation( operation );
			this.document.applyOperation( operation );
		};

		if ( itemOrRange instanceof Range ) {
			// The array is reversed, so the ranges to remove are in correct order and do not have to be updated.
			const ranges = itemOrRange.getMinimalFlatRanges().reverse();

			for ( const flat of ranges ) {
				addRemoveDelta( flat.start, flat.end.offset - flat.start.offset );
			}
		} else {
			const howMany = itemOrRange.is( 'text' ) ? itemOrRange.offsetSize : 1;

			addRemoveDelta( Position.createBefore( itemOrRange ), howMany );
		}
	}

	/**
	 * Merges two siblings at the given position.
	 *
	 * Node before and after the position have to be an element. Otherwise `batch-merge-no-element-before` or
	 * `batch-merge-no-element-after` error will be thrown.
	 *
	 * @param {module:engine/model/position~Position} position Position of merge.
	 */
	merge( position ) {
		const delta = new MergeDelta();
		this.addDelta( delta );

		const nodeBefore = position.nodeBefore;
		const nodeAfter = position.nodeAfter;

		if ( !( nodeBefore instanceof Element ) ) {
			/**
			 * Node before merge position must be an element.
			 *
			 * @error batch-merge-no-element-before
			 */
			throw new CKEditorError( 'batch-merge-no-element-before: Node before merge position must be an element.' );
		}

		if ( !( nodeAfter instanceof Element ) ) {
			/**
			 * Node after merge position must be an element.
			 *
			 * @error batch-merge-no-element-after
			 */
			throw new CKEditorError( 'batch-merge-no-element-after: Node after merge position must be an element.' );
		}

		const positionAfter = Position.createFromParentAndOffset( nodeAfter, 0 );
		const positionBefore = Position.createFromParentAndOffset( nodeBefore, nodeBefore.maxOffset );

		const move = new MoveOperation(
			positionAfter,
			nodeAfter.maxOffset,
			positionBefore,
			this.document.version
		);

		move.isSticky = true;
		delta.addOperation( move );
		this.document.applyOperation( move );

		const graveyard = this.document.graveyard;
		const gyPosition = new Position( graveyard, [ 0 ] );

		const remove = new RemoveOperation( position, 1, gyPosition, this.document.version );
		delta.addOperation( remove );
		this.document.applyOperation( remove );
	}

	/**
	 * Renames given element.
	 *
	 * @param {module:engine/model/element~Element} element The element to rename.
	 * @param {String} newName New element name.
	 */
	rename( element, newName ) {
		if ( !( element instanceof Element ) ) {
			/**
			 * Trying to rename an object which is not an instance of Element.
			 *
			 * @error batch-rename-not-element-instance
			 */
			throw new CKEditorError( 'batch-rename-not-element-instance: Trying to rename an object which is not an instance of Element.' );
		}

		const delta = new RenameDelta();
		this.addDelta( delta );

		const renameOperation = new RenameOperation( Position.createBefore( element ), element.name, newName, this.document.version );
		delta.addOperation( renameOperation );
		this.document.applyOperation( renameOperation );
	}

	/**
	 * Splits an element at the given position.
	 *
	 * The element cannot be a root element, as root element cannot be split. The `batch-split-element-no-parent` error
	 * will be thrown if you try to split an element with no parent.
	 *
	 * @param {module:engine/model/position~Position} position Position of split.
	 */
	split( position ) {
		const delta = new SplitDelta();
		this.addDelta( delta );

		const splitElement = position.parent;

		if ( !splitElement.parent ) {
			/**
			 * Element with no parent can not be split.
			 *
			 * @error batch-split-element-no-parent
			 */
			throw new CKEditorError( 'batch-split-element-no-parent: Element with no parent can not be split.' );
		}

		const copy = new Element( splitElement.name, splitElement.getAttributes() );

		const insert = new InsertOperation(
			Position.createAfter( splitElement ),
			copy,
			this.document.version
		);

		delta.addOperation( insert );
		this.document.applyOperation( insert );

		const move = new MoveOperation(
			position,
			splitElement.maxOffset - position.offset,
			Position.createFromParentAndOffset( copy, 0 ),
			this.document.version
		);
		move.isSticky = true;

		delta.addOperation( move );
		this.document.applyOperation( move );
	}

	/**
	 * Wraps given range with given element or with a new element with specified name, if string has been passed.
	 * **Note:** range to wrap should be a "flat range" (see {@link module:engine/model/range~Range#isFlat}). If not, error will be thrown.
	 *
	 * @param {module:engine/model/range~Range} range Range to wrap.
	 * @param {module:engine/model/element~Element|String} elementOrString Element or name of element to wrap the range with.
	 */
	wrap( range, elementOrString ) {
		if ( !range.isFlat ) {
			/**
			 * Range to wrap is not flat.
			 *
			 * @error batch-wrap-range-not-flat
			 */
			throw new CKEditorError( 'batch-wrap-range-not-flat: Range to wrap is not flat.' );
		}

		const element = elementOrString instanceof Element ? elementOrString : new Element( elementOrString );

		if ( element.childCount > 0 ) {
			/**
			 * Element to wrap with is not empty.
			 *
			 * @error batch-wrap-element-not-empty
			 */
			throw new CKEditorError( 'batch-wrap-element-not-empty: Element to wrap with is not empty.' );
		}

		if ( element.parent !== null ) {
			/**
			 * Element to wrap with is already attached to a tree model.
			 *
			 * @error batch-wrap-element-attached
			 */
			throw new CKEditorError( 'batch-wrap-element-attached: Element to wrap with is already attached to tree model.' );
		}

		const delta = new WrapDelta();
		this.addDelta( delta );

		const insert = new InsertOperation( range.end, element, this.document.version );
		delta.addOperation( insert );
		this.document.applyOperation( insert );

		const targetPosition = Position.createFromParentAndOffset( element, 0 );
		const move = new MoveOperation(
			range.start,
			range.end.offset - range.start.offset,
			targetPosition,
			this.document.version
		);
		delta.addOperation( move );
		this.document.applyOperation( move );
	}

	/**
	 * Unwraps children of the given element – all its children are moved before it and then the element is removed.
	 * Throws error if you try to unwrap an element which does not have a parent.
	 *
	 * @param {module:engine/model/element~Element} element Element to unwrap.
	 */
	unwrap( element ) {
		if ( element.parent === null ) {
			/**
			 * Trying to unwrap an element which has no parent.
			 *
			 * @error batch-unwrap-element-no-parent
			 */
			throw new CKEditorError( 'batch-unwrap-element-no-parent: Trying to unwrap an element which has no parent.' );
		}

		const delta = new UnwrapDelta();
		this.addDelta( delta );

		const sourcePosition = Position.createFromParentAndOffset( element, 0 );

		const move = new MoveOperation(
			sourcePosition,
			element.maxOffset,
			Position.createBefore( element ),
			this.document.version
		);

		move.isSticky = true;
		delta.addOperation( move );
		this.document.applyOperation( move );

		// Computing new position because we moved some nodes before `element`.
		// If we would cache `Position.createBefore( element )` we remove wrong node.
		const graveyard = this.document.graveyard;
		const gyPosition = new Position( graveyard, [ 0 ] );

		const remove = new RemoveOperation( Position.createBefore( element ), 1, gyPosition, this.document.version );
		delta.addOperation( remove );
		this.document.applyOperation( remove );
	}

	/**
	 * Adds or updates {@link module:engine/model/markercollection~Marker marker} with given name to given `range`.
	 *
	 * If passed name is a name of already existing marker (or {@link module:engine/model/markercollection~Marker Marker} instance
	 * is passed), `range` parameter may be omitted. In this case marker will not be updated in
	 * {@link module:engine/model/document~Document#markers document marker collection}. However the marker will be added to
	 * the document history. This may be important for other features, like undo. From document history point of view, it will
	 * look like the marker was created and added to the document at the moment when it is set using this method.
	 *
	 * This is useful if the marker is created before it can be added to document history (e.g. a feature creating the marker
	 * is waiting for additional data, etc.). In this case, the marker may be first created directly through
	 * {@link module:engine/model/markercollection~MarkerCollection MarkerCollection API} and only later added using `Batch` API.
	 *
	 * @param {module:engine/model/markercollection~Marker|String} markerOrName Marker or marker name to add or update.
	 * @param {module:engine/model/range~Range} [newRange] Marker range.
	 */
	setMarker( markerOrName, newRange ) {
		const name = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;
		const currentMarker = this.document.markers.get( name );

		if ( !newRange && !currentMarker ) {
			/**
			 * Range parameter is required when adding a new marker.
			 *
			 * @error batch-setMarker-no-range
			 */
			throw new CKEditorError( 'batch-setMarker-no-range: Range parameter is required when adding a new marker.' );
		}

		const currentRange = currentMarker ? currentMarker.getRange() : null;

		if ( !newRange ) {
			// If `newRange` is not given, treat this as synchronizing existing marker.
			// Create `MarkerOperation` with `oldRange` set to `null`, so reverse operation will remove the marker.
			addMarkerOperation( this, name, null, currentRange );
		} else {
			// Just change marker range.
			addMarkerOperation( this, name, currentRange, newRange );
		}
	}

	/**
	 * Removes given {@link module:engine/model/markercollection~Marker marker} or marker with given name.
	 *
	 * @param {module:engine/model/markercollection~Marker|String} markerOrName Marker or marker name to remove.
	 */
	removeMarker( markerOrName ) {
		const name = typeof markerOrName == 'string' ? markerOrName : markerOrName.name;

		if ( !this.document.markers.has( name ) ) {
			/**
			 * Trying to remove marker which does not exist.
			 *
			 * @error batch-removeMarker-no-marker
			 */
			throw new CKEditorError( 'batch-removeMarker-no-marker: Trying to remove marker which does not exist.' );
		}

		const oldRange = this.document.markers.get( name ).getRange();

		addMarkerOperation( this, name, oldRange, null );
	}
}

/**
 * Sets given attribute to each node in given range. When attribute value is null then attribute will be removed.
 *
 * Because attribute operation needs to have the same attribute value on the whole range, this function splits
 * the range into smaller parts.
 *
 * @private
 * @param {module:engine/model/batch~Batch} batch
 * @param {String} key Attribute key.
 * @param {*} value Attribute new value.
 * @param {module:engine/model/range~Range} range Model range on which the attribute will be set.
 */
function setAttributeToRange( batch, key, value, range ) {
	const delta = new AttributeDelta();
	const doc = batch.document;

	// Position of the last split, the beginning of the new range.
	let lastSplitPosition = range.start;

	// Currently position in the scanning range. Because we need value after the position, it is not a current
	// position of the iterator but the previous one (we need to iterate one more time to get the value after).
	let position;

	// Value before the currently position.
	let valueBefore;

	// Value after the currently position.
	let valueAfter;

	for ( const val of range ) {
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
		// Add delta to the batch only if there is at least operation in the delta. Add delta only once.
		if ( delta.operations.length === 0 ) {
			batch.addDelta( delta );
		}

		const range = new Range( lastSplitPosition, position );
		const operation = new AttributeOperation( range, key, valueBefore, value, doc.version );

		delta.addOperation( operation );
		doc.applyOperation( operation );
	}
}

// Sets given attribute to the given node. When attribute value is null then attribute will be removed.
//
// @private
// @param {module:engine/model/batch~Batch} batch
// @param {String} key Attribute key.
// @param {*} value Attribute new value.
// @param {module:engine/model/item~Item} item Model item on which the attribute will be set.
function setAttributeToItem( batch, key, value, item ) {
	const doc = batch.document;
	const previousValue = item.getAttribute( key );
	let range, operation;

	if ( previousValue != value ) {
		const delta = item.root === item ? new RootAttributeDelta() : new AttributeDelta();
		batch.addDelta( delta );

		if ( item.root === item ) {
			// If we change attributes of root element, we have to use `RootAttributeOperation`.
			operation = new RootAttributeOperation( item, key, previousValue, value, doc.version );
		} else {
			if ( item.is( 'element' ) ) {
				// If we change the attribute of the element, we do not want to change attributes of its children, so
				// the end of the range cannot be after the closing tag, it should be inside that element, before any of
				// it's children, so the range will contain only the opening tag.
				range = new Range( Position.createBefore( item ), Position.createFromParentAndOffset( item, 0 ) );
			} else {
				// If `item` is text proxy, we create a range from the beginning to the end of that text proxy, to change
				// all characters represented by it.
				range = new Range( Position.createBefore( item ), Position.createAfter( item ) );
			}

			operation = new AttributeOperation( range, key, previousValue, value, doc.version );
		}

		delta.addOperation( operation );
		doc.applyOperation( operation );
	}
}

// Creates and adds marker operation to {@link module:engine/model/delta/delta~Delta delta}.
//
// @private
// @param {module:engine/model/batch~Batch} batch
// @param {String} name Marker name.
// @param {module:engine/model/range~Range} oldRange Marker range before the change.
// @param {module:engine/model/range~Range} newRange Marker range after the change.
function addMarkerOperation( batch, name, oldRange, newRange ) {
	const doc = batch.document;
	const delta = new MarkerDelta();

	const operation = new MarkerOperation( name, oldRange, newRange, doc.markers, doc.version );

	batch.addDelta( delta );
	delta.addOperation( operation );
	doc.applyOperation( operation );
}

// Returns `true` if both root elements are the same element or both are documents root elements.
//
// Elements in the same tree can be moved (for instance you can move element form one documents root to another, or
// within the same document fragment), but when element supposed to be moved from document fragment to the document, or
// to another document it should be removed and inserted to avoid problems with OT. This is because features like undo or
// collaboration may track changes on the document but ignore changes on detached fragments and should not get
// unexpected `move` operation.
function isSameTree( rootA, rootB ) {
	if ( rootA === rootB ) {
		return true;
	}

	return rootA instanceof RootElement && rootB instanceof RootElement;
}
