/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dev-utils/operationreplayer
 */

/* global setTimeout */

import OperationFactory from '../model/operation/operationfactory';

/**
 * Operation replayer is a development tool created for easy replaying of operations on the document from stringified operations.
 */
export default class OperationReplayer {
	/**
	 * @param {module:engine/model/model~Model} model Data model.
	 * @param {String} logSeparator Separator between operations.
	 * @param {String} stringifiedOperations Operations to replay.
	 */
	constructor( model, logSeparator, stringifiedOperations ) {
		this._model = model;
		this._logSeparator = logSeparator;
		this.setStringifiedOperations( stringifiedOperations );
	}

	/**
	 * Parses the given string containing stringified operations and sets parsed operations as operations to replay.
	 *
	 * @param {String} stringifiedOperations Stringified operations to replay.
	 */
	setStringifiedOperations( stringifiedOperations ) {
		if ( stringifiedOperations === '' ) {
			this._operationsToReplay = [];

			return;
		}

		this._operationsToReplay = stringifiedOperations
			.split( this._logSeparator )
			.map( stringifiedOperation => JSON.parse( stringifiedOperation ) );
	}

	/**
	 * Returns operations to replay.
	 *
	 * @returns {Array.<module:engine/model/operation/operation~Operation>}
	 */
	getOperationsToReplay() {
		return this._operationsToReplay;
	}

	/**
	 * Applies all operations with a delay between actions.
	 *
	 * @param {Number} timeInterval Time between applying operations.
	 * @returns {Promise}
	 */
	play( timeInterval = 1000 ) {
		const operationReplayer = this; // eslint-disable-line consistent-this

		return new Promise( ( res, rej ) => {
			play();

			function play() {
				operationReplayer.applyNextOperation().then( isFinished => {
					if ( isFinished ) {
						return res();
					}

					setTimeout( play, timeInterval );
				} ).catch( err => {
					rej( err );
				} );
			}
		} );
	}

	/**
	 * Applies `numberOfOperations` operations, beginning after the last applied operation (or first, if no operations were applied).
	 *
	 * @param {Number} numberOfOperations The number of operations to apply.
	 * @returns {Promise}
	 */
	applyOperations( numberOfOperations ) {
		if ( numberOfOperations <= 0 ) {
			return;
		}

		return this.applyNextOperation()
			.then( isFinished => {
				if ( !isFinished ) {
					return this.applyOperations( numberOfOperations - 1 );
				}
			} );
	}

	/**
	 * Applies all operations to replay at once.
	 *
	 * @returns {Promise}
	 */
	applyAllOperations() {
		return this.applyNextOperation()
			.then( isFinished => {
				if ( !isFinished ) {
					return this.applyAllOperations();
				}
			} );
	}

	/**
	 * Applies the next operation to replay. Returns a promise with the `isFinished` parameter that is `true` if the last
	 * operation in the replayer has been applied, `false` otherwise.
	 *
	 * @returns {Promise.<Boolean>}
	 */
	applyNextOperation() {
		const model = this._model;

		return new Promise( res => {
			model.enqueueChange( writer => {
				const operationJson = this._operationsToReplay.shift();

				if ( !operationJson ) {
					return res( true );
				}

				const operation = OperationFactory.fromJSON( operationJson, model.document );

				writer.batch.addOperation( operation );
				model.applyOperation( operation );

				res( false );
			} );
		} );
	}
}
