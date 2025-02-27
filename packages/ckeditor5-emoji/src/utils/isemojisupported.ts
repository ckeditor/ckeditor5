/**
 * @license Copyright (c) 2023, Koala Interactive SAS
 * For licensing, see https://github.com/koala-interactive/is-emoji-supported/blob/master/LICENSE.md
 */

/**
 * @module emoji/utils/isemojisupported
 */

/**
 * Checks if the two pixels parts are the same using canvas.
 */
export default function isEmojiSupported( unicode: string ): boolean {
	const ctx = getCanvas();

	/* istanbul ignore next -- @preserve */
	if ( !ctx ) {
		return false;
	}

	const CANVAS_HEIGHT = 25;
	const CANVAS_WIDTH = 20;
	const textSize = Math.floor( CANVAS_HEIGHT / 2 );

	// Initialize canvas context.
	ctx.font = textSize + 'px Arial, Sans-Serif';
	ctx.textBaseline = 'top';
	ctx.canvas.width = CANVAS_WIDTH * 2;
	ctx.canvas.height = CANVAS_HEIGHT;

	ctx.clearRect( 0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT );

	// Draw in red on the left.
	ctx.fillStyle = '#FF0000';
	ctx.fillText( unicode, 0, 22 );

	// Draw in blue on right.
	ctx.fillStyle = '#0000FF';
	ctx.fillText( unicode, CANVAS_WIDTH, 22 );

	const a = ctx.getImageData( 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT ).data;
	const count = a.length;
	let i = 0;

	// Search the first visible pixel.
	for ( ; i < count && !a[ i + 3 ]; i += 4 );

	// No visible pixel.
	/* istanbul ignore next -- @preserve */
	if ( i >= count ) {
		return false;
	}

	// Emoji has immutable color, so we check the color of the emoji in two different colors.
	// the result show be the same.
	const x = CANVAS_WIDTH + ( ( i / 4 ) % CANVAS_WIDTH );
	const y = Math.floor( i / 4 / CANVAS_WIDTH );
	const b = ctx.getImageData( x, y, 1, 1 ).data;

	/* istanbul ignore next -- @preserve */
	if ( a[ i ] !== b[ 0 ] || a[ i + 2 ] !== b[ 2 ]) {
		return false;
	}

	//Some emojis consist of different ones, so they will show multiple characters if they are not supported.
	/* istanbul ignore next -- @preserve */
	if ( ctx.measureText( unicode ).width >= CANVAS_WIDTH ) {
		return false;
	}

	// Supported.
	return true;
};

function getCanvas(): CanvasRenderingContext2D | null {
	try {
		return document.createElement( 'canvas' ).getContext( '2d', { willReadFrequently: true } );
	} catch {
		/* istanbul ignore next -- @preserve */
		return null;
	}
}
