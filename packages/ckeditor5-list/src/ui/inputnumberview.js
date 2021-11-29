/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/ui/inputnumberview
 */

import { InputView } from 'ckeditor5/src/ui';

/**
 * The number input view class.
 *
 * @protected
 * @extends module:ui/input/inputview~InputView
 */
export default class InputNumberView extends InputView {
	/**
	 * Creates an instance of the input number view.
	 *
	 * @param {module:utils/locale~Locale} locale The {@link module:core/editor/editor~Editor#locale} instance.
	 * @param {Object} [options] Options of the input.
	 * @param {Number} [options.min] The value of the `min` DOM attribute (the lowest accepted value).
	 * @param {Number} [options.max] The value of the `max` DOM attribute (the highest accepted value).
	 * @param {Number} [options.step] The value of the `step` DOM attribute.
	 */
	constructor( locale, { min, max, step } = {} ) {
		super( locale );

		/**
		 * The value of the `min` DOM attribute (the lowest accepted value) set on the {@link #element}.
		 *
		 * @observable
		 * @default undefined
		 * @member {Number}
		 */
		this.set( 'min', min );

		/**
		 * The value of the `max` DOM attribute (the highest accepted value) set on the {@link #element}.
		 *
		 * @observable
		 * @default undefined
		 * @member {Number}
		 */
		this.set( 'max', max );

		/**
		 * The value of the `step` DOM attribute set on the {@link #element}.
		 *
		 * @observable
		 * @default undefined
		 * @member {Number}
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
