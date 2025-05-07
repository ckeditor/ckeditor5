/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/documentselection
 */

import TypeCheckable from './typecheckable.js';
import LiveRange from './liverange.js';
import Selection, {
	type SelectionChangeAttributeEvent,
	type SelectionChangeRangeEvent
} from './selection.js';
import Text from './text.js';
import TextProxy from './textproxy.js';

import type { default as Document, DocumentChangeEvent } from './document.js';
import type { default as Model, ModelApplyOperationEvent } from './model.js';
import type { Marker, MarkerCollectionUpdateEvent } from './markercollection.js';
import type Batch from './batch.js';
import type Element from './element.js';
import type Item from './item.js';
import type { default as Position, PositionOffset } from './position.js';
import type Range from './range.js';
import type Schema from './schema.js';

import {
	CKEditorError,
	Collection,
	EmitterMixin,
	toMap,
	uid
} from '@ckeditor/ckeditor5-utils';

const storePrefix = 'selection:';

/**
 * `DocumentSelection` is a special selection which is used as the
 * {@link module:engine/model/document~Document#selection document's selection}.
 * There can be only one instance of `DocumentSelection` per document.
 *
 * Document selection can only be changed by using the {@link module:engine/model/writer~Writer} instance
 * inside the {@link module:engine/model/model~Model#change `change()`} block, as it provides a secure way to modify model.
 *
 * `DocumentSelection` is automatically updated upon changes in the {@link module:engine/model/document~Document document}
 * to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
 *
 * Differences between {@link module:engine/model/selection~Selection} and `DocumentSelection` are:
 * * there is always a range in `DocumentSelection` - even if no ranges were added there is a "default range"
 * present in the selection,
 * * ranges added to this selection updates automatically when the document changes,
 * * attributes of `DocumentSelection` are updated automatically according to selection ranges.
 *
 * Since `DocumentSelection` uses {@link module:engine/model/liverange~LiveRange live ranges}
 * and is updated when {@link module:engine/model/document~Document document}
 * changes, it cannot be set on {@link module:engine/model/node~Node nodes}
 * that are inside {@link module:engine/model/documentfragment~DocumentFragment document fragment}.
 * If you need to represent a selection in document fragment,
 * use {@link module:engine/model/selection~Selection Selection class} instead.
 */
export default class DocumentSelection extends /* #__PURE__ */ EmitterMixin( TypeCheckable ) {
	/**
	 * Selection used internally by that class (`DocumentSelection` is a proxy to that selection).
	 */
	private _selection: LiveSelection;

	/**
	 * Creates an empty live selection for given {@link module:engine/model/document~Document}.
	 *
	 * @param doc Document which owns this selection.
	 */
	constructor( doc: Document ) {
		super();

		this._selection = new LiveSelection( doc );

		this._selection.delegate( 'change:range' ).to( this );
		this._selection.delegate( 'change:attribute' ).to( this );
		this._selection.delegate( 'change:marker' ).to( this );
	}

	/**
	 * Describes whether the selection is collapsed. Selection is collapsed when there is exactly one range which is
	 * collapsed.
	 */
	public get isCollapsed(): boolean {
		return this._selection.isCollapsed;
	}

	/**
	 * Selection anchor. Anchor may be described as a position where the most recent part of the selection starts.
	 * Together with {@link #focus} they define the direction of selection, which is important
	 * when expanding/shrinking selection. Anchor is always {@link module:engine/model/range~Range#start start} or
	 * {@link module:engine/model/range~Range#end end} position of the most recently added range.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see #focus
	 */
	public get anchor(): Position | null {
		return this._selection.anchor;
	}

	/**
	 * Selection focus. Focus is a position where the selection ends.
	 *
	 * Is set to `null` if there are no ranges in selection.
	 *
	 * @see #anchor
	 */
	public get focus(): Position | null {
		return this._selection.focus;
	}

	/**
	 * Number of ranges in selection.
	 */
	public get rangeCount(): number {
		return this._selection.rangeCount;
	}

	/**
	 * Describes whether `Documentselection` has own range(s) set, or if it is defaulted to
	 * {@link module:engine/model/document~Document#_getDefaultRange document's default range}.
	 */
	public get hasOwnRange(): boolean {
		return this._selection.hasOwnRange;
	}

	/**
	 * Specifies whether the {@link #focus}
	 * precedes {@link #anchor}.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	public get isBackward(): boolean {
		return this._selection.isBackward;
	}

	/**
	 * Describes whether the gravity is overridden (using {@link module:engine/model/writer~Writer#overrideSelectionGravity}) or not.
	 *
	 * Note that the gravity remains overridden as long as will not be restored the same number of times as it was overridden.
	 */
	public get isGravityOverridden(): boolean {
		return this._selection.isGravityOverridden;
	}

	/**
	 * A collection of selection {@link module:engine/model/markercollection~Marker markers}.
	 * Marker is a selection marker when selection range is inside the marker range.
	 *
	 * **Note**: Only markers from {@link ~DocumentSelection#observeMarkers observed markers groups} are collected.
	 */
	public get markers(): Collection<Marker> {
		return this._selection.markers;
	}

