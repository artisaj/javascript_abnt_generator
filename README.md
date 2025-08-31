# ABNT Generator

Gerador automático de documento acadêmico (TCC / Monografia) em DOCX conforme formatação ABNT, a partir de arquivos estruturados (JSON / TXT / HTML simples) e hierarquia de pastas.

## Principais Recursos
- Capa e contracapa via JSON
- Agradecimentos, Resumo, Abstract (palavras‑chave)
- Listas: Ilustrações, Abreviaturas e Siglas
- Sumário automático (TOC do Word)
- Geração hierárquica de tópicos ilimitados (1., 1.1., 1.1.1., ...)
- Numeração de páginas iniciando na Introdução
- Referências com HTML inline simples (<b>, <i>, <u>, <br>) e links clicáveis
- Indentação ABNT (primeira linha ~1,25 cm)
- Quebra automática antes de Referências

## Requisitos
- Node.js 18+
- Dependências:
```bash
npm install docx
```

## Execução
```bash
node abnt-generator.js
```
Saída em `saidas/v1.docx`.

## Estrutura de Pastas (Resumo)
```plaintext
estrutura/
  capa.json
  contracapa.json
  agradecimentos.txt
  resumo.json
  abstract.json
  listaIlustracoes.json
  siglas.json
  conteudo/
    01-Introducao.txt
    02-Exemplo_Titulo/
      index.txt
      01-Exemplo_Subtopico/
        index.txt
        01-Exemplo_Subsubtopico/
          index.txt
    03-Referências_Bibliográficas.txt
```

## Regras de Nomeação dos Tópicos
- Prefixo numérico NN- controla ordem e numeração.
- Underscore `_` vira espaço.
- `index.txt` dentro da pasta = texto introdutório.
- Subpastas/arquivos geram níveis: 1., 1.1., 1.1.1., 1.1.1.1 etc.
- Títulos em CAIXA ALTA com ponto após numeração (ex.: `1. INTRODUÇÃO`).

## Arquivos de Conteúdo
`capa.json` / `contracapa.json` (exemplo):
```json
{
  "universidade": "Universidade X",
  "nomeAluno": "Nome Sobrenome",
  "tituloTCC": "Título",
  "subtituloTCC": "Subtítulo",
  "natureza": "Monografia apresentada...",
  "nomeOrientador": "Prof. Dr. Fulano",
  "local": "Cidade",
  "ano": "2025"
}
```
`resumo.json` / `abstract.json`:
```json
{
  "texto": "Parágrafos separados por linha em branco.",
  "palavrasChave": ["Termo A", "Termo B"]
}
```
`listaIlustracoes.json`:
```json
{ "ilustracoes": ["Mapa de X", "Gráfico Y"] }
```
`siglas.json`:
```json
[
  { "sigla": "ONU", "descricao": "Organização das Nações Unidas" }
]
```
Referências (TXT com HTML inline):
```html
SOBRENOME, Autor. <b>Título da Obra</b>. Editora, 2023.
```

## Referências
- Nova página automática.
- HTML inline permitido: `<b> <strong> <i> <em> <u> <br>`.
- URLs viram hyperlinks azuis sublinhados.

## Sumário
- Inserido antes do conteúdo.
- Atualizar no Word: Ctrl+A → F9 (se necessário).

## Formatação
- Fonte: Times New Roman 12 pt.
- Corpo justificado, primeira linha recuada ~1,25 cm.
- Espaçamento entre parágrafos: after ~200 twips.
- Cabeçalho: número de página a partir da Introdução.
- Pré-textuais sem número visível.

## Adicionando Novo Tópico
Criar arquivo/pasta numerada:
```plaintext
estrutura/conteudo/04-Metodologia/
  index.txt
  01-Procedimentos.txt
  02-Analise_Dados.txt
```
Executar novamente o gerador.

## Erros Comuns
- Sumário vazio: atualizar campos no Word.
- Sem hyperlink: garantir URL contínua (sem quebra).
- Numeração errada: revisar prefixos NN-.

## Próximas Melhorias (Ideias)
- Formatação ABNT detalhada de referências.
- Inserção de figuras/tabelas com legenda.
- Citações e referências cruzadas.
- Exportação direta para PDF.

## Uso (Trecho Simplificado)
```javascript
import { gerarSecoesConteudo } from './builders/conteudo.js';
import { criarSumarioABNT } from './builders/sumario.js';
// Monta sections e gera Document(...)
```

## Licença
Definir (ex.: MIT).

## Contribuição
Abrir issue ou PR