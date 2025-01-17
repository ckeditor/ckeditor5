/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/ui/stylegroupview
 */

import { LabelView, View } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';

import StyleGridView from './stylegridview.js';
import type { NormalizedStyleDefinition } from '../styleutils.js';

import '../../theme/stylegroup.css';

/**
 * A class representing a group of styles (e.g. "block" or "inline").
 *
 * Renders a {@link module:style/ui/stylegridview~StyleGridView style grid} and a label.
 */
export default class StyleGroupView extends View<HTMLDivElement> {
	/**
	 * The styles grid of the group.
	 */
	public readonly gridView: StyleGridView;

	/**
	 * The label of the group.
	 */
	public readonly labelView: LabelView;

	/**
	 * Creates an instance of the {@link module:style/ui/stylegroupview~StyleGroupView} class.
	 *
	 * @param locale The localization services instance.
	 * @param label The localized label of the group.
	 * @param styleDefinitions Definitions of the styles in the group.
	 */
	constructor( locale: Locale, label: string, styleDefinitions: Array<NormalizedStyleDefinition> ) {
		super( locale );

		this.labelView = new LabelView( locale );
		this.labelView.text = label;
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
