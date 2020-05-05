/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-decoupled/decouplededitoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

/**
 * The decoupled editor UI view. It is a virtual view providing an inline
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#editable} and a
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar}, but without any
 * specific arrangement of the components in the DOM.
 *
 * See {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
 * to learn more about this view.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class DecoupledEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the decoupled editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
	 * @param {Object} [options={}] Configuration options fo the view instance.
	 * @param {HTMLElement} [options.editableElement] The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 * @param {Boolean} [options.shouldToolbarGroupWhenFull] When set `true` enables automatic items grouping
	 * in the main {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 */
	constructor( locale, editingView, options = {} ) {
		super( locale );

		/**
		 * The main toolbar of the decoupled editor UI.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		/**
		 * The editable of the decoupled editor UI.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale, editingView, options.editableElement );

		// This toolbar may be placed anywhere in the page so things like font size need to be reset in it.
		// Because of the above, make sure the toolbar supports rounded corners.
		// Also, make sure the toolbar has the proper dir attribute because its ancestor may not have one
		// and some toolbar item styles depend on this attribute.
		this.toolbar.extendTemplate( {
			attributes: {
				class: [
					'ck-reset_all',
					'ck-rounded-corners'
				],
				dir: locale.uiLanguageDirection
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this.registerChild( [ this.toolbar, this.editable ] );
	}
}
