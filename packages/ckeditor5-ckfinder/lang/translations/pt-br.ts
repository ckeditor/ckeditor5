/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt-br': {
		dictionary: {
			// Toolbar button tooltip for inserting an image or file via a CKFinder file browser.
			'Insert image or file': 'Inserir imagem ou arquivo',
			// Error message displayed when inserting a resized version of an image failed.
			'Could not obtain resized image URL.': 'Não foi possível obter o endereço da imagem redimensionada',
			// Title of a notification displayed when inserting a resized version of an image failed.
			'Selecting resized image failed': 'Seleção da imagem redimensionada falhou',
			// Error message displayed when an image cannot be inserted at the current position.
			'Could not insert image at the current position.': 'Não foi possível inserir a imagem na posição atual',
			// Title of a notification displayed when an image cannot be inserted at the current position.
			'Inserting image failed': 'Falha ao inserir imagem'
		}
	}
};

export default translations;
