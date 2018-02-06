/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dev-utils/deltareplayer
 */

/* global setTimeout */

import DeltaFactory from '../model/delta/deltafactory';

/**
 * Delta replayer is a development tool created for easy replaying of operations on the document from stringified deltas.
 */
export default class DeltaReplayer {
	/**
	 * @param {module:engine/model/model~Model} model Data model.
	 * @param {String} logSeparator Separator between deltas.
	 * @param {String} stringifiedDeltas Deltas to replay.
	 */
	constructor( model, logSeparator, stringifiedDeltas ) {
		this._model = model;
		this._logSeparator = logSeparator;
		this.setStringifiedDeltas( stringifiedDeltas );
	}

	/**
	 * Parses the given string containing stringified deltas and sets parsed deltas as deltas to replay.
	 *
	 * @param {String} stringifiedDeltas Stringified deltas to replay.
	 */
	setStringifiedDeltas( stringifiedDeltas ) {
		if ( stringifiedDeltas === '' ) {
			this._deltasToReplay = [];

			return;
		}

		this._deltasToReplay = stringifiedDeltas
			.split( this._logSeparator )
			.map( stringifiedDelta => JSON.parse( stringifiedDelta ) );
	}

	/**
	 * Returns deltas to replay.
	 *
	 * @returns {Array.<module:engine/model/delta/delta~Delta>}
	 */
	getDeltasToReplay() {
		return this._deltasToReplay;
	}

	/**
	 * Applies all deltas with a delay between actions.
	 *
	 * @param {Number} timeInterval Time between applying deltas.
	 * @returns {Promise}
	 */
	play( timeInterval = 1000 ) {
		const deltaReplayer = this; // eslint-disable-line consistent-this

		return new Promise( ( res, rej ) => {
			play();

			function play() {
				deltaReplayer.applyNextDelta().then( isFinished => {
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
	 * Applies `numberOfDeltas` deltas, beginning after the last applied delta (or first delta, if no deltas were applied).
	 *
	 * @param {Number} numberOfDeltas The number of deltas to apply.
	 * @returns {Promise}
	 */
	applyDeltas( numberOfDeltas ) {
		if ( numberOfDeltas <= 0 ) {
			return;
		}

		return this.applyNextDelta()
			.then( isFinished => {
				if ( !isFinished ) {
					return this.applyDeltas( numberOfDeltas - 1 );
				}
			} );
	}

	/**
	 * Applies all deltas to replay at once.
	 *
	 * @returns {Promise}
	 */
	applyAllDeltas() {
		return this.applyNextDelta()
			.then( isFinished => {
				if ( !isFinished ) {
					return this.applyAllDeltas();
				}
			} );
	}

	/**
	 * Applies the next delta to replay. Returns a promise with the `isFinished` parameter that is `true` if the last
	 * delta in the replayer has been applied, `false` otherwise.
	 *
	 * @returns {Promise.<Boolean>}
	 */
	applyNextDelta() {
		const model = this._model;

		return new Promise( res => {
			model.enqueueChange( writer => {
				const jsonDelta = this._deltasToReplay.shift();

				if ( !jsonDelta ) {
					return res( true );
				}

				const delta = DeltaFactory.fromJSON( jsonDelta, model.document );

				writer.batch.addDelta( delta );

				for ( const operation of delta.operations ) {
					model.applyOperation( operation );
				}

				res( false );
			} );
		} );
	}
}
