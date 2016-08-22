/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../ui/view.js';
import Template from '../../ui/template.js';

/**
 * The labeled input view class.
 *
 * See {@link ui.input.labeled.LabeledInput}.
 *
 * @memberOf ui.input.labeled
 * @extends ui.View
 */
export default class LabeledInputView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bind;

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck-labeled-input',
				]
			},
			children: [
				{
					tag: 'label',
					attributes: {
						class: [
							'ck-labeled-input__label'
						],
						for: bind.to( 'uid' )
					},
					children: [
						{
							text: bind.to( 'label' )
						}
					]
				},
			]
		} );

		this.register( 'content', el => el );
	}
}
