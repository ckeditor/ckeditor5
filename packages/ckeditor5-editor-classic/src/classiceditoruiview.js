/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BoxedEditorUIView from '../ui/editorui/boxed/boxededitoruiview.js';
import InlineEditableUIView from '../ui/editableui/inline/inlineeditableuiview.js';
import StickyToolbarView from '../ui/toolbar/sticky/stickytoolbarview.js';

/**
 * Classic editor UI view. Uses inline editable and sticky toolbar, all
 * enclosed in a boxed UI view.
 *
 * @memberOf editor-classic
 * @extends ui.editorUI.boxed.BoxedEditorUIView
 */
export default class ClassicEditorUIView extends BoxedEditorUIView {
	/**
	 * Creates an instance of the classic editor UI view.
	 *
	 * @param {utils.Locale} locale The {@link core.editor.Editor#locale} instance.
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * A sticky toolbar view instance.
		 *
		 * @readonly
		 * @member {ui.toolbar.sticky.StickyToolbarView} editor-classic.ClassicEditorUIView#toolbar
		 */
		this.toolbar = new StickyToolbarView( locale );

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {ui.editableUI.inline.InlineEditableUIView} editor-classic.ClassicEditorUIView#editable
		 */
		this.editable = new InlineEditableUIView( locale );

		this.top.add( this.toolbar );
		this.main.add( this.editable );
	}

	/**
	 * The editing host element of {@link editor-classic.ClassicEditorUIView#editable}.
	 *
	 * @readonly
	 * @type {HTMLElement}
	 */
	get editableElement() {
		return this.editable.element;
	}
}
