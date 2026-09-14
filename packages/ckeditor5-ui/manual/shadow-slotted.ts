/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { BlockToolbar, BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';

import { forwardStyles, getOverlayConfig, getShadowMode } from './_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

/* The web components ------------------------------------------------------------------------------------ */

// Both components attach their roots in the mode the control persists, so the page can be swept in either.
const shadowMode = getComponentRootMode();

/**
 * The mode both components attach their roots in.
 *
 * The control offers no light DOM mode on this page (`modes="open closed"`), because a `<slot>` needs a shadow
 * root and there is no light DOM variant of this test to run. Checked rather than cast, so a typo in that
 * attribute fails loudly here instead of reaching `attachShadow()` with a mode it rejects.
 */
function getComponentRootMode(): ShadowRootMode {
	const mode = getShadowMode();

	if ( mode === 'none' ) {
		throw new Error( 'shadow-slotted: this test needs a shadow root – the control must offer "open closed".' );
	}

	return mode;
}

// `position: relative` matters: `Rect#getVisible()` skips a clipping parent whose last positioned child is
// `position: absolute` unless the parent is positioned itself (see https://github.com/ckeditor/ckeditor5/issues/14107),
// and a positioned scroll container is what integrators ship anyway.
const FRAME_STYLES = /* css */ `
	:host {
		display: block;
	}

	.frame {
		position: relative;
		max-height: 300px;
		overflow: auto;
		border: 2px solid #7a7ab0;
		border-radius: 4px;
		background: #fff;
	}

	.pad {
		padding: 16px;
	}
`;

const frameStyleSheet = new CSSStyleSheet();

frameStyleSheet.replaceSync( FRAME_STYLES );

/**
 * `<ck-manual-slot-frame>` wraps its `<slot>` in a scrollable frame, the way a slot-based container component
 * with a scrollable body does.
 *
 * Its shadow tree needs no editor theme: slotted content stays in the document tree and keeps being styled by the
 * document stylesheets, which the sheets adopted by a shadow root do not reach.
 */
class SlotFrameElement extends HTMLElement {
	private _rendered = false;

	/**
	 * The scrollable element the editor has to recognise as its scrollable and clipping ancestor.
	 *
	 * Kept as an instance property rather than looked up through `host.shadowRoot`, so it stays reachable from the
	 * console in the closed mode.
	 */
	public frame!: HTMLElement;

	public connectedCallback(): void {
		if ( this._rendered ) {
			return;
		}

		this._rendered = true;

		const shadowRoot = this.attachShadow( { mode: shadowMode } );

		shadowRoot.adoptedStyleSheets = [ frameStyleSheet ];

		const pad = document.createElement( 'div' );

		pad.className = 'pad';
		pad.appendChild( document.createElement( 'slot' ) );

		this.frame = document.createElement( 'div' );
		this.frame.className = 'frame';
		this.frame.appendChild( pad );

		shadowRoot.appendChild( this.frame );
	}
}

/**
 * `<ck-manual-editor-host>` keeps the editor in a shadow root of its own – an editor component, as an integrator
 * would ship one. Slotted into `<ck-manual-slot-frame>` it makes the outward walk cross two boundaries: the
 * `.host` hop out of this root, and then the step into the shadow tree that lays the editor out, which only a
 * walk over the flattened tree takes.
 */
class EditorHostElement extends HTMLElement {
	private _rendered = false;

	/**
	 * The component's own shadow root, where the editor markup goes.
	 */
	public contentTarget!: ShadowRoot;

	public connectedCallback(): void {
		if ( this._rendered ) {
			return;
		}

		this._rendered = true;

		this.contentTarget = this.attachShadow( { mode: shadowMode } );

		// `forwardStyles()` owns the root's adopted sheets, so this component's own `display: block` stays in the
		// page stylesheet, which reaches its host in the light DOM anyway.
		forwardStyles( this.contentTarget );
	}
}

customElements.define( 'ck-manual-slot-frame', SlotFrameElement );
customElements.define( 'ck-manual-editor-host', EditorHostElement );

/* The editor -------------------------------------------------------------------------------------------- */

// Both components come from the page markup, which is where the composition this test is about belongs. Defining
// the elements above upgraded them, so their roots are already attached by the time this runs.
const editorHost = document.querySelector( 'ck-manual-editor-host' ) as EditorHostElement;
const editorTemplate = document.getElementById( 'editor-template' ) as HTMLTemplateElement;

editorHost.contentTarget.appendChild( editorTemplate.content.cloneNode( true ) );

ClassicEditor
	.create( {
		attachTo: editorHost.contentTarget.querySelector( '.editor' ) as HTMLElement,
		plugins: [ ArticlePluginSet, BlockToolbar, BalloonToolbar, FindAndReplace ],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', 'blockQuote',
			'insertTable', '|', 'undo', 'redo', 'findAndReplace'
		],
		blockToolbar: [ 'heading', '|', 'bulletedList', 'numberedList', '|', 'blockQuote' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		image: {
			toolbar: [ 'imageTextAlternative', 'toggleImageCaption' ]
		},
		// A container of its own at the end of `<body>` – a styled shadow root in the modes the control offers –
		// so the floating UI is not clipped away by the frame merely for sitting inside it. Whether a balloon is
		// clipped is then the editor's own answer to "how much of the editable is visible", which is what the
		// checks on this page come down to.
		...getOverlayConfig()
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
