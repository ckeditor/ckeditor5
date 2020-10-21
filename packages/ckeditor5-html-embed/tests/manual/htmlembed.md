## HTML embed feature

--- 

**This test has changed the CSP definitions:**

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'none'; 
    media-src http://techslides.com/; 
    connect-src 'self' https://cksource.com http://*.cke-cs.com; 
    script-src 'self' https://cksource.com; 
    img-src * data:; 
    style-src 'self' 'unsafe-inline'; 
    frame-src *"
>
```

---

After the editor initialization, it should contain 5 widgets with embedded HTML:

- `video`
- `audio`
- `picture` (resize the window to see other images, limits: 1200px, 650px)
- `iframe`
- `table`

All resources are provided by the ["Sample Files for Development"](http://techslides.com/sample-files-for-development) article. Thanks!

By default, the "previews in view" mode is enabled. It means that previews should be visible. 

We use the [`sanitize-html`](https://www.npmjs.com/package/sanitize-html) package to clean up the input HTML. It means that some of the 
elements or attributes may be not rendered in the editing view. However, they still will be returned in the editor's data.

You can disable the preview mode and have the `textarea` element that will be blocked or enabled (depends on feature state).

For toggling the state (edit source / see preview), click the icon in the right-top corner.
