/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/spinner/spinnerview
 */

import View from '../view.js';

import '../../theme/components/spinner/spinner.css';

/**
 * The spinner view class.
 */
export default class SpinnerView extends View {
	/**
	 * Controls whether the spinner is visible.
	 *
	 * @observable
	 * @default false
	 */
	declare public isVisible: boolean;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		this.set( 'isVisible', false );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-spinner-container',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},
			children: [ {
				tag: 'span',
				attributes: {
					class: [ 'ck', 'ck-spinner' ]
				}
			} ]
		} );
	}
}
