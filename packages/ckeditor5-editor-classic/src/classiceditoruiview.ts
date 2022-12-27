/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-classic/classiceditoruiview
 */

import { BoxedEditorUIView, InlineEditableUIView, StickyPanelView, ToolbarView } from 'ckeditor5/src/ui';
import type { Locale } from 'ckeditor5/src/utils';
import type { View } from 'ckeditor5/src/engine';

import '../theme/classiceditor.css';

/**
 * Classic editor UI view. Uses an inline editable and a sticky toolbar, all
 * enclosed in a boxed UI view.
 */
export default class ClassicEditorUIView extends BoxedEditorUIView {
	/**
	 * Sticky panel view instance. This is a parent view of a {@link #toolbar}
	 * that makes toolbar sticky.
	 */
	public readonly stickyPanel: StickyPanelView;

	/**
	 * Toolbar view instance.
	 */
	public readonly toolbar: ToolbarView;

	/**
	 * Editable UI view.
	 */
	public readonly editable: InlineEditableUIView;

	/**
	 * Creates an instance of the classic editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param options Configuration options for the view instance.
	 * @param options.shouldToolbarGroupWhenFull When set `true` enables automatic items grouping
	 * in the main {@link module:editor-classic/classiceditoruiview~ClassicEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 */
	constructor(
		locale: Locale,
		editingView: View,
		options: {
			shouldToolbarGroupWhenFull?: boolean;
		} = {}
	) {
		super( locale );

		this.stickyPanel = new StickyPanelView( locale );

		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		this.editable = new InlineEditableUIView( locale, editingView );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Set toolbar as a child of a stickyPanel and makes toolbar sticky.
		this.stickyPanel.content.add( this.toolbar );

		this.top.add( this.stickyPanel );
		this.main.add( this.editable );
	}
}
