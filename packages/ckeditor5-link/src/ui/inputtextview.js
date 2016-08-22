/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../ui/view.js';
import Template from '../../ui/template.js';

/**
 * The text input view class.
 *
 * See {@link ui.input.InputText}.
 *
 * @memberOf ui.input
 * @extends ui.View
 */
export default class InputTextView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bind;

		this.template = new Template( {
			tag: 'input',
			attributes: {
				type: 'text',
				class: [
					'ck-input',
					'ck-input-text'
				],
				id: bind.to( 'uid' ),
				value: bind.to( 'value' )
			}
		} );
	}
}
