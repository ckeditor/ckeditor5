/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/indentcommandbehavior/indentusingoffset
 */

import type { IndentBehavior } from './indentbehavior.js';

/**
 * The block indentation behavior that uses offsets to set indentation.
 */
export default class IndentUsingOffset implements IndentBehavior {
	/**
	 * The direction of indentation.
	 */
	public isForward: boolean;

	/**
	 * The offset of the next indentation step.
	 */
	public offset: number;

	/**
	 * Indentation unit.
	 */
	public unit: string;

	/**
	 * Creates an instance of the indentation behavior.
	 *
	 * @param config.direction The direction of indentation.
	 * @param config.offset The offset of the next indentation step.
	 * @param config.unit Indentation unit.
	 */
	constructor( config: { direction: 'forward' | 'backward'; offset: number; unit: string } ) {
		this.isForward = config.direction === 'forward';
		this.offset = config.offset;
		this.unit = config.unit;
	}

	/**
	 * @inheritDoc
	 */
	public checkEnabled( indentAttributeValue: string ): boolean {
		const currentOffset = parseFloat( indentAttributeValue || '0' );

		// The command is always enabled for forward indentation.
		return this.isForward || currentOffset > 0;
	}

	/**
	 * @inheritDoc
	 */
	public getNextIndent( indentAttributeValue: string ): string | undefined {
		const currentOffset = parseFloat( indentAttributeValue || '0' );
		const isSameUnit = !indentAttributeValue || indentAttributeValue.endsWith( this.unit );

		if ( !isSameUnit ) {
			return this.isForward ? this.offset + this.unit : undefined;
		}

		const nextOffset = this.isForward ? this.offset : -this.offset;

		const offsetToSet = currentOffset + nextOffset;

		return offsetToSet > 0 ? offsetToSet + this.unit : undefined;
	}
}
