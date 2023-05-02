import juice from 'juice';

import getContentStyles from './normalizers/utils';

import { Plugin } from 'ckeditor5/src/core';

export default class InlineStyles extends Plugin {
	static get pluginName() {
		return 'InlineStyles';
	}

	getDataWithInlineStyles( html, styles ) {
		const contentStyles = styles || getContentStyles();
		const data = html || `<div class="ck-content">${ this.editor.getData() }</div>`;

		return juice.inlineContent( data, contentStyles );
	}
}
