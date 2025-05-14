/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/dev-utils/operationreplayer
 */

import OperationFactory from '../model/operation/operationfactory.js';

import type Model from '../model/model.js';
import type Operation from '../model/operation/operation.js';

/**
 * Operation replayer is a development tool created for easy replaying of operations on the document from stringified operations.
 */
export default class OperationReplayer {
	private _model: Model;
	private _logSeparator: string;
	private _operationsToReplay!: Array<Operation>;

	/**
	 * @param model Data model.
	 * @param logSeparator Separator between operations.
	 * @param stringifiedOperations Operations to replay.
	 */
	constructor( model: Model, logSeparator: string, stringifiedOperations: string ) {
		this._model = model;
		this._logSeparator = logSeparator;
		this.setStringifiedOperations( stringifiedOperations );
	}

	/**
	 * Parses the given string containing stringified operations and sets parsed operations as operations to replay.
	 *
	 * @param stringifiedOperations Stringified operations to replay.
	 */
	public setStringifiedOperations( stringifiedOperations: string ): void {
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
	 */
	public getOperationsToReplay(): Array<Operation> {
		return this._operationsToReplay;
	}

	/**
	 * Applies all operations with a delay between actions.
	 *
	 * @param timeInterval Time between applying operations.
	 */
	public play( timeInterval = 1000 ): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
		const operationReplayer = this;

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
	 * @param numberOfOperations The number of operations to apply.
	 */
	public applyOperations( numberOfOperations: number ): Promise<void> | undefined {
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
	 */
	public applyAllOperations(): Promise<void> {
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
	 */
	public applyNextOperation(): Promise<boolean> {
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
