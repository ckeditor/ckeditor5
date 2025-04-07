/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Plugin } from '@ckeditor/ckeditor5-core';

export default class RevisionHistoryMock extends Plugin {
	static get pluginName() {
		return 'RevisionHistory';
	}

	static get isOfficialPlugin() {
		return true;
	}

	static showRevisionViewerCallback() {
		return () => {};
	}

	static closeRevisionViewerCallback() {
		return () => {};
	}

	constructor( editor ) {
		super( editor );

		editor.config.define( 'revisionHistory.showRevisionViewerCallback', RevisionHistoryMock.showRevisionViewerCallback );
		editor.config.define( 'revisionHistory.closeRevisionViewerCallback', RevisionHistoryMock.closeRevisionViewerCallback );
	}
}
