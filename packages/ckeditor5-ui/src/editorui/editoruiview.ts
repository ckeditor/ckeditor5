/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/editoruiview
 */

import View from '../view.js';
import BodyCollection from './bodycollection.js';
import type EditableUIView from '../editableui/editableuiview.js';

import type { Locale, LocaleTranslate } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/editorui/editorui.css';
import type MenuBarView from '../menubar/menubarview.js';

/**
 * The editor UI view class. Base class for the editor main views.
 */
export default abstract class EditorUIView extends View {
	/**
	 * Collection of the child views, detached from the DOM
	 * structure of the editor, like panels, icons etc.
	 */
	public readonly body: BodyCollection;

	declare public locale: Locale;
	declare public t: LocaleTranslate;

	public abstract get editable(): EditableUIView;

	/**
	 * Menu bar view instance. May not be initialized in some editor types.
	 */
	public menuBarView?: MenuBarView;

	/**
	 * Creates an instance of the editor UI view class.
	 *
	 * @param locale The locale instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.body = new BodyCollection( locale );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.body.attachToDom();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this.body.detachFromDom();

		return super.destroy();
	}
}
