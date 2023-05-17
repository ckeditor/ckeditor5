/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/view
 */

import Document from './document';
import DowncastWriter from './downcastwriter';
import Position, { type PositionOffset } from './position';
import Range from './range';
import Selection, {
	type PlaceOrOffset,
	type Selectable,
	type SelectionOptions
} from './selection';

import type { StylesProcessor } from './stylesmap';
import type Element from './element';
import type Node from './node';
import type Item from './item';

import {
	CKEditorError,
	ObservableMixin
} from '@ckeditor/ckeditor5-utils';

/**
 * Editor's view controller class. Its main responsibility is DOM - View management for editing purposes, to provide
 * abstraction over the DOM structure and events and hide all browsers quirks.
 *
 * View controller renders view document to DOM whenever view structure changes. To determine when view can be rendered,
 * all changes need to be done using the {@link module:engine/view/view~View#change} method, using
 * {@link module:engine/view/downcastwriter~DowncastWriter}:
 *
 * ```ts
 * view.change( writer => {
 * 	writer.insert( position, writer.createText( 'foo' ) );
 * } );
 * ```
 *
 * View controller also register {@link module:engine/view/observer/observer~Observer observers} which observes changes
 * on DOM and fire events on the {@link module:engine/view/document~Document Document}.
 * Note that the following observers are added by the class constructor and are always available:
 *
 * * {@link module:engine/view/observer/selectionobserver~SelectionObserver},
 * * {@link module:engine/view/observer/focusobserver~FocusObserver},
 * * {@link module:engine/view/observer/keyobserver~KeyObserver},
 * * {@link module:engine/view/observer/fakeselectionobserver~FakeSelectionObserver}.
 * * {@link module:engine/view/observer/compositionobserver~CompositionObserver}.
 * * {@link module:engine/view/observer/inputobserver~InputObserver}.
 * * {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}.
 * * {@link module:engine/view/observer/tabobserver~TabObserver}.
 *
 * This class also {@link module:engine/view/view~View#attachDomRoot binds the DOM and the view elements}.
 *
 * If you do not need full a DOM - view management, and only want to transform a tree of view elements to a tree of DOM
 * elements you do not need this controller. You can use the {@link module:engine/view/domconverter~DomConverter DomConverter} instead.
 */
export default class View extends ObservableMixin() {
	/**
	 * Instance of the {@link module:engine/view/document~Document} associated with this view controller.
	 */
	public readonly document: Document;

	/**
	 * DowncastWriter instance used in {@link #change change method} callbacks.
	 */
	protected readonly _writer: DowncastWriter;

	/**
	 * Is set to `true` when {@link #change view changes} are currently in progress.
	 */
	private _ongoingChange: boolean = false;

	/**
	 * Used to prevent calling {@link #forceRender} and {@link #change} during rendering view to the DOM.
	 */
	private _postFixersInProgress: boolean = false;

	/**
	 * @param stylesProcessor The styles processor instance.
	 */
	constructor( stylesProcessor: StylesProcessor ) {
		super();

		this.document = new Document( stylesProcessor );
		this._writer = new DowncastWriter( this.document );
	}

