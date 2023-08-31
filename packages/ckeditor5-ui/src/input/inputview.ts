/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/input/inputview
 */

import {
	type Locale
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/input/input.css';
import InputBase from './inputbase';

/**
 * The input view class.
 */
export default class InputView extends InputBase {
	/**
	 * Corresponds to the `inputmode` DOM attribute. Can be `text`, `numeric`, `decimal`, etc.
	 *
	 * @observable
	 * @default 'text'
	 */
	declare public inputMode: string;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.set( 'inputMode', 'text' );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'input',
			attributes: {
				class: [
					'ck',
					'ck-input',
					bind.if( 'isFocused', 'ck-input_focused' ),
					bind.if( 'isEmpty', 'ck-input-text_empty' ),
					bind.if( 'hasError', 'ck-error' )
				],
				id: bind.to( 'id' ),
				placeholder: bind.to( 'placeholder' ),
				readonly: bind.to( 'isReadOnly' ),
				inputmode: bind.to( 'inputMode' ),
				'aria-invalid': bind.if( 'hasError', true ),
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},
			on: {
				input: bind.to( ( ...args ) => {
					this.fire( 'input', ...args );
					this._updateIsEmpty();
				} ),
				change: bind.to( this._updateIsEmpty.bind( this ) )
			}
		} );
	}
}

/**
 * Fired when the user types in the input. Corresponds to the native
 * DOM `input` event.
 *
 * @eventName ~InputView#input
 */
export type InputViewInputEvent = {
	name: 'input';
	args: [ InputEvent ];
};
