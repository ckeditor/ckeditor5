/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-multi-root/multirooteditoruiview
 */

import { EditorUIView, InlineEditableUIView, ToolbarView } from 'ckeditor5/src/ui';
import type { Locale } from 'ckeditor5/src/utils';
import type { View } from 'ckeditor5/src/engine';

/**
 * The multi-root editor UI view. It is a virtual view providing an inline
 * {@link module:editor-multi-root/multirooteditoruiview~MultiRootEditorUIView#editable} and a
 * {@link module:editor-multi-root/multirooteditoruiview~MultiRootEditorUIView#toolbar}, but without any
 * specific arrangement of the components in the DOM.
 *
 * See {@link module:editor-multi-root/multirooteditor~MultiRootEditor.create `MultiRootEditor.create()`}
 * to learn more about this view.
 */
export default class MultiRootEditorUIView extends EditorUIView {
	/**
	 * The main toolbar of the multi-root editor UI.
	 */
	public readonly toolbar: ToolbarView;

	/**
	 * Editable elements used by the multi-root editor UI.
	 */
	public readonly editables: Record<string, InlineEditableUIView>;

	public readonly editable: InlineEditableUIView;

	/**
	 * Creates an instance of the multi-root editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param editableNames Names for all editable views. For each name, one
	 * {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView `InlineEditableUIView`} instance will be initialized.
	 * @param options Configuration options for the view instance.
	 * @param options.editableElements The editable elements to be used, assigned to their names. If not specified, they will be
	 * automatically created by {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView `InlineEditableUIView`}
	 * instances.
	 * @param options.shouldToolbarGroupWhenFull When set to `true` enables automatic items grouping
	 * in the main {@link module:editor-multi-root/multirooteditoruiview~MultiRootEditorUIView#toolbar toolbar}.
	 * See {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull} to learn more.
	 */
	constructor(
		locale: Locale,
		editingView: View,
		editableNames: Array<string>,
		options: {
			editableElements?: Record<string, HTMLElement>;
			shouldToolbarGroupWhenFull?: boolean;
		} = {}
	) {
		super( locale );

		const t = locale.t;

		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		this.editables = {};

		// Create `InlineEditableUIView` instance for each editable.
		for ( const editableName of editableNames ) {
			const editable = new InlineEditableUIView(
				locale,
				editingView,
				options.editableElements ? options.editableElements[ editableName ] : undefined,
				{
					label: editable => {
						return t( 'Rich Text Editor. Editing area: %0', editable.name! );
					}
				}
			);

			this.editables[ editableName ] = editable;
		}

		this.editable = Object.values( this.editables )[ 0 ];

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
	public override render(): void {
		super.render();

		this.registerChild( Object.values( this.editables ) );
		this.registerChild( [ this.toolbar ] );
	}
}
