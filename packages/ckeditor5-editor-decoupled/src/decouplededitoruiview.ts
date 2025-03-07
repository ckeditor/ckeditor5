/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module editor-decoupled/decouplededitoruiview
 */

import { EditorUIView, InlineEditableUIView, MenuBarView, ToolbarView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import type { EditingView } from 'ckeditor5/src/engine.js';

/**
 * The decoupled editor UI view. It is a virtual view providing an inline
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#editable},
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar}, and a
 * {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#menuBarView} but without any
 * specific arrangement of the components in the DOM.
 *
 * See {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create `DecoupledEditor.create()`}
 * to learn more about this view.
 */
export default class DecoupledEditorUIView extends EditorUIView {
	/**
	 * The main toolbar of the decoupled editor UI.
	 */
	public override readonly toolbar: ToolbarView;

	/**
	 * The editable of the decoupled editor UI.
	 */
	public readonly editable: InlineEditableUIView;

	/**
	 * Menu bar view instance.
	 */
	public override menuBarView: MenuBarView;

	/**
	 * Creates an instance of the decoupled editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param options Configuration options for the view instance.
	 * @param options.editableElement The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 * @param options.shouldToolbarGroupWhenFull When set `true` enables automatic items grouping
	 * in the main {@link module:editor-decoupled/decouplededitoruiview~DecoupledEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view}.
	 */
	constructor(
		locale: Locale,
		editingView: EditingView,
		options: {
			editableElement?: HTMLElement;
			shouldToolbarGroupWhenFull?: boolean;
			label?: string | Record<string, string>;
		} = {}
	) {
		super( locale );

		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		this.menuBarView = new MenuBarView( locale );

		this.editable = new InlineEditableUIView( locale, editingView, options.editableElement, {
			label: options.label
		} );

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

		this.menuBarView.extendTemplate( {
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
	public override render(): void {
		super.render();

		this.registerChild( [ this.menuBarView, this.toolbar, this.editable ] );
	}
}