	/**
	 * Used for the compatibility with the {@link module:engine/model/selection~Selection#isEqual} method.
	 *
	 * @internal
	 */
	public get _ranges(): Array<Range> {
		return this._selection._ranges;
	}

	/**
	 * Returns an iterable that iterates over copies of selection ranges.
	 */
	public getRanges(): IterableIterator<Range> {
		return this._selection.getRanges();
	}

	/**
	 * Returns the first position in the selection.
	 * First position is the position that {@link module:engine/model/position~Position#isBefore is before}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getFirstPosition(): Position | null {
		return this._selection.getFirstPosition();
	}

	/**
	 * Returns the last position in the selection.
	 * Last position is the position that {@link module:engine/model/position~Position#isAfter is after}
	 * any other position in the selection.
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getLastPosition(): Position | null {
		return this._selection.getLastPosition();
	}

	/**
	 * Returns a copy of the first range in the selection.
	 * First range is the one which {@link module:engine/model/range~Range#start start} position
	 * {@link module:engine/model/position~Position#isBefore is before} start position of all other ranges
	 * (not to confuse with the first range added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getFirstRange(): Range | null {
		return this._selection.getFirstRange();
	}

	/**
	 * Returns a copy of the last range in the selection.
	 * Last range is the one which {@link module:engine/model/range~Range#end end} position
	 * {@link module:engine/model/position~Position#isAfter is after} end position of all other ranges (not to confuse with the range most
	 * recently added to the selection).
	 *
	 * Returns `null` if there are no ranges in selection.
	 */
	public getLastRange(): Range | null {
		return this._selection.getLastRange();
	}

	/**
	 * Gets elements of type {@link module:engine/model/schema~Schema#isBlock "block"} touched by the selection.
	 *
	 * This method's result can be used for example to apply block styling to all blocks covered by this selection.
	 *
	 * **Note:** `getSelectedBlocks()` returns blocks that are nested in other non-block elements
	 * but will not return blocks nested in other blocks.
	 *
	 * In this case the function will return exactly all 3 paragraphs (note: `<blockQuote>` is not a block itself):
	 *
	 * ```
	 * <paragraph>[a</paragraph>
	 * <blockQuote>
	 * 	<paragraph>b</paragraph>
	 * </blockQuote>
	 * <paragraph>c]d</paragraph>
	 * ```
	 *
	 * In this case the paragraph will also be returned, despite the collapsed selection:
	 *
	 * ```
	 * <paragraph>[]a</paragraph>
	 * ```
	 *
	 * In such a scenario, however, only blocks A, B & E will be returned as blocks C & D are nested in block B:
	 *
	 * ```
	 * [<blockA></blockA>
	 * <blockB>
	 * 	<blockC></blockC>
	 * 	<blockD></blockD>
	 * </blockB>
	 * <blockE></blockE>]
	 * ```
	 *
	 * If the selection is inside a block all the inner blocks (A & B) are returned:
	 *
	 * ```
	 * <block>
	 * 	<blockA>[a</blockA>
	 * 	<blockB>b]</blockB>
	 * </block>
	 * ```
	 *
	 * **Special case**: If a selection ends at the beginning of a block, that block is not returned as from user perspective
	 * this block wasn't selected. See [#984](https://github.com/ckeditor/ckeditor5-engine/issues/984) for more details.
	 *
	 * ```
	 * <paragraph>[a</paragraph>
	 * <paragraph>b</paragraph>
	 * <paragraph>]c</paragraph> // this block will not be returned
	 * ```
	 */
	public getSelectedBlocks(): IterableIterator<Element> {
		return this._selection.getSelectedBlocks();
	}

	/**
	 * Returns the selected element. {@link module:engine/model/element~Element Element} is considered as selected if there is only
	 * one range in the selection, and that range contains exactly one element.
	 * Returns `null` if there is no selected element.
	 */
	public getSelectedElement(): Element | null {
		return this._selection.getSelectedElement();
	}

	/**
	 * Checks whether the selection contains the entire content of the given element. This means that selection must start
	 * at a position {@link module:engine/model/position~Position#isTouching touching} the element's start and ends at position
	 * touching the element's end.
	 *
	 * By default, this method will check whether the entire content of the selection's current root is selected.
	 * Useful to check if e.g. the user has just pressed <kbd>Ctrl</kbd> + <kbd>A</kbd>.
	 */
	public containsEntireContent( element: Element ): boolean {
		return this._selection.containsEntireContent( element );
	}

	/**
	 * Unbinds all events previously bound by document selection.
	 */
	public destroy(): void {
		this._selection.destroy();
	}

	/**
	 * Returns iterable that iterates over this selection's attribute keys.
	 */
	public getAttributeKeys(): IterableIterator<string> {
		return this._selection.getAttributeKeys();
	}

	/**
	 * Returns iterable that iterates over this selection's attributes.
	 *
	 * Attributes are returned as arrays containing two items. First one is attribute key and second is attribute value.
	 * This format is accepted by native `Map` object and also can be passed in `Node` constructor.
	 */
	public getAttributes(): IterableIterator<[ string, unknown ]> {
		return this._selection.getAttributes();
	}

