/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/rootoperation
 */

import Operation from './operation';

import type Document from '../document';
import { CKEditorError } from '@ckeditor/ckeditor5-utils';

/**
 * Operation that creates or removes a root element.
 */
export default class RootOperation extends Operation {
	/**
	 * Root name to create or remove.
	 */
	public readonly rootName: string;

	/**
	 * Root element to create or remove.
	 */
	public readonly elementName: string;

	/**
	 * Specifies whether the operation adds (`true`) or removes the root (`false`).
	 */
	public readonly isAdd: boolean;

	/**
	 * Document for which the root should be created.
	 */
	private readonly _document: Document;

	/**
	 * Creates an operation that creates or removes a root element.
	 *
	 * @param rootName Root name.
	 * @param elementName Root element name.
	 * @param isAdd Specifies whether the operation adds (`true`) or removes the root (`false`).
	 * @param document Document for which the root should be created.
	 * @param baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor(
		rootName: string,
		elementName: string,
		isAdd: boolean,
		document: Document,
		baseVersion: number | null
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

	public override get type(): 'addRoot' | 'removeRoot' {
		return this.isAdd ? 'addRoot' : 'removeRoot';
	}

	public override clone(): RootOperation {
		return new RootOperation( this.rootName, this.elementName, this.isAdd, this._document, this.baseVersion );
	}

	public override getReversed(): RootOperation {
		return new RootOperation( this.rootName, this.elementName, !this.isAdd, this._document, this.baseVersion! + 1 );
	}

	public override _validate(): void {
		const root = this._document.getRoot( this.rootName )!;

		if ( root.isAttached() && this.isAdd ) {
			/**
			 * Trying to attach a root that is already attached.
			 *
			 * @error root-operation-root-attached
			 */
			throw new CKEditorError(
				'root-operation-root-attached',
				this
			);
		} else if ( !root.isAttached() && !this.isAdd ) {
			/**
			 * Trying to detach a root that is already detached.
			 *
			 * @error root-operation-root-detached
			 */
			throw new CKEditorError(
				'root-operation-root-detached',
				this
			);
		}
	}

	public override _execute(): void {
		this._document.getRoot( this.rootName )!._isAttached = this.isAdd;
	}

	public override toJSON(): unknown {
		const json: any = super.toJSON();

		// TODO: Temporary solution. To allow compressing `RootOperation`, it stored as `RootAttributeOperation` until changes are
		// TODO: introduced in operations compressor.
		json.__className = 'RootAttributeOperation';
		json.root = this.rootName;
		json.key = '$$' + this.type;
		json.oldValue = null;
		json.newValue = this.elementName;

		delete json._document;

		return json;
	}

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
		// TODO: Temporary solution. To allow compressing `RootOperation`, it stored as `RootAttributeOperation` until changes are
		// TODO: introduced in operations compressor.
		const type = json.key.substring( 2 );

		return new RootOperation( json.root, json.newValue, type === 'addRoot', document, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // public override toString(): string {
	// @if CK_DEBUG_ENGINE // 	return `RootOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE //		`${ this.type } -> "${ this.rootName }" (${ this.elementName })`;
	// @if CK_DEBUG_ENGINE // }
}
