/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/model/writer
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
import DocumentSelection from './documentselection';

import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

/**
 * Model writer it the proper way of modifying model. It should be used whenever you wants to create node, modify
 * child nodes, attributes or text. To get writer use {@link module:engine/model/model~Model#change} or
 * {@link module:engine/model/model~Model#enqueueChange}.
 *
 *		model.change( writer => {
 *			writer.insertText( 'foo', paragraph, 'end' );
 *		} );
 *
 * Note that writer can be passed to a nested function but you should never store and use it outside the `change` or
 * `enqueueChange` block.
 *
 * @see module:engine/model/model~Model#change
 * @see module:engine/model/model~Model#enqueueChange
 */
export default class Writer {
	/**
	 * Writer class constructor.
	 *
	 * It is not recommended to use it directly, use {@link module:engine/model/model~Model#change} or
	 * {@link module:engine/model/model~Model#enqueueChange} instead.
	 *
	 * @protected
	 * @param {module:engine/model/model~Model} model
	 * @param {module:engine/model/batch~Batch} batch
	 */
	constructor( model, batch ) {
		/**
		 * @readonly
		 * @type {module:engine/model/model~Model}
		 */
		this.model = model;

		/**
		 * @readonly
		 * @type {module:engine/model/batch~Batch}
		 */
		this.batch = batch;
	}

