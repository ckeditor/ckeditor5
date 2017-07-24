/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditoruiview
 */

import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import StickyToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/sticky/stickytoolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * Classic editor UI view. Uses an inline editable and a sticky toolbar, all
 * enclosed in a boxed UI view.
 *
 * @extends module:ui/editorui/boxed/boxededitoruiview~BoxedEditorUIView
 */
export default class ClassicEditorUIView extends BoxedEditorUIView {
	/**
	 * Creates an instance of the classic editor UI view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * A sticky toolbar view instance.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/sticky/stickytoolbarview~StickyToolbarView}
		 */
		this.toolbar = new StickyToolbarView( locale );

		Template.extend( this.toolbar.template, {
			attributes: {
				class: 'ck-editor-toolbar'
			}
		} );

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale );

		this.top.add( this.toolbar );
		this.main.add( this.editable );
	}

	/**
	 * @inheritDoc
	 */
	get editableElement() {
		return this.editable.element;
	}
}
