# Serverless - AWS Node.js Typescript

Projeto serverless para gerar PDF's com informações de usuários. 
Roda na AWS Lambda, utiliza dynamodb e armazena os arquivos no S3.

## Dependências

- `yarn or npm i` para instalar dependências
- `yarn or npm dynamodb:install` para instalar dynamodb local

## Execução
- `yarn or npm dynamodb:start` para rodar dynamodb local
- `yarn or npm dev` para rodar offline

## Deploy
- `serverless deploy` para executar o deploy


## Requisição HTTP

### Exemplo request:
```js
// POST http://localhost:3000/dev/generatePdf
{
	"id": "ba0f37fa-80a9-11ec-a8a3-0242ac120002",
	"name": "Adriano",
	"email": "adriano@gmail.com.br"
}
```

### Exemplo resposta:
```js
{
  "message": "PDF Gerado com sucesso!",
  "url": "{{localePath}}/ba0f37fa-80a9-11ec-a8a3-0242ac120002.pdf"
}
```

## Instruções execução e deploy

> **Requirements**: NodeJS `lts/fermium (v.14.18.1)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.
