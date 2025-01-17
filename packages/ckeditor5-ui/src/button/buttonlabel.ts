/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/button/buttonlabel
*/

import type View from '../view.js';

/**
 * The button label interface. Implemented by the {@link module:ui/button/buttonlabelview~ButtonLabelView}
 * and any label view that can be used with the {@link module:ui/button/buttonview~ButtonView}.
 */
export default interface ButtonLabel extends View {

	/**
	 * The `id` attribute of the button label. It is used for accessibility purposes
	 * to describe the button.
	 *
	 * @observable
	 */
	id: string | undefined;

	/**
	 * The `style` attribute of the button label. It allows customizing the presentation
	 * of the label.
	 *
	 * @observable
	 */
	style: string | undefined;

	/**
	 * The human-readable text of the label.
	 *
	 * @observable
	 */
	text: string | undefined;

}
