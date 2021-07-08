#### `<picture>` element support (`PictureEditing` plugin)

**Note**: For the purpose of this test, all images in the editor that use `<picture>` have 🖼 next to them (via CSS).

**Note**: For the time being, uploading images in this test will always insert a pre-defined image with pre-defined picture sources (project's logo). This should change when an upload service supporting `<picture>` is available.

1. Some images in this test use `<picture>` and some not.
1. Scale down the viewport (browser window) to see `<picture>`-based images change their look (this is called [art direction](http://usecases.responsiveimages.org/#art-direction)).
1. Make sure linking and unlinking `<picture>`-based images works as expected.
1. Make sure resizing `<picture>`-based images works as expected.
1. Make sure copy, paste, drag, and drop of `<picture>`-based images work as expected.

---

You can add the `sources` attribute to any selected image to make it render using `<picture>`:

```js
editor.model.change( writer => writer.setAttribute( 'sources', [
	{
		srcset: 'logo-square.png',
		media: '(max-width: 800px)',
		type: 'image/png'
	},
	{
		srcset: 'logo-wide.png',
		media: '(min-width: 800px)',
		type: 'image/png'
	}
], editor.model.document.selection.getFirstRange() ) );
```

you can also remove `sources` and make a `<picture>`-based image a "regular one" by using

```js
editor.model.change( writer => {
	writer.removeAttribute( 'sources', editor.model.document.selection.getFirstRange() )
} );
```
