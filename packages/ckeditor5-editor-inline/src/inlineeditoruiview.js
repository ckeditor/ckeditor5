/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-inline/inlineeditoruiview
 */

import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import FloatingPanelView from '@ckeditor/ckeditor5-ui/src/panel/floating/floatingpanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * Inline editor UI view. Uses inline editable and floating toolbar.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
export default class InlineEditorUIView extends EditorUIView {
	/**
	 * Creates an instance of the inline editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 */
	constructor( locale, editableElement ) {
		super( locale );

		/**
		 * A floating toolbar view instance.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale );

		/**
		 * A floating panel view instance.
		 *
		 * @readonly
		 * @member {module:ui/panel/floating/floatingpanelview~FloatingPanelView}
		 */
		this.panel = new FloatingPanelView( locale );

		Template.extend( this.panel.template, {
			attributes: {
				class: 'ck-toolbar__container'
			}
		} );

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale, editableElement );

		this.body.add( this.panel );
		this.addChildren( this.editable );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		return super.init()
			.then( () => this.panel.content.add( this.toolbar ) );
	}

	/**
	 * @inheritDoc
	 */
	get editableElement() {
		return this.editable.element;
	}
}
