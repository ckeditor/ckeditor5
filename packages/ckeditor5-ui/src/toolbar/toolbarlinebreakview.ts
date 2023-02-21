/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/toolbarlinebreakview
 */

import View from '../view';

import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The toolbar line break view class.
 */
export default class ToolbarLineBreakView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-toolbar__line-break'
				]
			}
		} );
	}
}
