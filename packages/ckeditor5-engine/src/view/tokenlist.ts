/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/tokenlist
 */

import { toArray, type ArrayOrItem } from '@ckeditor/ckeditor5-utils';
import type { AttributeValue } from './element.js';

/**
 * TODO
 */
export default class TokenList implements AttributeValue {
	/**
	 * TODO
	 */
	private _set = new Set<string>();

	/**
	 * Returns true if token list has no tokens set.
	 */
	public get isEmpty(): boolean {
		return this._set.size == 0;
	}

	/**
	 * Number of tokens.
	 */
	public get size(): number {
		return this._set.size;
	}

	/**
	 * TODO
	 */
	public setTo( value: string ): this {
		this.clear();

		for ( const token of value.split( /\s+/ ) ) {
			this._set.add( token );
		}

		return this;
	}

	/**
	 * TODO
	 */
	public has( name: string ): boolean {
		return this._set.has( name );
	}

	/**
	 * TODO
	 * Not a common interface!
	 */
	public add( tokens: ArrayOrItem<string> ): void {
		for ( const token of toArray( tokens ) ) {
			this._set.add( token );
		}
	}

	/**
	 * TODO
	 */
	public remove( tokens: ArrayOrItem<string> ): void {
		for ( const token of toArray( tokens ) ) {
			this._set.delete( token );
		}
	}

	/**
	 * TODO
	 */
	public toString(): string {
		return Array.from( this._set ).join( ' ' );
	}

	/**
	 * TODO This is not defined in StylesMap, should we unify this?
	 */
	public keys(): IterableIterator<string> {
		return this._set.keys();
	}

	/**
	 * Removes all styles.
	 */
	public clear(): void {
		this._set.clear();
	}

	/**
	 * TODO
	 */
	public isSimilar( other: TokenList ): boolean {
		if ( this.size !== other.size ) {
			return false;
		}

		for ( const token of this.keys() ) {
			if ( !other.has( token ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * TODO
	 * @internal
	 */
	public _clone(): this {
		const clone = new ( this.constructor as any )();

		clone._set = new Set( this._set );

		return clone;
	}
}
