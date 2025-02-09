/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { CKEditorError, createElement } from 'ckeditor5/src/utils.js';
import type { Editor, EditorConfig } from 'ckeditor5/src/core.js';
import type { RevisionViewerEditor } from '@ckeditor/ckeditor5-revision-history';

/**
 * The abstract editor type handler. It should be extended by the particular editor type handler.
 */
export default class AbstractEditorHandler {
	/**
	 * Maps placeholder elements to moved elements.
	 */
	private _placeholderToElement: Map<HTMLElement, HTMLElement>;

	/**
	 * Maps placeholder names to placeholder elements.
	 */
	private _idToPlaceholder: Map<string, HTMLElement>;

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
	 * An editor instance. It should be set by the particular editor type handler.
	 */
	declare protected _editor: Editor;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		this._placeholderToElement = new Map();
		this._idToPlaceholder = new Map();
		this._editor = editor;

		editor.on( 'destroy', () => {
			this.returnMovedElements();
		} );

		if ( editor.plugins.has( 'RevisionHistory' ) ) {
			this._showRevisionViewerCallback = editor.config.get( 'revisionHistory.showRevisionViewerCallback' )!;
			this._closeRevisionViewerCallback = editor.config.get( 'revisionHistory.closeRevisionViewerCallback' )!;
		}
	}

	/**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */
	public moveToFullscreen( elementToMove: HTMLElement, placeholderName: string ): void {
		const placeholderElement = createElement( document, 'div' );

		placeholderElement.setAttribute( 'data-ck-fullscreen-placeholder', placeholderName );
		elementToMove.replaceWith( placeholderElement );

		this.getContainer().querySelector( `[data-ck-fullscreen="${ placeholderName }"]` )!.append( elementToMove );

		this._placeholderToElement.set( placeholderElement, elementToMove );
		this._idToPlaceholder.set( placeholderName, placeholderElement );
	}

	/**
	 * Returns a single moved element to its original place.
	 */
	public returnMovedElement( placeholderName: string ): void {
		const placeholder = this._idToPlaceholder.get( placeholderName )!;
		const element = this._placeholderToElement.get( placeholder );

		if ( element ) {
			placeholder.replaceWith( element );
			placeholder.remove();

			this._idToPlaceholder.delete( placeholderName );
			this._placeholderToElement.delete( placeholder );
		}

		if ( this._idToPlaceholder.size === 0 ) {
			this._destroyContainer();
		}
	}

	/**
	 * Returns the moved elements to their original places.
	 */
	public returnMovedElements(): void {
		for ( const placeholderName of this._idToPlaceholder.keys() ) {
			this.returnMovedElement( placeholderName );
		}

		if ( this._idToPlaceholder.size === 0 ) {
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
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="left-sidebar"></div>
					<div class="ck ck-fullscreen__editable" data-ck-fullscreen="editable"></div>
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="right-sidebar"></div>
				</div>
			`;

			document.body.appendChild( this._container );
		}

		return this._container;
	}

	/**
	 * Enables the fullscreen mode. This is a virtual method that should be overridden by the particular editor type handler.
	 */
	public enable(): void {
		/**
		 * Invalid editor type. Fullscreen mode is compatible only with the classic and decoupled editors.
		 *
		 * @error fullscreen-invalid-editor-type
		 */
		throw new CKEditorError( 'fullscreen-invalid-editor-type', this._editor );
	}

	/**
	 * Disables the fullscreen mode. This is a virtual method that should be overridden by the particular editor type handler.
	 */
	public disable(): void {
		/**
		 * Invalid editor type. Fullscreen mode is compatible only with the classic and decoupled editors.
		 *
		 * @error fullscreen-invalid-editor-type
		 */
		throw new CKEditorError( 'fullscreen-invalid-editor-type', this._editor );
	}

	/**
	 * Destroys the fullscreen mode container.
	 */
	private _destroyContainer(): void {
		if ( this._container ) {
			this._container.remove();
			this._container = null;
		}
	}

	/**
	 * Modifies the revision history viewer callbacks to display the viewer in the fullscreen mode.
	 */
	protected _overrideRevisionHistoryCallbacks(): void {
		/* istanbul ignore next -- @preserve */
		// * Hide editor's editable and toolbar;
		// * Disable menu bar;
		// * Show revision viewer editable, toolbar and sidebar.
		this._editor.config.set( 'revisionHistory.showRevisionViewerCallback', async () => {
			const revisionViewer = await this._showRevisionViewerCallback!();

			this.returnMovedElement( 'editable' );
			this.returnMovedElement( 'toolbar' );

			if ( this._editor.ui.view.menuBarView ) {
				this._editor.ui.view.menuBarView.disable();
			}

			this.moveToFullscreen( revisionViewer!.ui.getEditableElement()!, 'editable' );
			this.moveToFullscreen( revisionViewer!.ui.view.toolbar.element!, 'toolbar' );
			this.moveToFullscreen( this._editor.config.get( 'revisionHistory.viewerSidebarContainer' )!, 'right-sidebar' );

			return revisionViewer;
		} );

		/* istanbul ignore next -- @preserve */
		// * Hide revision viewer editable, toolbar and sidebar;
		// * Enable menu bar;
		// * Show editor's editable and toolbar.
		this._editor.config.set( 'revisionHistory.closeRevisionViewerCallback', async () => {
			this.returnMovedElement( 'toolbar' );
			this.returnMovedElement( 'editable' );
			this.returnMovedElement( 'right-sidebar' );

			await this._closeRevisionViewerCallback!();

			this.moveToFullscreen( this._editor.ui.getEditableElement()!, 'editable' );
			this.moveToFullscreen( this._editor.ui.view.toolbar!.element!, 'toolbar' );

			if ( this._editor.ui.view.menuBarView ) {
				this._editor.ui.view.menuBarView.enable();
			}
		} );
	}

	/**
	 *	Resets the revision history viewer callbacks to their original values.
	 */
	protected _restoreRevisionHistoryCallbacks(): void {
		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.showRevisionViewerCallback', async () => {
			return this._showRevisionViewerCallback!();
		} );

		/* istanbul ignore next -- @preserve */
		this._editor.config.set( 'revisionHistory.closeRevisionViewerCallback', async () => {
			return this._closeRevisionViewerCallback!();
		} );
	}
}
