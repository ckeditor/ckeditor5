/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/tokenlist
 */

import { type ArrayOrItem, toArray } from '@ckeditor/ckeditor5-utils';
import type { ElementAttributeValue } from './element.js';

/**
 * Token list. Allows handling (adding, removing, retrieving) a set of tokens (for example class names).
 */
export default class TokenList implements ElementAttributeValue {
	/**
	 * The set of tokens.
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
	 * Checks if a given token is set.
	 */
	public has( name: string ): boolean {
		return this._set.has( name );
	}

	/**
	 * Returns all tokens.
	 */
	public keys(): Array<string> {
		return Array.from( this._set.keys() );
	}

	/**
	 * Resets the value to the given one.
	 */
	public setTo( value: string ): this {
		this.clear();

		for ( const token of value.split( /\s+/ ) ) {
			if ( token ) {
				this._set.add( token );
			}
		}

		return this;
	}

	/**
	 * Sets a given token without affecting other tokens.
	 */
	public set( tokens: ArrayOrItem<string> ): void {
		for ( const token of toArray( tokens ) ) {
			if ( token ) {
				this._set.add( token );
			}
		}
	}

	/**
	 * Removes given token.
	 */
	public remove( tokens: ArrayOrItem<string> ): void {
		for ( const token of toArray( tokens ) ) {
			this._set.delete( token );
		}
	}

	/**
	 * Removes all tokens.
	 */
	public clear(): void {
		this._set.clear();
	}

	/**
	 * Returns a normalized tokens string.
	 */
	public toString(): string {
		return Array.from( this._set ).join( ' ' );
	}

	/**
	 * Returns `true` if both attributes have the same tokens.
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
	 * Clones the attribute value.
	 *
	 * @internal
	 */
	public _clone(): this {
		const clone = new ( this.constructor as any )();

		clone._set = new Set( this._set );

		return clone;
	}

	/**
	 * Used by the {@link module:engine/view/matcher~Matcher Matcher} to collect matching attribute tokens.
	 *
	 * @internal
	 * @param tokenPattern The matched token name pattern.
	 * @returns An array of matching tokens.
	 */
	public _getTokensMatch(
		tokenPattern: true | string | RegExp
	): Array<string> | undefined {
		const match: Array<string> = [];

		if ( tokenPattern === true ) {
			for ( const token of this._set.keys() ) {
				match.push( token );
			}

			return match;
		}

		if ( typeof tokenPattern == 'string' ) {
			for ( const token of tokenPattern.split( /\s+/ ) ) {
				if ( this._set.has( token ) ) {
					match.push( token );
				} else {
					return undefined;
				}
			}

			return match;
		}

		for ( const token of this._set.keys() ) {
			if ( token.match( tokenPattern ) ) {
				match.push( token );
			}
		}

		return match.length ? match : undefined;
	}

	/**
	 * Returns a list of consumables for the attribute.
	 *
	 * Could be filtered by the given token name.
	 *
	 * @internal
	 */
	public _getConsumables( name?: string ): Array<string> {
		return name ? [ name ] : this.keys();
	}

	/**
	 * Used by {@link module:engine/view/element~Element#_canMergeAttributesFrom} to verify if the given attribute
	 * can be merged without conflicts into the attribute.
	 *
	 * This method is indirectly used by the {@link module:engine/view/downcastwriter~DowncastWriter} while downcasting
	 * an {@link module:engine/view/attributeelement~AttributeElement} to merge it with other `AttributeElement`.
	 *
	 * @internal
	 */
	public _canMergeFrom(): boolean {
		return true;
	}

	/**
	 * Used by {@link module:engine/view/element~Element#_mergeAttributesFrom} to merge a given attribute into the attribute.
	 *
	 * This method is indirectly used by the {@link module:engine/view/downcastwriter~DowncastWriter} while down-casting
	 * an {@link module:engine/view/attributeelement~AttributeElement} to merge it with other AttributeElement.
	 *
	 * @internal
	 */
	public _mergeFrom( other: TokenList ): void {
		for ( const token of other._set.keys() ) {
			if ( !this._set.has( token ) ) {
				this._set.add( token );
			}
		}
	}

	/**
	 * Used by {@link module:engine/view/element~Element#_canSubtractAttributesOf} to verify if the given attribute
	 * can be fully subtracted from the attribute.
	 *
	 * This method is indirectly used by the {@link module:engine/view/downcastwriter~DowncastWriter} while down-casting
	 * an {@link module:engine/view/attributeelement~AttributeElement} to unwrap the AttributeElement.
	 *
	 * @internal
	 */
	public _isMatching( other: TokenList ): boolean {
		for ( const name of other._set.keys() ) {
			if ( !this._set.has( name ) ) {
				return false;
			}
		}

		return true;
	}
}
