/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/ui/stylegroupview
 */

import {
	LabelView,
	View
} from 'ckeditor5/src/ui';
import StyleGridView from './stylegridview';

import '../../theme/stylegroup.css';

/**
 * A class representing a group of styles (e.g. "block" or "inline").
 *
 * Renders a {@link module:style/ui/stylegridview~StyleGridView style grid} and a label.
 *
 * @protected
 * @extends module:ui/view~View
 */
export default class StyleGroupView extends View {
	/**
	 * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {String} label The localized label of the group.
	 * @param {Array.<module:style/style~StyleDefinition>} styleDefinitions Definitions of the styles in the group.
	 */
	constructor( locale, label, styleDefinitions ) {
		super( locale );

		/**
		 * The label of the group.
		 *
		 * @protected
		 * @readonly
		 * @member {module:ui/label~LabelView} #labelView
		 */
		this.labelView = new LabelView( locale );
		this.labelView.text = label;

		/**
		 * The styles grid of the group.
		 *
		 * @readonly
		 * @member {module:style/ui/stylegridview~StyleGridView} #gridView
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
