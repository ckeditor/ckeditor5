/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { createElement } from 'ckeditor5/src/utils.js';
import { PresenceListUI } from '@ckeditor/ckeditor5-real-time-collaboration';
import { DocumentOutlineUI } from '@ckeditor/ckeditor5-document-outline';
import type { ElementApi, Editor, EditorConfig } from 'ckeditor5/src/core.js';
import type { PaginationRenderer } from '@ckeditor/ckeditor5-pagination';
import type { RevisionViewerEditor } from '@ckeditor/ckeditor5-revision-history';
import type { Annotation, AnnotationsUIs, Sidebar } from '@ckeditor/ckeditor5-comments';

/**
 * The abstract editor type handler. It should be extended by the particular editor type handler.
 */
export default class AbstractEditorHandler {
	/**
	 * Maps placeholder names to placeholder elements and moved elements.
	 */
	private _placeholderMap: Map<string, { placeholderElement: HTMLElement; movedElement: HTMLElement }>;

	/**
	 * The container element that holds the fullscreen mode layout.
	 */
	private _container: HTMLElement | null = null;

	/**
	 * The document object in which the editor is located.
	 */
	private _document: Document;

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
	 * Data of the annotations UIs that were active before entering the fullscreen mode.
	 */
	protected annotationsUIsData: Map<string, Record<string, any>> | null = null;

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
		this._document = this._editor.sourceElement!.ownerDocument;
		this._editor.config.define( 'fullscreen.container', this._document.body );

