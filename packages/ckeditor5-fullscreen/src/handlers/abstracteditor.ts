/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { createElement } from 'ckeditor5/src/utils.js';
import { type Editor } from 'ckeditor5/src/core.js';
import type { AnnotationsUIs, Sidebar } from '@ckeditor/ckeditor5-comments';

/**
 * The abstract editor type handler. It should be extended by the particular editor type handler.
 */
export default class AbstractEditorHandler {
	/**
	 * Map of moved elements (moved -> placeholder).
	 */
	private _movedElements: Map<HTMLElement, HTMLElement>;

	/**
	 * The container element that holds the fullscreen mode layout.
	 * It's independent of the editor type.
	 */
	private _container: HTMLElement | null = null;

	/**
	 * A function moving the editor UI elements to the fullscreen mode. It should be set by the particular editor type handler.
	 * Returns the fullscreen mode container element so it can be further customized via `fullscreen.enableCallback` configuration property.
	*/
	protected _defaultEnable: () => HTMLElement;

	/**
	 * An editor instance. It should be set by the particular editor type handler.
	 */
	declare protected _editor: Editor;

	/**
	 * Data of the annotations UIs that were active before entering the fullscreen mode.
	 */
	protected annotationsUIsData: Map<string, Record<string, any>> | null = null;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		this._movedElements = new Map();
		this._editor = editor;

		this._defaultEnable = () => this.getContainer();

		this._editor.on( 'destroy', () => {
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

		this._movedElements.set( elementToMove, placeholderElement );
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
					<div class="ck ck-fullscreen__sidebar" data-ck-fullscreen="left-sidebar"></div>
					<div class="ck ck-fullscreen__editor" data-ck-fullscreen="editor"></div>
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

		// Store the current state of the annotations UIs to restore it when leaving fullscreen mode.
		/* istanbul ignore if -- @preserve */
		if ( this._editor.plugins.has( 'AnnotationsUIs' ) ) {
			this._overrideAnnotationsUIs();
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

		// Restore previous state of the annotations UIs.
		/* istanbul ignore if -- @preserve */
		if ( this.annotationsUIsData ) {
			this._restoreAnnotationsUIs();
		}

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
	 * Stores the current state of the annotations UIs to restore it when leaving fullscreen mode.
	 */
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

		annotationsUIs.switchTo( 'wideSidebar' );

		this.moveToFullscreen( ( sidebarPlugin.container!.firstElementChild as HTMLElement ), 'right-sidebar' );
	}

	/**
	 * Restores the saved state of the annotations UIs.
	 */
	private _restoreAnnotationsUIs() {
		const annotationsUIs = this._editor.plugins.get( 'AnnotationsUIs' ) as AnnotationsUIs;

		annotationsUIs.deactivateAll();

		for ( const [ uiName, data ] of [ ...this.annotationsUIsData! ] ) {
			annotationsUIs.activate( uiName, data.filter );
		}

		this.annotationsUIsData = null;
	}
}