	/**
	 * The `change()` method is the primary way of changing the view. You should use it to modify any node in the view tree.
	 * It makes sure that after all changes are made the view is rendered to the DOM (assuming that the view will be changed
	 * inside the callback). It prevents situations when the DOM is updated when the view state is not yet correct. It allows
	 * to nest calls one inside another and still performs a single rendering after all those changes are made.
	 * It also returns the return value of its callback.
	 *
	 * ```ts
	 * const text = view.change( writer => {
	 * 	const newText = writer.createText( 'foo' );
	 * 	writer.insert( position1, newText );
	 *
	 * 	view.change( writer => {
	 * 		writer.insert( position2, writer.createText( 'bar' ) );
	 * 	} );
	 *
	 * 	writer.remove( range );
	 *
	 * 	return newText;
	 * } );
	 * ```
	 *
	 * When the outermost change block is done and rendering to the DOM is over the
	 * {@link module:engine/view/view~View#event:render `View#render`} event is fired.
	 *
	 * This method throws a `applying-view-changes-on-rendering` error when
	 * the change block is used after rendering to the DOM has started.
	 *
	 * @param callback Callback function which may modify the view.
	 * @returns Value returned by the callback.
	 */
	public change<TReturn>( callback: ( writer: DowncastWriter ) => TReturn ): TReturn {
		if ( this._postFixersInProgress ) {
			/**
			 * Thrown when there is an attempt to make changes to the view tree when it is in incorrect state. This may
			 * cause some unexpected behaviour and inconsistency between the DOM and the view.
			 * This may be caused by:
			 *
			 * * calling {@link module:engine/view/view~View#change} or {@link module:engine/view/view~View#forceRender} during rendering
			 * process,
			 * * calling {@link module:engine/view/view~View#change} or {@link module:engine/view/view~View#forceRender} inside of
			 *   {@link module:engine/view/document~Document#registerPostFixer post-fixer function}.
			 *
			 * @error cannot-change-view-tree
			 */
			throw new CKEditorError(
				'cannot-change-view-tree',
				this
			);
		}

		try {
			// Recursive call to view.change() method - execute listener immediately.
			if ( this._ongoingChange ) {
				return callback( this._writer );
			}

			// This lock will assure that all recursive calls to view.change() will end up in same block - one "render"
			// event for all nested calls.
			this._ongoingChange = true;
			const callbackResult = callback( this._writer );
			this._ongoingChange = false;

			if ( this._handleChangeBlock() ) {
				this.fire<ViewRenderEvent>( 'render' );
			}

			return callbackResult;
		} catch ( err: any ) {
			// @if CK_DEBUG // throw err;
			/* istanbul ignore next -- @preserve */
			CKEditorError.rethrowUnexpectedError( err, this );
		}
	}

	/**
	 * Destroys this instance. Makes sure that all observers are destroyed and listeners removed.
	 */
	public destroy(): void {
		this.document.destroy();

		this.stopListening();
	}

	/**
	 * Creates position at the given location. The location can be specified as:
	 *
	 * * a {@link module:engine/view/position~Position position},
	 * * parent element and offset (offset defaults to `0`),
	 * * parent element and `'end'` (sets position at the end of that element),
	 * * {@link module:engine/view/item~Item view item} and `'before'` or `'after'` (sets position before or after given view item).
	 *
	 * This method is a shortcut to other constructors such as:
	 *
	 * * {@link #createPositionBefore},
	 * * {@link #createPositionAfter},
	 *
	 * @param offset Offset or one of the flags. Used only when first parameter is a {@link module:engine/view/item~Item view item}.
	 */
	public createPositionAt( itemOrPosition: Item | Position, offset?: PositionOffset ): Position {
		return Position._createAt( itemOrPosition, offset );
	}

	/**
	 * Creates a new position after given view item.
	 *
	 * @param item View item after which the position should be located.
	 */
	public createPositionAfter( item: Item ): Position {
		return Position._createAfter( item );
	}

	/**
	 * Creates a new position before given view item.
	 *
	 * @param item View item before which the position should be located.
	 */
	public createPositionBefore( item: Item ): Position {
		return Position._createBefore( item );
	}

	/**
	 * Creates a range spanning from `start` position to `end` position.
	 *
	 * **Note:** This factory method creates it's own {@link module:engine/view/position~Position} instances basing on passed values.
	 *
	 * @param start Start position.
	 * @param end End position. If not set, range will be collapsed at `start` position.
	 */
	public createRange( start: Position, end?: Position | null ): Range {
		return new Range( start, end );
	}

	/**
	 * Creates a range that starts before given {@link module:engine/view/item~Item view item} and ends after it.
	 */
	public createRangeOn( item: Item ): Range {
		return Range._createOn( item );
	}

	/**
	 * Creates a range inside an {@link module:engine/view/element~Element element} which starts before the first child of
	 * that element and ends after the last child of that element.
	 *
	 * @param element Element which is a parent for the range.
	 */
	public createRangeIn( element: Element ): Range {
		return Range._createIn( element );
	}

