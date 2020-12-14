/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module enter/entermodelobserver
 */

import ModelObserver from '@ckeditor/ckeditor5-engine/src/model/observer/modelobserver';

/**
 * Observes... TODO
 *
 * @extends module:engine/model/observer/modelobserver~ModelObserver
 */
export default class EnterModelObserver extends ModelObserver {
	/**
	 * @inheritDoc
	 */
	constructor( model ) {
		super( model, 'enter' );
	}
}
