/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinderediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';

import CKFinderCommand from './ckfindercommand';

/**
 * The CKFinder editing feature. It introduces the {@link module:ckfinder/ckfindercommand~CKFinderCommand ckfinder command}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CKFinderEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CKFinderEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Notification ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.commands.add( 'ckfinder', new CKFinderCommand( editor ) );
	}
}
