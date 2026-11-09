/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { BlockToolbar, BalloonToolbar } from '@ckeditor/ckeditor5-ui';

declare global {
	interface Window { editor: any }
}

type FrameMode = 'dialog' | 'popover' | 'fixed';

/**
 * Renders its children through a slot inside a modal `<dialog>`, a popover, or a `position: fixed` panel. The slot
 * is placed in one of them by `open()`, so the children are not rendered until then.
 */
class FixedFrameElement extends HTMLElement {
	private readonly _dialog = document.createElement( 'dialog' );
	private readonly _panel = document.createElement( 'div' );
	private readonly _closeButton = document.createElement( 'button' );
	private readonly _slot = document.createElement( 'slot' );

	constructor() {
		super();

		const style = document.createElement( 'style' );

		// The margin keeps the frame away from the viewport's corner, so a result offset by its position is visible.
		style.textContent = `
			dialog, .panel { margin: 60px 80px; padding: 20px; border: 4px solid #1a73e8; width: 600px; }
			.panel { position: fixed; top: 0; left: 0; background: #fff; }
			.panel:not( .open ):not( :popover-open ) { display: none; }
		`;

		this._closeButton.type = 'button';
		this._closeButton.textContent = 'Close';
		this._closeButton.addEventListener( 'click', () => this.close() );

		this._panel.className = 'panel';

		this.attachShadow( { mode: 'open' } ).append( style, this._dialog, this._panel );
	}

	public open( mode: FrameMode ): void {
		this.close();

		const container = mode === 'dialog' ? this._dialog : this._panel;

		container.append( this._closeButton, this._slot );

		if ( mode === 'dialog' ) {
			this._dialog.showModal();
		} else if ( mode === 'popover' ) {
			this._panel.setAttribute( 'popover', 'manual' );
			this._panel.showPopover();
		} else {
			this._panel.classList.add( 'open' );
		}
	}

	public close(): void {
		if ( this._dialog.open ) {
			this._dialog.close();
		}

		if ( this._panel.matches( '[popover]' ) ) {
			this._panel.hidePopover();
			this._panel.removeAttribute( 'popover' );
		}

		this._panel.classList.remove( 'open' );
	}
}

customElements.define( 'ck-manual-fixed-frame', FixedFrameElement );

const frame = document.querySelector( 'ck-manual-fixed-frame' ) as FixedFrameElement;

for ( const button of document.querySelectorAll<HTMLButtonElement>( 'button[data-mode]' ) ) {
	button.addEventListener( 'click', () => frame.open( button.dataset.mode as FrameMode ) );
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		plugins: [ ArticlePluginSet, BlockToolbar, BalloonToolbar ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|', 'undo', 'redo' ],
		blockToolbar: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList', 'blockQuote' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		ui: {
			overlayContainer: document.querySelector( '#overlay-container' ) as HTMLElement
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
