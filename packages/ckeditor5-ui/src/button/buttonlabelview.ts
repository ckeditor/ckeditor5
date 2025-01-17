/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/button/buttonlabelview
 */

import View from '../view.js';
import type ButtonLabel from './buttonlabel.js';

/**
 * A default implementation of the button view's label. It comes with a dynamic text support
 * via {@link module:ui/button/buttonlabelview~ButtonLabelView#text} property.
 */
export default class ButtonLabelView extends View implements ButtonLabel {
	/**
	 * @inheritDoc
	 */
	declare public id: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public style: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public text: string | undefined;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		this.set( {
			style: undefined,
			text: undefined,
			id: undefined
		} );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'span',

			attributes: {
				class: [
					'ck',
					'ck-button__label'
				],
				style: bind.to( 'style' ),
				id: bind.to( 'id' )
			},

			children: [
				{
					text: bind.to( 'text' )
				}
			]
		} );
	}
}
