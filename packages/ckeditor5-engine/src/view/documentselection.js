/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/documentselection
 */

import Selection from './selection';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';

/**
 * Class representing the document selection in the view.
 *
 * Its instance is available in {@link module:engine/view/document~Document#selection `Document#selection`}.
 *
 * It is similar to {@link module:engine/view/selection~Selection} but
 * it has a read-only API and can be modified only by the writer available in
 * the {@link module:engine/view/view~View#change `View#change()`} block
 * (so via {@link module:engine/view/downcastwriter~DowncastWriter#setSelection `DowncastWriter#setSelection()`}).
 */
export default class DocumentSelection {
	/**
	 * Creates new DocumentSelection instance.
	 *
	 * 		// Creates empty selection without ranges.
	 *		const selection = new DocumentSelection();
	 *
	 *		// Creates selection at the given range.
	 *		const range = writer.createRange( start, end );
	 *		const selection = new DocumentSelection( range );
	 *
	 *		// Creates selection at the given ranges
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
	 *		const selection = new DocumentSelection( ranges );
	 *
	 *		// Creates selection from the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		const selection = new DocumentSelection( otherSelection );
	 *
	 * 		// Creates selection at the given position.
	 *		const position = writer.createPositionAt( root, offset );
	 *		const selection = new DocumentSelection( position );
	 *
	 *		// Creates collapsed selection at the position of given item and offset.
	 *		const paragraph = writer.createContainerElement( 'paragraph' );
	 *		const selection = new DocumentSelection( paragraph, offset );
	 *
	 *		// Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 *		// first child of that element and ends after the last child of that element.
	 *		const selection = new DocumentSelection( paragraph, 'in' );
	 *
	 *		// Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 *		// just after the item.
	 *		const selection = new DocumentSelection( paragraph, 'on' );
	 *
	 * `Selection`'s constructor allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Creates backward selection.
	 *		const selection = new DocumentSelection( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		const selection = new DocumentSelection( range, { fake: true, label: 'foo' } );
	 *
	 * @param {module:engine/view/selection~Selectable} [selectable=null]
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Offset or place when selectable is an `Item`.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 */
	constructor( selectable = null, placeOrOffset, options ) {
		/**
		 * Selection is used internally (`DocumentSelection` is a proxy to that selection).
		 *
		 * @private
		 * @member {module:engine/view/selection~Selection}
		 */
		this._selection = new Selection();

		// Delegate change event to be fired on DocumentSelection instance.
		this._selection.delegate( 'change' ).to( this );

		// Set selection data.
		this._selection.setTo( selectable, placeOrOffset, options );
	}

	/**
	 * Returns true if selection instance is marked as `fake`.
	 *
	 * @see #_setTo
	 * @returns {Boolean}
	 */
	get isFake() {
		return this._selection.isFake;
	}

