/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark/bookmarkui
 */

import { Plugin, type Editor, icons } from 'ckeditor5/src/core.js';
import {
	ButtonView,
	ContextualBalloon,
	CssTransitionDisablerMixin,
	MenuBarMenuListItemButtonView,
	clickOutsideHandler,
	type ViewWithCssTransitionDisabler
} from 'ckeditor5/src/ui.js';

import {
	ClickObserver,
	type ViewDocumentClickEvent,
	type Element,
	type ViewElement
} from 'ckeditor5/src/engine.js';

import type { PositionOptions } from 'ckeditor5/src/utils.js';
import type { DeleteCommand } from 'ckeditor5/src/typing.js';

import BookmarkFormView, { type BookmarkFormValidatorCallback } from './ui/bookmarkformview.js';
import BookmarkActionsView from './ui/bookmarkactionsview.js';
import type UpdateBookmarkCommand from './updatebookmarkcommand.js';
import type InsertBookmarkCommand from './insertbookmarkcommand.js';

import BookmarkEditing from './bookmarkediting.js';

const VISUAL_SELECTION_MARKER_NAME = 'bookmark-ui';

/**
 * The UI plugin of the bookmark feature.
 *
 * It registers the `'bookmark'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * which inserts the `bookmark` element upon selection.
 */
export default class BookmarkUI extends Plugin {
	/**
	 * The actions view displayed inside of the balloon.
	 */
	public actionsView: BookmarkActionsView | null = null;

	/**
	 * The form view displayed inside the balloon.
	 */
	public formView: BookmarkFormView & ViewWithCssTransitionDisabler | null = null;

	/**
	 * The contextual balloon plugin instance.
	 */
	private _balloon!: ContextualBalloon;

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ BookmarkEditing, ContextualBalloon ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'BookmarkUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		this._balloon = editor.plugins.get( ContextualBalloon );

		// Create toolbar buttons.
		this._createToolbarBookmarkButton();
		this._enableBalloonActivators();

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
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed (see ckeditor5#1341).
		if ( this.formView ) {
			this.formView.destroy();
		}

		if ( this.actionsView ) {
			this.actionsView.destroy();
		}
	}

	/**
	 * Creates views.
	 */
	private _createViews() {
		this.actionsView = this._createActionsView();
		this.formView = this._createFormView();

		// Attach lifecycle actions to the the balloon.
		this._enableUserBalloonInteractions();
	}

	/**
	 * Creates the {@link module:bookmark/ui/bookmarkactionsview~BookmarkActionsView} instance.
	 */
	private _createActionsView(): BookmarkActionsView {
		const editor = this.editor;
		const actionsView = new BookmarkActionsView( editor.locale );
		const updateBookmarkCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
		const deleteCommand: DeleteCommand = editor.commands.get( 'delete' )!;

		actionsView.bind( 'id' ).to( updateBookmarkCommand, 'value' );
		actionsView.editButtonView.bind( 'isEnabled' ).to( updateBookmarkCommand );
		actionsView.removeButtonView.bind( 'isEnabled' ).to( deleteCommand );

		// Display edit form view after clicking on the "Edit" button.
		this.listenTo( actionsView, 'edit', () => {
			this._addFormView();
		} );

		// Execute remove command after clicking on the "Remove" button.
		this.listenTo( actionsView, 'remove', () => {
			this._hideUI();
			editor.execute( 'delete' );
		} );

		// Close the panel on esc key press when the **actions have focus**.
		actionsView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		return actionsView;
	}

