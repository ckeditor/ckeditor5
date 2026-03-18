/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '../../src/editor/editor.js';
import { ElementApiMixin } from '../../src/editor/utils/elementapimixin.js';
import { normalizeRootsConfig, normalizeSingleRootEditorConstructorParams } from '../../src/editor/utils/normalizerootsconfig.js';
import { EditorUI, BoxedEditorUIView, InlineEditableUIView } from '@ckeditor/ckeditor5-ui';
import { ElementReplacer } from '@ckeditor/ckeditor5-utils';
import { isElement } from 'es-toolkit/compat';

/**
 * A simplified classic editor. Useful for testing features.
 *
 * @memberOf tests.core._utils
 * @extends core.editor.Editor
 */
export class ClassicTestEditor extends ElementApiMixin( Editor ) {
	/**
	 * @inheritDoc
	 */
	constructor( sourceElementOrDataOrConfig, config ) {
		const {
			sourceElementOrData,
			editorConfig
		} = normalizeSingleRootEditorConstructorParams( sourceElementOrDataOrConfig, config );

		super( editorConfig );

		normalizeRootsConfig( sourceElementOrData, this.config, 'main', true );

		const sourceElement = this.config.get( 'attachTo' );

		if ( isElement( sourceElement ) ) {
			this.sourceElement = sourceElement;
		}

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();

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
					.then( () => editor.ui.init( editor.config.get( 'attachTo' ) || null ) )
					.then( () => editor.data.init( editor.config.get( 'roots' ).main.initialData ) )
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
