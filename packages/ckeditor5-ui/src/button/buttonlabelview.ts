/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/button/buttonlabelview
 */

import View from '../view';

/**
 * TODO
 */
export default class ButtonLabelView extends View {
	/**
	 * TODO
	 */
	declare public style: string | undefined;

	/**
	 * TODO
	 */
	declare public label: string | undefined;

	/**
	 * TODO
	 */
	declare public id: string | undefined;

	/**
	 * TODO
	 */
	constructor() {
		super();

		this.set( {
			style: null,
			label: null,
			id: null
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
					text: bind.to( 'label' )
				}
			]
		} );
	}
}
