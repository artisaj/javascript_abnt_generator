import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, Footer } from 'docx';
import { criarCapaABNT } from './builders/capa.js';
import { criarContracapaABNT } from './builders/contracapa.js';
import { criarAgradecimentosABNT } from './builders/agradecimentos.js';
import { criarResumoABNT } from './builders/resumo.js';

// Caminho do arquivo de capa e contracapa
const capaPath = path.join('estrutura', 'capa.json');
const contracapaPath = path.join('estrutura', 'contracapa.json');
const agradecimentosPath = path.join('estrutura', 'agradecimentos.txt');
const resumoPath = path.join('estrutura', 'resumo.json');
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

// Propriedades comuns da seção
const commonSectionProps = {
	properties: {
		page: {
			margin: {
				top: 1700, // 3cm
				right: 1134, // 2cm
				bottom: 1134, // 2cm
				left: 1700, // 3cm
			},
			size: {
				orientation: 'portrait',
				width: 11906, // A4 width in twips
				height: 16838, // A4 height in twips
			},
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

const doc = new Document({
    sections,
    styles: {
        default: {
            document: {
                run: { font: 'Times New Roman', size: 24, color: '000000' },
            },
        },
    },
});

// Salva o arquivo DOCX
Packer.toBuffer(doc).then((buffer) => {
	if (!fs.existsSync(saidaDir)) fs.mkdirSync(saidaDir, { recursive: true });
	fs.writeFileSync(saidaDocx, buffer);
	console.log(`Arquivo gerado em: ${saidaDocx}`);
});