	/**
	 * Gets an attribute value for given key or `undefined` if that attribute is not set on the selection.
	 *
	 * @param key Key of attribute to look for.
	 * @returns Attribute value or `undefined`.
	 */
	public getAttribute( key: string ): unknown {
		return this._selection.getAttribute( key );
	}

	/**
	 * Checks if the selection has an attribute for given key.
	 *
	 * @param key Key of attribute to check.
	 * @returns `true` if attribute with given key is set on selection, `false` otherwise.
	 */
	public hasAttribute( key: string ): boolean {
		return this._selection.hasAttribute( key );
	}

	/**
	 * Refreshes selection attributes and markers according to the current position in the model.
	 */
	public refresh(): void {
		this._selection.updateMarkers();
		this._selection._updateAttributes( false );
	}

	/**
	 * Registers a marker group prefix or a marker name to be collected in the
	 * {@link ~DocumentSelection#markers selection markers collection}.
	 *
	 * See also {@link module:engine/model/markercollection~MarkerCollection#getMarkersGroup `MarkerCollection#getMarkersGroup()`}.
	 *
	 * @param prefixOrName The marker group prefix or marker name.
	 */
	public observeMarkers( prefixOrName: string ): void {
		this._selection.observeMarkers( prefixOrName );
	}

	/**
	 * Moves {@link module:engine/model/documentselection~DocumentSelection#focus} to the specified location.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelectionFocus} method.
	 *
	 * The location can be specified in the same form as
	 * {@link module:engine/model/writer~Writer#createPositionAt writer.createPositionAt()} parameters.
	 *
	 * @see module:engine/model/writer~Writer#setSelectionFocus
	 * @internal
	 * @param offset Offset or one of the flags. Used only when
	 * first parameter is a {@link module:engine/model/item~Item model item}.
	 */
	public _setFocus( itemOrPosition: Item | Position, offset?: PositionOffset ): void {
		this._selection.setFocus( itemOrPosition, offset );
	}

	/**
	 * Sets this selection's ranges and direction to the specified location based on the given
	 * {@link module:engine/model/selection~Selectable selectable}.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelection} method.
	 *
	 * @see module:engine/model/writer~Writer#setSelection
	 * @internal
	 */
	public _setTo( ...args: Parameters<Selection[ 'setTo' ]> ): void {
		this._selection.setTo( ...args );
	}

	/**
	 * Sets attribute on the selection. If attribute with the same key already is set, it's value is overwritten.
	 * Should be used only within the {@link module:engine/model/writer~Writer#setSelectionAttribute} method.
	 *
	 * @see module:engine/model/writer~Writer#setSelectionAttribute
	 * @internal
	 * @param key Key of the attribute to set.
	 * @param value Attribute value.
	 */
	public _setAttribute( key: string, value: unknown ): void {
		this._selection.setAttribute( key, value );
	}

	/**
	 * Removes an attribute with given key from the selection.
	 * If the given attribute was set on the selection, fires the {@link module:engine/model/selection~Selection#event:change:range}
	 * event with removed attribute key.
	 * Should be used only within the {@link module:engine/model/writer~Writer#removeSelectionAttribute} method.
	 *
	 * @see module:engine/model/writer~Writer#removeSelectionAttribute
	 * @internal
	 * @param key Key of the attribute to remove.
	 */
	public _removeAttribute( key: string ): void {
		this._selection.removeAttribute( key );
	}

	/**
	 * Returns an iterable that iterates through all selection attributes stored in current selection's parent.
	 *
	 * @internal
	 */
	public _getStoredAttributes(): Iterable<[ string, unknown ]> {
		return this._selection.getStoredAttributes();
	}

	/**
	 * Temporarily changes the gravity of the selection from the left to the right.
	 *
	 * The gravity defines from which direction the selection inherits its attributes. If it's the default left
	 * gravity, the selection (after being moved by the the user) inherits attributes from its left hand side.
	 * This method allows to temporarily override this behavior by forcing the gravity to the right.
	 *
	 * It returns an unique identifier which is required to restore the gravity. It guarantees the symmetry
	 * of the process.
	 *
	 * @see module:engine/model/writer~Writer#overrideSelectionGravity
	 * @internal
	 * @returns The unique id which allows restoring the gravity.
	 */
	public _overrideGravity(): string {
		return this._selection.overrideGravity();
	}

	/**
	 * Restores the {@link ~DocumentSelection#_overrideGravity overridden gravity}.
	 *
	 * Restoring the gravity is only possible using the unique identifier returned by
	 * {@link ~DocumentSelection#_overrideGravity}. Note that the gravity remains overridden as long as won't be restored
	 * the same number of times it was overridden.
	 *
	 * @see module:engine/model/writer~Writer#restoreSelectionGravity
	 * @internal
	 * @param uid The unique id returned by {@link #_overrideGravity}.
	 */
	public _restoreGravity( uid: string ): void {
		this._selection.restoreGravity( uid );
	}

