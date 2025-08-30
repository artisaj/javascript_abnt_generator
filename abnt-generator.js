import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, Footer, Header, PageNumber } from 'docx';
import { criarCapaABNT } from './builders/capa.js';
import { criarContracapaABNT } from './builders/contracapa.js';
import { criarAgradecimentosABNT } from './builders/agradecimentos.js';
import { criarResumoABNT } from './builders/resumo.js';
import { criarAbstractABNT } from './builders/abstract.js';
import { criarListaIlustracoesABNT } from './builders/listaIlustracoes.js';
import { criarListaSiglasAbreviaturasABNT } from './builders/siglas.js';
import { gerarSecoesConteudo } from './builders/conteudo.js';

// Caminho do arquivo de capa e contracapa
const capaPath = path.join('estrutura', 'capa.json');
const contracapaPath = path.join('estrutura', 'contracapa.json');
const agradecimentosPath = path.join('estrutura', 'agradecimentos.txt');
const resumoPath = path.join('estrutura', 'resumo.json');
const abstractPath = path.join('estrutura', 'abstract.json');
const listaIlustracoesPath = path.join('estrutura', 'listaIlustracoes.json');
const siglasPath = path.join('estrutura', 'siglas.json');
const saidaDir = path.join('saidas');
const versao = 'v1';
const saidaDocx = path.join(saidaDir, `${versao}.docx`);

// Lê o conteúdo da capa e contracapa
const capa = JSON.parse(fs.readFileSync(capaPath, 'utf8'));
const contracapa = JSON.parse(fs.readFileSync(contracapaPath, 'utf8'));

let agradecimentosTexto = '';
if (fs.existsSync(agradecimentosPath)) {
    agradecimentosTexto = fs.readFileSync(agradecimentosPath, 'utf8');
}

let resumoData = {};
if (fs.existsSync(resumoPath)) {
    try {
        resumoData = JSON.parse(fs.readFileSync(resumoPath, 'utf8'));
    } catch { resumoData = {}; }
}

let abstractData = {};
if (fs.existsSync(abstractPath)) {
    try { abstractData = JSON.parse(fs.readFileSync(abstractPath, 'utf8')); } catch { abstractData = {}; }
}

let listaIlustracoesData = {};
if (fs.existsSync(listaIlustracoesPath)) {
    try { listaIlustracoesData = JSON.parse(fs.readFileSync(listaIlustracoesPath, 'utf8')); } catch { listaIlustracoesData = {}; }
}

let siglasData = [];
if (fs.existsSync(siglasPath)) {
    try {
		const raw = JSON.parse(fs.readFileSync(siglasPath, 'utf8'));
        if (Array.isArray(raw)) siglasData = raw;
    } catch { siglasData = []; }
}

// Propriedades comuns de página ABNT
const commonSectionProps = {
    properties: {
        page: {
            margin: { top: 1700, right: 1134, bottom: 1134, left: 1700 },
            size: { orientation: 'portrait', width: 11906, height: 16838 },
        },
    },
};

// Monta seções dinamicamente
const sections = [];

// Capa
sections.push({
    ...commonSectionProps,
    children: criarCapaABNT(capa),
    footers: {
        default: new Footer({
            children: [
                new Paragraph({
                    children: [new TextRun({ text: `${capa.local}     ${capa.ano}`, font: 'Times New Roman', size: 24 })],
                    alignment: 'center',
                }),
            ],
        }),
    },
});

// Contracapa
sections.push({
    ...commonSectionProps,
    children: criarContracapaABNT(contracapa),
    footers: {
        default: new Footer({
            children: [
                new Paragraph({
                    children: [new TextRun({ text: `${contracapa.local}     ${contracapa.ano}`, font: 'Times New Roman', size: 24 })],
                    alignment: 'center',
                }),
            ],
        }),
    },
});

// Agradecimentos (condicional)
const agradecimentosParas = criarAgradecimentosABNT(agradecimentosTexto);
if (agradecimentosParas.length) {
    sections.push({
        ...commonSectionProps,
        children: agradecimentosParas,
        footers: { default: new Footer({ children: [] }) }, // footer vazio
    });
}

// Resumo (condicional)
const resumoParas = criarResumoABNT(resumoData);
if (resumoParas.length) {
    sections.push({
        ...commonSectionProps,
        children: resumoParas,
        footers: { default: new Footer({ children: [] }) }, // footer vazio
    });
}

// Abstract (condicional)
const abstractParas = criarAbstractABNT(abstractData);
if (abstractParas.length) {
    sections.push({
        ...commonSectionProps,
        children: abstractParas,
        footers: { default: new Footer({ children: [] }) },
    });
}

// Lista de Ilustrações (condicional)
const listaIlustracoesParas = criarListaIlustracoesABNT(listaIlustracoesData);
if (listaIlustracoesParas.length) {
    sections.push({
        ...commonSectionProps,
        children: listaIlustracoesParas,
        footers: { default: new Footer({ children: [] }) },
    });
}

// Lista de Abreviaturas e Siglas (condicional)
const siglasParas = criarListaSiglasAbreviaturasABNT(siglasData);
if (siglasParas.length) {
    sections.push({
        ...commonSectionProps,
        children: siglasParas,
        footers: { default: new Footer({ children: [] }) },
    });
}

// Conteúdo principal (Introdução + demais tópicos)
const { secoes: secoesConteudo } = gerarSecoesConteudo(path.join('estrutura', 'conteudo'));
if (secoesConteudo.length) {
    sections.push({
        ...commonSectionProps,
        // Inicia numeração de páginas aqui
        properties: {
            ...commonSectionProps.properties,
            pageNumberStart: 1,
        },
        children: secoesConteudo,
        footers: { default: new Footer({ children: [] }) },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        children: [PageNumber.CURRENT],
                        alignment: 'right',
                    }),
                ],
            }),
        },
    });
}

// Criação do documento
const doc = new Document({
    sections,
    styles: {
        default: {
            document: { run: { font: 'Times New Roman', size: 24, color: '000000' } },
        },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { bold: true, size: 24 },
                paragraph: { spacing: { before: 200, after: 0 } },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { bold: true, size: 24 },
                paragraph: { spacing: { before: 150, after: 0 } },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { bold: true, size: 24 },
                paragraph: { spacing: { before: 120, after: 0 } },
            },
            {
                id: 'Heading4',
                name: 'Heading 4',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { bold: true, size: 24 },
                paragraph: { spacing: { before: 100, after: 0 } },
            },
            {
                id: 'Heading5',
                name: 'Heading 5',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { bold: true, size: 24 },
                paragraph: { spacing: { before: 100, after: 0 } },
            },
            {
                id: 'Heading6',
                name: 'Heading 6',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { bold: true, size: 24 },
                paragraph: { spacing: { before: 100, after: 0 } },
            },
        ],
    },
});

// Salva o arquivo DOCX
Packer.toBuffer(doc).then((buffer) => {
	if (!fs.existsSync(saidaDir)) fs.mkdirSync(saidaDir, { recursive: true });
	fs.writeFileSync(saidaDocx, buffer);
	console.log(`Arquivo gerado em: ${saidaDocx}`);
});
