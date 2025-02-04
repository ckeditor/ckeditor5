/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { CKEditorError, createElement } from 'ckeditor5/src/utils.js';
import { type Editor } from 'ckeditor5/src/core.js';

/**
 * The abstract editor type handler. It should be extended by the particular editor type handler.
 */
export default class AbstractEditorHandler {
	/**
	 * An editor instance. It should be overriden by the particular editor type handler.
	 */
	declare protected _editor: Editor;

	/**
	 * The container element that holds the fullscreen mode layout.
	 * It's independent of the editor type.
	 */
	declare public _container: HTMLElement | null;

	/**
	 * Map of moved elements (moved -> placeholder).
	 *
	 * @private
	*/
	declare private _movedElements: Map<HTMLElement, HTMLElement>;

	/**
	 * @inheritDoc
	 */
	constructor() {
		this._movedElements = new Map();
	}

	/**
	 * Moves the given element to the fullscreen mode container, leaving a placeholder in its place.
	 */
	public moveToFullscreen( elementToMove: HTMLElement, placeholderName: string ): void {
		const placeholderElement = createElement( document, 'div' );

		elementToMove.replaceWith( placeholderElement );

		this.getContainer().querySelector( `[data-ck-fullscreen-placeholder="${ placeholderName }"]` )!.append( elementToMove );

		this._movedElements.set( elementToMove, placeholderElement );
	}

	/**
	 * Returns the moved elements to their original places.
	 */
	public returnMovedElements(): void {
		this._movedElements.forEach( ( placeholder, moved ) => {
			placeholder.replaceWith( moved );
			placeholder.remove();
		} );

		this._movedElements.clear();

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
					<div class="ck ck-fullscreen__menu-bar" data-ck-fullscreen-placeholder="menu-bar"></div>
					<div class="ck ck-fullscreen__toolbar" data-ck-fullscreen-placeholder="toolbar"></div>
				</div>
				<div class="ck ck-fullscreen__editor-wrapper">
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen-placeholder="left-sidebar"></div>
					<div class="ck ck-fullscreen__editor" data-ck-fullscreen-placeholder="editor"></div>
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen-placeholder="right-sidebar"></div>
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
}
