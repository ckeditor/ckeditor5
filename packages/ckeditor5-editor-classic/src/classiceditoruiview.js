/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-classic/classiceditoruiview
 */

import BoxedEditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/boxed/boxededitoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import StickyPanelView from '@ckeditor/ckeditor5-ui/src/panel/sticky/stickypanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

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
	 * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
	 * @param {Object} [options={}] Configuration options fo the view instance.
	 * @param {Boolean} [options.shouldToolbarGroupWhenFull] When set `true` enables automatic items grouping
	 * in the main {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 */
	constructor( locale, editingView, options = {} ) {
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
		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		/**
		 * Editable UI view.
		 *
		 * @readonly
		 * @member {module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}
		 */
		this.editable = new InlineEditableUIView( locale, editingView );
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
}
