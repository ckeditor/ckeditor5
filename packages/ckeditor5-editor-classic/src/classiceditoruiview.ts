/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-classic/classiceditoruiview
 */

import { BoxedEditorUIView, InlineEditableUIView, MenuBarView, StickyPanelView, ToolbarView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import type { EditingView } from 'ckeditor5/src/engine.js';

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
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
	 */
	constructor(
		locale: Locale,
		editingView: EditingView,
		options: {
			shouldToolbarGroupWhenFull?: boolean;
			useMenuBar?: boolean;
			label?: string | Record<string, string>;
		} = {}
	) {
		super( locale );

		this.stickyPanel = new StickyPanelView( locale );

		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		if ( options.useMenuBar ) {
			this.menuBarView = new MenuBarView( locale );
		}

		this.editable = new InlineEditableUIView( locale, editingView, undefined, {
			label: options.label
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		if ( this.menuBarView ) {
			// Set toolbar as a child of a stickyPanel and makes toolbar sticky.
			this.stickyPanel.content.addMany( [ this.menuBarView, this.toolbar ] );
		} else {
			this.stickyPanel.content.add( this.toolbar );
		}

		this.top.add( this.stickyPanel );
		this.main.add( this.editable );
	}
}
