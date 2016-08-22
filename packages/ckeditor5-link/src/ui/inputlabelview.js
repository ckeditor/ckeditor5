/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../ui/view.js';
import Template from '../../ui/template.js';

/**
 * The input label view class.
 *
 * See {@link ui.input.InputLabel}.
 *
 * @memberOf ui.input
 * @extends ui.View
 */
export default class InputLabelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bind;

		this.template = new Template( {
			tag: 'label',
			attributes: {
				class: [
					'ck-labeled-input__label'
				],
				for: bind.to( 'for' )
			},
			children: [
				{
					text: bind.to( 'text' )
				}
			]
		} );
	}
}
