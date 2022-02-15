/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import {
	LabelView,
	View
} from 'ckeditor5/src/ui';
import StyleGridView from './stylegridview';

import '../../theme/stylegroup.css';

/**
 * TODO
 *
 * @extends module:ui/view~View
 */
export default class StyleGroupView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, label, styleDefinitions ) {
		super( locale );

		/**
		 * TODO
		 */
		this.labelView = new LabelView( locale );
		this.labelView.text = label;

		/**
		 * TODO
		 */
		this.gridView = new StyleGridView( locale, styleDefinitions );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-style-panel__style-group'
				],
				role: 'group',
				'aria-labelledby': this.labelView.id
			},

			children: [
				this.labelView,
				this.gridView
			]
		} );
	}
}
