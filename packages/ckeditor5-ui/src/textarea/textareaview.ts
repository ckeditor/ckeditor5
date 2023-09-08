/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/textarea/textareaview
 */

import { type Locale } from '@ckeditor/ckeditor5-utils';
import InputBase from '../input/inputbase';

import '../../theme/components/input/input.css';

/**
 * The textarea view class.
 */
export default class TextareaView extends InputBase<HTMLTextAreaElement> {
	/**
	 * Specifies the visible height of a text area, in lines.
	 *
	 * @observable
	 * @default 1
	 */
	declare public rows: number;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.set( 'rows', 1 );

		const bind = this.bindTemplate;

		this.template!.tag = 'textarea';

		this.extendTemplate( {
			attributes: {
				rows: bind.to( 'rows' )
			}
		} );
	}
}