	/**
	 * Returns fake selection label.
	 *
	 * @see #_setTo
	 * @returns {String}
	 */
	get fakeSelectionLabel() {
		return this._selection.fakeSelectionLabel;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the selection starts. Together with
	 * {@link #focus focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always the start or end of the most recent added range.
	 * It may be a bit unintuitive when there are multiple ranges in selection.
	 *
	 * @see #focus
	 * @type {module:engine/view/position~Position}
	 */
	get anchor() {
		return this._selection.anchor;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * @see #anchor
	 * @type {module:engine/view/position~Position}
	 */
	get focus() {
		return this._selection.focus;
	}

	/**
	 * Returns whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
	 * collapsed.
	 *
	 * @type {Boolean}
	 */
	get isCollapsed() {
		return this._selection.isCollapsed;
	}

	/**
	 * Returns number of ranges in selection.
	 *
	 * @type {Number}
	 */
	get rangeCount() {
		return this._selection.rangeCount;
	}

	/**
	 * Specifies whether the {@link #focus} precedes {@link #anchor}.
	 *
	 * @type {Boolean}
	 */
	get isBackward() {
		return this._selection.isBackward;
	}

	/**
	 * {@link module:engine/view/editableelement~EditableElement EditableElement} instance that contains this selection, or `null`
	 * if the selection is not inside an editable element.
	 *
	 * @type {module:engine/view/editableelement~EditableElement|null}
	 */
	get editableElement() {
		return this._selection.editableElement;
	}

	/**
	 * Used for the compatibility with the {@link module:engine/view/selection~Selection#isEqual} method.
	 *
	 * @protected
	 */
	get _ranges() {
		return this._selection._ranges;
	}

	/**
	 * Returns an iterable that contains copies of all ranges added to the selection.
	 *
	 * @returns {Iterable.<module:engine/view/range~Range>}
	 */
	* getRanges() {
		yield* this._selection.getRanges();
	}

	/**
	 * Returns copy of the first range in the selection. First range is the one which
	 * {@link module:engine/view/range~Range#start start} position {@link module:engine/view/position~Position#isBefore is before} start
	 * position of all other ranges (not to confuse with the first range added to the selection).
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/range~Range|null}
	 */
	getFirstRange() {
		return this._selection.getFirstRange();
	}

	/**
	 * Returns copy of the last range in the selection. Last range is the one which {@link module:engine/view/range~Range#end end}
	 * position {@link module:engine/view/position~Position#isAfter is after} end position of all other ranges (not to confuse
	 * with the last range added to the selection). Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/range~Range|null}
	 */
	getLastRange() {
		return this._selection.getLastRange();
	}

	/**
	 * Returns copy of the first position in the selection. First position is the position that
	 * {@link module:engine/view/position~Position#isBefore is before} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/position~Position|null}
	 */
	getFirstPosition() {
		return this._selection.getFirstPosition();
	}

	/**
	 * Returns copy of the last position in the selection. Last position is the position that
	 * {@link module:engine/view/position~Position#isAfter is after} any other position in the selection ranges.
	 * Returns `null` if no ranges are added to selection.
	 *
	 * @returns {module:engine/view/position~Position|null}
	 */
	getLastPosition() {
		return this._selection.getLastPosition();
	}

	/**
	 * Returns the selected element. {@link module:engine/view/element~Element Element} is considered as selected if there is only
	 * one range in the selection, and that range contains exactly one element.
	 * Returns `null` if there is no selected element.
	 *
	 * @returns {module:engine/view/element~Element|null}
	 */
	getSelectedElement() {
		return this._selection.getSelectedElement();
	}

	/**
	 * Checks whether, this selection is equal to given selection. Selections are equal if they have same directions,
	 * same number of ranges and all ranges from one selection equal to a range from other selection.
	 *
	 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} otherSelection
	 * Selection to compare with.
	 * @returns {Boolean} `true` if selections are equal, `false` otherwise.
	 */
	isEqual( otherSelection ) {
		return this._selection.isEqual( otherSelection );
	}

	/**
	 * Checks whether this selection is similar to given selection. Selections are similar if they have same directions, same
	 * number of ranges, and all {@link module:engine/view/range~Range#getTrimmed trimmed} ranges from one selection are
	 * equal to any trimmed range from other selection.
	 *
	 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} otherSelection
	 * Selection to compare with.
	 * @returns {Boolean} `true` if selections are similar, `false` otherwise.
	 */
	isSimilar( otherSelection ) {
		return this._selection.isSimilar( otherSelection );
	}

	/**
	 * Checks whether this object is of the given type.
	 *
	 *		docSelection.is( 'selection' ); // -> true
	 *		docSelection.is( 'documentSelection' ); // -> true
	 *		docSelection.is( 'view:selection' ); // -> true
	 *		docSelection.is( 'view:documentSelection' ); // -> true
	 *
	 *		docSelection.is( 'model:documentSelection' ); // -> false
	 *		docSelection.is( 'element' ); // -> false
	 *		docSelection.is( 'node' ); // -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type
	 * @returns {Boolean}
	 */
	is( type ) {
		return type === 'selection' ||
			type == 'documentSelection' ||
			type == 'view:selection' ||
			type == 'view:documentSelection';
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/view/selection~Selectable selectable}.
	 *
	 *		// Sets selection to the given range.
	 *		const range = writer.createRange( start, end );
	 *		documentSelection._setTo( range );
	 *
	 *		// Sets selection to given ranges.
	 * 		const ranges = [ writer.createRange( start1, end2 ), writer.createRange( start2, end2 ) ];
	 *		documentSelection._setTo( range );
	 *
	 *		// Sets selection to the other selection.
	 *		const otherSelection = writer.createSelection();
	 *		documentSelection._setTo( otherSelection );
	 *
	 * 		// Sets collapsed selection at the given position.
	 *		const position = writer.createPositionAt( root, offset );
	 *		documentSelection._setTo( position );
	 *
	 * 		// Sets collapsed selection at the position of given item and offset.
	 *		documentSelection._setTo( paragraph, offset );
	 *
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 *		documentSelection._setTo( paragraph, 'in' );
	 *
	 * Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends just after the item.
	 *
	 *		documentSelection._setTo( paragraph, 'on' );
	 *
	 * 		// Clears selection. Removes all ranges.
	 *		documentSelection._setTo( null );
	 *
	 * `Selection#_setTo()` method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 *		// Sets selection as backward.
	 *		documentSelection._setTo( range, { backward: true } );
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to des cribe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 *		// Creates fake selection with label.
	 *		documentSelection._setTo( range, { fake: true, label: 'foo' } );
	 *
	 * @protected
	 * @fires change
	 * @param {module:engine/view/selection~Selectable} selectable
	 * @param {Number|'before'|'end'|'after'|'on'|'in'} [placeOrOffset] Sets place or offset of the selection.
	 * @param {Object} [options]
	 * @param {Boolean} [options.backward] Sets this selection instance to be backward.
	 * @param {Boolean} [options.fake] Sets this selection instance to be marked as `fake`.
	 * @param {String} [options.label] Label for the fake selection.
	 */
	_setTo( selectable, placeOrOffset, options ) {
		this._selection.setTo( selectable, placeOrOffset, options );
	}

	/**
	 * Moves {@link #focus} to the specified location.
	 *
	 * The location can be specified in the same form as {@link module:engine/view/view~View#createPositionAt view.createPositionAt()}
	 * parameters.
	 *
	 * @protected
	 * @fires change
	 * @param {module:engine/view/item~Item|module:engine/view/position~Position} itemOrPosition
	 * @param {Number|'end'|'before'|'after'} [offset] Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	_setFocus( itemOrPosition, offset ) {
		this._selection.setFocus( itemOrPosition, offset );
	}

	/**
	 * Fired whenever selection ranges are changed through {@link ~DocumentSelection Selection API}.
	 *
	 * @event change
	 */
}

mix( DocumentSelection, EmitterMixin );
