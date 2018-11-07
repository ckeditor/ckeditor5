/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ckfinder/ckfinderediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CKFinderCommand from './ckfindercommand';

export default class CKFinderEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Register CKFinder command.
		editor.commands.add( 'ckfinder', new CKFinderCommand( editor ) );
	}
}
