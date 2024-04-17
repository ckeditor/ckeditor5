import { Editor } from '@ckeditor/ckeditor5-core';
import { Element } from '@ckeditor/ckeditor5-engine';
import { HeadingConfig } from '@ckeditor/ckeditor5-heading';
import { ImageConfig, ImageStyleConfig } from '@ckeditor/ckeditor5-image/src/imageconfig';
import { TableConfig } from '@ckeditor/ckeditor5-table';

// Functions
export function MentionCustomization(editor: Editor) {
  editor.conversion.for('upcast').elementToAttribute({
    view: {
      name: 'span',
      key: 'data-mention',
      classes: 'mention',
      attributes: {
        'data-model': true,
        'data-id': true,
        'data-label-method': true,
        'data-label': true
      }
    },
    model: {
      key: 'mention',
      value: (viewItem: Element) => {
        const mentionAttribute = editor.plugins.get('Mention').toMentionAttribute(viewItem, {
          modelName: viewItem.getAttribute('data-model'),
          modelId: viewItem.getAttribute('data-id'),
          labelMethod: viewItem.getAttribute('data-label-method'),
          label: viewItem.getAttribute('data-label'),
          dataToggle: viewItem.getAttribute('data-toggle'),
          dataTitle: viewItem.getAttribute('data-original-title'),
        });
        return mentionAttribute;
      }
    },
    converterPriority: 'high'
  });
  editor.conversion.for('downcast').attributeToElement({
    model: 'mention',
    view: (modelAttributeValue, { writer }) => {
      if (!modelAttributeValue) {
        return;
      }
      setTimeout(function () {
      }, 500);

      return writer.createAttributeElement('span', {
        'class': 'mention',
        'data-model': modelAttributeValue.modelName,
        'data-id': modelAttributeValue.modelId || crypto.randomUUID(),
        'data-label': modelAttributeValue.label,
        'data-label-method': modelAttributeValue.labelMethod,
        'data-toggle': modelAttributeValue.dataToggle,
        'data-original-title': modelAttributeValue.dataTitle,
        'data-mentionings--render-target': 'mentioning',
        'data-container': '.element-box',
      }, {
        priority: 20,
        id: modelAttributeValue.uid
      });
    },
    converterPriority: 'high'
  });
}


// Constants
interface CkeditorNumericFontSizeConfig {
  options: (number | string)[];
}

export interface LanguageConfig {
  language: string;
  label: string;
  class: string;
}

export const NumericFontSizeConfig: CkeditorNumericFontSizeConfig = {
  options: [10, 12, 14, '16 (default)', 18, 20, 24, 36],
};

export const ImageStyles: ImageStyleConfig = {
  options: [
    'alignLeft',
    'alignCenter',
    'alignRight'
  ]
};

export const ImageConfiguration: ImageConfig = {
  resizeUnit: 'px',
  toolbar: [
    'imageStyle:inline',
    'imageStyle:wrapText',
    'imageStyle:breakText',
    '|',
    'imageTextAlternative',
    'toggleImageCaption',
  ],
  styles: ImageStyles,
};

export const CodeBlockConfiguration: { languages: LanguageConfig[] } = {
  languages: [
    { language: 'ruby', label: 'Ruby', class: 'ruby' },
    { language: 'plaintext', label: 'Plain text', class: '' },
    { language: 'javascript', label: 'JavaScript', class: 'js javascript js-code' },
    { language: 'python', label: 'Python', class: 'python' },
    { language: 'bash', label: 'Bash', class: 'bash' },
  ],
};

export const HeadingConfiguration: HeadingConfig = {
  options: [
    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
    { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
    { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
    { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
  ]
}

export const TableConfiguration: TableConfig  = {
  contentToolbar: [
    'tableColumn',
    'tableRow',
    'mergeTableCells',
    'tableCellProperties',
    'tableProperties',
    'toggleTableCaption'
  ],
  defaultHeadings: { rows: 1 },
  tableProperties: {
    defaultProperties: {
      backgroundColor: 'hsl(0, 0%, 100%)',
      borderStyle: 'solid',
      borderColor: 'gray',
      borderWidth: '2px',
      alignment: 'center',
      width: '',
      height: '',
    }
  },
  tableCellProperties: {
    defaultProperties: {
      borderStyle: 'solid',
      borderColor: 'gray',
      borderWidth: '2px',
      backgroundColor: 'hsl(0, 0%, 100%)',
      width: '',
      height: '',
      padding: ''
    }
  }
};
