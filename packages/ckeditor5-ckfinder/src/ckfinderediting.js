/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckfinder/ckfinderediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Notification } from 'ckeditor5/src/ui';

import CKFinderCommand from './ckfindercommand';

/**
 * The CKFinder editing feature. It introduces the {@link module:ckfinder/ckfindercommand~CKFinderCommand CKFinder command}.
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
		return [ Notification, 'ImageEditing', 'LinkEditing' ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.commands.add( 'ckfinder', new CKFinderCommand( editor ) );
	}
}
