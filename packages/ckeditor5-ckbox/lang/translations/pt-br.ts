/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { Translations } from '@ckeditor/ckeditor5-utils';

const translations: Translations = {
	'pt-br': {
		dictionary: {
			// A toolbar button tooltip for opening the file browser that allows inserting an image or a file to the editor.
			'Open file manager': 'Abrir gerenciador de arquivos',
			// A message is displayed when CKEditor 5 cannot associate an image with any of the categories defined in CKBox while uploading an asset.
			'Cannot determine a category for the uploaded file.': 'Não foi possível determinar a categoria para o arquivo enviado.',
			// A message is displayed when the user is not authorised to access the CKBox workspace configured as default one.
			'Cannot access default workspace.': 'Não é possível acessar o espaço de trabalho padrão.',
			// The title of the notification displayed when there is no permission to edit assets.
			'You have no image editing permissions.': 'Você não tem permissão para editar imagens.',
			// Image toolbar button tooltip for opening a dialog to manipulate the image.
			'Edit image': 'Editar imagem',
			// A message stating that image editing is in progress.
			'Processing the edited image.': 'Processando a imagem editada.',
			// A message is displayed when the server fails to process an image or doesn't respond.
			'Server failed to process the image.': 'Falha do servidor ao processar a imagem.',
			// A message is displayed when category of the image user wants to edit can't be determined.
			'Failed to determine category of edited image.': 'Falha ao determinar a categoria da imagem editada.'
		}
	}
};

export default translations;
