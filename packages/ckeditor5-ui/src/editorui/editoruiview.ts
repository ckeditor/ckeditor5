/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/editoruiview
 */

import View from '../view';
import BodyCollection from './bodycollection';

import '../../theme/components/editorui/editorui.css';

import type EditableUIView from '../editableui/editableuiview';
import type { Locale, LocaleTranslate } from '@ckeditor/ckeditor5-utils';

/**
 * The editor UI view class. Base class for the editor main views.
 *
 * @extends module:ui/view~View
 */
export default abstract class EditorUIView extends View {
	public readonly body: BodyCollection;

	declare public locale: Locale;
	declare public t: LocaleTranslate;

	public abstract get editable(): EditableUIView;

	/**
	 * Creates an instance of the editor UI view class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The locale instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		/**
		 * Collection of the child views, detached from the DOM
		 * structure of the editor, like panels, icons etc.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection} #body
		 */
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