		this._defaultEnable = () => this.getContainer();
		editor.on( 'destroy', () => {
			this.disable();
		} );
	}

	/**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */
	public moveToFullscreen( elementToMove: HTMLElement, placeholderName: string ): void {
		const placeholderElement = createElement( this._document, 'div' );

		placeholderElement.setAttribute( 'data-ck-fullscreen-placeholder', placeholderName );
		elementToMove.replaceWith( placeholderElement );

		this.getContainer().querySelector( `[data-ck-fullscreen="${ placeholderName }"]` )!.append( elementToMove );

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
	public getContainer(): HTMLElement {
		if ( !this._container ) {
			this._container = createElement( this._document, 'div', {
				class: 'ck ck-fullscreen__main-container'
			} );

			this._container.innerHTML = `
				<div class="ck ck-fullscreen__top-wrapper ck-reset_all">
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editable-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div>
					</div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable"></div>
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="right-sidebar"></div>
				</div>
				<div class="ck ck-fullscreen__bottom-wrapper">
					<div class="ck ck-fullscreen__body-wrapper" data-ck-fullscreen="body-wrapper"></div>
				</div>
			`;

			this._editor.config.get( 'fullscreen.container' )!.appendChild( this._container );
		}

		return this._container;
	}

	/**
	 * Enables the fullscreen mode. It executes the editor-specific enable handler and then the configured callback.
	 */
	public enable(): void {
		this._defaultEnable();

		this._generatePresenceListElement();
		this._generateDocumentOutlineElement();

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

		if ( this._editor.config.get( 'fullscreen.enableCallback' ) ) {
			this._editor.config.get( 'fullscreen.enableCallback' )!( this.getContainer() );
		}
	}

	/**
	 * Disables the fullscreen mode by restoring all moved elements and destroying the fullscreen container.
	 */
	public disable(): void {
		if ( this._editor.config.get( 'fullscreen.disableCallback' ) ) {
			this._editor.config.get( 'fullscreen.disableCallback' )!();
		}

		this.restoreDocumentOutlineDefaultContainer();

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this.annotationsUIsData ) {
			this._restoreAnnotationsUIs();
		}

		if ( this._editor.plugins.has( 'RevisionHistory' ) ) {
			this._restoreRevisionHistoryCallbacks();
		}

		for ( const placeholderName of this._placeholderMap.keys() ) {
			this.restoreMovedElementLocation( placeholderName );
		}

		if ( this._placeholderMap.size === 0 ) {
			this._destroyContainer();
		}
	}

	/**
	 * Destroys the fullscreen mode container.
	 */
	private _destroyContainer(): void {
		if ( !this._container ) {
			return;
		}

		this._container.remove();
		this._container = null;

		// Code coverage is provided in the commercial package repository as integration unit tests.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'Pagination' ) ) {
			( this._editor.plugins.get( 'PaginationRenderer' ) as PaginationRenderer ).setupScrollableAncestor();
		}
	}

	/**
	 * Checks if the PresenceList plugin is available and moves its elements to fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _generatePresenceListElement(): void {
		if ( !this._editor.plugins.has( 'PresenceListUI' ) ) {
			return;
		}

		const presenceListElement = createElement( document, 'div', {
			class: 'ck ck-fullscreen__left-sidebar-item'
		} );

		presenceListElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header">Connected users</div>
			<div class="ck ck-fullscreen__presence-list" data-ck-fullscreen="presence-list"></div>
		`;

		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( presenceListElement );

		const presenceListUI: PresenceListUI = this._editor.plugins.get( PresenceListUI );

		this.moveToFullscreen( presenceListUI.view.element!, 'presence-list' );
	}

	/**
	 * Checks if the DocumentOutline plugin is available and moves its elements to fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _generateDocumentOutlineElement(): void {
		if ( !this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			return;
		}

		const documentOutlineHeaderElement = createElement( document, 'div', {
			class: 'ck-fullscreen__left-sidebar-item ck-fullscreen__left-sidebar-item--no-margin'
		} );

		documentOutlineHeaderElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header ck-fullscreen__document-outline-header">
				Document outline
			</div>
		`;

		const documentOutlineBodyElement = createElement( document, 'div', {
			class: 'ck ck-fullscreen__left-sidebar-item ck-fullscreen__document-outline-wrapper'
		} );

		documentOutlineBodyElement.innerHTML = `
			<div class="ck ck-fullscreen__document-outline" data-ck-fullscreen="document-outline"></div>
		`;

		document.querySelector( '[data-ck-fullscreen="left-sidebar"]' )!.appendChild( documentOutlineBodyElement );
		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( documentOutlineHeaderElement );

		const documentOutlineUI: DocumentOutlineUI = this._editor.plugins.get( DocumentOutlineUI );
		documentOutlineUI.view.documentOutlineContainer = document.querySelector( '[data-ck-fullscreen="left-sidebar"]' ) as HTMLElement;

		this.moveToFullscreen( documentOutlineUI.view.element!, 'document-outline' );
	}

	/**
	 * Restores the default value of documentOutlineContainer, which is modified in fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	public restoreDocumentOutlineDefaultContainer(): void {
		if ( !this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			return;
		}

		const documentOutlineUI: DocumentOutlineUI = this._editor.plugins.get( DocumentOutlineUI );
		documentOutlineUI.view.documentOutlineContainer = documentOutlineUI.view.element as HTMLElement;
	}

	/**
	 * Stores the current state of the annotations UIs to restore it when leaving fullscreen mode.
	 */
	// Code coverage is provided in the commercial package repository as integration unit tests.
	/* istanbul ignore next -- @preserve */
	private _overrideAnnotationsUIs() {
		const annotationsUIs = this._editor.plugins.get( 'AnnotationsUIs' ) as AnnotationsUIs;

		this.annotationsUIsData = new Map( annotationsUIs.uisData );

		// Switch to the wide sidebar.
		const sidebarPlugin = this._editor.plugins.get( 'Sidebar' ) as Sidebar;

		if ( !sidebarPlugin.container ) {
			sidebarPlugin.setContainer(
				this.getContainer().querySelector( '[data-ck-fullscreen="right-sidebar"]' ) as HTMLElement
			);
		}

		const annotationsFilters = new Map<string, ( annotation: Annotation ) => boolean>();

		for ( const [ uiName, data ] of [ ...this.annotationsUIsData! ] ) {
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

		for ( const [ uiName, data ] of [ ...this.annotationsUIsData! ] ) {
			annotationsUIs.activate( uiName, data.filter );
		}

		this.annotationsUIsData = null;
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

			this.restoreMovedElementLocation( 'editable' );
			this.restoreMovedElementLocation( 'toolbar' );
			this.restoreMovedElementLocation( 'right-sidebar' );

			if ( this.annotationsUIsData ) {
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
}
