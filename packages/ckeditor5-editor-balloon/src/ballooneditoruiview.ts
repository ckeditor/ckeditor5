/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module editor-balloon/ballooneditoruiview
 */

import { EditorUIView, InlineEditableUIView } from 'ckeditor5/src/ui';
import type { Locale } from 'ckeditor5/src/utils';
import type { View } from 'ckeditor5/src/engine';

/**
 * Contextual editor UI view. Uses the {@link module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView}.
 */
export default class BalloonEditorUIView extends EditorUIView {
	/**
	 * Editable UI view.
	 */
	public readonly editable: InlineEditableUIView;

	/**
	 * Creates an instance of the balloon editor UI view.
	 *
	 * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param editingView The editing view instance this view is related to.
	 * @param editableElement The editable element. If not specified, it will be automatically created by
	 * {@link module:ui/editableui/editableuiview~EditableUIView}. Otherwise, the given element will be used.
	 */
	constructor(
		locale: Locale,
		editingView: View,
		editableElement?: HTMLElement
	) {
		super( locale );

		const t = locale.t;

		this.editable = new InlineEditableUIView( locale, editingView, editableElement, {
			label: editableView => {
				return t( 'Rich Text Editor. Editing area: %0', editableView.name! );
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.registerChild( this.editable );
	}
}
