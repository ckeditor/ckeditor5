/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '../../src/editor/editor.js';
import ElementApiMixin from '../../src/editor/utils/elementapimixin.js';
import EditorUI from '@ckeditor/ckeditor5-ui/src/editorui/editorui.js';
import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview.js';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer.js';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview.js';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement.js';
import { isElement } from 'es-toolkit/compat';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror.js';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.Editor
 */
export default class ClassicTestEditor extends ElementApiMixin( Editor ) {
	/**
	 * @inheritDoc
	 */
	constructor( sourceElementOrData, config ) {
		super( config );

		if ( isElement( sourceElementOrData ) ) {
			this.sourceElement = sourceElementOrData;
		}

		// Editor in paragraph-only mode
		const isInline = config && config.useInlineRoot;

		if ( isInline ) {
			this.model.schema.register( '$inlineRoot', {
				isLimit: true,
				isInline: true
			} );

			this.model.schema.extend( '$text', {
				allowIn: '$inlineRoot'
			} );
		}

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot( isInline ? '$inlineRoot' : '$root' );

		this.ui = new ClassicTestEditorUI( this, new BoxedEditorUIView( this.locale ) );

		// Expose properties normally exposed by the ClassicEditorUI.
		this.ui.view.editable = new InlineEditableUIView( this.ui.view.locale, this.editing.view, undefined, {
			label: this.config.get( 'label' )
		} );
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
					.then( () => {
						if ( !isElement( sourceElementOrData ) && config.initialData ) {
							// Documented in core/editor/editorconfig.jsdoc.
							throw new CKEditorError( 'editor-create-initial-data', null );
						}

						return editor.data.init( config.initialData || getInitialData( sourceElementOrData ) );
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
export class ClassicTestEditorUI extends EditorUI {
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

		editingView.attachDomRoot( view.editable.element );

		if ( replacementElement ) {
			this._elementReplacer.replace( replacementElement, view.element );
		}

		this.fire( 'ready' );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this._elementReplacer.restore();

		this._view.destroy();
	}
}

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
