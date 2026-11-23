/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Link } from '@ckeditor/ckeditor5-link';
import type { ModelElement } from '@ckeditor/ckeditor5-engine';

import { createEditorDomRoot, getOverlayConfig } from '../../_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
	}
}

const editorDomRoot = createEditorDomRoot( document.getElementById( 'mount' )!, {
	template: document.getElementById( 'editor-template' ) as HTMLTemplateElement
} );

// Taken now, as a closed shadow root cannot be queried from the outside later.
const container = editorDomRoot.querySelector( '#editor-container' ) as HTMLElement;
const details = editorDomRoot.querySelector( '#editor-details' ) as HTMLDetailsElement;
const methodSelect = document.getElementById( 'hide-method' ) as HTMLSelectElement;
const status = document.getElementById( 'status' )!;

// Applies (`true`) or removes (`false`) the hiding method on tab 1.
const HIDE_METHODS: Record<string, ( hide: boolean ) => void> = {
	'display': hide => container.style.setProperty( 'display', hide ? 'none' : '' ),
	'content-visibility': hide => container.style.setProperty( 'content-visibility', hide ? 'hidden' : '' ),
	'until-found': hide => hide ? container.setAttribute( 'hidden', 'until-found' ) : container.removeAttribute( 'hidden' ),
	'details': hide => { details.open = !hide; }
};

let hiddenWith: string | null = null;

ClassicEditor
	.create( {
		attachTo: editorDomRoot.querySelector( '#editor' ) as HTMLElement,
		plugins: [ Essentials, Paragraph, Link ],
		toolbar: [ 'link' ],
		...getOverlayConfig()
	} )
	.then( editor => {
		window.editor = editor;

		const balloon = editor.plugins.get( 'ContextualBalloon' );

		const updateStatus = () => {
			const balloonVisible = balloon.view.isVisible;

			if ( !hiddenWith ) {
				status.dataset.verdict = '';
			} else {
				status.dataset.verdict = balloonVisible ? 'bug' : 'ok';
			}
			status.textContent = `Tab 1 hidden: ${ hiddenWith || 'no' } · link balloon visible: ${ balloonVisible ? 'yes' : 'no' }`;
		};

		for ( const tab of document.querySelectorAll<HTMLElement>( '.tab' ) ) {
			tab.addEventListener( 'pointerdown', event => {
				// As in the report: a cancelled `pointerdown` suppresses the `mousedown` that would close the balloon.
				event.preventDefault();

				if ( tab.id == 'ui-update' ) {
					editor.ui.update();
				} else {
					showTab( tab.dataset.tab! );
				}

				updateStatus();
			} );
		}

		methodSelect.addEventListener( 'change', () => {
			showTab( '1' );
			updateStatus();
		} );

		balloon.view.on( 'change:isVisible', updateStatus );
		setInterval( updateStatus, 250 );

		// Opens the link toolbar as a click inside the link does: the caret goes into the link, then a DOM `click`
		// reaches the handler of `LinkUI`, with no need for its internals.
		const paragraph = editor.model.document.getRoot()!.getChild( 0 ) as ModelElement;
		const linkText = Array.from( paragraph.getChildren() ).find( child => child.hasAttribute( 'linkHref' ) )!;

		editor.editing.view.focus();
		editor.model.change( writer => writer.setSelection( paragraph, linkText.startOffset! + 2 ) );
		editor.editing.view.getDomRoot()!.querySelector( 'a' )!.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function showTab( tab: string ): void {
	if ( hiddenWith ) {
		HIDE_METHODS[ hiddenWith ]( false );
		hiddenWith = null;
	}

	if ( tab == '2' ) {
		hiddenWith = methodSelect.value;
		HIDE_METHODS[ hiddenWith ]( true );
	}

	document.getElementById( 'tab-2-panel' )!.hidden = tab != '2';

	for ( const element of document.querySelectorAll<HTMLElement>( '.tab[data-tab]' ) ) {
		element.classList.toggle( 'tab_active', element.dataset.tab == tab );
	}
}
