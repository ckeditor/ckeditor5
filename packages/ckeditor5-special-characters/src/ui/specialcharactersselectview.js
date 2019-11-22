/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharactersselectview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import LabelView from '@ckeditor/ckeditor5-ui/src/label/labelview';
import SelectView from '@ckeditor/ckeditor5-ui/src/select/selectview';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

/**
 * @extends module:ui/view~View
 */
export default class SpecialCharactersSelectView extends View {
	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} options
	 * @param {String} options.labelText A label for the select element.
	 * @param {Array.<module:ui/select/selectview~SelectViewOption>} options.selectOptions Options to chose in the select view.
	 */
	constructor( locale, options ) {
		super( locale );

		const inputUid = `ck-select-${ uid() }`;

		/**
		 * A label for the select view.
		 *
		 * @member {module:ui/label/labelview~LabelView}
		 */
		this.label = new LabelView( this.locale );

		/**
		 * Select view for changing a category of special characters.
		 *
		 * @member {module:ui/select/selectview~SelectView}
		 */
		this.selectView = new SelectView( this.locale, options.selectOptions );
		this.selectView.delegate( 'input' ).to( this );

		this.label.for = inputUid;
		this.label.text = options.labelText;
		this.label.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-symbol-grid__label'
				]
			}
		} );

		this.selectView.id = inputUid;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-grid-table'
				]
			},
			children: [
				this.label,
				this.selectView
			]
		} );
	}

	/**
	 * Returns a value from the select view.
	 *
	 * @returns {String}
	 */
	get value() {
		return this.selectView.element.value;
	}
}