	/**
	 * Generates and returns an attribute key for selection attributes store, basing on original attribute key.
	 *
	 * @internal
	 * @param key Attribute key to convert.
	 * @returns Converted attribute key, applicable for selection store.
	 */
	public static _getStoreAttributeKey( key: string ): string {
		return storePrefix + key;
	}

	/**
	 * Checks whether the given attribute key is an attribute stored on an element.
	 *
	 * @internal
	 */
	public static _isStoreAttributeKey( key: string ): boolean {
		return key.startsWith( storePrefix );
	}
}

// The magic of type inference using `is` method is centralized in `TypeCheckable` class.
// Proper overload would interfere with that.
DocumentSelection.prototype.is = function( type: string ): boolean {
	return type === 'selection' ||
		type == 'model:selection' ||
		type == 'documentSelection' ||
		type == 'model:documentSelection';
};

/**
 * Fired when selection range(s) changed.
 *
 * @eventName ~DocumentSelection#change:range
 * @param directChange In case of {@link module:engine/model/selection~Selection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~DocumentSelection}, however, may change because its position
 * was directly changed through the {@link module:engine/model/writer~Writer writer} or because its position was
 * changed because the structure of the model has been changed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 */
export type DocumentSelectionChangeRangeEvent = SelectionChangeRangeEvent;

/**
 * Fired when selection attribute changed.
 *
 * @eventName ~DocumentSelection#change:attribute
 * @param directChange In case of {@link module:engine/model/selection~Selection} class it is always set
 * to `true` which indicates that the selection change was caused by a direct use of selection's API.
 * The {@link module:engine/model/documentselection~DocumentSelection}, however, may change because its attributes
 * were directly changed through the {@link module:engine/model/writer~Writer writer} or because its position was
 * changed in the model and its attributes were refreshed (which means an indirect change).
 * The indirect change does not occur in case of normal (detached) selections because they are "static" (as "not live")
 * which mean that they are not updated once the document changes.
 * @param attributeKeys Array containing keys of attributes that changed.
*/
export type DocumentSelectionChangeAttributeEvent = SelectionChangeAttributeEvent;

/**
 * Fired when selection marker(s) changed.
 *
 * @eventName ~DocumentSelection#change:marker
 * @param directChange This is always set to `false` in case of `change:marker` event as there is no possibility
 * to change markers directly through {@link module:engine/model/documentselection~DocumentSelection} API.
 * See also {@link module:engine/model/documentselection~DocumentSelection#event:change:range} and
 * {@link module:engine/model/documentselection~DocumentSelection#event:change:attribute}.
 * @param oldMarkers Markers in which the selection was before the change.
 */
export type DocumentSelectionChangeMarkerEvent = {
	name: 'change:marker';
	args: [ {
		directChange: boolean;
		oldMarkers: Array<Marker>;
	} ];
};

/**
 * Fired when selection range(s), attribute(s) or marker(s) changed.
 *
 * @eventName ~DocumentSelection#change
 * @param directChange This is always set to `false` in case of `change:marker` event as there is no possibility
 * to change markers directly through {@link module:engine/model/documentselection~DocumentSelection} API.
 * See also {@link module:engine/model/documentselection~DocumentSelection#event:change:range} and
 * {@link module:engine/model/documentselection~DocumentSelection#event:change:attribute}.
 * @param attributeKeys Array containing keys of attributes that changed.
 * @param oldMarkers Markers in which the selection was before the change.
 */
export type DocumentSelectionChangeEvent = {
	name: 'change' | 'change:attribute' | 'change:marker' | 'change:range';
	args: [ {
		directChange: boolean;
		attributeKeys?: Array<string>;
		oldMarkers?: Array<Marker>;
	} ];
};

/**
 * `LiveSelection` is used internally by {@link module:engine/model/documentselection~DocumentSelection} and shouldn't be used directly.
 *
 * LiveSelection` is automatically updated upon changes in the {@link module:engine/model/document~Document document}
 * to always contain valid ranges. Its attributes are inherited from the text unless set explicitly.
 *
 * Differences between {@link module:engine/model/selection~Selection} and `LiveSelection` are:
 * * there is always a range in `LiveSelection` - even if no ranges were added there is a "default range"
 * present in the selection,
 * * ranges added to this selection updates automatically when the document changes,
 * * attributes of `LiveSelection` are updated automatically according to selection ranges.
 */
class LiveSelection extends Selection {
	/**
	 * List of selection markers.
	 * Marker is a selection marker when selection range is inside the marker range.
	 */
	public markers: Collection<Marker> = new Collection( { idProperty: 'name' } );

	/**
	 * Document which owns this selection.
	 */
	private _model: Model;

	/**
	 * Document which owns this selection.
	 */
	private _document: Document;

	/**
	 * Stores selection ranges.
	 *
	 * @internal
	 */
	public declare _ranges: Array<LiveRange>;

