/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/observer/arrowkeysmodelobserver
 */

import ModelObserver from './modelobserver';
import { isArrowKeyCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

/**
 * Observes... TODO
 *
 * @extends module:engine/model/observer/modelobserver~ModelObserver
 */
export default class ArrowKeysModelObserver extends ModelObserver {
	/**
	 * @inheritDoc
	 */
	constructor( model ) {
		super( model, 'keydown', 'arrowkey' );
	}

	/**
	 * @inheritDoc
	 */
	translateViewEvent( data ) {
		if ( !isArrowKeyCode( data.keyCode ) ) {
			return false;
		}

		// TODO provide arrow direction
		// TODO maybe event type could be namespaced like arrowkey:left ?

		return data;
	}
}
