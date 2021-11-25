/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { InputView } from 'ckeditor5/src/ui';

/**
 * The number input view class.
 *
 * @extends module:ui/view~View
 */
export default class InputNumberView extends InputView {
	/**
	 * @inheritDoc
	 */
	constructor( locale, { min, max, step } = {} ) {
		super( locale );

		/**
		 * TODO
		 */
		this.set( 'min', min );

		/**
		 * TODO
		 */
		this.set( 'max', max );

		/**
		 * TODO
		 */
		this.set( 'step', step );

		const bind = this.bindTemplate;

		this.extendTemplate( {
			attributes: {
				type: 'number',
				class: [
					'ck-input-number'
				],
				min: bind.to( 'min' ),
				max: bind.to( 'max' ),
				step: bind.to( 'step' )
			}
		} );
	}
}
