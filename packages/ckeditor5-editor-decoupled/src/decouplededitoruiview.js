/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-decoupled/decouplededitoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * The decoupled editor UI view. It's a virtual view providing an inline
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#editable} and a
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar}, but without any
 * specific arrangement of the components in DOM.
 *
 * See {@link module:core/editor/editorconfig~EditorConfig#toolbarContainer `config.toolbarContainer`} and
 * {@link module:core/editor/editorconfig~EditorConfig#editableContainer `config.editableContainer`} to
 * learn more about the UI of a decoupled editor.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class DecoupledEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the decoupled editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The main toolbar of the decoupled editor UI.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale );

		/**
		 * The editable of the decoupled editor UI.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale );

		// This toolbar may be placed anywhere in the page so things like font-size needs to be reset in it.
		Template.extend( this.toolbar.template, {
			attributes: {
				class: 'ck-reset_all'
			}
		} );

		this.registerChildren( [ this.toolbar, this.editable ] );
	}

	/**
	 * Destroys the view and removes {@link #toolbar} and {@link #editable}
	 * {@link module:ui/view~View#element `element`} from DOM, if required.
	 *
	 * @param {Boolean} [removeToolbar] When `true`, remove the {@link #toolbar} element from DOM.
	 * @param {Boolean} [removeEditable] When `true`, remove the {@link #editable} element from DOM.
	 */
	destroy( removeToolbar, removeEditable ) {
		super.destroy();

		if ( removeToolbar ) {
			this.toolbar.element.remove();
		}

		if ( removeEditable ) {
			this.editable.element.remove();
		}
	}

	/**
	 * @inheritDoc
	 */
	get editableElement() {
		return this.editable.element;
	}
}
