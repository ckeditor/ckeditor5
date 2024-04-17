## CKEditor for Authorium

### Local
1. Navigate to the CKEditor package folder where modifications were made

   ```bash
   cd packages/ckeditor-build-multi-root
   ```

2. Generates the build folder containing the customized editor

   ```bash
	yarn build
   ```
   
3. Create symlinks to local project, only the first time

   ```bash
	yarn link
   ```

### Authorium repository
1. Link CKEditor custom editor to Authorium, only the first time

   ```bash
	yarn link "@ckeditor/ckeditor5-build-multi-root"
   ```

2. Update the repository already linked

   ```bash
	yarn install --force
   ```

3. Setup the authorium application `bin/setup`

   ```bash
	bin/setup
   ```
   
4. Run the application `bin/dev`

   ```bash
	bin/dev
   ```

## Publish package
`TODO: Publish package on release`

1. Navigate to the CKEditor package folder where modifications were made, log in to NPM, and adjust package.json to reflect your npm username

    ```bash
	npm login
   ```

2. After successful login, publish your custom build

   ```bash
	npm publish --access=public
   ```
