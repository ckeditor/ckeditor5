# CKEditor 5 classic editor build - custom Edition #
## Liens utiles

- Guide suivi: https://blowstack.com/blog/create-ckeditor-5-custom-build
- Dépôt github: https://github.com/a-sauvaget/ckeditor5
- Package NPM: https://www.npmjs.com/package/@a-sauvaget/ckeditor5-custom-build

## Mettre à jour le package ##

Vérifier d'être bien dans le dossier *ckeditor5/packages/ckeditor5-build-classic* et dans la branche *customBuild*.

Après avoir effectuer des modifications, faire:

```sh
npm login
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]
npm publish --access=public
```

## Mettre à jour CKEditor via dépôt officiel ##

```sh
git fetch upstream
git merge upstream/stable
npm run build
npm update
```

Attention: il peut avoir des conflit à résoudre

