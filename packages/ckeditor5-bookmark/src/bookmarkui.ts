/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module bookmark/bookmarkui
 */

import type { LinksProviderDetailedItem, LinksProviderListItem } from '@ckeditor/ckeditor5-link';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import {
	ButtonView,
	ContextualBalloon,
	CssTransitionDisablerMixin,
	MenuBarMenuListItemButtonView,
	clickOutsideHandler,
	LabelView,
	BalloonPanelView,
	type ViewWithCssTransitionDisabler
} from 'ckeditor5/src/ui.js';
import { IconBookmark, IconRemove, IconBookmarkMedium, IconBookmarkSmall, IconPencil } from 'ckeditor5/src/icons.js';
import {
	type Element,
	type ViewDocumentSelection,
	type ViewElement
} from 'ckeditor5/src/engine.js';

import type { PositionOptions } from 'ckeditor5/src/utils.js';
import type { DeleteCommand } from 'ckeditor5/src/typing.js';
import { isWidget, WidgetToolbarRepository } from 'ckeditor5/src/widget.js';

import BookmarkFormView, { type BookmarkFormViewCancelEvent, type BookmarkFormValidatorCallback } from './ui/bookmarkformview.js';
import type UpdateBookmarkCommand from './updatebookmarkcommand.js';
import type InsertBookmarkCommand from './insertbookmarkcommand.js';

import BookmarkEditing from './bookmarkediting.js';

import '../theme/bookmarktoolbar.css';

const VISUAL_SELECTION_MARKER_NAME = 'bookmark-ui';

/**
 * The UI plugin of the bookmark feature.
 *
 * It registers the `'bookmark'` UI button in the editor's {@link module:ui/componentfactory~ComponentFactory component factory}
 * which inserts the `bookmark` element upon selection.
 */
export default class BookmarkUI extends Plugin {
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
		return [ BookmarkEditing, ContextualBalloon, WidgetToolbarRepository ] as const;
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

		this._balloon = editor.plugins.get( ContextualBalloon );

		// Register the link provider in link plugin to display the link form.
		if ( editor.plugins.has( 'LinkUI' ) ) {
			this._registerLinkProvider();
		}

		// Create toolbar buttons.
		this._registerComponents();

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
	public afterInit(): void {
		const editor = this.editor;
		const t = editor.locale.t;
		const widgetToolbarRepository = this.editor.plugins.get( WidgetToolbarRepository );
		const defaultPositions = BalloonPanelView.defaultPositions;

		widgetToolbarRepository.register( 'bookmark', {
			ariaLabel: t( 'Bookmark toolbar' ),
			items: editor.config.get( 'bookmark.toolbar' )!,

			getRelatedElement: getSelectedBookmarkWidget,
			balloonClassName: 'ck-bookmark-balloon ck-toolbar-container',

			// Override positions to the same list as for balloon panel default
			// so widget toolbar will try to use same position as form view.
			positions: [
				defaultPositions.southArrowNorth,
				defaultPositions.southArrowNorthMiddleWest,
				defaultPositions.southArrowNorthMiddleEast,
				defaultPositions.southArrowNorthWest,
				defaultPositions.southArrowNorthEast,
				defaultPositions.northArrowSouth,
				defaultPositions.northArrowSouthMiddleWest,
				defaultPositions.northArrowSouthMiddleEast,
				defaultPositions.northArrowSouthWest,
				defaultPositions.northArrowSouthEast,
				defaultPositions.viewportStickyNorth
			]
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
	}

	/**
	 * Creates views.
	 */
	private _createViews() {
		this.formView = this._createFormView();

		// Attach lifecycle actions to the the balloon.
		this._enableUserBalloonInteractions();
	}

	/**
	 * Creates the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} instance.
	 */
	private _createFormView(): BookmarkFormView & ViewWithCssTransitionDisabler {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;
		const insertBookmarkCommand: InsertBookmarkCommand = editor.commands.get( 'insertBookmark' )!;
		const updateBookmarkCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
		const commands = [ insertBookmarkCommand, updateBookmarkCommand ];

		const formView = new ( CssTransitionDisablerMixin( BookmarkFormView ) )( locale, getFormValidators( editor ) );

		formView.idInputView.fieldView.bind( 'value' ).to( updateBookmarkCommand, 'value' );
		formView.saveButtonView.bind( 'label' ).to( updateBookmarkCommand, 'value', value => value ? t( 'Save' ) : t( 'Insert' ) );

		// Form elements should be read-only when corresponding commands are disabled.
		formView.idInputView.bind( 'isEnabled' ).toMany(
			commands,
			'isEnabled',
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		// Disable the "save" button if the command is disabled.
		formView.saveButtonView.bind( 'isEnabled' ).toMany(
			commands,
			'isEnabled',
			( ...areEnabled ) => areEnabled.some( isEnabled => isEnabled )
		);

		// Close the panel on form after clicking back button.
		this.listenTo<BookmarkFormViewCancelEvent>( formView, 'cancel', () => {
			this._hideFormView();
		} );

		// Execute link command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			if ( formView.isValid() ) {
				const value = formView.id!;

				if ( this._getSelectedBookmarkElement() ) {
					editor.execute( 'updateBookmark', { bookmarkId: value } );
				} else {
					editor.execute( 'insertBookmark', { bookmarkId: value } );
				}

				this._hideFormView();
			}
		} );

		// Update balloon position when form error changes.
		this.listenTo( formView.idInputView, 'change:errorText', () => {
			editor.ui.update();
		} );

		return formView;
	}

