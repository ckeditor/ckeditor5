/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module editor-classic/classiceditoruiview
 */

import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import StickyPanelView from '@ckeditor/ckeditor5-ui/src/panel/sticky/stickypanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

import log from '@ckeditor/ckeditor5-utils/src/log';

import '../theme/classiceditor.css';

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
		 * Sticky panel view instance. This is a parent view of a {@link #toolbar}
		 * that makes toolbar sticky.
		 *
		 * @readonly
		 * @member {module:ui/panel/sticky/stickypanelview~StickyPanelView}
		 */
		this.stickyPanel = new StickyPanelView( locale );

		/**
		 * Toolbar view instance.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarView}
		 */
		this.toolbar = new ToolbarView( locale );

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Set toolbar as a child of a stickyPanel and makes toolbar sticky.
		this.stickyPanel.content.add( this.toolbar );

		this.top.add( this.stickyPanel );
		this.main.add( this.editable );
	}

	/**
	 * **Deprecated** since `v12.0.0`. The {@link module:ui/editableui/editableuiview~EditableUIView#editableElement
	 * `EditableUIView editableElement`} could be used instead.
	 *
	 * The element which is the main editable element (usually the one with `contentEditable="true"`).
	 *
	 * @deprecated v12.0.0 The {@link module:ui/editableui/editableuiview~EditableUIView#editableElement
	 * `EditableUIView editableElement`} could be used instead.
	 * @readonly
	 * @member {HTMLElement} #editableElement
	 */
	get editableElement() {
		log.warn( 'deprecated-ui-view-editableElement: The ClassicEditorUIView#editableElement property is deprecated.' );
		return this.editable.editableElement;
	}
}
