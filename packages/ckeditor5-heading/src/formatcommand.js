/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from '../command.js';

export default class FormatCommand extends Command {
	constructor( editor ) {
		super( editor );

		this.set( 'value', 'paragraph' );

		this.listenTo( editor.document.selection, 'change', () => {
			const position = editor.document.selection.getFirstPosition();
			const parent = position.parent;

			switch ( parent.name ) {
				case 'h2':
					this.value = 'heading1';
					break;

				case 'h3':
					this.value = 'heading2';
					break;

				case 'h4':
					this.value = 'heading3';
					break;
			}
		} );
	}
}
