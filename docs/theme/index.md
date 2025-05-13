---
category: theme
order: 1
meta-title: CKEditor 5 theme Gloria | CKEditor 5 Documentation
menu-title: Theme
meta-description: Theme.
theme: true
toc: false
legacy: true
---

# Theme

## Code snippet

```js
const {
    ClassicEditor,
    Essentials,
    Bold,
    Italic,
    Font,
    Paragraph
} = CKEDITOR;

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        licenseKey: '<YOUR_LICENSE_KEY>',
        plugins: [ Essentials, Bold, Italic, Font, Paragraph ],
        toolbar: [
            'undo', 'redo', '|', 'bold', 'italic', '|',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
        ]
    } )
    .then( /* ... */ )
    .catch( /* ... */ );
```

## Components

<ck:button>Simple button</ck:button>

<ck:info-box info>
	<ck:button label="Simple button" />
</ck:info-box>

### Banner

<ck:banner>

<h2>Create your own <span>CKEditor 5</span></h2>

Check out our interactive Builder to quickly get a taste of CKEditor 5. It offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs.

- editor type,
- the features you need,
- the preferred framework (React, Angular, Vue or Vanilla JS),
- the preferred distribution method.

You get ready-to-use code tailored to your needs!

<ck:button-link target="_blank" href="https://ckeditor.com/ckeditor-5/builder?redirect=docs" variant="primary" label="Check out our interactive Builder" rounded="true"></ck:button-link>
</ck:banner>