	/**
	 * Creates the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} instance.
	 */
	private _createFormView(): BookmarkFormView & ViewWithCssTransitionDisabler {
		const editor = this.editor;
		const locale = editor.locale;
		const insertBookmarkCommand: InsertBookmarkCommand = editor.commands.get( 'insertBookmark' )!;
		const updateBookmarkCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
		const commands = [ insertBookmarkCommand, updateBookmarkCommand ];

		const formView = new ( CssTransitionDisablerMixin( BookmarkFormView ) )( locale, getFormValidators( editor ) );

		formView.idInputView.fieldView.bind( 'value' ).to( updateBookmarkCommand, 'value' );

		// Form elements should be read-only when corresponding commands are disabled.
		formView.idInputView.bind( 'isEnabled' ).toMany(
			commands,
			'isEnabled',
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		// Disable the "save" button if the command is disabled.
		formView.buttonView.bind( 'isEnabled' ).toMany(
			commands,
			'isEnabled',
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		// Execute link command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			if ( formView.isValid() ) {
				const value = formView.id!;

				if ( this._getSelectedBookmarkElement() ) {
					editor.execute( 'updateBookmark', { bookmarkId: value } );
				} else {
					editor.execute( 'insertBookmark', { bookmarkId: value } );
				}

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

		return formView;
	}

	/**
	 * Creates a toolbar Bookmark button. Clicking this button will show
	 * a {@link #_balloon} attached to the selection.
	 */
	private _createToolbarBookmarkButton() {
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
	}

	/**
	 * Creates a button for `bookmark` command to use either in toolbar or in menu bar.
	 */
	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const insertCommand: InsertBookmarkCommand = editor.commands.get( 'insertBookmark' )!;
		const updateCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
		const t = locale.t;

		view.set( {
			label: t( 'Bookmark' ),
			icon: icons.bookmark
		} );

		// Execute the command.
		this.listenTo( view, 'execute', () => this._showUI( true ) );

		view.bind( 'isEnabled' ).toMany(
			[ insertCommand, updateCommand ],
			'isEnabled',
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		view.bind( 'isOn' ).to( updateCommand, 'value', value => !!value );

		return view;
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} should be displayed.
	 */
	private _enableBalloonActivators(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		// Handle click on view document and show panel when selection is placed inside the bookmark element.
		// Keep panel open until selection will be inside the same bookmark element.
		this.listenTo<ViewDocumentClickEvent>( viewDocument, 'click', () => {
			const bookmark = this._getSelectedBookmarkElement();

			if ( bookmark ) {
				// Then show panel but keep focus inside editor editable.
				this._showUI();
			}
		} );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 */
	private _enableUserBalloonInteractions(): void {
		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set( 'Tab', ( data, cancel ) => {
			if ( this._areActionsVisible && !this.actionsView!.focusTracker.isFocused ) {
				this.actionsView!.focus();
				cancel();
			}
		}, {
			// Use the high priority because the bookmark UI navigation is more important
			// than other feature's actions, e.g. list indentation.
			priority: 'high'
		} );

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isUIVisible ) {
				this._hideUI();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView!,
			activator: () => this._isUIInPanel,
			contextElements: () => [ this._balloon.view.element! ],
			callback: () => this._hideUI()
		} );
	}

	/**
	 * Updates the button label. If bookmark is selected label is set to 'Update' otherwise
	 * it is 'Insert'.
	 */
	private _updateFormButtonLabel( isBookmarkSelected: boolean ) {
		const t = this.editor.locale.t;

		this.formView!.buttonView.label = isBookmarkSelected ? t( 'Update' ) : t( 'Insert' );
	}

	/**
	 * Adds the {@link #actionsView} to the {@link #_balloon}.
	 *
	 * @internal
	 */
	public _addActionsView(): void {
		if ( !this.actionsView ) {
			this._createViews();
		}

		if ( this._areActionsInPanel ) {
			return;
		}

		this._balloon.add( {
			view: this.actionsView!,
			position: this._getBalloonPositionData()
		} );
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	private _addFormView(): void {
		if ( !this.formView ) {
			this._createViews();
		}

		if ( this._isFormInPanel ) {
			return;
		}

		const editor = this.editor;
		const updateBookmarkCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;

		this.formView!.disableCssTransitions();
		this.formView!.resetFormStatus();

		this._balloon.add( {
			view: this.formView!,
			position: this._getBalloonPositionData()
		} );

		this.formView!.idInputView.fieldView.value = updateBookmarkCommand.value || '';

		// Select input when form view is currently visible.
		if ( this._balloon.visibleView === this.formView ) {
			this.formView!.idInputView.fieldView.select();
		}

		this.formView!.enableCssTransitions();
	}

	/**
	 * Closes the form view. Decides whether the balloon should be hidden completely.
	 */
	private _closeFormView(): void {
		const updateBookmarkCommand: UpdateBookmarkCommand = this.editor.commands.get( 'updateBookmark' )!;

		if ( updateBookmarkCommand.value !== undefined ) {
			this._removeFormView();
		} else {
			this._hideUI();
		}
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */
	private _removeFormView(): void {
		if ( this._isFormInPanel ) {
			// Blur the input element before removing it from DOM to prevent issues in some browsers.
			// See https://github.com/ckeditor/ckeditor5/issues/1501.
			this.formView!.buttonView.focus();

			// Reset the ID field to update the state of the submit button.
			this.formView!.idInputView.fieldView.reset();

			this._balloon.remove( this.formView! );

			// Because the form has an input which has focus, the focus must be brought back
			// to the editor. Otherwise, it would be lost.
			this.editor.editing.view.focus();

			this._hideFakeVisualSelection();
		}
	}

	/**
	 * Shows the correct UI type. It is either {@link #formView} or {@link #actionsView}.
	 */
	private _showUI( forceVisible: boolean = false ): void {
		if ( !this.formView ) {
			this._createViews();
		}

		// When there's no bookmark under the selection, go straight to the editing UI.
		if ( !this._getSelectedBookmarkElement() ) {
			// Show visual selection on a text without a bookmark when the contextual balloon is displayed.
			this._showFakeVisualSelection();

			this._addActionsView();

			// Be sure panel with bookmark is visible.
			if ( forceVisible ) {
				this._balloon.showStack( 'main' );
			}

			this._addFormView();
		}
		// If there's a bookmark under the selection...
		else {
			// Go to the editing UI if actions are already visible.
			if ( this._areActionsVisible ) {
				this._addFormView();
			}
			// Otherwise display just the actions UI.
			else {
				this._addActionsView();
			}

			// Be sure panel with bookmark is visible.
			if ( forceVisible ) {
				this._balloon.showStack( 'main' );
			}
		}

		// Begin responding to ui#update once the UI is added.
		this._startUpdatingUI();
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_addFormView}, {@link #_addActionsView}.
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

		// Then remove the actions view because it's beneath the form.
		this._balloon.remove( this.actionsView! );

		this._hideFakeVisualSelection();
	}

	/**
	 * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor UI should be refreshed.
	 *
	 * See: {@link #_hideUI} to learn when the UI stops reacting to the `update` event.
	 */
	private _startUpdatingUI(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		let prevSelectedBookmark = this._getSelectedBookmarkElement();
		let prevSelectionParent = getSelectionParent();

		this._updateFormButtonLabel( !!prevSelectedBookmark );

		const update = () => {
			const selectedBookmark = this._getSelectedBookmarkElement();
			const selectionParent = getSelectionParent();

			// Hide the panel if:
			//
			// * the selection went out of the EXISTING bookmark element. E.g. user moved the caret out
			//   of the bookmark,
			// * the selection went to a different parent when creating a NEW bookmark. E.g. someone
			//   else modified the document.
			// * the selection has expanded (e.g. displaying bookmark actions then pressing SHIFT+Right arrow).
			//
			if (
				( prevSelectedBookmark && !selectedBookmark ) ||
				( !prevSelectedBookmark && selectionParent !== prevSelectionParent )
			) {
				this._hideUI();
			}
			// Update the position of the panel when:
			//  * bookmark panel is in the visible stack
			//  * the selection remains on the original bookmark element,
			//  * there was no bookmark element in the first place, i.e. creating a new bookmark
			else if ( this._isUIVisible ) {
				// If still in a bookmark element, simply update the position of the balloon.
				// If there was no bookmark (e.g. inserting one), the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				this._balloon.updatePosition( this._getBalloonPositionData() );
			}

			this._updateFormButtonLabel( !!prevSelectedBookmark );

			prevSelectedBookmark = selectedBookmark;
			prevSelectionParent = selectionParent;
		};

		function getSelectionParent() {
			return viewDocument.selection.focus!.getAncestors()
				.reverse()
				.find( ( node ): node is ViewElement => node.is( 'element' ) );
		}

		this.listenTo( editor.ui, 'update', update );
		this.listenTo( this._balloon, 'change:visibleView', update );
	}

	/**
	 * Returns `true` when {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isFormInPanel(): boolean {
		return !!this.formView && this._balloon.hasView( this.formView );
	}

	/**
	 * Returns `true` when {@link #actionsView} is in the {@link #_balloon}.
	 */
	private get _areActionsInPanel(): boolean {
		return !!this.actionsView && this._balloon.hasView( this.actionsView );
	}

	/**
	 * Returns `true` when {@link #actionsView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _areActionsVisible(): boolean {
		return !!this.actionsView && this._balloon.visibleView === this.actionsView;
	}

	/**
	 * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon}.
	 */
	private get _isUIInPanel(): boolean {
		return this._isFormInPanel || this._areActionsInPanel;
	}

	/**
	 * Returns `true` when {@link #actionsView} or {@link #formView} is in the {@link #_balloon} and it is
	 * currently visible.
	 */
	private get _isUIVisible(): boolean {
		const visibleView = this._balloon.visibleView;

		return !!this.formView && visibleView == this.formView || this._areActionsVisible;
	}

	/**
	 * Returns positioning options for the {@link #_balloon}. They control the way the balloon is attached
	 * to the target element or selection.
	 */
	private _getBalloonPositionData(): Partial<PositionOptions> | undefined {
		const view = this.editor.editing.view;
		const model = this.editor.model;
		let target: PositionOptions[ 'target' ] | undefined;

		const bookmarkElement = this._getSelectedBookmarkElement();

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			// There are cases when we highlight selection using a marker (#7705, #4721).
			const markerViewElements = Array.from( this.editor.editing.mapper.markerNameToElements( VISUAL_SELECTION_MARKER_NAME )! );
			const newRange = view.createRange(
				view.createPositionBefore( markerViewElements[ 0 ] ),
				view.createPositionAfter( markerViewElements[ markerViewElements.length - 1 ] )
			);

			target = view.domConverter.viewRangeToDom( newRange );
		}
		else if ( bookmarkElement ) {
			target = () => {
				const mapper = this.editor.editing.mapper;
				const domConverter = view.domConverter;
				const viewElement = mapper.toViewElement( bookmarkElement )!;

				return domConverter.mapViewToDom( viewElement )!;
			};
		}

		return target && { target };
	}

	/**
	 * Returns the bookmark {@link module:engine/view/attributeelement~AttributeElement} under
	 * the {@link module:engine/view/document~Document editing view's} selection or `null`
	 * if there is none.
	 */
	private _getSelectedBookmarkElement(): Element | null {
		const selection = this.editor.model.document.selection;
		const element = selection.getSelectedElement();

		if ( element && element.is( 'element', 'bookmark' ) ) {
			return element;
		}

		return null;
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
}

/**
 * Returns bookmark form validation callbacks.
 */
function getFormValidators( editor: Editor ): Array<BookmarkFormValidatorCallback> {
	const { t } = editor;
	const bookmarkEditing = editor.plugins.get( BookmarkEditing );

	return [
		form => {
			if ( !form.id ) {
				return t( 'Bookmark must not be empty.' );
			}
		},
		form => {
			if ( form.id && /\s/.test( form.id ) ) {
				return t( 'Bookmark name cannot contain space characters.' );
			}
		},
		form => {
			const selectedElement = editor.model.document.selection.getSelectedElement();
			const existingBookmarkForId = bookmarkEditing.getElementForBookmarkId( form.id! );

			// Accept change of bookmark ID if no real change is happening (edit -> submit, without changes).
			if ( selectedElement === existingBookmarkForId ) {
				return;
			}

			if ( existingBookmarkForId ) {
				return t( 'Bookmark name already exists.' );
			}
		}
	];
}
