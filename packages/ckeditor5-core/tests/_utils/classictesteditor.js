/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Editor from '../../src/editor/editor';
import ElementApiMixin from '../../src/editor/utils/elementapimixin';
import DataApiMixin from '../../src/editor/utils/dataapimixin';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import EditorUI from '../../src/editor/editorui';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import { isElement } from 'lodash-es';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.Editor
 */
export default class ClassicTestEditor extends Editor {
	/**
	 * @inheritDoc
	 */
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		// Use the HTML data processor in this editor.
		this.data.processor = new HtmlDataProcessor( this.data.stylesProcessor );

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();

		this.ui = new ClassicTestEditorUI( this, new BoxedEditorUIView( this.locale ) );

		// Expose properties normally exposed by the ClassicEditorUI.
		this.ui.view.editable = new InlineEditableUIView( this.ui.view.locale, this.editing.view );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		if ( this.sourceElement ) {
			this.updateSourceElement();
		}

		this.ui.destroy();

		return super.destroy();
	}

	/**
	 * @param {HTMLElement|String} sourceElementOrData The DOM element that will be the source for the created editor
	 * or the editor's initial data.
	 * @param {module:core/editor/editorconfig~EditorConfig} [config] The editor configuration.
	 * @returns {Promise} A promise resolved once the editor is ready. The promise resolves with the created editor instance.
	 */
	static create( sourceElementOrData, config = {} ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					// Simulate EditorUI.init() (e.g. like in ClassicEditorUI). The ui#view
					// should be rendered after plugins are initialized.
					.then( () => editor.ui.init( isElement( sourceElementOrData ) ? sourceElementOrData : null ) )
					.then( () => editor.editing.view.attachDomRoot( editor.ui.getEditableElement() ) )
					.then( () => {
						if ( !isElement( sourceElementOrData ) && config.initialData ) {
							// Documented in core/editor/editorconfig.jsdoc.
							throw new CKEditorError(
								'editor-create-initial-data: ' +
								'The config.initialData option cannot be used together with initial data passed in Editor.create().',
								null
							);
						}

						editor.data.init( config.initialData || getInitialData( sourceElementOrData ) );
					} )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}

/**
 * A simplified classic editor ui class.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.EditorUI
 */
class ClassicTestEditorUI extends EditorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor, view ) {
		super( editor );

		// A helper to easily replace the editor#element with editor.editable#element.
		this._elementReplacer = new ElementReplacer();

		this._view = view;
	}

	/**
	 * The main (top–most) view of the editor UI.
	 *
	 * @readonly
	 * @member {module:ui/editorui/editoruiview~EditorUIView} #view
	 */
	get view() {
		return this._view;
	}

	/**
	 * Initializes the UI.
	 *
	 * @param {HTMLElement|null} replacementElement The DOM element that will be the source for the created editor.
	 */
	init( replacementElement ) {
		const view = this.view;
		const editable = view.editable;
		const editingView = this.editor.editing.view;
		const editingRoot = editingView.document.getRoot();

		editable.name = editingRoot.rootName;

		view.render();

		view.main.add( view.editable );

		this.setEditableElement( 'main', view.editable.element );

		if ( replacementElement ) {
			this._elementReplacer.replace( replacementElement, view.element );
		}

		this.fire( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._elementReplacer.restore();

		this._view.destroy();

		super.destroy();
	}
}

mix( ClassicTestEditor, DataApiMixin );
mix( ClassicTestEditor, ElementApiMixin );

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