	/**
	 * Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates collapsed selection at the position of given item and offset.
	 * const paragraph = view.createContainerElement( 'paragraph' );
	 * const selection = view.createSelection( paragraph, offset );
	 *
	 * // Creates a range inside an {@link module:engine/view/element~Element element} which starts before the
	 * // first child of that element and ends after the last child of that element.
	 * const selection = view.createSelection( paragraph, 'in' );
	 *
	 * // Creates a range on an {@link module:engine/view/item~Item item} which starts before the item and ends
	 * // just after the item.
	 * const selection = view.createSelection( paragraph, 'on' );
	 * ```
	 *
	 * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = view.createSelection( paragraph, 'in', { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = view.createSelection( element, 'in', { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #createSelection:SELECTABLE `createSelection( selectable, options )`}.
	 *
	 * @label NODE_OFFSET
	 */
	public createSelection( selectable: Node, placeOrOffset: PlaceOrOffset, options?: SelectionOptions ): Selection;

	/**
	 * Creates new {@link module:engine/view/selection~Selection} instance.
	 *
	 * ```ts
	 * // Creates empty selection without ranges.
	 * const selection = view.createSelection();
	 *
	 * // Creates selection at the given range.
	 * const range = view.createRange( start, end );
	 * const selection = view.createSelection( range );
	 *
	 * // Creates selection at the given ranges
	 * const ranges = [ view.createRange( start1, end2 ), view.createRange( star2, end2 ) ];
	 * const selection = view.createSelection( ranges );
	 *
	 * // Creates selection from the other selection.
	 * const otherSelection = view.createSelection();
	 * const selection = view.createSelection( otherSelection );
	 *
	 * // Creates selection from the document selection.
	 * const selection = view.createSelection( editor.editing.view.document.selection );
	 *
	 * // Creates selection at the given position.
	 * const position = view.createPositionFromPath( root, path );
	 * const selection = view.createSelection( position );
	 * ```
	 *
	 * `Selection`'s factory method allow passing additional options (`backward`, `fake` and `label`) as the last argument.
	 *
	 * ```ts
	 * // Creates backward selection.
	 * const selection = view.createSelection( range, { backward: true } );
	 * ```
	 *
	 * Fake selection does not render as browser native selection over selected elements and is hidden to the user.
	 * This way, no native selection UI artifacts are displayed to the user and selection over elements can be
	 * represented in other way, for example by applying proper CSS class.
	 *
	 * Additionally fake's selection label can be provided. It will be used to describe fake selection in DOM
	 * (and be  properly handled by screen readers).
	 *
	 * ```ts
	 * // Creates fake selection with label.
	 * const selection = view.createSelection( range, { fake: true, label: 'foo' } );
	 * ```
	 *
	 * See also: {@link #createSelection:NODE_OFFSET `createSelection( node, placeOrOffset, options )`}.
	 *
	 * @label SELECTABLE
	 */
	public createSelection( selectable?: Exclude<Selectable, Node>, options?: SelectionOptions ): Selection;

	public createSelection( ...args: ConstructorParameters<typeof Selection> ): Selection {
		return new Selection( ...args );
	}

	/**
	 * TODO
	 */
	protected _handleChangeBlock(): boolean {
		this._postFixersInProgress = true;
		this.document._callPostFixers( this._writer );
		this._postFixersInProgress = false;

		return true;
	}
}

/**
 * Fired after a topmost {@link module:engine/view/view~View#change change block} and all
 * {@link module:engine/view/document~Document#registerPostFixer post-fixers} are executed.
 *
 * Actual rendering is performed as a first listener on 'normal' priority.
 *
 * ```ts
 * view.on( 'render', () => {
 * 	// Rendering to the DOM is complete.
 * } );
 * ```
 *
 * This event is useful when you want to update interface elements after the rendering, e.g. position of the
 * balloon panel. If you wants to change view structure use
 * {@link module:engine/view/document~Document#registerPostFixer post-fixers}.
 *
 * @eventName ~View#render
 */
export type ViewRenderEvent = {
	name: 'render';
	args: [];
};
