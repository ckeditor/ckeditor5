/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/horizontalrule
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HorizontalRuleEditing from './horizontalruleediting';
import HorizontalRuleUI from './horizontalruleui';

/**
 * The horizontal rule plugin.
 *
 *
 * @extends module:core/plugin~Plugin
 */
export default class HorizontalRule extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HorizontalRuleEditing, HorizontalRuleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HorizontalRule';
	}
}
