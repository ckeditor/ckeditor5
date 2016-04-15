/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from '../../../utils/utils.js';
import EmitterMixin from '../../../utils/emittermixin.js';
import deleteContents from './deletecontents.js';
import modifySelection from './modifyselection.js';

/**
 * Set of frequently used tools to work with a document.
 * The instance of composer is available in {@link engine.treeModel.Document#composer}.
 *
 * By default this class implements only a very basic version of those algorithms. However, all its methods can be extended
 * by features by listening to related events. The default action of those events are implemented
 * by functions available in the {@link engine.treeModel.composer} namespace, so they can be reused
 * in the algorithms implemented by features.
 *
 * @member engine.treeModel.composer
 * @mixes utils.EmitterMixin
 */
export default class Composer {
	/**
	 * Creates an instance of the composer.
	 */
	constructor() {
		this.on( 'deleteContents', ( evt, data ) => deleteContents( data.batch, data.selection ) );
		this.on( 'modifySelection', ( evt, data ) => modifySelection( data.selection, data.options ) );
	}

	/**
	 * See {@link engine.treeModel.composer.deleteContents}.
	 *
	 * @fires engine.treeModel.composer.Composer#deleteContents
	 * @param {engine.treeModel.Batch} batch Batch to which the deltas will be added.
	 * @param {engine.treeModel.Selection} selection Selection of which the content should be deleted.
	 */
	deleteContents( batch, selection ) {
		this.fire( 'deleteContents', { batch, selection } );
	}

	/**
	 * See {@link engine.treeModel.composer.modifySelection}.
	 *
	 * @fires engine.treeModel.composer.Composer#modifySelection
	 * @param {engine.treeModel.Selection} The selection to modify.
	 * @param {Object} options See {@link engine.treeModel.composer.modifySelection}'s options.
	 */
	modifySelection( selection, options ) {
		this.fire( 'modifySelection', { selection, options } );
	}
}

utils.mix( Composer, EmitterMixin );
