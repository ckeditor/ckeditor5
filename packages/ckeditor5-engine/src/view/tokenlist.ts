/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/tokenlist
 */

import { type ArrayOrItem, toArray } from '@ckeditor/ckeditor5-utils';
import type { ElementAttributeValue } from './element.js';

/**
 * TODO
 */
export default class TokenList implements ElementAttributeValue {
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
	 */
	public set( tokens: ArrayOrItem<string> ): void {
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
	 * TODO
	 */
	public keys(): Array<string> {
		return Array.from( this._set.keys() );
	}

	/**
	 * TODO
	 * @internal
	 */
	public _getConsumables(): Array<string> {
		return this.keys();
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
	 */
	public canMergeFrom(): boolean {
		return true;
	}

	/**
	 * TODO
	 */
	public mergeFrom( other: TokenList ): void {
		for ( const token of other._set.keys() ) {
			if ( !this._set.has( token ) ) {
				this._set.add( token );
			}
		}
	}

	/**
	 * TODO
	 */
	public isMatching( other: TokenList ): boolean {
		for ( const name of other.keys() ) {
			if ( !this.has( name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @internal
	 */
	public _getTokensMatch(
		attributeKey: string,
		patternToken: true | string | RegExp
	): Array<[ string, string ]> | undefined {
		const match: Array<[ string, string ]> = [];

		if ( patternToken === true ) {
			for ( const token of this._set.keys() ) {
				match.push( [ attributeKey, token ] );
			}

			return match;
		}

		if ( typeof patternToken == 'string' ) {
			for ( const token of patternToken.split( /\s+/ ) ) {
				if ( this._set.has( token ) ) {
					match.push( [ attributeKey, token ] );
				} else {
					return undefined;
				}
			}

			return match;
		}

		for ( const token of this._set.keys() ) {
			if ( token.match( patternToken ) ) {
				match.push( [ attributeKey, token ] );
			}
		}

		return match.length ? match : undefined;
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
