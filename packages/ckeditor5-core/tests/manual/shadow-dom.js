/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals customElements, HTMLElement, document, CKEditorInspector, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import InlineEditor from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import BalloonEditor from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ArticlePluginSet from '../_utils/articlepluginset';

const EDITOR_CONFIG = {
	plugins: [ ArticlePluginSet ],
	toolbar: [
		'heading',
		'|',
		'bold',
		'italic',
		'link',
		'bulletedList',
		'numberedList',
		'|',
		'outdent',
		'indent',
		'|',
		'blockQuote',
		'insertTable',
		'mediaEmbed',
		'undo',
		'redo'
	],
	image: {
		toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	}
};

class EditorComponent extends HTMLElement {
	_setupContentContainer() {
		const contentContainer = this.querySelector( '.editor-content' );

		this.shadowRoot.appendChild( contentContainer );

		return contentContainer;
	}

	_cloneGlobalCKEditorStyles() {
		this.shadowRoot.appendChild( document.querySelector( 'style[data-cke]' ).cloneNode( true ) );
	}

	_injectComponentStyles() {
		const style = document.createElement( 'style' );

		style.innerHTML = `
			:host {
				font-family: "Comic Sans MS", "Comic Sans", cursive;
			}

			:host > *.ck {
				margin-top: 30px;
			}

			.ck.ck-content.ck-editor__editable {
				background: #fff;
			}
		`;

		this.shadowRoot.appendChild( style );
	}

	_injectBodyCollection() {
		this.shadowRoot.appendChild( this.editor.ui.view.body._bodyCollectionContainer );
	}
}

class ClassicEditorComponent extends EditorComponent {
	connectedCallback() {
		const shadowRoot = this.attachShadow( { mode: 'open' } );
		const contentContainer = this._setupContentContainer();

		this._cloneGlobalCKEditorStyles();
		this._injectComponentStyles();

		shadowRoot.insertBefore( document.createTextNode( 'Classic editor in shadow DOM.' ), shadowRoot.firstChild );

		ClassicEditor
			.create( contentContainer, EDITOR_CONFIG )
			.then( editor => {
				this.editor = editor;
				this._injectBodyCollection();
				CKEditorInspector.attach( { classic: editor } );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}
}

class InlineEditorComponent extends EditorComponent {
	connectedCallback() {
		const shadowRoot = this.attachShadow( { mode: 'open' } );
		const contentContainer = this._setupContentContainer();

		this._cloneGlobalCKEditorStyles();
		this._injectComponentStyles();

		shadowRoot.insertBefore( document.createTextNode( 'Inline editor in shadow DOM.' ), shadowRoot.firstChild );

		InlineEditor
			.create( contentContainer, EDITOR_CONFIG )
			.then( editor => {
				this.editor = editor;
				this._injectBodyCollection();
				CKEditorInspector.attach( { inline: editor } );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}
}

class BalloonEditorComponent extends EditorComponent {
	connectedCallback() {
		const shadowRoot = this.attachShadow( { mode: 'open' } );
		const contentContainer = this._setupContentContainer();

		this._cloneGlobalCKEditorStyles();
		this._injectComponentStyles();

		shadowRoot.insertBefore( document.createTextNode( 'Balloon editor in shadow DOM.' ), shadowRoot.firstChild );

		BalloonEditor
			.create( contentContainer, EDITOR_CONFIG )
			.then( editor => {
				this.editor = editor;
				this._injectBodyCollection();
				CKEditorInspector.attach( { balloon: editor } );
			} )
			.catch( err => {
				console.error( err.stack );
			} );
	}
}

customElements.define( 'ck-editor-classic', ClassicEditorComponent );
customElements.define( 'ck-editor-inline', InlineEditorComponent );
customElements.define( 'ck-editor-balloon', BalloonEditorComponent );
