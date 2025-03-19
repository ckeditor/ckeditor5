/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { DialogViewPosition } from 'ckeditor5/src/ui.js';
import { global, createElement, Rect, type EventInfo } from 'ckeditor5/src/utils.js';
import type { ElementApi, Editor, EditorConfig } from 'ckeditor5/src/core.js';
import type { PresenceListUI } from '@ckeditor/ckeditor5-real-time-collaboration';
import type { DocumentOutlineUI } from '@ckeditor/ckeditor5-document-outline';
import type { PaginationRenderer } from '@ckeditor/ckeditor5-pagination';
import type { RevisionViewerEditor } from '@ckeditor/ckeditor5-revision-history';
import type { Annotation, AnnotationsUIs, Sidebar } from '@ckeditor/ckeditor5-comments';

const DIALOG_OFFSET = 28;

/**
 * The abstract editor type handler. It should be extended by the particular editor type handler.
 */
export default class AbstractEditorHandler {
	/**
	 * Maps placeholder names to placeholder elements and moved elements.
	 */
	private _placeholderMap: Map<string, { placeholderElement: HTMLElement; movedElement: HTMLElement }>;

	/**
	 * The wrapper element that holds the fullscreen mode layout.
	 */
	private _wrapper: HTMLElement | null = null;

	/**
	 * The document object in which the editor is located.
	 */
	private _document: Document;

	/**
	 * Data of the annotations UIs that were active before entering the fullscreen mode.
	 */
	private _annotationsUIsData: Map<string, Record<string, any>> | null = null;

	/**
	 * A callback that hides the document outline header when the source editing mode is enabled.
	 * Document outline element itself is hidden by source editing plugin.
	 */
	/* istanbul ignore next -- @preserve */
	private _sourceEditingCallback = ( _evt: EventInfo, _name: string, value: boolean ) => {
		( this.getWrapper().querySelector( '.ck-fullscreen__document-outline-header' ) as HTMLElement ).style.display =
			value ? 'none' : '';
	};

	/**
	 * A callback that shows the revision viewer, stored to restore the original one after exiting the fullscreen mode.
	 */
	protected _showRevisionViewerCallback: ( ( config?: EditorConfig ) => Promise<RevisionViewerEditor | null> ) | null = null;

	/**
	 * A callback that closes the revision viewer, stored to restore the original one after exiting the fullscreen mode.
	 */
	protected _closeRevisionViewerCallback: ( ( viewerEditor?: RevisionViewerEditor ) => Promise<unknown> ) | null = null;

	/**
	 * A function moving the editor UI elements to the fullscreen mode. It should be set by the particular editor type handler.
	 * Returns the fullscreen mode container element so it can be further customized via `fullscreen.enableCallback` configuration property.
	*/
	protected _defaultEnable: () => HTMLElement;

	/**
	 * An editor instance. It should be set by the particular editor type handler.
	 */
	declare protected _editor: Editor & Partial<ElementApi>;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		this._placeholderMap = new Map();

		if ( editor.plugins.has( 'RevisionHistory' ) ) {
			this._showRevisionViewerCallback = editor.config.get( 'revisionHistory.showRevisionViewerCallback' )!;
			this._closeRevisionViewerCallback = editor.config.get( 'revisionHistory.closeRevisionViewerCallback' )!;
		}

		this._editor = editor;
		this._document = this._editor.sourceElement ? this._editor.sourceElement.ownerDocument : global.document;
		this._editor.config.define( 'fullscreen.container', this._document.body );

