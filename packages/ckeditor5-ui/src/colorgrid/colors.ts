/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/colorgrid/colors
 */

import type { ColorOption } from './utils.js';

/**
 * The default color palette shared by every feature that displays a color grid: the font color,
 * the font background color, and the border and background colors of tables and table cells.
 *
 * It holds 12 hues in 10 shades each, from `50` to `900`, and fills a 12-column grid. Every row is one
 * shade and every column is one hue. The last column is a grey scale from white to black, matching the
 * lightness of each row.
 *
 * Shaded labels follow the `<hue> <shade>` pattern. {@link module:ui/colorgrid/utils~getLocalizedColorOptions}
 * translates the hue and keeps the shade number.
 *
 * @internal
 */
export const defaultColors: Array<ColorOption> = [
	{ label: 'Red 50', color: 'hsl(351, 100%, 96%)' },
	{ label: 'Purple 50', color: 'hsl(292, 44%, 93%)' },
	{ label: 'Indigo 50', color: 'hsl(231, 44%, 94%)' },
	{ label: 'Blue 50', color: 'hsl(205, 87%, 94%)' },
	{ label: 'Cyan 50', color: 'hsl(187, 72%, 93%)' },
	{ label: 'Teal 50', color: 'hsl(177, 41%, 91%)' },
	{ label: 'Light green 50', color: 'hsl(88, 52%, 94%)' },
	{ label: 'Lime 50', color: 'hsl(66, 71%, 95%)' },
	{ label: 'Amber 50', color: 'hsl(46, 100%, 94%)' },
	{ label: 'Orange 50', color: 'hsl(37, 100%, 94%)' },
	{ label: 'Blue grey 50', color: 'hsl(204, 15%, 94%)' },
	{ label: 'White', color: 'hsl(0, 0%, 100%)', hasBorder: true },
	{ label: 'Red 100', color: 'hsl(354, 100%, 90%)' },
	{ label: 'Purple 100', color: 'hsl(291, 46%, 83%)' },
	{ label: 'Indigo 100', color: 'hsl(232, 45%, 84%)' },
	{ label: 'Blue 100', color: 'hsl(207, 89%, 86%)' },
	{ label: 'Cyan 100', color: 'hsl(187, 71%, 82%)' },
	{ label: 'Teal 100', color: 'hsl(175, 41%, 79%)' },
	{ label: 'Light green 100', color: 'hsl(88, 51%, 86%)' },
	{ label: 'Lime 100', color: 'hsl(65, 69%, 86%)' },
	{ label: 'Amber 100', color: 'hsl(45, 100%, 85%)' },
	{ label: 'Orange 100', color: 'hsl(36, 100%, 85%)' },
	{ label: 'Blue grey 100', color: 'hsl(199, 16%, 84%)' },
	{ label: 'Grey 100', color: 'hsl(0, 0%, 96%)' },
	{ label: 'Red 200', color: 'hsl(0, 73%, 77%)' },
	{ label: 'Purple 200', color: 'hsl(291, 47%, 71%)' },
	{ label: 'Indigo 200', color: 'hsl(231, 44%, 74%)' },
	{ label: 'Blue 200', color: 'hsl(207, 90%, 77%)' },
	{ label: 'Cyan 200', color: 'hsl(187, 72%, 71%)' },
	{ label: 'Teal 200', color: 'hsl(174, 42%, 65%)' },
	{ label: 'Light green 200', color: 'hsl(88, 50%, 77%)' },
	{ label: 'Lime 200', color: 'hsl(66, 71%, 77%)' },
	{ label: 'Amber 200', color: 'hsl(45, 100%, 76%)' },
	{ label: 'Orange 200', color: 'hsl(36, 100%, 75%)' },
	{ label: 'Blue grey 200', color: 'hsl(200, 15%, 73%)' },
	{ label: 'Grey 200', color: 'hsl(0, 0%, 93%)' },
	{ label: 'Red 300', color: 'hsl(0, 69%, 68%)' },
	{ label: 'Purple 300', color: 'hsl(291, 47%, 60%)' },
	{ label: 'Indigo 300', color: 'hsl(231, 44%, 64%)' },
	{ label: 'Blue 300', color: 'hsl(207, 89%, 68%)' },
	{ label: 'Cyan 300', color: 'hsl(187, 71%, 59%)' },
	{ label: 'Teal 300', color: 'hsl(174, 42%, 51%)' },
	{ label: 'Light green 300', color: 'hsl(88, 50%, 67%)' },
	{ label: 'Lime 300', color: 'hsl(66, 70%, 68%)' },
	{ label: 'Amber 300', color: 'hsl(46, 100%, 66%)' },
	{ label: 'Orange 300', color: 'hsl(36, 100%, 65%)' },
	{ label: 'Blue grey 300', color: 'hsl(200, 16%, 62%)' },
	{ label: 'Grey 300', color: 'hsl(0, 0%, 88%)' },
	{ label: 'Red 400', color: 'hsl(1, 83%, 63%)' },
	{ label: 'Purple 400', color: 'hsl(291, 47%, 51%)' },
	{ label: 'Indigo 400', color: 'hsl(231, 44%, 56%)' },
	{ label: 'Blue 400', color: 'hsl(207, 90%, 61%)' },
	{ label: 'Cyan 400', color: 'hsl(187, 71%, 50%)' },
	{ label: 'Teal 400', color: 'hsl(174, 63%, 40%)' },
	{ label: 'Light green 400', color: 'hsl(88, 50%, 60%)' },
	{ label: 'Lime 400', color: 'hsl(66, 70%, 61%)' },
	{ label: 'Amber 400', color: 'hsl(45, 100%, 58%)' },
	{ label: 'Orange 400', color: 'hsl(36, 100%, 58%)' },
	{ label: 'Blue grey 400', color: 'hsl(200, 15%, 54%)' },
	{ label: 'Grey 400', color: 'hsl(0, 0%, 74%)' },
	{ label: 'Red 500', color: 'hsl(4, 90%, 58%)' },
	{ label: 'Purple 500', color: 'hsl(291, 64%, 42%)' },
	{ label: 'Indigo 500', color: 'hsl(231, 48%, 48%)' },
	{ label: 'Blue 500', color: 'hsl(207, 90%, 54%)' },
	{ label: 'Cyan 500', color: 'hsl(187, 100%, 42%)' },
	{ label: 'Teal 500', color: 'hsl(174, 100%, 29%)' },
	{ label: 'Light green 500', color: 'hsl(88, 50%, 53%)' },
	{ label: 'Lime 500', color: 'hsl(66, 70%, 54%)' },
	{ label: 'Amber 500', color: 'hsl(45, 100%, 51%)' },
	{ label: 'Orange 500', color: 'hsl(36, 100%, 50%)' },
	{ label: 'Blue grey 500', color: 'hsl(200, 18%, 46%)' },
	{ label: 'Grey 500', color: 'hsl(0, 0%, 62%)' },
	{ label: 'Red 600', color: 'hsl(1, 77%, 55%)' },
	{ label: 'Purple 600', color: 'hsl(288, 65%, 40%)' },
	{ label: 'Indigo 600', color: 'hsl(232, 50%, 45%)' },
	{ label: 'Blue 600', color: 'hsl(208, 79%, 51%)' },
	{ label: 'Cyan 600', color: 'hsl(187, 100%, 38%)' },
	{ label: 'Teal 600', color: 'hsl(174, 100%, 27%)' },
	{ label: 'Light green 600', color: 'hsl(89, 46%, 48%)' },
	{ label: 'Lime 600', color: 'hsl(64, 60%, 50%)' },
	{ label: 'Amber 600', color: 'hsl(42, 100%, 50%)' },
	{ label: 'Orange 600', color: 'hsl(34, 100%, 49%)' },
	{ label: 'Blue grey 600', color: 'hsl(199, 18%, 40%)' },
	{ label: 'Grey 600', color: 'hsl(0, 0%, 46%)' },
	{ label: 'Red 700', color: 'hsl(0, 65%, 51%)' },
	{ label: 'Purple 700', color: 'hsl(282, 68%, 38%)' },
	{ label: 'Indigo 700', color: 'hsl(232, 54%, 41%)' },
	{ label: 'Blue 700', color: 'hsl(210, 79%, 46%)' },
	{ label: 'Cyan 700', color: 'hsl(186, 100%, 33%)' },
	{ label: 'Teal 700', color: 'hsl(173, 100%, 24%)' },
	{ label: 'Light green 700', color: 'hsl(92, 48%, 42%)' },
	{ label: 'Lime 700', color: 'hsl(62, 61%, 44%)' },
	{ label: 'Amber 700', color: 'hsl(38, 100%, 50%)' },
	{ label: 'Orange 700', color: 'hsl(30, 100%, 48%)' },
	{ label: 'Blue grey 700', color: 'hsl(199, 18%, 33%)' },
	{ label: 'Grey 700', color: 'hsl(0, 0%, 38%)' },
	{ label: 'Red 800', color: 'hsl(0, 66%, 47%)' },
	{ label: 'Purple 800', color: 'hsl(277, 70%, 36%)' },
	{ label: 'Indigo 800', color: 'hsl(233, 57%, 37%)' },
	{ label: 'Blue 800', color: 'hsl(212, 80%, 42%)' },
	{ label: 'Cyan 800', color: 'hsl(185, 100%, 28%)' },
	{ label: 'Teal 800', color: 'hsl(173, 100%, 21%)' },
	{ label: 'Light green 800', color: 'hsl(95, 50%, 37%)' },
	{ label: 'Lime 800', color: 'hsl(60, 63%, 38%)' },
	{ label: 'Amber 800', color: 'hsl(34, 100%, 50%)' },
	{ label: 'Orange 800', color: 'hsl(27, 100%, 47%)' },
	{ label: 'Blue grey 800', color: 'hsl(200, 18%, 26%)' },
	{ label: 'Grey 800', color: 'hsl(0, 0%, 26%)' },
	{ label: 'Red 900', color: 'hsl(0, 74%, 41%)' },
	{ label: 'Purple 900', color: 'hsl(267, 75%, 31%)' },
	{ label: 'Indigo 900', color: 'hsl(235, 66%, 30%)' },
	{ label: 'Blue 900', color: 'hsl(217, 85%, 34%)' },
	{ label: 'Cyan 900', color: 'hsl(182, 100%, 20%)' },
	{ label: 'Teal 900', color: 'hsl(170, 100%, 15%)' },
	{ label: 'Light green 900', color: 'hsl(103, 56%, 27%)' },
	{ label: 'Lime 900', color: 'hsl(54, 70%, 30%)' },
	{ label: 'Amber 900', color: 'hsl(26, 100%, 50%)' },
	{ label: 'Orange 900', color: 'hsl(21, 100%, 45%)' },
	{ label: 'Blue grey 900', color: 'hsl(200, 19%, 18%)' },
	{ label: 'Black', color: 'hsl(0, 0%, 0%)' }
];

/**
 * The number of columns in the {@link module:ui/colorgrid/colors~defaultColors default color palette}.
 *
 * @internal
 */
export const defaultColorGridColumns = 12;