	/**
	 * Keeps mapping of attribute name to priority with which the attribute got modified (added/changed/removed)
	 * last time. Possible values of priority are: `'low'` and `'normal'`.
	 *
	 * Priorities are used by internal `LiveSelection` mechanisms. All attributes set using `LiveSelection`
	 * attributes API are set with `'normal'` priority.
	 */
	private _attributePriority: Map<string, 'low' | 'normal'> = new Map();

	/**
	 * Position to which the selection should be set if the last selection range was moved to the graveyard.
	 */
	private _selectionRestorePosition: Position | null = null;

	/**
	 * Flag that informs whether the selection ranges have changed. It is changed on true when `LiveRange#change:range` event is fired.
	 */
	private _hasChangedRange: boolean = false;

	/**
	 * Each overriding gravity adds an UID to the set and each removal removes it.
	 * Gravity is overridden when there's at least one UID in the set.
	 * Gravity is restored when the set is empty.
	 * This is to prevent conflicts when gravity is overridden by more than one feature at the same time.
	 */
	private _overriddenGravityRegister: Set<string> = new Set();

	/**
	 * Prefixes of marker names that should affect `LiveSelection#markers` collection.
	 */
	private _observedMarkers: Set<string> = new Set();

	/**
	 * Creates an empty live selection for given {@link module:engine/model/document~Document}.
	 *
	 * @param doc Document which owns this selection.
	 */
	constructor( doc: Document ) {
		super();

		this._model = doc.model;
		this._document = doc;

		// Ensure selection is correct after each operation.
		this.listenTo<ModelApplyOperationEvent>( this._model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( !operation.isDocumentOperation || operation.type == 'marker' || operation.type == 'rename' || operation.type == 'noop' ) {
				return;
			}

			// Fix selection if the last range was removed from it and we have a position to which we can restore the selection.
			if ( this._ranges.length == 0 && this._selectionRestorePosition ) {
				this._fixGraveyardSelection( this._selectionRestorePosition );
			}

			// "Forget" the restore position even if it was not "used".
			this._selectionRestorePosition = null;

			if ( this._hasChangedRange ) {
				this._hasChangedRange = false;
				this.fire<DocumentSelectionChangeRangeEvent>( 'change:range', { directChange: false } );
			}
		}, { priority: 'lowest' } );

		// Ensure selection is correct and up to date after each range change.
		this.on<DocumentSelectionChangeRangeEvent>( 'change:range', () => {
			this._validateSelectionRanges( this.getRanges() );
		} );

		// Update markers data stored by the selection after each marker change.
		// This handles only marker changes done through marker operations (not model tree changes).
		this.listenTo<MarkerCollectionUpdateEvent>( this._model.markers, 'update', ( evt, marker, oldRange, newRange ) => {
			this._updateMarker( marker, newRange );
		} );

