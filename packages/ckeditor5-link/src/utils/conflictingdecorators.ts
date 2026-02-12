/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/utils/conflictingdecorators
 */

/**
 * Checks if two decorators conflict with each other.
 *
 * Decorators conflict when they share the same HTML attribute names (excluding mergeable attributes)
 * or style properties.
 *
 * @internal
 * @param a The first decorator.
 * @param b The second decorator.
 */
export function areDecoratorsConflicting( a: DecoratorLike, b: DecoratorLike ): boolean {
	if ( a.attributes && b.attributes ) {
		const hasConflict = Object.keys( a.attributes ).some(
			key => !isMergeableAttribute( key ) && key in b.attributes!
		);

		if ( hasConflict ) {
			return true;
		}
	}

	// Check for conflicting style properties (same CSS property names).
	if ( a.styles && b.styles ) {
		const hasConflict = Object.keys( a.styles ).some( key => key in b.styles! );

		if ( hasConflict ) {
			return true;
		}
	}

	// Classes don't conflict with each other - they can be merged.
	return false;

	function isMergeableAttribute( key: string ): boolean {
		return key === 'class' || key === 'style' || key === 'rel';
	}
}

/**
 * Resolves conflicting manual decorators by automatically disabling decorators that share
 * the same HTML attributes with newly enabled decorators.
 *
 * @internal
 * @param options Configuration object.
 * @param options.decoratorStates Initial decorator states.
 * @param options.allDecorators Collection of all manual decorators.
 * @returns Updated decorator states with conflicts resolved.
 */
export function resolveConflictingDecorators(
	{
		decoratorStates,
		allDecorators
	}: {
		decoratorStates: Record<string, boolean>;
		allDecorators: Array<DecoratorLike & { value?: boolean }>;
	}
): Record<string, boolean> {
	const resolved: Record<string, boolean> = { ...decoratorStates };

	for ( const name in decoratorStates ) {
		if ( decoratorStates[ name ] && isNewlyAddedDecorator( name ) ) {
			const conflicts = getConflictingManualDecorators( name, allDecorators );

			for ( const conflict of conflicts ) {
				resolved[ conflict ] = false;
			}
		}
	}

	function isNewlyAddedDecorator( name: string ): boolean {
		return allDecorators.some( item => item.id === name && !item.value );
	}

	return resolved;
}

/**
 * Returns array of decorator names that conflict with the given decorator.
 * Decorators conflict when they share the same HTML attribute names or style properties.
 *
 * @param decoratorId The id/name of the manual decorator to check for conflicts.
 * @param manualDecorators Collection of all manual decorators.
 * @returns Array of conflicting decorator names.
 */
function getConflictingManualDecorators(
	decoratorId: string,
	manualDecorators: Array<DecoratorLike>
): Array<string> {
	const decorator = manualDecorators.find( item => item.id === decoratorId );

	/* istanbul ignore next -- @preserve */
	if ( !decorator ) {
		return [];
	}

	return manualDecorators
		.filter( otherDecorator => otherDecorator.id !== decoratorId && areDecoratorsConflicting( decorator, otherDecorator ) )
		.map( item => item.id );
}

/**
 * Decorator-like object representing attributes and styles.
 */
type DecoratorLike = {
	id: string;
	attributes?: Record<string, string>;
	styles?: Record<string, string>;
};
