/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import EditorUI from '@ckeditor/ckeditor5-core/src/editor/editorui';
import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import Link from '@ckeditor/ckeditor5-link/src/link';
import FindAndReplace from '../../src/findandreplace';

class MultirootEditor extends Editor {
	constructor( sourceElements, config ) {
		super( config );

		// Create root and UIView element for each editable container.
		for ( const rootName of Object.keys( sourceElements ) ) {
			this.model.document.createRoot( '$root', rootName );
		}

		this.ui = new MultirootEditorUI( this, new MultirootEditorUIView( this.locale, this.editing.view, sourceElements ) );
	}

	destroy() {
		const data = {};
		const editables = {};
		const editablesNames = Array.from( this.ui.getEditableElementsNames() );

		for ( const rootName of editablesNames ) {
			data[ rootName ] = this.getData( { rootName } );
			editables[ rootName ] = this.ui.getEditableElement( rootName );
		}

		this.ui.destroy();

		return super.destroy()
			.then( () => {
				for ( const rootName of editablesNames ) {
					setDataInElement( editables[ rootName ], data[ rootName ] );
				}
			} );
	}

	static create( sourceElements, config ) {
		return new Promise( resolve => {
			const editor = new this( sourceElements, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.ui.init() )
					.then( () => {
						const initialData = {};

						// Create initial data object containing data from all roots.
						for ( const rootName of Object.keys( sourceElements ) ) {
							initialData[ rootName ] = getDataFromElement( sourceElements[ rootName ] );
						}

						return editor.data.init( initialData );
					} )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

mix( MultirootEditor, DataApiMixin );

class MultirootEditorUI extends EditorUI {
	constructor( editor, view ) {
		super( editor );

		this.view = view;
	}

	init() {
		const view = this.view;
		const editor = this.editor;
		const editingView = editor.editing.view;

		let lastFocusedEditableElement;

		view.render();

		this.focusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
			for ( const editable of this.view.editables ) {
				if ( editable.element === focusedElement ) {
					lastFocusedEditableElement = editable.element;
				}
			}
		} );

		this.focusTracker.on( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				lastFocusedEditableElement = null;
			}
		} );

		for ( const editable of this.view.editables ) {
			const editableElement = editable.element;

			this.setEditableElement( editable.name, editableElement );
			this.focusTracker.add( editableElement );

			editable.bind( 'isFocused' ).to( this.focusTracker, 'isFocused', this.focusTracker, 'focusedElement',
				( isFocused, focusedElement ) => {
					if ( !isFocused ) {
						return false;
					}

					if ( focusedElement === editableElement ) {
						return true;
					} else {
						return lastFocusedEditableElement === editableElement;
					}
				} );

			editingView.attachDomRoot( editableElement, editable.name );
		}

		this._initToolbar();
		this.fire( 'ready' );
	}

	destroy() {
		const view = this.view;
		const editingView = this.editor.editing.view;

		for ( const editable of this.view.editables ) {
			editingView.detachDomRoot( editable.name );
		}

		view.destroy();

		super.destroy();
	}

	_initToolbar() {
		const editor = this.editor;
		const view = this.view;
		const toolbar = view.toolbar;

		toolbar.fillFromConfig( editor.config.get( 'toolbar' ), this.componentFactory );

		enableToolbarKeyboardFocus( {
			origin: editor.editing.view,
			originFocusTracker: this.focusTracker,
			originKeystrokeHandler: editor.keystrokes,
			toolbar
		} );
	}
}

class MultirootEditorUIView extends EditorUIView {
	constructor( locale, editingView, editableElements ) {
		super( locale );

		this.toolbar = new ToolbarView( locale );
		this.editables = [];

		for ( const editableName of Object.keys( editableElements ) ) {
			const editable = new InlineEditableUIView( locale, editingView, editableElements[ editableName ] );

			editable.name = editableName;
			this.editables.push( editable );
		}

		Template.extend( this.toolbar.template, {
			attributes: {
				class: [
					'ck-reset_all',
					'ck-rounded-corners'
				],
				dir: locale.uiLanguageDirection
			}
		} );
	}

	render() {
		super.render();

		this.registerChild( this.editables );
		this.registerChild( [ this.toolbar ] );
	}
}

MultirootEditor
	.create( {
		header: document.querySelector( '#header' ),
		content: document.querySelector( '#content' ),
		footerleft: document.querySelector( '#footer-left' ),
		footerright: document.querySelector( '#footer-right' )
	}, {
		plugins: [
			Essentials, Paragraph, Heading, Bold, Italic, List, Link, FindAndReplace
		],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', 'undo', 'redo', 'FindAndReplace' ]
	} )
	.then( editor => {
		document.querySelector( '#toolbar' ).appendChild( editor.ui.view.toolbar.element );
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
