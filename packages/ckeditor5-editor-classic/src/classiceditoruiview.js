/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditoruiview
 */

import BoxedEditorUIView from '../ui/editorui/boxed/boxededitoruiview.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';
import StickyToolbarView from '../ui/toolbar/sticky/stickytoolbarview.js';

/**
 * Classic editor UI view. Uses inline editable and sticky toolbar, all
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