	/**
	 * Creates link form menu list entry, so it'll be possible to access
	 * the list of the bookmarks from the link form.
	 */
	private _registerLinkProvider() {
		const t = this.editor.locale.t;
		const linksUI = this.editor.plugins.get( 'LinkUI' )!;
		const bookmarkEditing = this.editor.plugins.get( BookmarkEditing );

		const getListItems = () => Array
			.from( bookmarkEditing.getAllBookmarkNames() )
			.sort( ( a, b ) => a.localeCompare( b ) )
			.map( ( bookmarkId ): LinksProviderListItem => ( {
				id: bookmarkId,
				href: `#${ bookmarkId }`,
				label: bookmarkId,
				icon: IconBookmarkMedium
			} ) );

		const getItem = ( href: string ): LinksProviderDetailedItem | null => {
			const bookmark = [ ...bookmarkEditing.getAllBookmarkNames() ].find( item => `#${ item }` === href );

			if ( !bookmark ) {
				return null;
			}

			return {
				href,
				label: bookmark,
				icon: IconBookmarkSmall,
				tooltip: t( 'Scroll to bookmark' )
			};
		};

		linksUI.registerLinksListProvider( {
			label: t( 'Bookmarks' ),
			emptyListPlaceholder: t( 'No bookmarks available.' ),
			navigate: ( { href }: LinksProviderDetailedItem ) => this._scrollToBookmark( href ),
			getListItems,
			getItem
		} );
	}

	/**
	 * Scrolls the editor to the bookmark with the given id.
	 */
	private _scrollToBookmark( href: string ) {
		const bookmarkEditing = this.editor.plugins.get( BookmarkEditing );
		const bookmarkElement = bookmarkEditing.getElementForBookmarkId( href.slice( 1 ) );

		if ( !bookmarkElement ) {
			return false;
		}

		this.editor.model.change( writer => {
			writer.setSelection( bookmarkElement!, 'on' );
		} );

		this.editor.editing.view.scrollToTheSelection( {
			alignToTop: true,
			forceScroll: true
		} );

		return true;
	}