	/**
	 * Creates a new {@link module:engine/model/text~Text text node}.
	 *
	 *		writer.createText( 'foo' );
	 *		writer.createText( 'foo', { 'bold': true } );
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
	 *		writer.createElement( 'paragraph', { 'alignment': 'center' } );
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
	 * 		const text = writer.createText( 'foo' );
	 *		writer.insert( text, paragraph, 5 );
	 *
	 * You can also use `end` instead of the offset to insert at the end:
	 *
	 * 		const text = writer.createText( 'foo' );
	 *		writer.insert( text, paragraph, 'end' );
	 *
	 * Or insert before or after another element:
	 *
	 * 		const paragraph = writer.createElement( 'paragraph' );
	 *		writer.insert( paragraph, anotherParagraph, 'after' );
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position.createAt}.
	 *
	 * Note that if the item already has parent it will be removed from the previous parent.
	 *
	 * Note that you cannot re-insert a node from a document to a different document or document fragment. In this case,
	 * `model-writer-insert-forbidden-move` is thrown.
	 *
	 * If you want to move {@link module:engine/model/range~Range range} instead of an
	 * {@link module:engine/model/item~Item item} use {@link module:engine/model/writer~Writer#move move}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/documentfragment~DocumentFragment} item Item or document
	 * fragment to insert.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
	 * second parameter is a {@link module:engine/model/item~Item model item}.
	 */
	insert( item, itemOrPosition, offset ) {
		this._assertWriterUsedCorrectly();

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
				if ( item.root.document ) {
					// It is forbidden to move a node that was already in a document outside of it.
					throw new Error( 'model-writer-insert-forbidden-move: Cannot move a node from a document to a different tree.' );
				} else {
					// Move between two different document fragments or from document fragment to a document is possible.
					// In that case, remove the item from it's original parent.
					this.remove( item );
				}
			}
		}

		const version = position.root.document ? position.root.document.version : null;

		const insert = new InsertOperation( position, item, version );

		this.batch.addDelta( delta );
		delta.addOperation( insert );
		this.model.applyOperation( insert );

		// When element is a DocumentFragment we need to move its markers to Document#markers.
		if ( item instanceof DocumentFragment ) {
			for ( const [ markerName, markerRange ] of item.markers ) {
				// We need to migrate marker range from DocumentFragment to Document.
				const rangeRootPosition = Position.createAt( markerRange.root );
				const range = new Range(
					markerRange.start._getCombined( rangeRootPosition, position ),
					markerRange.end._getCombined( rangeRootPosition, position )
				);

				this.setMarker( markerName, range, { usingOperation: true } );
			}
		}
	}

	/**
	 * Creates and inserts text on given position. You can optionally set text attributes:
	 *
	 *		writer.insertText( 'foo', position );
	 *		writer.insertText( 'foo', { 'bold': true }, position );
	 *
	 * Instead of using position you can use parent and offset or define that text should be inserted at the end
	 * or before or after other node:
	 *
	 * 		writer.insertText( 'foo', paragraph, 5 ); // inserts in paragraph, at offset 5
	 *		writer.insertText( 'foo', paragraph, 'end' ); // inserts at the end of the paragraph
	 *		writer.insertText( 'foo', image, 'after' ); // inserts after image
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position.createAt}.
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
	 *		writer.insertElement( 'paragraph', position );
	 *		writer.insertElement( 'paragraph', { 'alignment': 'center' }, position );
	 *
	 * Instead of using position you can use parent and offset or define that text should be inserted at the end
	 * or before or after other node:
	 *
	 * 		writer.insertElement( 'paragraph', paragraph, 5 ); // inserts in paragraph, at offset 5
	 *		writer.insertElement( 'paragraph', blockquote, 'end' ); // insets at the end of the blockquote
	 *		writer.insertElement( 'paragraph', image, 'after' ); // inserts after image
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position.createAt}.
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
	 *		const paragraph = writer.createElement( 'paragraph' );
	 *		writer.append( paragraph, root );
	 *
	 * Note that if the item already has parent it will be removed from the previous parent.
	 *
	 * If you want to move {@link module:engine/model/range~Range range} instead of an
	 * {@link module:engine/model/item~Item item} use {@link module:engine/model/writer~Writer#move move}.
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
	 *		writer.appendText( 'foo', { 'bold': true }, paragraph );
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
	 *		writer.appendElement( 'paragraph', { 'alignment': 'center' }, root );
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
	 * Sets the text content for the specified `textNode`.
	 *
	 * @param {String} value New value.
	 * @param {module:engine/model/text~Text} textNode Text node that will be updated.
	 */
	setTextData( value, textNode ) {
		textNode._data = value;
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
			setAttributeOnRange( this, key, value, itemOrRange );
		} else {
			setAttributeOnItem( this, key, value, itemOrRange );
		}
	}

	/**
	 * Sets values of attributes on a {@link module:engine/model/item~Item model item}
	 * or on a {@link module:engine/model/range~Range range}.
	 *
	 *		writer.setAttributes( {
	 *			'bold': true,
	 *			'italic': true
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
			setAttributeOnRange( this, key, null, itemOrRange );
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
	 * 		writer.move( sourceRange, paragraph, 5 ); // moves all items in the range to the paragraph at offset 5
	 *		writer.move( sourceRange, blockquote, 'end' ); // moves all items in the range at the end of the blockquote
	 *		writer.move( sourceRange, image, 'after' ); // moves all items in the range after the image
	 *
	 * These parameters works the same way as {@link module:engine/model/position~Position.createAt}.
	 *
	 * Note that items can be moved only within the same tree. It means that you can move items within the same root
	 * (element or document fragment) or between {@link module:engine/model/document~Document#roots documents roots},
	 * but you can not move items from document fragment to the document or from one detached element to another. Use
	 * {@link module:engine/model/writer~Writer#insert} in such cases.
	 *
	 * @param {module:engine/model/range~Range} range Source range.
	 * @param {module:engine/model/item~Item|module:engine/model/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset=0] Offset or one of the flags. Used only when
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
			throw new CKEditorError( 'writer-move-invalid-range: Invalid range to move.' );
		}

		if ( !range.isFlat ) {
			/**
			 * Range to move is not flat.
			 *
			 * @error writer-move-range-not-flat
			 */
			throw new CKEditorError( 'writer-move-range-not-flat: Range to move is not flat.' );
		}

		const position = Position.createAt( itemOrPosition, offset );

		if ( !isSameTree( range.root, position.root ) ) {
			/**
			 * Range is going to be moved within not the same document. Please use
			 * {@link module:engine/model/writer~Writer#insert insert} instead.
			 *
			 * @error writer-move-different-document
			 */
			throw new CKEditorError( 'writer-move-different-document: Range is going to be moved between different documents.' );
		}

		const delta = new MoveDelta();
		this.batch.addDelta( delta );

		const version = range.root.document ? range.root.document.version : null;

		const operation = new MoveOperation( range.start, range.end.offset - range.start.offset, position, version );
		delta.addOperation( operation );
		this.model.applyOperation( operation );
	}

	/**
	 * Removes given model {@link module:engine/model/item~Item item} or {@link module:engine/model/range~Range range}.
	 *
	 * @param {module:engine/model/item~Item|module:engine/model/range~Range} itemOrRange Model item or range to remove.
	 */
	remove( itemOrRange ) {
		this._assertWriterUsedCorrectly();

		const addRemoveDelta = ( position, howMany ) => {
			const delta = new RemoveDelta();
			this.batch.addDelta( delta );

			applyRemoveOperation( position, howMany, delta, this.model );
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
	 * Node before and after the position have to be an element. Otherwise `writer-merge-no-element-before` or
	 * `writer-merge-no-element-after` error will be thrown.
	 *
	 * @param {module:engine/model/position~Position} position Position of merge.
	 */
	merge( position ) {
		this._assertWriterUsedCorrectly();

		const delta = new MergeDelta();
		this.batch.addDelta( delta );

		const nodeBefore = position.nodeBefore;
		const nodeAfter = position.nodeAfter;

		if ( !( nodeBefore instanceof Element ) ) {
			/**
			 * Node before merge position must be an element.
			 *
			 * @error writer-merge-no-element-before
			 */
			throw new CKEditorError( 'writer-merge-no-element-before: Node before merge position must be an element.' );
		}

		if ( !( nodeAfter instanceof Element ) ) {
			/**
			 * Node after merge position must be an element.
			 *
			 * @error writer-merge-no-element-after
			 */
			throw new CKEditorError( 'writer-merge-no-element-after: Node after merge position must be an element.' );
		}

		const positionAfter = Position.createFromParentAndOffset( nodeAfter, 0 );
		const positionBefore = Position.createFromParentAndOffset( nodeBefore, nodeBefore.maxOffset );

		const moveVersion = position.root.document ? position.root.document.version : null;

		const move = new MoveOperation(
			positionAfter,
			nodeAfter.maxOffset,
			positionBefore,
			moveVersion
		);

		move.isSticky = true;
		delta.addOperation( move );
		this.model.applyOperation( move );

		applyRemoveOperation( position, 1, delta, this.model );
	}

	/**
	 * Renames given element.
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
				'writer-rename-not-element-instance: Trying to rename an object which is not an instance of Element.'
			);
		}

		const delta = new RenameDelta();
		this.batch.addDelta( delta );

		const version = element.root.document ? element.root.document.version : null;

		const renameOperation = new RenameOperation( Position.createBefore( element ), element.name, newName, version );
		delta.addOperation( renameOperation );
		this.model.applyOperation( renameOperation );
	}

	/**
	 * Splits elements start from the given position and goes to the top of the model tree as long as given
	 * `limitElement` won't be reached. When limitElement is not defined then only a parent of given position will be split.
	 *
	 * The element needs to have a parent. It cannot be a root element nor document fragment.
	 * The `writer-split-element-no-parent` error will be thrown if you try to split an element with no parent.
	 *
	 * @param {module:engine/model/position~Position} position Position of split.
	 * @param {module:engine/model/node~Node} [limitElement] Stop splitting when this element will be reached.
	 * @returns {Object} result Split result.
	 * @returns {module:engine/model/position~Position} result.position between split elements.
	 * @returns {module:engine/model/range~Range} result.range Range that stars from the end of the first split element and ands
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
			throw new CKEditorError( 'writer-split-element-no-parent: Element with no parent can not be split.' );
		}

		// When limit element is not defined lets set splitElement parent as limit.
		if ( !limitElement ) {
			limitElement = splitElement.parent;
		}

		if ( !position.parent.getAncestors( { includeSelf: true } ).includes( limitElement ) ) {
			throw new CKEditorError( 'writer-split-invalid-limit-element: Limit element is not a position ancestor.' );
		}

		// We need to cache elements that will be created as a result of the first split because
		// we need to create a range from the end of the first split element to the beginning of the
		// first copy element. This should be handled by LiveRange but it doesn't work on detached nodes.
		let firstSplitElement, firstCopyElement;

		do {
			const delta = new SplitDelta();
			this.batch.addDelta( delta );

			const copy = new Element( splitElement.name, splitElement.getAttributes() );
			const insertVersion = splitElement.root.document ? splitElement.root.document.version : null;

			const insert = new InsertOperation(
				Position.createAfter( splitElement ),
				copy,
				insertVersion
			);

			delta.addOperation( insert );
			this.model.applyOperation( insert );

			const moveVersion = insertVersion !== null ? insertVersion + 1 : null;

			const move = new MoveOperation(
				position,
				splitElement.maxOffset - position.offset,
				Position.createFromParentAndOffset( copy, 0 ),
				moveVersion
			);
			move.isSticky = true;

			delta.addOperation( move );
			this.model.applyOperation( move );

			// Cache result of the first split.
			if ( !firstSplitElement && !firstCopyElement ) {
				firstSplitElement = splitElement;
				firstCopyElement = copy;
			}

			position = Position.createBefore( copy );
			splitElement = position.parent;
		} while ( splitElement !== limitElement );

		return {
			position,
			range: new Range( Position.createAt( firstSplitElement, 'end' ), Position.createAt( firstCopyElement ) )
		};
	}

	/**
	 * Wraps given range with given element or with a new element with specified name, if string has been passed.
	 *
	 * **Note:** range to wrap should be a "flat range" (see {@link module:engine/model/range~Range#isFlat}). If not, error will be thrown.
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
			throw new CKEditorError( 'writer-wrap-range-not-flat: Range to wrap is not flat.' );
		}

		const element = elementOrString instanceof Element ? elementOrString : new Element( elementOrString );

		if ( element.childCount > 0 ) {
			/**
			 * Element to wrap with is not empty.
			 *
			 * @error writer-wrap-element-not-empty
			 */
			throw new CKEditorError( 'writer-wrap-element-not-empty: Element to wrap with is not empty.' );
		}

		if ( element.parent !== null ) {
			/**
			 * Element to wrap with is already attached to a tree model.
			 *
			 * @error writer-wrap-element-attached
			 */
			throw new CKEditorError( 'writer-wrap-element-attached: Element to wrap with is already attached to tree model.' );
		}

		const delta = new WrapDelta();
		this.batch.addDelta( delta );

		const insertVersion = range.root.document ? range.root.document.version : null;

		const insert = new InsertOperation( range.end, element, insertVersion );
		delta.addOperation( insert );
		this.model.applyOperation( insert );

		const moveVersion = insertVersion !== null ? insertVersion + 1 : null;

		const targetPosition = Position.createFromParentAndOffset( element, 0 );
		const move = new MoveOperation(
			range.start,
			range.end.offset - range.start.offset,
			targetPosition,
			moveVersion
		);
		delta.addOperation( move );
		this.model.applyOperation( move );
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
			throw new CKEditorError( 'writer-unwrap-element-no-parent: Trying to unwrap an element which has no parent.' );
		}

		const delta = new UnwrapDelta();
		this.batch.addDelta( delta );

		const sourcePosition = Position.createFromParentAndOffset( element, 0 );
		const moveVersion = sourcePosition.root.document ? sourcePosition.root.document.version : null;

		const move = new MoveOperation(
			sourcePosition,
			element.maxOffset,
			Position.createBefore( element ),
			moveVersion
		);

		move.isSticky = true;
		delta.addOperation( move );
		this.model.applyOperation( move );

		applyRemoveOperation( Position.createBefore( element ), 1, delta, this.model );
	}

	/**
	 * Adds or updates a {@link module:engine/model/markercollection~Marker marker}. Marker is a named range, which tracks
	 * changes in the document and updates its range automatically, when model tree changes. Still, it is possible to change the
	 * marker's range directly using this method.
	 *
	 * As the first parameter you can set marker name or instance. If none of them is provided, new marker, with a unique
	 * name is created and returned.
	 *
	 * The `options.usingOperation` parameter lets you decide if the marker should be managed by operations or not. See
	 * {@link module:engine/model/markercollection~Marker marker class description} to learn about the difference between
	 * markers managed by operations and not-managed by operations. It is possible to change this option for an existing marker.
	 * This is useful when a marker have been created earlier and then later, it needs to be added to the document history.
	 *
	 * Create/update marker directly base on marker's name:
	 *
	 * 		setMarker( markerName, range );
	 *
	 * Update marker using operation:
	 *
	 * 		setMarker( marker, range, { usingOperation: true } );
	 * 		setMarker( markerName, range, { usingOperation: true } );
	 *
	 * Create marker with a unique id using operation:
	 *
	 * 		setMarker( range, { usingOperation: true } );
	 *
	 * Create marker directly without using operations:
	 *
	 * 		setMarker( range )
	 *
	 * Change marker's option (start using operations to manage it):
	 *
	 * 		setMarker( marker, { usingOperation: true } );
	 *
	 * Note: For efficiency reasons, it's best to create and keep as little markers as possible.
	 *
	 * @see module:engine/model/markercollection~Marker
	 * @param {module:engine/model/markercollection~Marker|String} [markerOrName]
	 * Name of a marker to create or update, or `Marker` instance to update, or range for the marker with a unique name.
	 * @param {module:engine/model/range~Range} [range] Marker range.
	 * @param {Object} [options]
	 * @param {Boolean} [options.usingOperation=false] Flag indicated whether the marker should be added by MarkerOperation.
	 * See {@link module:engine/model/markercollection~Marker#managedUsingOperations}.
	 * @returns {module:engine/model/markercollection~Marker} Marker that was set.
	 */
	setMarker( markerOrNameOrRange, rangeOrOptions, options ) {
		this._assertWriterUsedCorrectly();

		let markerName, newRange, usingOperation;

		if ( markerOrNameOrRange instanceof Range ) {
			markerName = uid();
			newRange = markerOrNameOrRange;
			usingOperation = !!rangeOrOptions && !!rangeOrOptions.usingOperation;
		} else {
			markerName = typeof markerOrNameOrRange === 'string' ? markerOrNameOrRange : markerOrNameOrRange.name;

			if ( rangeOrOptions instanceof Range ) {
				newRange = rangeOrOptions;
				usingOperation = !!options && !!options.usingOperation;
			} else {
				newRange = null;
				usingOperation = !!rangeOrOptions && !!rangeOrOptions.usingOperation;
			}
		}

		const currentMarker = this.model.markers.get( markerName );

		if ( !usingOperation ) {
			if ( !newRange ) {
				/**
			 	 * Range parameter is required when adding a new marker.
				 *
				 * @error writer-setMarker-no-range
				 */
				throw new CKEditorError( 'writer-setMarker-no-range: Range parameter is required when adding a new marker.' );
			}

			// If marker changes to marker that do not use operations then we need to create additional operation
			// that removes that marker first.
			if ( currentMarker && currentMarker.managedUsingOperations && !usingOperation ) {
				applyMarkerOperation( this, markerName, currentMarker.getRange(), null );
			}

			return this.model.markers._set( markerName, newRange, usingOperation );
		}

		if ( !newRange && !currentMarker ) {
			throw new CKEditorError( 'writer-setMarker-no-range: Range parameter is required when adding a new marker.' );
		}

		const currentRange = currentMarker ? currentMarker.getRange() : null;

		if ( !newRange ) {
			// If `newRange` is not given, treat this as synchronizing existing marker.
			// Create `MarkerOperation` with `oldRange` set to `null`, so reverse operation will remove the marker.
			applyMarkerOperation( this, markerName, null, currentRange );
		} else {
			// Just change marker range.
			applyMarkerOperation( this, markerName, currentRange, newRange );
		}

		return this.model.markers.get( markerName );
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
			throw new CKEditorError( 'writer-removeMarker-no-marker: Trying to remove marker which does not exist.' );
		}

		const marker = this.model.markers.get( name );

		if ( !marker.managedUsingOperations ) {
			this.model.markers._remove( name );

			return;
		}

		const oldRange = marker.getRange();

		applyMarkerOperation( this, name, oldRange, null );
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selection selection}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/node~Node node}, {@link module:engine/model/position~Position position},
	 * {@link module:engine/model/range~Range range}, an iterable of {@link module:engine/model/range~Range ranges} or null.
	 *
	 *		// Sets selection to the given range.
	 *		const range = new Range( start, end );
	 *		writer.setSelection( range );
	 *
	 *		// Sets selection to given ranges.
	 * 		const ranges = [ new Range( start1, end2 ), new Range( star2, end2 ) ];
	 *		writer.setSelection( range );
	 *
	 *		// Sets selection to other selection.
	 *		const otherSelection = new Selection();
	 *		writer.setSelection( otherSelection );
	 *
	 * 		// Sets selection to the given document selection.
	 *		const documentSelection = new DocumentSelection( doc );
	 *		writer.setSelection( documentSelection );
	 *
	 * 		// Sets collapsed selection at the given position.
	 *		const position = new Position( root, path );
	 *		writer.setSelection( position );
	 *
	 * 		// Sets collapsed selection at the position of the given node and an offset.
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
	 * 		// Removes all selection's ranges.
	 *		writer.setSelection( null );
	 *
	 * `Writer#setSelection()` allow passing additional options (`backward`) as the last argument.
	 *
	 * 		// Sets selection as backward.
	 *		writer.setSelection( range, { backward: true } );
	 *
	 * Throws `writer-incorrect-use` error when the writer is used outside the `change()` block.
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection|
	 * module:engine/model/position~Position|module:engine/model/node~Node|
	 * Iterable.<module:engine/model/range~Range>|module:engine/model/range~Range|null} selectable
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
	 * The location can be specified in the same form as {@link module:engine/model/position~Position.createAt} parameters.
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
	 * or object / iterable of key - value attribute pairs.
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
	 * Using key
	 *
	 * 	writer.removeSelectionAttribute( 'italic' );
	 *
	 * Using iterable of keys
	 *
	 * 	writer.removeSelectionAttribute( [ 'italic', 'bold' ] );
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
	 * By default the selection's gravity is automatically restored just after a direct selection change (when user
	 * moved the caret) but you can pass `customRestore = true` in which case you will have to call
	 * {@link ~Writer#restoreSelectionGravity} manually.
	 *
	 * When the selection's gravity is overridden more than once without being restored in the meantime then it needs
	 * to be restored the same number of times. This is to prevent conflicts when
	 * more than one feature want to independently override and restore the selection's gravity.
	 *
	 * @param {Boolean} [customRestore=false] When `true` then gravity won't be restored until
	 * {@link ~Writer#restoreSelectionGravity} will be called directly. When `false` then gravity is restored
	 * after selection is moved by user.
	 */
	overrideSelectionGravity( customRestore ) {
		this.model.document.selection._overrideGravity( customRestore );
	}

	/**
	 * Restores {@link ~Writer#overrideSelectionGravity} gravity to default.
	 *
	 * Note that the gravity remains overridden as long as will not be restored the same number of times as it was overridden.
	 */
	restoreSelectionGravity() {
		this.model.document.selection._restoreGravity();
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
			throw new CKEditorError( 'writer-incorrect-use: Trying to use a writer outside the change() block.' );
		}
	}
}

