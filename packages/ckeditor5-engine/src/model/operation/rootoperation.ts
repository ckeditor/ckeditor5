/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/model/operation/rootoperation
 */

import Operation from './operation.js';

import type Document from '../document.js';
import type { Selectable } from '../selection.js';

/**
 * Operation that creates (or attaches) or detaches a root element.
 */
export default class RootOperation extends Operation {
	/**
	 * Root name to create or detach.
	 */
	public readonly rootName: string;

	/**
	 * Root element name.
	 */
	public readonly elementName: string;

	/**
	 * Specifies whether the operation adds (`true`) or detaches the root (`false`).
	 */
	public readonly isAdd: boolean;

	/**
	 * Document which owns the root.
	 */
	private readonly _document: Document;

	/**
	 * Creates an operation that creates or removes a root element.
	 *
	 * @param rootName Root name to create or detach.
	 * @param elementName Root element name.
	 * @param isAdd Specifies whether the operation adds (`true`) or detaches the root (`false`).
	 * @param document Document which owns the root.
	 * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation can be applied.
	 */
	constructor(
		rootName: string,
		elementName: string,
		isAdd: boolean,
		document: Document,
		baseVersion: number
	) {
		super( baseVersion );

		this.rootName = rootName;
		this.elementName = elementName;
		this.isAdd = isAdd;
		this._document = document;

		// Make sure that the root exists ASAP, this is important for RTC.
		// If the root was dynamically added, there will be more operations that operate on/in this root.
		// These operations will require root element instance (in operation property or in position instance).
		// If the root is not created ahead of time, instantiating such operations may fail.
		if ( !this._document.getRoot( this.rootName ) ) {
			const root = this._document.createRoot( this.elementName, this.rootName );

			root._isAttached = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	public override get type(): 'addRoot' | 'detachRoot' {
		return this.isAdd ? 'addRoot' : 'detachRoot';
	}

	/**
	 * @inheritDoc
	 */
	public get affectedSelectable(): Selectable {
		return this._document.getRoot( this.rootName );
	}

	/**
	 * @inheritDoc
	 */
	public override clone(): RootOperation {
		return new RootOperation( this.rootName, this.elementName, this.isAdd, this._document, this.baseVersion! );
	}

	/**
	 * @inheritDoc
	 */
	public override getReversed(): RootOperation {
		return new RootOperation( this.rootName, this.elementName, !this.isAdd, this._document, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 */
	public override _execute(): void {
		this._document.getRoot( this.rootName )!._isAttached = this.isAdd;
	}

	/**
	 * @inheritDoc
	 */
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		delete json._document;

		return json;
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'RootOperation';
	}

	/**
	 * Creates `RootOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param json Deserialized JSON object.
	 * @param document Document on which this operation will be applied.
	 */
	public static override fromJSON( json: any, document: Document ): RootOperation {
		return new RootOperation( json.rootName, json.elementName, json.isAdd, document, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	return `RootOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE //		`${ this.type } -> "${ this.rootName }" (${ this.elementName })`;
	// @if CK_DEBUG_ENGINE // }
}