	/**
	 * Creates a toolbar Bookmark button. Clicking this button will show
	 * a {@link #_balloon} attached to the selection.
	 */
	private _registerComponents() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'bookmark', () => {
			const buttonView = this._createBookmarkButton( ButtonView );

			buttonView.set( {
				tooltip: true
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:bookmark', () => {
			return this._createBookmarkButton( MenuBarMenuListItemButtonView );
		} );

		// Bookmark toolbar buttons.

		editor.ui.componentFactory.add( 'bookmarkPreview', locale => {
			const updateBookmarkCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
			const label = new LabelView( locale );

			label.extendTemplate( {
				attributes: {
					class: [ 'ck-bookmark-toolbar__preview' ]
				}
			} );

			label.bind( 'text' ).to( updateBookmarkCommand, 'value' );

			return label;
		} );

		editor.ui.componentFactory.add( 'editBookmark', locale => {
			const updateBookmarkCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
			const button = new ButtonView( locale );
			const t = locale.t;

			button.set( {
				label: t( 'Edit bookmark' ),
				icon: IconPencil,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to( updateBookmarkCommand );

			this.listenTo( button, 'execute', () => {
				this._showFormView();
			} );

			return button;
		} );

		editor.ui.componentFactory.add( 'removeBookmark', locale => {
			const deleteCommand: DeleteCommand = editor.commands.get( 'delete' )!;
			const button = new ButtonView( locale );
			const t = locale.t;

			button.set( {
				label: t( 'Remove bookmark' ),
				icon: IconRemove,
				tooltip: true
			} );

			button.bind( 'isEnabled' ).to( deleteCommand );

			this.listenTo( button, 'execute', () => {
				editor.execute( 'delete' );
				editor.editing.view.focus();
			} );

			return button;
		} );
	}

	/**
	 * Creates a button for `bookmark` command to use either in toolbar or in menu bar.
	 */
	private _createBookmarkButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const locale = editor.locale;
		const view = new ButtonClass( locale ) as InstanceType<T>;
		const insertCommand: InsertBookmarkCommand = editor.commands.get( 'insertBookmark' )!;
		const updateCommand: UpdateBookmarkCommand = editor.commands.get( 'updateBookmark' )!;
		const t = locale.t;

		view.set( {
			label: t( 'Bookmark' ),
			icon: IconBookmark
		} );

		// Execute the command.
		this.listenTo( view, 'execute', () => {
			editor.editing.view.scrollToTheSelection();
			this._showFormView();
		} );

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
	 * {@link #formView} is visible or not.
	 */
	private _enableUserBalloonInteractions(): void {
		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._isFormVisible ) {
				this._hideFormView();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView!,
			activator: () => this._isFormInPanel,
			contextElements: () => [ this._balloon.view.element! ],
			callback: () => {
				// Focusing on the editable during a click outside the balloon panel might
				// cause the selection to move to the beginning of the editable, so we avoid
				// focusing on it during this action.
				// See: https://github.com/ckeditor/ckeditor5/issues/18253
				this._hideFormView( false );
			}
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

		const updateBookmarkCommand: UpdateBookmarkCommand = this.editor.commands.get( 'updateBookmark' )!;

		this.formView!.disableCssTransitions();
		this.formView!.resetFormStatus();

		this._balloon.add( {
			view: this.formView!,
			position: this._getBalloonPositionData()
		} );

		this.formView!.backButtonView.isVisible = updateBookmarkCommand.isEnabled;
		this.formView!.idInputView.fieldView.value = updateBookmarkCommand.value || '';

		// Select input when form view is currently visible.
		if ( this._balloon.visibleView === this.formView ) {
			this.formView!.idInputView.fieldView.select();
		}

		this.formView!.enableCssTransitions();
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */
	private _removeFormView( updateFocus: boolean = true ): void {
		// Blur the input element before removing it from DOM to prevent issues in some browsers.
		// See https://github.com/ckeditor/ckeditor5/issues/1501.
		this.formView!.saveButtonView.focus();

		// Reset the ID field to update the state of the submit button.
		this.formView!.idInputView.fieldView.reset();

		this._balloon.remove( this.formView! );

		// Because the form has an input which has focus, the focus must be brought back
		// to the editor. Otherwise, it would be lost.
		if ( updateFocus ) {
			this.editor.editing.view.focus();
		}

		this._hideFakeVisualSelection();
	}

	/**
	 * Shows the {@link #formView}.
	 */
	private _showFormView(): void {
		if ( !this.formView ) {
			this._createViews();
		}

		if ( !this._getSelectedBookmarkElement() ) {
			this._showFakeVisualSelection();
		}

		this._addFormView();

		// Be sure panel with bookmark is visible.
		this._balloon.showStack( 'main' );

		// Begin responding to ui#update once the UI is added.
		this._startUpdatingUI();
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 */
	private _hideFormView( updateFocus: boolean = true ): void {
		if ( !this._isFormInPanel ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );
		this.stopListening( this._balloon, 'change:visibleView' );

		// Make sure the focus always gets back to the editable _before_ removing the focused form view.
		// Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
		if ( updateFocus ) {
			editor.editing.view.focus();
		}

		// Remove form first because it's on top of the stack.
		this._removeFormView( updateFocus );

		this._hideFakeVisualSelection();
	}

	/**
	 * Makes the UI react to the {@link module:ui/editorui/editorui~EditorUI#event:update} event to
	 * reposition itself when the editor UI should be refreshed.
	 *
	 * See: {@link #_hideFormView} to learn when the UI stops reacting to the `update` event.
	 */
	private _startUpdatingUI(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		let prevSelectedBookmark = this._getSelectedBookmarkElement();
		let prevSelectionParent = getSelectionParent();

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
				prevSelectedBookmark && !selectedBookmark ||
				!prevSelectedBookmark && selectionParent !== prevSelectionParent
			) {
				this._hideFormView();
			}
			// Update the position of the panel when:
			//  * bookmark panel is in the visible stack
			//  * the selection remains on the original bookmark element,
			//  * there was no bookmark element in the first place, i.e. creating a new bookmark
			else if ( this._isFormVisible ) {
				// If still in a bookmark element, simply update the position of the balloon.
				// If there was no bookmark (e.g. inserting one), the balloon must be moved
				// to the new position in the editing view (a new native DOM range).
				this._balloon.updatePosition( this._getBalloonPositionData() );
			}

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
	 * Returns `true` when {@link #formView} is in the {@link #_balloon} and it is currently visible.
	 */
	private get _isFormVisible(): boolean {
		return !!this.formView && this._balloon.visibleView == this.formView;
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

		if ( !target ) {
			return;
		}

		return {
			target
		};
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

/**
 * Returns the currently selected bookmark view element.
 */
function getSelectedBookmarkWidget( selection: ViewDocumentSelection ): ViewElement | null {
	const element = selection.getSelectedElement();

	if ( !element || !isWidget( element ) || !element.getCustomProperty( 'bookmark' ) ) {
		return null;
	}

	return element;
}