// Sets given attribute to each node in given range. When attribute value is null then attribute will be removed.
//
// Because attribute operation needs to have the same attribute value on the whole range, this function splits
// the range into smaller parts.
//
// @private
// @param {module:engine/model/writer~Writer} writer
// @param {String} key Attribute key.
// @param {*} value Attribute new value.
// @param {module:engine/model/range~Range} range Model range on which the attribute will be set.
function setAttributeOnRange( writer, key, value, range ) {
	const delta = new AttributeDelta();
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
			writer.batch.addDelta( delta );
		}

		const range = new Range( lastSplitPosition, position );
		const version = range.root.document ? doc.version : null;
		const operation = new AttributeOperation( range, key, valueBefore, value, version );

		delta.addOperation( operation );
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

		const delta = isRootChanged ? new RootAttributeDelta() : new AttributeDelta();
		writer.batch.addDelta( delta );

		if ( isRootChanged ) {
			// If we change attributes of root element, we have to use `RootAttributeOperation`.
			const version = item.document ? doc.version : null;

			operation = new RootAttributeOperation( item, key, previousValue, value, version );
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

			const version = range.root.document ? doc.version : null;

			operation = new AttributeOperation( range, key, previousValue, value, version );
		}

		delta.addOperation( operation );
		model.applyOperation( operation );
	}
}

