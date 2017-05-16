/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/editableui/inline/inlineeditableuiview
 */

import EditableUIView from '../../editableui/editableuiview';
import Template from '../../template';

/**
 * The inline editable UI class implementing an inline {@link module:ui/editableui/editableuiview~EditableUIView}.
 *
 * @extends module:ui/editableui/editableuiview~EditableUIView
 */
export default class InlineEditableUIView extends EditableUIView {
	/**
	 * Creates an instance of the InlineEditableUIView class.
	 *
	 * @param {module:utils/locale~Locale} [locale] The locale instance.
	 * @param {HTMLElement} [editableElement] The editable element. If not specified, the
	 * {@link module:ui/editableui/editableuiview~EditableUIView}
	 * should create it. Otherwise, the existing element should be used.
	 */
	constructor( locale, editableElement ) {
		super( locale, editableElement );

		const bind = this.bindTemplate;
		const t = this.t;

		/**
		 * The name of the editable UI view.
		 *
		 * @observable
		 * @member {String} #name
		 */
		this.set( 'name', null );

		const getLabel = value => {
			return t( 'Rich Text Editor, %0', [ value ] );
		};

		Template.extend( this.template, {
			attributes: {
				role: 'textbox',
				'aria-label': bind.to( 'name', getLabel ),
				class: 'ck-editor__editable_inline'
			}
		} );
	}
}
