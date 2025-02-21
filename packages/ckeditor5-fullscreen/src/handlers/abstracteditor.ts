/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { PresenceListUI } from '@ckeditor/ckeditor5-real-time-collaboration';
import { DocumentOutlineUI } from '@ckeditor/ckeditor5-document-outline';
import { CKEditorError, createElement } from 'ckeditor5/src/utils.js';
import { type Editor } from 'ckeditor5/src/core.js';

/**
 * The abstract editor type handler. It should be extended by the particular editor type handler.
 */
export default class AbstractEditorHandler {
	/**
	 * Map of moved elements (moved -> placeholder).
	 */
	private _movedElements: Map<HTMLElement, HTMLElement>;

	private _idToPlaceholder: Map<string, HTMLElement>;

	/**
	 * The container element that holds the fullscreen mode layout.
	 * It's independent of the editor type.
	 */
	private _container: HTMLElement | null = null;

	/**
	 * An editor instance. It should be set by the particular editor type handler.
	 */
	declare protected _editor: Editor;

	/**
	 * @inheritDoc
	 */
	constructor() {
		this._movedElements = new Map();
		this._idToPlaceholder = new Map();
	}

	/**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */
	public moveToFullscreen( elementToMove: HTMLElement, placeholderName: string ): void {
		const placeholderElement = createElement( document, 'div' );

		placeholderElement.setAttribute( 'data-ck-fullscreen-placeholder', placeholderName );
		elementToMove.replaceWith( placeholderElement );

		this.getContainer().querySelector( `[data-ck-fullscreen="${ placeholderName }"]` )!.append( elementToMove );

		this._movedElements.set( placeholderElement, elementToMove );
		this._idToPlaceholder.set( placeholderName, placeholderElement );
	}

	/**
	 * Returns a single moved element to its original place.
	 */
	public returnMovedElement( placeholderName: string ): void {
		const placeholder = this._idToPlaceholder.get( placeholderName )!;
		const element = this._movedElements.get( placeholder );

		if ( element ) {
			placeholder.replaceWith( element );
			placeholder.remove();

			this._movedElements.delete( placeholder );
		}
	}

	/**
	 * Returns the moved elements to their original places.
	 */
	public returnMovedElements(): void {
		this.restoreDocumentOutlineContainer();

		this._movedElements.forEach( ( moved, placeholder ) => {
			placeholder.replaceWith( moved );
			placeholder.remove();
		} );

		this._movedElements.clear();
		this._idToPlaceholder.clear();

		if ( this._container ) {
			this._container.remove();
			this._container = null;
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
				<div class="ck ck-fullscreen__editor-wrapper">
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div  class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div> 
					</div>
					<div class="ck ck-fullscreen__editor" data-ck-fullscreen="editor"></div>
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

	public generatePresenceListElement(): void {
		if ( !this._editor.plugins.has( 'PresenceListUI' ) ) {
			return;
		}

		const presenceListWrapper = `
			<div class="ck ck-fullscreen__left-sidebar-item">
				<div class="ck ck-fullscreen__left-sidebar-header">Connected users</div>
				<div class="ck ck-fullscreen__presence-list" data-ck-fullscreen="presence-list"></div>
			</div>
		`;

		const fragment = document.createRange().createContextualFragment( presenceListWrapper );

		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( fragment );

		const presenceListUI: PresenceListUI = this._editor.plugins.get( PresenceListUI );

		this.moveToFullscreen( presenceListUI.view.element!, 'presence-list' );
	}

	public generateDocumentOutlineElement(): void {
		if ( !this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			return;
		}

		const documentOutlineHeader = `
		<div class="ck-fullscreen__left-sidebar-item ck-fullscreen__left-sidebar-item--no-margin">
			<div class="ck ck-fullscreen__left-sidebar-header ck-fullscreen__document-outline-header">
				Document Outline
			</div>
		</div>
		`;
		const documentOutlineBody = `
			<div class="ck ck-fullscreen__left-sidebar-item ck-fullscreen__document-outline-wrapper">
				<div class="ck ck-fullscreen__document-outline" data-ck-fullscreen="document-outline"></div>
			</div>
		`;

		const documentOutlineHeaderFragment = document.createRange().createContextualFragment( documentOutlineHeader );
		const documentOutlineBodyFragment = document.createRange().createContextualFragment( documentOutlineBody );

		document.querySelector( '[data-ck-fullscreen="left-sidebar"]' )!.appendChild( documentOutlineBodyFragment );
		document.querySelector( '[data-ck-fullscreen="left-sidebar-sticky"]' )!.appendChild( documentOutlineHeaderFragment );

		const documentOutlineUI: DocumentOutlineUI = this._editor.plugins.get( DocumentOutlineUI );
		documentOutlineUI.view._documentOutlineContainer = document.querySelector( '[data-ck-fullscreen="left-sidebar"]' ) as HTMLElement;

		this.moveToFullscreen( documentOutlineUI.view.element!, 'document-outline' );
	}

	public restoreDocumentOutlineContainer(): void {
		if ( !this._editor.plugins.has( 'DocumentOutlineUI' ) ) {
			return;
		}

		const documentOutlineContainer = this._editor.config.get( 'documentOutline.container' ) as HTMLElement | undefined;
		const documentOutlineUI: DocumentOutlineUI = this._editor.plugins.get( DocumentOutlineUI );

		documentOutlineUI.view._documentOutlineContainer = documentOutlineContainer;
	}
}
