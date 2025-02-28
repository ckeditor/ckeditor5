/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen/handlers/abstracteditorhandler
 */

import { PresenceListUI } from '@ckeditor/ckeditor5-real-time-collaboration';
import { DocumentOutlineUI } from '@ckeditor/ckeditor5-document-outline';
import { type EventInfo, createElement, Rect } from 'ckeditor5/src/utils.js';
import { type Editor } from 'ckeditor5/src/core.js';
import { DialogViewPosition, type Dialog } from 'ckeditor5/src/ui.js';

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
					<div class="ck ck-fullscreen__sidebar ck-fullscreen__left-sidebar" data-ck-fullscreen="left-sidebar">
						<div class="ck ck-fullscreen__left-sidebar--sticky" data-ck-fullscreen="left-sidebar-sticky"></div>
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
		this._defaultEnable();

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

		this._movedElements.forEach( ( placeholder, moved ) => {
			placeholder.replaceWith( moved );
			placeholder.remove();
		} );

		this._movedElements.clear();

		if ( this._container ) {
			this._container.remove();
			this._container = null;
		}

		this.unregisterFullscreenDialogPositionAdjustements();
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
