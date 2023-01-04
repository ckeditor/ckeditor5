/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/model/operation/renameoperation
 */

import Operation from './operation';
import Element from '../element';
import Position from '../position';

import { CKEditorError } from '@ckeditor/ckeditor5-utils';

import type Document from '../document';

/**
 * Operation to change element's name.
 *
 * Using this class you can change element's name.
 *
 * @extends module:engine/model/operation/operation~Operation
 */
export default class RenameOperation extends Operation {
	public position: Position;
	public oldName: string;
	public newName: string;

	/**
	 * Creates an operation that changes element's name.
	 *
	 * @param {module:engine/model/position~Position} position Position before an element to change.
	 * @param {String} oldName Current name of the element.
	 * @param {String} newName New name for the element.
	 * @param {Number|null} baseVersion Document {@link module:engine/model/document~Document#version} on which operation
	 * can be applied or `null` if the operation operates on detached (non-document) tree.
	 */
	constructor( position: Position, oldName: string, newName: string, baseVersion: number | null ) {
		super( baseVersion );

		/**
		 * Position before an element to change.
		 *
		 * @member {module:engine/model/position~Position} module:engine/model/operation/renameoperation~RenameOperation#position
		 */
		this.position = position;
		// This position sticks to the next node because it is a position before the node that we want to change.
		this.position.stickiness = 'toNext';

		/**
		 * Current name of the element.
		 *
		 * @member {String} module:engine/model/operation/renameoperation~RenameOperation#oldName
		 */
		this.oldName = oldName;

		/**
		 * New name for the element.
		 *
		 * @member {String} module:engine/model/operation/renameoperation~RenameOperation#newName
		 */
		this.newName = newName;
	}

	/**
	 * @inheritDoc
	 */
	public get type(): 'rename' {
		return 'rename';
	}

	/**
	 * Creates and returns an operation that has the same parameters as this operation.
	 *
	 * @returns {module:engine/model/operation/renameoperation~RenameOperation} Clone of this operation.
	 */
	public clone(): RenameOperation {
		return new RenameOperation( this.position.clone(), this.oldName, this.newName, this.baseVersion );
	}

	/**
	 * See {@link module:engine/model/operation/operation~Operation#getReversed `Operation#getReversed()`}.
	 *
	 * @returns {module:engine/model/operation/renameoperation~RenameOperation}
	 */
	public getReversed(): Operation {
		return new RenameOperation( this.position.clone(), this.newName, this.oldName, this.baseVersion! + 1 );
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public override _validate(): void {
		const element = this.position.nodeAfter;

		if ( !( element instanceof Element ) ) {
			/**
			 * Given position is invalid or node after it is not instance of Element.
			 *
			 * @error rename-operation-wrong-position
			 */
			throw new CKEditorError(
				'rename-operation-wrong-position',
				this
			);
		} else if ( element.name !== this.oldName ) {
			/**
			 * Element to change has different name than operation's old name.
			 *
			 * @error rename-operation-wrong-name
			 */
			throw new CKEditorError(
				'rename-operation-wrong-name',
				this
			);
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 */
	public _execute(): void {
		const element = this.position.nodeAfter;

		( element as any ).name = this.newName;
	}

	/**
	 * @inheritDoc
	 */
	public override toJSON(): unknown {
		const json: any = super.toJSON();

		json.position = this.position.toJSON();

		return json;
	}

	/**
	 * @inheritDoc
	 */
	public static override get className(): string {
		return 'RenameOperation';
	}

	/**
	 * Creates `RenameOperation` object from deserialized object, i.e. from parsed JSON string.
	 *
	 * @param {Object} json Deserialized JSON object.
	 * @param {module:engine/model/document~Document} document Document on which this operation will be applied.
	 * @returns {module:engine/model/operation/attributeoperation~AttributeOperation}
	 */
	public static override fromJSON( json: any, document: Document ): RenameOperation {
		return new RenameOperation( Position.fromJSON( json.position, document ), json.oldName, json.newName, json.baseVersion );
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `RenameOperation( ${ this.baseVersion } ): ` +
	// @if CK_DEBUG_ENGINE //		`${ this.position }: "${ this.oldName }" -> "${ this.newName }"`;
	// @if CK_DEBUG_ENGINE // }
}