		this._defaultEnable = () => this.getWrapper();
		editor.on( 'destroy', () => {
			if ( this._wrapper ) {
				this.destroy();
			}
		} );
	}

	/**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */
	public moveToFullscreen( elementToMove: HTMLElement, placeholderName: string ): void {
		const placeholderElement = createElement( this._document, 'div' );

		placeholderElement.setAttribute( 'data-ck-fullscreen-placeholder', placeholderName );
		elementToMove.replaceWith( placeholderElement );

		this.getWrapper().querySelector( `[data-ck-fullscreen="${ placeholderName }"]` )!.append( elementToMove );

		this._placeholderMap.set( placeholderName, { placeholderElement, movedElement: elementToMove } );
	}

	/**
	 * Returns a single moved element to its original place.
	 */
	public restoreMovedElementLocation( placeholderName: string ): void {
		if ( !this._placeholderMap.has( placeholderName ) ) {
			return;
		}

		const { placeholderElement, movedElement } = this._placeholderMap.get( placeholderName )!;

		placeholderElement.replaceWith( movedElement );
		placeholderElement.remove();

		this._placeholderMap.delete( placeholderName );

		if ( this._placeholderMap.size === 0 ) {
			this._destroyContainer();
		}
	}

	/**
	 * Returns the fullscreen mode container element.
	 */
	public getWrapper(): HTMLElement {
		if ( !this._wrapper ) {
			this._wrapper = createElement( this._document, 'div', {
				class: 'ck ck-fullscreen__main-wrapper'
			} );

			this._wrapper.innerHTML = `
				<div class="ck ck-fullscreen__top-wrapper ck-reset_all">
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editable-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div>
					</div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable">
						<div class="ck ck-fullscreen__pagination-view" data-ck-fullscreen="pagination-view"></div>
					</div>
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__right-sidebar" data-ck-fullscreen="right-sidebar"></div>
				</div>
				<div class="ck ck-fullscreen__bottom-wrapper">
					<div class="ck ck-fullscreen__body-wrapper" data-ck-fullscreen="body-wrapper"></div>
				</div>
			`;

			this._editor.config.get( 'fullscreen.container' )!.appendChild( this._wrapper );
		}

		return this._wrapper;
	}

	/**
	 * Enables the fullscreen mode. It executes the editor-specific enable handler and then the configured callback.
	 */
	public enable(): void {
		this._defaultEnable();

		// Block scroll if the fullscreen container is the body element. Otherwise the document has to stay scrollable.
		if ( this._editor.config.get( 'fullscreen.container' ) === this._document.body ) {
			this._document.body.classList.add( 'ck-fullscreen' );
			this._document.body.parentElement!.classList.add( 'ck-fullscreen' );
		}

		if ( this._editor.plugins.has( 'Dialog' ) ) {
			this._registerFullscreenDialogPositionAdjustments();
		}

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'PresenceListUI' ) ) {
			this._generatePresenceListContainer();
		}

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			this._generateDocumentOutlineContainer();
		}

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'Pagination' ) ) {
			( this._editor.plugins.get( 'PaginationRenderer' ) as PaginationRenderer ).setupScrollableAncestor();
		}

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'AnnotationsUIs' ) ) {
			this._overrideAnnotationsUIs();
		}

		if ( this._editor.plugins.has( 'RevisionHistory' ) ) {
			// Code coverage is provided in the commercial package repository as integration unit tests.
			/* istanbul ignore if -- @preserve */
			if ( this._editor.plugins.get( 'RevisionHistory' ).isRevisionViewerOpen ) {
				this._editor.config.get( 'revisionHistory.closeRevisionViewerCallback' )!();
			}

			this._overrideRevisionHistoryCallbacks();
		}

		if ( this._editor.plugins.has( 'SourceEditing' ) && this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			this._editor.plugins.get( 'SourceEditing' ).on( 'change:isSourceEditingMode', this._sourceEditingCallback );
		}

		// Hide all other elements in the container to ensure they don't create an empty unscrollable space.
		for ( const element of this._editor.config.get( 'fullscreen.container' )!.children ) {
			if ( element !== this._wrapper ) {
				( element as HTMLElement ).style.display = 'none';
			}
		}

		if ( this._editor.config.get( 'fullscreen.enableCallback' ) ) {
			this._editor.config.get( 'fullscreen.enableCallback' )!( this.getWrapper() );
		}
	}

	/**
	 * Disables the fullscreen mode by restoring all moved elements and destroying the fullscreen container.
	 */
	public disable(): void {
		if ( this._editor.config.get( 'fullscreen.disableCallback' ) ) {
			this._editor.config.get( 'fullscreen.disableCallback' )!();
		}

		this._document.body.classList.remove( 'ck-fullscreen' );
		this._document.body.parentElement!.classList.remove( 'ck-fullscreen' );

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			this._restoreDocumentOutlineDefaultContainer();
		}

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._annotationsUIsData ) {
			this._restoreAnnotationsUIs();
		}

		if ( this._editor.plugins.has( 'RevisionHistory' ) ) {
			this._restoreRevisionHistoryCallbacks();
		}

		if ( this._editor.plugins.has( 'SourceEditing' ) && this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			this._editor.plugins.get( 'SourceEditing' ).off( 'change:isSourceEditingMode', this._sourceEditingCallback );
		}

		for ( const placeholderName of this._placeholderMap.keys() ) {
			this.restoreMovedElementLocation( placeholderName );
		}

		this._editor.ui.view.toolbar!.switchBehavior(
			this._editor.config.get( 'toolbar.shouldNotGroupWhenFull' ) === true ? 'static' : 'dynamic'
		);

		if ( this._placeholderMap.size === 0 ) {
			this._destroyContainer();
		}

		// Pagination has to be restored after leaving fullscreen mode to ensure proper rendering.
		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'Pagination' ) ) {
			( this._editor.plugins.get( 'PaginationRenderer' ) as PaginationRenderer ).setupScrollableAncestor();
		}

		// Also dialog position needs to be recalculated after leaving fullscreen mode.
		if ( this._editor.plugins.has( 'Dialog' ) ) {
			this._unregisterFullscreenDialogPositionAdjustments();
		}
	}

	/**
	 * @inheritDoc
	 */
	public destroy(): void {
		for ( const { placeholderElement, movedElement } of this._placeholderMap.values() ) {
			placeholderElement.remove();
			movedElement.remove();
		}

		this._destroyContainer();

		this._document.body.classList.remove( 'ck-fullscreen' );
		this._document.body.parentElement!.classList.remove( 'ck-fullscreen' );
	}

	/**
	 * Destroys the fullscreen mode container.
	 */
	private _destroyContainer(): void {
		if ( !this._wrapper ) {
			return;
		}

		this._wrapper.remove();
		this._wrapper = null;

		// Restore visibility of all other elements in the container.
		for ( const element of this._editor.config.get( 'fullscreen.container' )!.children ) {
			( element as HTMLElement ).style.display = '';
		}
	}

	/**
	 * Checks if the PresenceListUI plugin is available and moves its elements to fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _generatePresenceListContainer(): void {
		const presenceListElement = createElement( document, 'div', {
			class: 'ck ck-fullscreen__left-sidebar-item'
		} );

		presenceListElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header">Connected users</div>
			<div class="ck ck-fullscreen__presence-list" data-ck-fullscreen="presence-list"></div>
		`;

		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( presenceListElement );

		const presenceListUI = this._editor.plugins.get( 'PresenceListUI' ) as PresenceListUI;

		this.moveToFullscreen( presenceListUI.view.element!, 'presence-list' );
	}

	/**
	 * Checks if the DocumentOutlineUI plugin is available and moves its elements to fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _generateDocumentOutlineContainer(): void {
		const documentOutlineHeaderElement = createElement( document, 'div', {
			class: 'ck-fullscreen__left-sidebar-item ck-fullscreen__left-sidebar-item--no-margin'
		} );

		documentOutlineHeaderElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header ck-fullscreen__document-outline-header">
				Document outline
			</div>
		`;

		const documentOutlineBodyWrapper = createElement( document, 'div', {
			class: 'ck ck-fullscreen__left-sidebar-item ck-fullscreen__document-outline-wrapper'
		} );

		documentOutlineBodyWrapper.innerHTML = `
			<div class="ck ck-fullscreen__document-outline" data-ck-fullscreen="document-outline"></div>
		`;

		document.querySelector( '[data-ck-fullscreen="left-sidebar"]' )!.appendChild( documentOutlineBodyWrapper );
		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( documentOutlineHeaderElement );

		const documentOutlineUI = this._editor.plugins.get( 'DocumentOutlineUI' ) as DocumentOutlineUI;
		documentOutlineUI.view.documentOutlineContainer = document.querySelector( '[data-ck-fullscreen="left-sidebar"]' ) as HTMLElement;

		this.moveToFullscreen( documentOutlineUI.view.element!, 'document-outline' );
	}

	/**
	 * Restores the default value of documentOutlineContainer, which is modified in fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _restoreDocumentOutlineDefaultContainer(): void {
		const documentOutlineUI = this._editor.plugins.get( 'DocumentOutlineUI' ) as DocumentOutlineUI;
		documentOutlineUI.view.documentOutlineContainer = documentOutlineUI.view.element as HTMLElement;
	}

	/**
	 * Stores the current state of the annotations UIs to restore it when leaving fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _overrideAnnotationsUIs() {
		const annotationsUIs = this._editor.plugins.get( 'AnnotationsUIs' ) as AnnotationsUIs;

		this._annotationsUIsData = new Map( annotationsUIs.uisData );

		// Switch to the wide sidebar.
		const sidebarPlugin = this._editor.plugins.get( 'Sidebar' ) as Sidebar;

		if ( !sidebarPlugin.container ) {
			sidebarPlugin.setContainer(
				this.getWrapper().querySelector( '[data-ck-fullscreen="right-sidebar"]' ) as HTMLElement
			);
		}

		const annotationsFilters = new Map<string, ( annotation: Annotation ) => boolean>();

		for ( const [ uiName, data ] of [ ...this._annotationsUIsData! ] ) {
			// Default filter is `() => true`. Only store filters that are different.
			if ( data.filter.toString() !== '() => true' ) {
				annotationsFilters.set( uiName, data.filter );
			}
		}

		annotationsUIs.deactivateAll();

		// Check if someone has a filter defined for `wideSidebar`. If so, retrieve and apply it in fullscreen. Do not show any other UI.
		if ( annotationsFilters.has( 'wideSidebar' ) ) {
			annotationsUIs.activate( 'wideSidebar', annotationsFilters.get( 'wideSidebar' ) );
		}
		// If no filter is defined for `wideSidebar`, read the filters for the active display(s) mode and apply them.
		// It's possible there are filters for both `narrowSidebar` and `inline` modes, so display annotations that match any of them.
		else if ( annotationsFilters.size ) {
			annotationsUIs.activate( 'wideSidebar',
				annotation => [ ...annotationsFilters.values() ].some( filter => filter( annotation ) )
			);
		}
		// If no filters are defined for the active display mode(s), simply display all annotations in the wide sidebar.
		else {
			annotationsUIs.switchTo( 'wideSidebar' );
		}

		this.moveToFullscreen( ( sidebarPlugin.container!.firstElementChild as HTMLElement ), 'right-sidebar' );
	}

	/**
	 * Restores the saved state of the annotations UIs.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _restoreAnnotationsUIs() {
		const annotationsUIs = this._editor.plugins.get( 'AnnotationsUIs' ) as AnnotationsUIs;

		annotationsUIs.deactivateAll();

		for ( const [ uiName, data ] of [ ...this._annotationsUIsData! ] ) {
			annotationsUIs.activate( uiName, data.filter );
		}

		this._annotationsUIsData = null;
	}

	/**
	 * Modifies the revision history viewer callbacks to display the viewer in the fullscreen mode.
	 */
	private _overrideRevisionHistoryCallbacks(): void {
		// * Hide editor's editable, toolbar and sidebar;
		// * Disable menu bar;
		// * Show revision viewer editable, toolbar and sidebar.
		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.showRevisionViewerCallback', async () => {
			const revisionViewer = await this._showRevisionViewerCallback!();

			if ( this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
				( this.getWrapper().querySelector( '.ck-fullscreen__document-outline-header' ) as HTMLElement ).style.display = 'none';
			}

			this.restoreMovedElementLocation( 'editable' );
			this.restoreMovedElementLocation( 'toolbar' );
			this.restoreMovedElementLocation( 'right-sidebar' );

			if ( this._annotationsUIsData ) {
				this._restoreAnnotationsUIs();
			}

			if ( this._editor.ui.view.menuBarView ) {
				this._editor.ui.view.menuBarView.disable();
			}

			this.moveToFullscreen( revisionViewer!.ui.getEditableElement()!, 'editable' );
			this.moveToFullscreen( revisionViewer!.ui.view.toolbar.element!, 'toolbar' );
			this.moveToFullscreen( this._editor.config.get( 'revisionHistory.viewerSidebarContainer' )!, 'right-sidebar' );

			return revisionViewer;
		} );

		// * Hide revision viewer editable, toolbar and sidebar;
		// * Enable menu bar;
		// * Show editor's editable, toolbar and sidebar.
		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.closeRevisionViewerCallback', async () => {
			this.restoreMovedElementLocation( 'toolbar' );
			this.restoreMovedElementLocation( 'editable' );
			this.restoreMovedElementLocation( 'right-sidebar' );

			if ( this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
				( this.getWrapper().querySelector( '.ck-fullscreen__document-outline-header' ) as HTMLElement ).style.display = '';
			}

			await this._closeRevisionViewerCallback!();

			this.moveToFullscreen( this._editor.ui.getEditableElement()!, 'editable' );
			this.moveToFullscreen( this._editor.ui.view.toolbar!.element!, 'toolbar' );

			if ( this._editor.plugins.has( 'AnnotationsUIs' ) ) {
				this._overrideAnnotationsUIs();
			}

			if ( this._editor.ui.view.menuBarView ) {
				this._editor.ui.view.menuBarView.enable();
			}
		} );
	}

	/**
	 *	Resets the revision history viewer callbacks to their original values.
	 */
	private _restoreRevisionHistoryCallbacks(): void {
		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.showRevisionViewerCallback', async () => {
			return this._showRevisionViewerCallback!();
		} );

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.closeRevisionViewerCallback', async () => {
			return this._closeRevisionViewerCallback!();
		} );
	}

	/**
	 * Adds an event listener when the dialog opens to adjust its position in fullscreen mode,
	 * utilizing the empty space on the right side of the editable element.
	 */
	private _registerFullscreenDialogPositionAdjustments(): void {
		const dialog = this._editor.plugins.get( 'Dialog' );

		this._setNewDialogPosition();

		dialog.on( 'change:isOpen', this.updateDialogPositionCallback, { priority: 'highest' } );
	}

	/**
	 * Removes an event listener that adjusts the dialog's position in fullscreen mode.
	 */
	private _unregisterFullscreenDialogPositionAdjustments(): void {
		const dialog = this._editor.plugins.get( 'Dialog' );
		const dialogView = dialog.view;

		if ( dialogView && dialogView.position === null ) {
			dialogView.position = DialogViewPosition.EDITOR_TOP_SIDE;
		}

		if ( dialogView ) {
			dialogView.updatePosition();
		}

		dialog.off( 'change:isOpen', this.updateDialogPositionCallback );
	}

	/**
	 * Stores a bound reference to the _updateDialogPosition method, allowing it to be attached and detached from change event.
	 */
	public updateDialogPositionCallback = this._updateDialogPosition.bind( this );

	/**
	 * If dialog is open, adjust its positioning.
	 */
	private _updateDialogPosition( _evt: EventInfo, _name: string, isOpen: boolean ): void {
		if ( isOpen ) {
			this._setNewDialogPosition();
		}
	}

	/**
	 * Adjusts the dialog position to utilize the empty space on the right side of the editable.
	 * The new dialog position should be on the right side of the fullscreen view with a 30px margin.
	 * Only dialogs with the position set to "editor-top-side" should have their position changed.
	 */
	private _setNewDialogPosition(): void {
		const dialog = this._editor.plugins.get( 'Dialog' );
		const dialogView = dialog.view!;

		if ( !dialogView || dialogView.position !== DialogViewPosition.EDITOR_TOP_SIDE ) {
			return;
		}

		const fullscreenViewContainerRect = new Rect( this._wrapper! ).getVisible();
		const editorContainerRect = new Rect( document.querySelector( '.ck-fullscreen__editable' ) as HTMLElement ).getVisible();
		const dialogRect = new Rect( dialogView.element!.querySelector( '.ck-dialog' ) as HTMLElement ).getVisible();
		const scrollOffset = new Rect( document.querySelector( '.ck-fullscreen__editable-wrapper' ) as HTMLElement )
			.excludeScrollbarsAndBorders().getVisible()!.width -
			new Rect( document.querySelector( '.ck-fullscreen__editable-wrapper' ) as HTMLElement ).getVisible()!.width;

		if ( fullscreenViewContainerRect && editorContainerRect && dialogRect ) {
			dialogView.position = null;

			dialogView.moveTo(
				fullscreenViewContainerRect.left + fullscreenViewContainerRect.width - dialogRect.width - DIALOG_OFFSET + scrollOffset,
				editorContainerRect.top
			);
		}
	}
}
