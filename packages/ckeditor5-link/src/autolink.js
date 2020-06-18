/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/autolink
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import TextWatcher from '@ckeditor/ckeditor5-typing/src/textwatcher';

const regexp = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)) $/;

/**
 * The auto link plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoLink extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoLink';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		const watcher = new TextWatcher( editor.model, text => {
			const match = regexp.exec( text );

			if ( match ) {
				return { match };
			}
		} );

		const input = editor.plugins.get( 'Input' );

		watcher.on( 'matched:data', ( evt, data ) => {
			const { batch, range, match } = data;

			if ( !input.isInput( batch ) ) {
				return;
			}

			const url = match[ 1 ];

			// Enqueue change to make undo step.
			editor.model.enqueueChange( writer => {
				writer.setAttribute( 'linkHref', url, writer.createRange(
					range.start,
					range.end.getShiftedBy( -1 )
				) );
			} );
		} );
	}
}