		// Ensure selection is up to date after each change block.
		this.listenTo<DocumentChangeEvent>( this._document, 'change', ( evt, batch ) => {
			clearAttributesStoredInElement( this._model, batch );
		} );
	}

	public override get isCollapsed(): boolean {
		const length = this._ranges.length;

		return length === 0 ? this._document._getDefaultRange().isCollapsed : super.isCollapsed;
	}

	public override get anchor(): Position {
		return super.anchor || this._document._getDefaultRange().start;
	}

	public override get focus(): Position {
		return super.focus || this._document._getDefaultRange().end;
	}

	public override get rangeCount(): number {
		return this._ranges.length ? this._ranges.length : 1;
	}

	/**
	 * Describes whether `LiveSelection` has own range(s) set, or if it is defaulted to
	 * {@link module:engine/model/document~Document#_getDefaultRange document's default range}.
	 */
	public get hasOwnRange(): boolean {
		return this._ranges.length > 0;
	}

	/**
	 * When set to `true` then selection attributes on node before the caret won't be taken
	 * into consideration while updating selection attributes.
	 */
	public get isGravityOverridden(): boolean {
		return !!this._overriddenGravityRegister.size;
	}

	/**
	 * Unbinds all events previously bound by live selection.
	 */
	public destroy(): void {
		for ( let i = 0; i < this._ranges.length; i++ ) {
			this._ranges[ i ].detach();
		}

		this.stopListening();
	}

	public override* getRanges(): IterableIterator<Range> {
		if ( this._ranges.length ) {
			yield* super.getRanges();
		} else {
			yield this._document._getDefaultRange();
		}
	}

	public override getFirstRange(): Range {
		return super.getFirstRange() || this._document._getDefaultRange();
	}

	public override getLastRange(): Range {
		return super.getLastRange() || this._document._getDefaultRange();
	}

	public override setTo( ...args: Parameters<Selection[ 'setTo' ]> ) {
		super.setTo( ...args );
		this._updateAttributes( true );
		this.updateMarkers();
	}

	public override setFocus( itemOrPosition: Item | Position, offset?: PositionOffset ): void {
		super.setFocus( itemOrPosition, offset );
		this._updateAttributes( true );
		this.updateMarkers();
	}

	public override setAttribute( key: string, value: unknown ): void {
		if ( this._setAttribute( key, value ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire<DocumentSelectionChangeAttributeEvent>( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	public override removeAttribute( key: string ): void {
		if ( this._removeAttribute( key ) ) {
			// Fire event with exact data.
			const attributeKeys = [ key ];
			this.fire<DocumentSelectionChangeAttributeEvent>( 'change:attribute', { attributeKeys, directChange: true } );
		}
	}

	public overrideGravity(): string {
		const overrideUid = uid();

		// Remember that another overriding has been requested. It will need to be removed
		// before the gravity is to be restored.
		this._overriddenGravityRegister.add( overrideUid );

		if ( this._overriddenGravityRegister.size === 1 ) {
			this._updateAttributes( true );
		}

		return overrideUid;
	}

	public restoreGravity( uid: string ): void {
		if ( !this._overriddenGravityRegister.has( uid ) ) {
			/**
			 * Restoring gravity for an unknown UID is not possible. Make sure you are using a correct
			 * UID obtained from the {@link module:engine/model/writer~Writer#overrideSelectionGravity} to restore.
			 *
			 * @error document-selection-gravity-wrong-restore
			 * @param {string} uid The unique identifier returned by
			 * {@link module:engine/model/documentselection~DocumentSelection#_overrideGravity}.
			 */
			throw new CKEditorError(
				'document-selection-gravity-wrong-restore',
				this,
				{ uid }
			);
		}

		this._overriddenGravityRegister.delete( uid );

		// Restore gravity only when all overriding have been restored.
		if ( !this.isGravityOverridden ) {
			this._updateAttributes( true );
		}
	}

	public observeMarkers( prefixOrName: string ): void {
		this._observedMarkers.add( prefixOrName );
		this.updateMarkers();
	}

	protected override _replaceAllRanges( ranges: Array<Range> ): void {
		this._validateSelectionRanges( ranges );

		super._replaceAllRanges( ranges );
	}

	protected override _popRange(): void {
		this._ranges.pop()!.detach();
	}

	protected override _pushRange( range: Range ): void {
		const liveRange = this._prepareRange( range );

		// `undefined` is returned when given `range` is in graveyard root.
		if ( liveRange ) {
			this._ranges.push( liveRange );
		}
	}

	private _validateSelectionRanges( ranges: Iterable<Range> ) {
		for ( const range of ranges ) {
			if ( !this._document._validateSelectionRange( range ) ) {
				/**
				 * Range from {@link module:engine/model/documentselection~DocumentSelection document selection}
				 * starts or ends at incorrect position.
				 *
				 * @error document-selection-wrong-position
				 * @param {module:engine/model/range~Range} range The invalid range.
				 */
				throw new CKEditorError(
					'document-selection-wrong-position',
					this,
					{ range }
				);
			}
		}
	}

	/**
	 * Prepares given range to be added to selection. Checks if it is correct,
	 * converts it to {@link module:engine/model/liverange~LiveRange LiveRange}
	 * and sets listeners listening to the range's change event.
	 */
	private _prepareRange( range: Range ): LiveRange | undefined {
		this._checkRange( range );

		if ( range.root == this._document.graveyard ) {
			// @if CK_DEBUG // console.warn( 'Trying to add a Range that is in the graveyard root. Range rejected.' );

			return;
		}

		const liveRange = LiveRange.fromRange( range );

		// If selection range is moved to the graveyard remove it from the selection object.
		// Also, save some data that can be used to restore selection later, on `Model#applyOperation` event.
		liveRange.on( 'change:range', ( evt, oldRange, data ) => {
			this._hasChangedRange = true;

			if ( liveRange.root == this._document.graveyard ) {
				this._selectionRestorePosition = data.deletionPosition;

				const index = this._ranges.indexOf( liveRange );
				this._ranges.splice( index, 1 );
				liveRange.detach();
			}
		} );

		return liveRange;
	}

	public updateMarkers(): void {
		if ( !this._observedMarkers.size ) {
			return;
		}

		const markers = [];
		let changed = false;

		for ( const marker of this._model.markers ) {
			const markerGroup = marker.name.split( ':', 1 )[ 0 ];

			if ( !this._observedMarkers.has( markerGroup ) ) {
				continue;
			}

			const markerRange = marker.getRange();

			for ( const selectionRange of this.getRanges() ) {
				if ( markerRange.containsRange( selectionRange, !selectionRange.isCollapsed ) ) {
					markers.push( marker );
				}
			}
		}

		const oldMarkers = Array.from( this.markers );

		for ( const marker of markers ) {
			if ( !this.markers.has( marker ) ) {
				this.markers.add( marker );

				changed = true;
			}
		}

		for ( const marker of Array.from( this.markers ) ) {
			if ( !markers.includes( marker ) ) {
				this.markers.remove( marker );

				changed = true;
			}
		}

		if ( changed ) {
			this.fire<DocumentSelectionChangeMarkerEvent>( 'change:marker', { oldMarkers, directChange: false } );
		}
	}

	private _updateMarker( marker: Marker, markerRange: Range | null ): void {
		const markerGroup = marker.name.split( ':', 1 )[ 0 ];

		if ( !this._observedMarkers.has( markerGroup ) ) {
			return;
		}

		let changed = false;

		const oldMarkers = Array.from( this.markers );
		const hasMarker = this.markers.has( marker );

		if ( !markerRange ) {
			if ( hasMarker ) {
				this.markers.remove( marker );
				changed = true;
			}
		} else {
			let contained = false;

			for ( const selectionRange of this.getRanges() ) {
				if ( markerRange.containsRange( selectionRange, !selectionRange.isCollapsed ) ) {
					contained = true;

					break;
				}
			}

			if ( contained && !hasMarker ) {
				this.markers.add( marker );

				changed = true;
			} else if ( !contained && hasMarker ) {
				this.markers.remove( marker );

				changed = true;
			}
		}

		if ( changed ) {
			this.fire<DocumentSelectionChangeMarkerEvent>( 'change:marker', { oldMarkers, directChange: false } );
		}
	}

	/**
	 * Updates this selection attributes according to its ranges and the {@link module:engine/model/document~Document model document}.
	 */
	public _updateAttributes( clearAll: boolean ): void {
		const newAttributes = toMap( this._getSurroundingAttributes() );
		const oldAttributes = toMap( this.getAttributes() );

		if ( clearAll ) {
			// If `clearAll` remove all attributes and reset priorities.
			this._attributePriority = new Map();
			this._attrs = new Map();
		} else {
			// If not, remove only attributes added with `low` priority.
			for ( const [ key, priority ] of this._attributePriority ) {
				if ( priority == 'low' ) {
					this._attrs.delete( key );
					this._attributePriority.delete( key );
				}
			}
		}

		this._setAttributesTo( newAttributes );

		// Let's evaluate which attributes really changed.
		const changed = [];

		// First, loop through all attributes that are set on selection right now.
		// Check which of them are different than old attributes.
		for ( const [ newKey, newValue ] of this.getAttributes() ) {
			if ( !oldAttributes.has( newKey ) || oldAttributes.get( newKey ) !== newValue ) {
				changed.push( newKey );
			}
		}

		// Then, check which of old attributes got removed.
		for ( const [ oldKey ] of oldAttributes ) {
			if ( !this.hasAttribute( oldKey ) ) {
				changed.push( oldKey );
			}
		}

		// Fire event with exact data (fire only if anything changed).
		if ( changed.length > 0 ) {
			this.fire<DocumentSelectionChangeAttributeEvent>( 'change:attribute', { attributeKeys: changed, directChange: false } );
		}
	}

	/**
	 * Internal method for setting `LiveSelection` attribute. Supports attribute priorities (through `directChange`
	 * parameter).
	 */
	private _setAttribute( key: string, value: unknown, directChange: boolean = true ): boolean {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		const oldValue = super.getAttribute( key );

		// Don't do anything if value has not changed.
		if ( oldValue === value ) {
			return false;
		}

		this._attrs.set( key, value );

		// Update priorities map.
		this._attributePriority.set( key, priority );

		return true;
	}

	/**
	 * Internal method for removing `LiveSelection` attribute. Supports attribute priorities (through `directChange`
	 * parameter).
	 *
	 * NOTE: Even if attribute is not present in the selection but is provided to this method, it's priority will
	 * be changed according to `directChange` parameter.
	 */
	private _removeAttribute( key: string, directChange: boolean = true ): boolean {
		const priority = directChange ? 'normal' : 'low';

		if ( priority == 'low' && this._attributePriority.get( key ) == 'normal' ) {
			// Priority too low.
			return false;
		}

		// Update priorities map.
		this._attributePriority.set( key, priority );

		// Don't do anything if value has not changed.
		if ( !super.hasAttribute( key ) ) {
			return false;
		}

		this._attrs.delete( key );

		return true;
	}

	/**
	 * Internal method for setting multiple `LiveSelection` attributes. Supports attribute priorities (through
	 * `directChange` parameter).
	 */
	private _setAttributesTo( attrs: Map<string, unknown> ): Set<string> {
		const changed = new Set<string>();

		for ( const [ oldKey, oldValue ] of this.getAttributes() ) {
			// Do not remove attribute if attribute with same key and value is about to be set.
			if ( attrs.get( oldKey ) === oldValue ) {
				continue;
			}

			// All rest attributes will be removed so changed attributes won't change .
			this._removeAttribute( oldKey, false );
		}

		for ( const [ key, value ] of attrs ) {
			// Attribute may not be set because of attributes or because same key/value is already added.
			const gotAdded = this._setAttribute( key, value, false );

			if ( gotAdded ) {
				changed.add( key );
			}
		}

		return changed;
	}

	/**
	 * Returns an iterable that iterates through all selection attributes stored in current selection's parent.
	 */
	public* getStoredAttributes(): IterableIterator<[ string, unknown ]> {
		const selectionParent = this.getFirstPosition()!.parent as Element;

		if ( this.isCollapsed && selectionParent.isEmpty ) {
			for ( const key of selectionParent.getAttributeKeys() ) {
				if ( key.startsWith( storePrefix ) ) {
					const realKey = key.substr( storePrefix.length );

					yield [ realKey, selectionParent.getAttribute( key ) ];
				}
			}
		}
	}

	/**
	 * Checks model text nodes that are closest to the selection's first position and returns attributes of first
	 * found element. If there are no text nodes in selection's first position parent, it returns selection
	 * attributes stored in that parent.
	 */
	private _getSurroundingAttributes(): Iterable<[ string, unknown ]> | null {
		const position = this.getFirstPosition()!;
		const schema = this._model.schema;

		if ( position.root.rootName == '$graveyard' ) {
			return null;
		}

		let attrs = null;

		if ( !this.isCollapsed ) {
			// 1. If selection is a range...
			const range = this.getFirstRange();

			// ...look for a first character node in that range and take attributes from it.
			for ( const value of range ) {
				// If the item is an object, we don't want to get attributes from its children...
				if ( value.item.is( 'element' ) && schema.isObject( value.item ) ) {
					// ...but collect attributes from inline object.
					attrs = getTextAttributes( value.item, schema );
					break;
				}

				if ( value.type == 'text' ) {
					attrs = value.item.getAttributes();
					break;
				}
			}
		} else {
			// 2. If the selection is a caret or the range does not contain a character node...

			const nodeBefore = position.textNode ? position.textNode : position.nodeBefore;
			const nodeAfter = position.textNode ? position.textNode : position.nodeAfter;

			// When gravity is overridden then don't take node before into consideration.
			if ( !this.isGravityOverridden ) {
				// ...look at the node before caret and take attributes from it if it is a character node.
				attrs = getTextAttributes( nodeBefore, schema );
			}

			// 3. If not, look at the node after caret...
			if ( !attrs ) {
				attrs = getTextAttributes( nodeAfter, schema );
			}

			// 4. If not, try to find the first character on the left, that is in the same node.
			// When gravity is overridden then don't take node before into consideration.
			if ( !this.isGravityOverridden && !attrs ) {
				let node = nodeBefore;

				while ( node && !attrs ) {
					node = node.previousSibling;
					attrs = getTextAttributes( node, schema );
				}
			}

			// 5. If not found, try to find the first character on the right, that is in the same node.
			if ( !attrs ) {
				let node = nodeAfter;

				while ( node && !attrs ) {
					node = node.nextSibling;
					attrs = getTextAttributes( node, schema );
				}
			}

			// 6. If not found, selection should retrieve attributes from parent.
			if ( !attrs ) {
				attrs = this.getStoredAttributes();
			}
		}

		return attrs;
	}

	/**
	 * Fixes the selection after all its ranges got removed.
	 * @param deletionPosition Position where the deletion happened.
	 */
	private _fixGraveyardSelection( deletionPosition: Position ): void {
		// Find a range that is a correct selection range and is closest to the position where the deletion happened.
		const selectionRange = this._model.schema.getNearestSelectionRange( deletionPosition );

		// If nearest valid selection range has been found - add it in the place of old range.
		if ( selectionRange ) {
			// Check the range, convert it to live range, bind events, etc.
			this._pushRange( selectionRange );
		}
		// If nearest valid selection range cannot be found don't add any range. Selection will be set to the default range.
	}
}

/**
 * Helper function for {@link module:engine/model/liveselection~LiveSelection#_updateAttributes}.
 *
 * It checks if the passed model item is a text node (or text proxy) and, if so, returns it's attributes.
 * If not, it checks if item is an inline object and does the same. Otherwise it returns `null`.
 */
function getTextAttributes( node: Item | null, schema: Schema ): Iterable<[string, unknown]> | null {
	if ( !node ) {
		return null;
	}

	if ( node instanceof TextProxy || node instanceof Text ) {
		return node.getAttributes();
	}

	if ( !schema.isInline( node ) ) {
		return null;
	}

	// Stop on inline elements (such as `<softBreak>`) that are not objects (such as `<imageInline>` or `<mathml>`).
	if ( !schema.isObject( node ) ) {
		return [];
	}

	const attributes: Array<[string, unknown]> = [];

	// Collect all attributes that can be applied to the text node.
	for ( const [ key, value ] of node.getAttributes() ) {
		if (
			schema.checkAttribute( '$text', key ) &&
			schema.getAttributeProperties( key ).copyFromObject !== false
		) {
			attributes.push( [ key, value ] );
		}
	}

	return attributes;
}

/**
 * Removes selection attributes from element which is not empty anymore.
 */
function clearAttributesStoredInElement( model: Model, batch: Batch ) {
	const differ = model.document.differ;

	for ( const entry of differ.getChanges() ) {
		if ( entry.type != 'insert' ) {
			continue;
		}

		const changeParent = entry.position.parent as Element;
		const isNoLongerEmpty = entry.length === changeParent.maxOffset;

		if ( isNoLongerEmpty ) {
			model.enqueueChange( batch, writer => {
				const storedAttributes = Array.from( changeParent.getAttributeKeys() )
					.filter( key => key.startsWith( storePrefix ) );

				for ( const key of storedAttributes ) {
					writer.removeAttribute( key, changeParent );
				}
			} );
		}
	}
}
