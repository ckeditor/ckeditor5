/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/bookmarkui
 */

import { Plugin } from 'ckeditor5/src/core.js';
import {
	ButtonView,
	ContextualBalloon,
	MenuBarMenuListItemButtonView,
	clickOutsideHandler
} from 'ckeditor5/src/ui.js';

import type { PositionOptions } from 'ckeditor5/src/utils.js';
import type { BookmarkFormValidatorCallback } from './ui/bookmarkformview.js';

import BookmarkView from './ui/bookmarkview.js';
import bookmarkIcon from '../theme/icons/bookmark.svg';
import '../theme/bookmark.css';

const VISUAL_SELECTION_MARKER_NAME = 'bookmark-ui';

/**
 * The UI plugin of the bookmark feature.
 *
 * It registers the `'bookmark'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * which inserts the `bookmark` element upon selection.
 */
export default class BookmarkUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BookmarkUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ContextualBalloon ] as const;
	}

	/**
	 * The form view displayed inside the balloon.
	 */
	public bookmarkView: BookmarkView | null = null;

	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon!: ContextualBalloon;

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'bookmark', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:bookmark', () => {
			return this._createButton( MenuBarMenuListItemButtonView );
		} );

		this._balloon = editor.plugins.get( ContextualBalloon );

		// Renders a fake visual selection marker on an expanded selection.
		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: VISUAL_SELECTION_MARKER_NAME,
			view: {
				classes: [ 'ck-fake-bookmark-selection' ]
			}
		} );

		// Renders a fake visual selection marker on a collapsed selection.
		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: VISUAL_SELECTION_MARKER_NAME,
			view: ( data, { writer } ) => {
				if ( !data.markerRange.isCollapsed ) {
					return null;
				}

				const markerElement = writer.createUIElement( 'span' );

				writer.addClass(
					[ 'ck-fake-bookmark-selection', 'ck-fake-bookmark-selection_collapsed' ],
					markerElement
				);

				return markerElement;
			}
		} );
	}

	/**
	 * Creates a button for `bookmark` command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const t = locale.t;

		view.set( {
			label: t( 'Bookmark' ),
			icon: bookmarkIcon
		} );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			this._showUI();
		} );

		return view;
	}

	/**
	 * Creates the {@link module:bookmark/ui/bookmarkview~BookmarkView} instance.
	 */
	private _createFormView(): BookmarkView {
		const editor = this.editor;
		const t = editor.locale.t;
		const validators: Array<BookmarkFormValidatorCallback> = [
			form => {
				if ( form.id && /\s/.test( form.id ) ) {
					return t( 'Spaces not allowed in ID.' );
				}

				return undefined;
			}
		];

		const bookmarkView = new BookmarkView( editor.locale, validators );
		const formView = bookmarkView.formView;

		this.listenTo( formView, 'submit', () => {
			if ( formView.isValid() ) {
				this._closeFormView();
			}
		} );

		// Update balloon position when form error changes.
		this.listenTo( formView.idInputView, 'change:errorText', () => {
			editor.ui.update();
		} );

		// Close the panel on esc key press when the **form has focus**.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._closeFormView();
			cancel();
		} );

		return bookmarkView;
	}

	/**
	 * Closes the form view. Decides whether the balloon should be hidden completely.
	 */
	private _closeFormView(): void {
		this._hideUI();
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_addFormView}.
	 */
	private _hideUI(): void {
		if ( !this._isUIInPanel ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );
		this.stopListening( this._balloon, 'change:visibleView' );

		// Make sure the focus always gets back to the editable _before_ removing the focused form view.
		// Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
		editor.editing.view.focus();

		// Remove form first because it's on top of the stack.
		this._removeFormView();

		this._hideFakeVisualSelection();
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */
	private _removeFormView(): void {
		if ( this._isFormInPanel ) {
			// Blur the input element before removing it from DOM to prevent issues in some browsers.
			// See https://github.com/ckeditor/ckeditor5/issues/1501.
			this.bookmarkView!.formView!.insertButtonView.focus();

			// Reset the ID field to update the state of the submit button.
			this.bookmarkView!.formView!.idInputView.fieldView.reset();

			this._balloon.remove( this.bookmarkView! );

			// Because the form has an input which has focus, the focus must be brought back
			// to the editor. Otherwise, it would be lost.
			this.editor.editing.view.focus();

			this._hideFakeVisualSelection();
		}
	}

	/**
	 * Creates views.
	 */
	private _createViews() {
		this.bookmarkView = this._createFormView();

		// Attach lifecycle actions to the the balloon.
		this._enableUserBalloonInteractions();
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 */
	private _enableUserBalloonInteractions(): void {
		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isUIVisible ) {
				this._hideUI();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.bookmarkView!,
			activator: () => this._isUIInPanel,
			contextElements: () => [ this._balloon.view.element! ],
			callback: () => this._hideUI()
		} );
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	private _addFormView(): void {
		if ( !this.bookmarkView ) {
			this._createViews();
		}

		if ( this._isFormInPanel ) {
			return;
		}

		this.bookmarkView!.formView!.disableCssTransitions();
		this.bookmarkView!.formView!.resetFormStatus();

		this._balloon.add( {
			view: this.bookmarkView!,
			position: this._getBalloonPositionData()
		} );

		this.bookmarkView!.formView!.idInputView.fieldView.value = '';

		// Select input when form view is currently visible.
		if ( this._balloon.visibleView === this.bookmarkView ) {
			this.bookmarkView!.formView!.idInputView.fieldView.select();
		}

		this.bookmarkView!.formView!.enableCssTransitions();
	}

	/**
	 * Shows the correct UI type. It is either {@link #formView}.
	 *
	 * @internal
	 */
	public _showUI(): void {
		if ( !this.bookmarkView ) {
			this._createViews();
		}

		// Show visual selection on a text when the contextual balloon is displayed.
		this._showFakeVisualSelection();
		this._addFormView();

		// Begin responding to ui#update once the UI is added.
		this._startUpdatingUI();
	}

	/**
	 * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor UI should be refreshed.
	 *
	 * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
	 */
	private _startUpdatingUI(): void {
		const editor = this.editor;

		const update = () => {
			if ( this._isUIVisible ) {
				// If still in a bookmark element, simply update the position of the balloon.
				// If there was no bookmark (e.g. inserting one), the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				this._balloon.updatePosition( this._getBalloonPositionData() );
			}
		};

		this.listenTo( editor.ui, 'update', update );
		this.listenTo( this._balloon, 'change:visibleView', update );
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 */
	private _getBalloonPositionData(): Partial<PositionOptions> | undefined {
		const view = this.editor.editing.view;
		const model = this.editor.model;
		let target: PositionOptions[ 'target' ] | undefined;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			// There are cases when we highlight selection using a marker (#7705, #4721).
			const markerViewElements = Array.from( this.editor.editing.mapper.markerNameToElements( VISUAL_SELECTION_MARKER_NAME )! );
			const newRange = view.createRange(
				view.createPositionBefore( markerViewElements[ 0 ] ),
				view.createPositionAfter( markerViewElements[ markerViewElements.length - 1 ] )
			);

			target = view.domConverter.viewRangeToDom( newRange );
		}

		return target && { target };
	}

	/**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds a 'bookmark-ui' marker into the document that is rendered as a highlight on selected text fragment.
	 */
	private _showFakeVisualSelection(): void {
		const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange()!;

			if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
				writer.updateMarker( VISUAL_SELECTION_MARKER_NAME, { range } );
			} else {
				if ( range.start.isAtEnd ) {
					const startPosition = range.start.getLastMatchingPosition(
						( { item } ) => !model.schema.isContent( item ),
						{ boundaries: range }
					);

					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range: writer.createRange( startPosition, range.end )
					} );
				} else {
					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range
					} );
				}
			}
		} );
	}

	/**
	 * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
	 */
	private _hideFakeVisualSelection(): void {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}

	/**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isFormInPanel(): boolean {
		return !!this.bookmarkView && this._balloon.hasView( this.bookmarkView );
	}

	/**
	 * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isUIInPanel(): boolean {
		return this._isFormInPanel;
	}

	/**
	 * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _isUIVisible(): boolean {
		const visibleView = this._balloon.visibleView;

		return !!this.bookmarkView && visibleView == this.bookmarkView;
	}
}
