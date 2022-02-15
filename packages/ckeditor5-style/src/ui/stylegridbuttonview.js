/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import {
	ButtonView,
	View
} from 'ckeditor5/src/ui';

// These are intermediate element names that can't be rendered as style preview because
// they don't make sense standalone.
const NON_PREVIEWABLE_ELEMENT_NAMES = [
	'caption', 'colgroup', 'dd', 'dt', 'figcaption', 'legend', 'li', 'optgroup', 'option', 'rp',
	'rt', 'summary', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
];

/**
 * TODO
 *
 * @extends TODO
 */
export default class StyleGridButtonView extends ButtonView {
	/**
	 * @inheritDoc
	 */
	constructor( locale, definition ) {
		super( locale );

		/**
		 * TODO
		 */
		this.definition = definition;

		this.previewView = this._createPreview( definition );

		this.set( {
			label: definition.name,
			class: 'ck-style-grid__button',
			withText: true
		} );

		this.extendTemplate( {
			attributes: {
				role: 'option'
			}
		} );

		this.styleDefinition = definition;

		this.children.add( this.previewView, 0 );
	}

	/**
	 * TODO
	 *
	 * @param {*} definition
	 * @returns
	 */
	_createPreview( definition ) {
		const previewView = new View( this.locale );

		previewView.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-style-grid__button__preview',
					'ck-content'
				]
			},

			children: [
				{
					// Avoid previewing a standalone <td> or <li> directly in a <div>.
					tag: this._isPreviewable( definition.element ) ? definition.element : 'div',
					attributes: {
						class: definition.classes
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			]
		} );

		return previewView;
	}

	_isPreviewable( elementName ) {
		return !NON_PREVIEWABLE_ELEMENT_NAMES.includes( elementName );
	}
}
