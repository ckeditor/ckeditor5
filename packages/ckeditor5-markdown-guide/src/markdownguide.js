import { Plugin } from 'ckeditor5/src/core';

import MarkdownGuideUI from './markdownguideui';

/**
 * @extends module:core/plugin~Plugin
 */
export default class MarkdownGuide extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MarkdownGuideUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MarkdownGuide';
	}
}
