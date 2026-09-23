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
	{ label: 'Indigo 50', color: 'hsl(231.4, 43.8%, 93.7%)' },
	{ label: 'Blue 50', color: 'hsl(205.4, 86.7%, 94.1%)' },
	{ label: 'Cyan 50', color: 'hsl(187, 72%, 93%)' },
	{ label: 'Teal 50', color: 'hsl(176.7, 40.9%, 91.4%)' },
	{ label: 'Light green 50', color: 'hsl(88, 51.7%, 94.3%)' },
	{ label: 'Lime 50', color: 'hsl(66, 71.4%, 94.5%)' },
	{ label: 'Amber 50', color: 'hsl(46, 100%, 94.1%)' },
	{ label: 'Orange 50', color: 'hsl(37, 100%, 94%)' },
	{ label: 'Blue grey 50', color: 'hsl(204, 15.2%, 93.5%)' },
	{ label: 'White', color: 'hsl(0, 0%, 100%)', hasBorder: true },
	{ label: 'Red 100', color: 'hsl(354, 100%, 90.2%)' },
	{ label: 'Purple 100', color: 'hsl(291.2, 46.1%, 82.5%)' },
	{ label: 'Indigo 100', color: 'hsl(231.7, 45%, 84.3%)' },
	{ label: 'Blue 100', color: 'hsl(207.2, 88.9%, 85.9%)' },
	{ label: 'Cyan 100', color: 'hsl(186.6, 71.1%, 82.4%)' },
	{ label: 'Teal 100', color: 'hsl(174.7, 41.3%, 78.6%)' },
	{ label: 'Light green 100', color: 'hsl(87.6, 50.7%, 85.7%)' },
	{ label: 'Lime 100', color: 'hsl(65, 69%, 86%)' },
	{ label: 'Amber 100', color: 'hsl(45, 100%, 85.1%)' },
	{ label: 'Orange 100', color: 'hsl(35.8, 100%, 84.9%)' },
	{ label: 'Blue grey 100', color: 'hsl(198.5, 15.7%, 83.7%)' },
	{ label: 'Grey 100', color: 'hsl(0, 0%, 96%)' },
	{ label: 'Red 200', color: 'hsl(0, 73%, 77%)' },
	{ label: 'Purple 200', color: 'hsl(291.3, 46.9%, 71.2%)' },
	{ label: 'Indigo 200', color: 'hsl(230.8, 44.4%, 73.9%)' },
	{ label: 'Blue 200', color: 'hsl(207, 90%, 77%)' },
	{ label: 'Cyan 200', color: 'hsl(187, 72%, 71%)' },
	{ label: 'Teal 200', color: 'hsl(174, 42%, 65%)' },
	{ label: 'Light green 200', color: 'hsl(88, 50%, 76.5%)' },
	{ label: 'Lime 200', color: 'hsl(65.9, 70.7%, 77.3%)' },
	{ label: 'Amber 200', color: 'hsl(45.1, 100%, 75.5%)' },
	{ label: 'Orange 200', color: 'hsl(36, 100%, 75%)' },
	{ label: 'Blue grey 200', color: 'hsl(200, 15.3%, 73.1%)' },
	{ label: 'Grey 200', color: 'hsl(0, 0%, 93.3%)' },
	{ label: 'Red 300', color: 'hsl(0, 68.7%, 67.5%)' },
	{ label: 'Purple 300', color: 'hsl(291.2, 46.6%, 59.6%)' },
	{ label: 'Indigo 300', color: 'hsl(230.5, 44.1%, 63.5%)' },
	{ label: 'Blue 300', color: 'hsl(206.7, 89%, 67.8%)' },
	{ label: 'Cyan 300', color: 'hsl(186.9, 71.2%, 59.2%)' },
	{ label: 'Teal 300', color: 'hsl(174.3, 41.8%, 50.8%)' },
	{ label: 'Light green 300', color: 'hsl(88, 50%, 67%)' },
	{ label: 'Lime 300', color: 'hsl(65.8, 70.4%, 68.2%)' },
	{ label: 'Amber 300', color: 'hsl(45.7, 100%, 65.5%)' },
	{ label: 'Orange 300', color: 'hsl(35.7, 100%, 65.1%)' },
	{ label: 'Blue grey 300', color: 'hsl(200, 15.6%, 62.4%)' },
	{ label: 'Grey 300', color: 'hsl(0, 0%, 88%)' },
	{ label: 'Red 400', color: 'hsl(1.1, 83.2%, 62.5%)' },
	{ label: 'Purple 400', color: 'hsl(291.3, 46.6%, 50.8%)' },
	{ label: 'Indigo 400', color: 'hsl(231, 44.2%, 55.7%)' },
	{ label: 'Blue 400', color: 'hsl(207, 90%, 61%)' },
	{ label: 'Cyan 400', color: 'hsl(186.7, 70.9%, 50.2%)' },
	{ label: 'Teal 400', color: 'hsl(174.4, 62.7%, 40%)' },
	{ label: 'Light green 400', color: 'hsl(88, 50.2%, 59.8%)' },
	{ label: 'Lime 400', color: 'hsl(65.7, 69.7%, 61.2%)' },
	{ label: 'Amber 400', color: 'hsl(45.2, 100%, 57.8%)' },
	{ label: 'Orange 400', color: 'hsl(35.7, 100%, 57.5%)' },
	{ label: 'Blue grey 400', color: 'hsl(200, 15.4%, 54.1%)' },
	{ label: 'Grey 400', color: 'hsl(0, 0%, 74%)' },
	{ label: 'Red 500', color: 'hsl(4.1, 89.6%, 58.4%)' },
	{ label: 'Purple 500', color: 'hsl(291.2, 63.7%, 42.2%)' },
	{ label: 'Indigo 500', color: 'hsl(230.8, 48.4%, 47.8%)' },
	{ label: 'Blue 500', color: 'hsl(206.6, 89.7%, 54.1%)' },
	{ label: 'Cyan 500', color: 'hsl(186.8, 100%, 41.6%)' },
	{ label: 'Teal 500', color: 'hsl(174.4, 100%, 29.4%)' },
	{ label: 'Light green 500', color: 'hsl(87.8, 50.2%, 52.7%)' },
	{ label: 'Lime 500', color: 'hsl(65.5, 70%, 54.3%)' },
	{ label: 'Amber 500', color: 'hsl(45, 100%, 51.4%)' },
	{ label: 'Orange 500', color: 'hsl(35.8, 100%, 50%)' },
	{ label: 'Blue grey 500', color: 'hsl(199.5, 18.3%, 46.1%)' },
	{ label: 'Grey 500', color: 'hsl(0, 0%, 62%)' },
	{ label: 'Red 600', color: 'hsl(1.4, 77.2%, 55.3%)' },
	{ label: 'Purple 600', color: 'hsl(287.5, 65%, 40.4%)' },
	{ label: 'Indigo 600', color: 'hsl(231.6, 50%, 44.7%)' },
	{ label: 'Blue 600', color: 'hsl(208, 79.3%, 50.8%)' },
	{ label: 'Cyan 600', color: 'hsl(186.5, 100%, 37.8%)' },
	{ label: 'Teal 600', color: 'hsl(173.9, 100%, 26.9%)' },
	{ label: 'Light green 600', color: 'hsl(89, 46%, 48%)' },
	{ label: 'Lime 600', color: 'hsl(64, 59.7%, 49.6%)' },
	{ label: 'Amber 600', color: 'hsl(42.1, 100%, 50%)' },
	{ label: 'Orange 600', color: 'hsl(33.5, 100%, 49.2%)' },
	{ label: 'Blue grey 600', color: 'hsl(198.9, 18.4%, 40.4%)' },
	{ label: 'Grey 600', color: 'hsl(0, 0%, 46%)' },
	{ label: 'Red 700', color: 'hsl(0, 65.1%, 50.6%)' },
	{ label: 'Purple 700', color: 'hsl(282.1, 67.9%, 37.8%)' },
	{ label: 'Indigo 700', color: 'hsl(231.9, 53.6%, 40.6%)' },
	{ label: 'Blue 700', color: 'hsl(209.8, 78.7%, 46.1%)' },
	{ label: 'Cyan 700', color: 'hsl(185.7, 100%, 32.7%)' },
	{ label: 'Teal 700', color: 'hsl(173.1, 100%, 23.7%)' },
	{ label: 'Light green 700', color: 'hsl(92, 48%, 42%)' },
	{ label: 'Lime 700', color: 'hsl(62.2, 61.4%, 43.7%)' },
	{ label: 'Amber 700', color: 'hsl(37.6, 100%, 50%)' },
	{ label: 'Orange 700', color: 'hsl(30.4, 100%, 48%)' },
	{ label: 'Blue grey 700', color: 'hsl(199.4, 18.3%, 33.1%)' },
	{ label: 'Grey 700', color: 'hsl(0, 0%, 38%)' },
	{ label: 'Red 800', color: 'hsl(0, 66.4%, 46.7%)' },
	{ label: 'Purple 800', color: 'hsl(277.3, 70.2%, 35.5%)' },
	{ label: 'Indigo 800', color: 'hsl(232.7, 57.2%, 36.7%)' },
	{ label: 'Blue 800', color: 'hsl(211.9, 80.3%, 41.8%)' },
	{ label: 'Cyan 800', color: 'hsl(185, 100%, 28%)' },
	{ label: 'Teal 800', color: 'hsl(172.6, 100%, 20.6%)' },
	{ label: 'Light green 800', color: 'hsl(95.2, 49.5%, 36.5%)' },
	{ label: 'Lime 800', color: 'hsl(59.5, 62.9%, 38%)' },
	{ label: 'Amber 800', color: 'hsl(33.6, 100%, 50%)' },
	{ label: 'Orange 800', color: 'hsl(27.1, 100%, 46.9%)' },
	{ label: 'Blue grey 800', color: 'hsl(200, 17.9%, 26.3%)' },
	{ label: 'Grey 800', color: 'hsl(0, 0%, 26%)' },
	{ label: 'Red 900', color: 'hsl(0, 73.5%, 41.4%)' },
	{ label: 'Purple 900', color: 'hsl(267, 75%, 31.4%)' },
	{ label: 'Indigo 900', color: 'hsl(234.6, 65.8%, 29.8%)' },
	{ label: 'Blue 900', color: 'hsl(216.5, 85.1%, 34.1%)' },
	{ label: 'Cyan 900', color: 'hsl(182.4, 100%, 19.6%)' },
	{ label: 'Teal 900', color: 'hsl(169.9, 100%, 15.1%)' },
	{ label: 'Light green 900', color: 'hsl(103.2, 55.6%, 26.5%)' },
	{ label: 'Lime 900', color: 'hsl(54, 70%, 30%)' },
	{ label: 'Amber 900', color: 'hsl(26.1, 100%, 50%)' },
	{ label: 'Orange 900', color: 'hsl(21.1, 100%, 45.1%)' },
	{ label: 'Blue grey 900', color: 'hsl(200, 19.1%, 18.4%)' },
	{ label: 'Black', color: 'hsl(0, 0%, 0%)' }
];

/**
 * The number of columns in the {@link module:ui/colorgrid/colors~defaultColors default color palette}.
 *
 * @internal
 */
export const defaultColorGridColumns = 12;
