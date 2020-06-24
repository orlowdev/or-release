# Размещение Nightly-сборок

[en](./nightly-release.en.md) ∘ [ru](./nightly-release.ru.md)

Данный документ кратко описывает автоматизацию процесс публикации nightly-релизов. Более детально процесс описан в примерах ниже.

Требования:

- Нужна CI конфигурация, которая будет выполняться только при публикации нового релиза или тега
- Node необходим для использования `npx`

## GitHub Actions

```yml
# ./.github/workflows/nightly-release-workflow.yml
name: Nightly Release
on:
 # Таким образом назначается расписание.
 schedule:
  # Данная конфигурация выполняется каждую ночь в 01:00.
  # @see https://crontab.guru
  - cron: '0 1 * * *'
jobs:
 versioning:
  runs-on: ubuntu-latest
  steps:
   # Этот шаг извлекает исходный код из репозитория.
   - uses: actions/checkout@v2
     with:
      # Необходимо отключить глубину получения, т.к. по умолчанию
      # actions/checkout берёт только текущий коммит.
      fetch-depth: 0
   # Установка Node для получения возможности использовать `npx`.
   - name: Setup Node
     uses: actions/setup-node@v1
     with:
      node-version: '12.x'
   - name: Publish new version with build metadata attached
     # Запуск @priestine/versions с указанием build metadata на основе
     # текущей даты и пре-релиза nightly.
     # Результатом выполнения этой команды для версии 1.0.0 от 23 июня
     # 2020 будет `1.0.0-nightly.1+20200623`.
     run: npx @priestine/versions --pre-release=nightly --build-metadata=$(date '+%Y%m%d') --repository=$GITHUB_REPOSITORY
     env:
      # Для удобства, можно перенести часть конфигурации в переменные
      # окружения.
      PRIESTINE_VERSIONS_TOKEN: ${{ secrets.PRIESTINE_VERSIONS_TOKEN }}
```
