/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-multi-root/multirooteditoruiview
 */

import { EditorUIView, InlineEditableUIView, MenuBarView, ToolbarView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';
import type { EditingView } from 'ckeditor5/src/engine.js';

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
	 * Menu bar view instance.
	 */
	public override menuBarView: MenuBarView;

	/**
	 * The editing view instance this view is related to.
	 */
	private readonly _editingView: EditingView;

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
	 * @param options.label When set, this value will be used as an accessible `aria-label` of the
	 * {@link module:ui/editableui/editableuiview~EditableUIView editable view} elements.
	 */
	constructor(
		locale: Locale,
		editingView: EditingView,
		editableNames: Array<string>,
		options: {
			editableElements?: Record<string, HTMLElement>;
			shouldToolbarGroupWhenFull?: boolean;
			label?: string | Record<string, string>;
		} = {}
	) {
		super( locale );

		this._editingView = editingView;

		this.toolbar = new ToolbarView( locale, {
			shouldGroupWhenFull: options.shouldToolbarGroupWhenFull
		} );

		this.menuBarView = new MenuBarView( locale );

		this.editables = {};

		// Create `InlineEditableUIView` instance for each editable.
		for ( const editableName of editableNames ) {
			const editableElement = options.editableElements ? options.editableElements[ editableName ] : undefined;
			let { label } = options;

			if ( typeof label === 'object' ) {
				label = label[ editableName ];
			}

			this.createEditable( editableName, editableElement, label );
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
	 * Creates an editable instance with given name and registers it in the editor UI view.
	 *
	 * If `editableElement` is provided, the editable instance will be created on top of it. Otherwise, the editor will create a new
	 * DOM element and use it instead.
	 *
	 * @param editableName The name for the editable.
	 * @param editableElement DOM element for which the editable should be created.
	 * @param label The accessible editable label used by assistive technologies.
	 * @returns The created editable instance.
	 */
	public createEditable( editableName: string, editableElement?: HTMLElement, label?: string ): InlineEditableUIView {
		const editable = new InlineEditableUIView( this.locale, this._editingView, editableElement, {
			label
		} );

		this.editables[ editableName ] = editable;
		editable.name = editableName;

		if ( this.isRendered ) {
			this.registerChild( editable );
		}

		return editable;
	}

	/**
	 * Destroys and removes the editable from the editor UI view.
	 *
	 * @param editableName The name of the editable that should be removed.
	 */
	public removeEditable( editableName: string ): void {
		const editable = this.editables[ editableName ];

		if ( this.isRendered ) {
			this.deregisterChild( editable );
		}

		delete this.editables[ editableName ];

		editable.destroy();
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.registerChild( Object.values( this.editables ) );
		this.registerChild( this.toolbar );
		this.registerChild( this.menuBarView );
	}
}