// Creates and applies marker operation to {@link module:engine/model/delta/delta~Delta delta}.
//
// @private
// @param {module:engine/model/writer~Writer} writer
// @param {String} name Marker name.
// @param {module:engine/model/range~Range} oldRange Marker range before the change.
// @param {module:engine/model/range~Range} newRange Marker range after the change.
function applyMarkerOperation( writer, name, oldRange, newRange ) {
	const model = writer.model;
	const doc = model.document;
	const delta = new MarkerDelta();

	const operation = new MarkerOperation( name, oldRange, newRange, model.markers, doc.version );

	writer.batch.addDelta( delta );
	delta.addOperation( operation );
	model.applyOperation( operation );
}

// Creates `RemoveOperation` or `DetachOperation` that removes `howMany` nodes starting from `position`.
// The operation will be applied on given model instance and added to given delta instance.
//
// @private
// @param {module:engine/model/position~Position} position Position from which nodes are removed.
// @param {Number} howMany Number of nodes to remove.
// @param {module:engine/model/delta~Delta} delta Delta to add new operation to.
// @param {module:engine/model/model~Model} model Model instance on which operation will be applied.
function applyRemoveOperation( position, howMany, delta, model ) {
	let operation;

	if ( position.root.document ) {
		const doc = model.document;
		const graveyardPosition = new Position( doc.graveyard, [ 0 ] );

		operation = new RemoveOperation( position, howMany, graveyardPosition, doc.version );
	} else {
		operation = new DetachOperation( position, howMany );
	}

	delta.addOperation( operation );
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
