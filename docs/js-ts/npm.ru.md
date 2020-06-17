# Публикация релизов в NPM

[en](./npm.en.md) ∘ [ru](./npm.ru.md)

В данном документе кратко описан процесс автоматизации размещения новых релизов в **NPM**. Он также применим для публикации в другие реестры, включая **GitHub Packages**, дополнительную информацию можно получить из примеров ниже. Сам процесс довольно прямолинеен:

- Нужна CI конфигурация, которая будет выполняться только при публикации нового релиза или тега
- В её рамках, код должен быть подготовлен на размещению в реестре (к примеру, транспиляция TypeScript в JavaScript)
- Версия релиза должна быть помещена в `package.json` в качестве значения для свойства **version**
- Для возможности опубликовать пакет в реестре, понадобится переменная окружения `NODE_AUTH_TOKEN`
- Можно публиковать

## GitHub Actions

```yml
# ./.github/workflows/npm-publish-workflow.yml
name: Publish Node.js Package
on:
 release:
  # Исполнять только в случае нового GitHub Release.
  types: [released]
jobs:
 npm:
  runs-on: ubuntu-latest
  steps:
   - uses: actions/checkout@v2
   - uses: actions/setup-node@v1
     with:
      node-version: '12.x'
      # Если нужно публиковать в другой реестр, здесь можно указать его
      # адрес. Например, для публикации в GitHub Packages, нужно
      # указать "https://npm.pkg.github.com/".
      registry-url: 'https://registry.npmjs.org'
      # Если Вы используете скоуп (@...) в названии Вашего пакета,
      # укажите его здесь. В ином случае, данное свойство можно
      # удалить.
      scope: '@priestine'
   - name: Set env
     # Эта команда излекает версию из релизного тега и присваивает её
     # переменной окружения RELEASE_VERSION.
     run: echo ::set-env name=RELEASE_VERSION::${GITHUB_REF#refs/*/}
   - name: Install dependencies
     run: npm ci
     # На данном этапе должны выполняться все подготовительные работы
     # по приведению кодовой базы к тому виду, который ожидается при
     # нахождении пакета в реестре.
   - name: Transpile to JavaScript
     run: npm run build
     # Этот этап размещает версию из релизного тега в
     # package.json -> version.
   - run: |
      sed -i s/"\"version\":.*/\"version\": \"$RELEASE_VERSION\","/ package.json
   - name: Publish to NPM
     run: npm publish
     env:
      # Для сохранения приватности, используйте GitHub Secrets.
      # @see https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
      NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
