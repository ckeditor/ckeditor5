/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { PresenceListUI } from '@ckeditor/ckeditor5-real-time-collaboration';
import { DocumentOutlineUI } from '@ckeditor/ckeditor5-document-outline';
import type { Editor, EditorConfig } from 'ckeditor5/src/core.js';
import type { RevisionViewerEditor } from '@ckeditor/ckeditor5-revision-history';
import type { Annotation, AnnotationsUIs, Sidebar } from '@ckeditor/ckeditor5-comments';
import { type EventInfo, createElement, Rect } from 'ckeditor5/src/utils.js';
import { DialogViewPosition, type Dialog } from 'ckeditor5/src/ui.js';

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
	 * It's independent of the editor type.
	 */
	private _container: HTMLElement | null = null;

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
	declare protected _editor: Editor;

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
		this._defaultEnable = () => this.getContainer();
		editor.on( 'destroy', () => {
			this.disable();
		} );
	}

	/**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */
	public moveToFullscreen( elementToMove: HTMLElement, placeholderName: string ): void {
		const placeholderElement = createElement( document, 'div' );

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
			this._container = createElement( document, 'div', {
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
			`;

			document.body.appendChild( this._container );
		}

		return this._container;
	}

	/**
	 * Enables the fullscreen mode. It executes the editor-specific enable handler and then the configured callback.
	 */
	public enable(): void {
		this._defaultEnable();

		this.generatePresenceListElement();
		this.generateDocumentOutlineElement();
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
		if ( this._container ) {
			this._container.remove();
			this._container = null;
		}

		this.unregisterFullscreenDialogPositionAdjustements();
	}

	/* istanbul ignore next -- @preserve */
	public generatePresenceListElement(): void {
		if ( !this._editor.plugins.has( 'PresenceListUI' ) ) {
			return;
		}

		const presneceListElement = createElement( document, 'div', {
			class: 'ck ck-fullscreen__left-sidebar-item'
		} );

		presneceListElement.innerHTML = `
			<div class="ck ck-fullscreen__left-sidebar-header">Connected users</div>
			<div class="ck ck-fullscreen__presence-list" data-ck-fullscreen="presence-list"></div>
		`;

		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( presneceListElement );

		const presenceListUI: PresenceListUI = this._editor.plugins.get( PresenceListUI );

		this.moveToFullscreen( presenceListUI.view.element!, 'presence-list' );
	}

	/* istanbul ignore next -- @preserve */
	public generateDocumentOutlineElement(): void {
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
		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.showRevisionViewerCallback', async () => {
			return this._showRevisionViewerCallback!();
		} );

		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.closeRevisionViewerCallback', async () => {
			return this._closeRevisionViewerCallback!();
		} );
	}

	/**
	 * Adds an event listener when the dialog opens to adjust its position in fullscreen mode,
	 * utilizing the empty space on the right side of the editable element.
	 */
	public registerFullscreenDialogPositionAdjustements(): void {
		if ( !this._editor.plugins.has( 'Dialog' ) ) {
			return;
		}

		const dialog = this._editor.plugins.get( 'Dialog' ) as Dialog;

		this.setNewDialogPosition();

		dialog.on( 'change:isOpen', this.updateDialogPositionCallback, { priority: 'highest' } );
	}

	/**
	 * Removes an event listener that adjusts the dialog's position in fullscreen mode.
	 */
	public unregisterFullscreenDialogPositionAdjustements(): void {
		if ( !this._editor.plugins.has( 'Dialog' ) ) {
			return;
		}

		const dialog = this._editor.plugins.get( 'Dialog' ) as Dialog;
		const dialogView = dialog.view;

		if ( dialogView && dialogView.position === null ) {
			dialogView.position = DialogViewPosition.EDITOR_TOP_SIDE;
		}

		dialogView?.updatePosition();

		dialog.off( 'change:isOpen', this.updateDialogPositionCallback );
	}

	public updateDialogPositionCallback = this.updateDialogPosition.bind( this );

	/**
	 * An event triggered on dialog opening that sets a new position or restores previous values.
	 */
	private updateDialogPosition( _evt: EventInfo, _name: string, isOpen: boolean ): void {
		if ( isOpen ) {
			this.setNewDialogPosition();
		} else {
			const dialog = this._editor.plugins.get( 'Dialog' ) as Dialog;
			const dialogView = dialog.view;

			if ( dialogView?.position === null ) {
				dialogView.position = DialogViewPosition.EDITOR_TOP_SIDE;
			}
		}
	}

	/**
	 * Adjusts the dialog position to utilize the empty space on the right side of the editable.
	 * The new dialog position should be on the right side of the fullscreen view with a 30px margin.
	 * Only dialogs with the position set to "editor-top-side" should have their position changed.
	 */
	public setNewDialogPosition(): void {
		if ( !this._editor.plugins.has( 'Dialog' ) ) {
			return;
		}

		const dialog = this._editor.plugins.get( 'Dialog' ) as Dialog;
		const dialogView = dialog.view!;

		if ( !dialogView || dialogView.position !== DialogViewPosition.EDITOR_TOP_SIDE ) {
			return;
		}

		const fullscreenViewContainerRect = this._getVisibleContainerRect( this._container! );
		const editorContainerRect = this._getVisibleContainerRect( document.querySelector( '.ck-fullscreen__editor' )! );
		const dialogRect = this._getVisibleContainerRect( dialogView.element!.querySelector( '.ck-dialog' ) as HTMLElement );

		if ( fullscreenViewContainerRect && editorContainerRect && dialogRect ) {
			const DIALOG_OFFSET = 30;
			dialogView.position = null;

			dialogView.moveTo(
				fullscreenViewContainerRect.left + fullscreenViewContainerRect.width - dialogRect.width - DIALOG_OFFSET,
				editorContainerRect.top + DIALOG_OFFSET
			);
		}
	}

	private _getVisibleContainerRect( container: HTMLElement ): Rect | null {
		return new Rect( container )?.getVisible();
	}
}
