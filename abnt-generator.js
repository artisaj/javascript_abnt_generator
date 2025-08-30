import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, Footer } from 'docx';
import { criarCapaABNT } from './builders/capa.js';

// Caminho do arquivo de capa
const capaPath = path.join('estrutura', 'capa.json');
const saidaDir = path.join('saidas');
const versao = 'v1';
const saidaDocx = path.join(saidaDir, `${versao}.docx`);

// Lê o conteúdo da capa
const capa = JSON.parse(fs.readFileSync(capaPath, 'utf8'));

// Cria o documento
const doc = new Document({
	sections: [
		{
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
			children: criarCapaABNT(capa),
			footers: {
				default: new Footer({
					children: [
						new Paragraph({
							children: [
								new TextRun({ text: `${capa.local}     ${capa.ano}`, font: 'Times New Roman', size: 24 }),
							],
							alignment: 'center',
						}),
					],
				}),
			},
		},
	],
	styles: {
		default: {
			document: {
				run: {
					font: 'Times New Roman',
					size: 24, // 12pt
					color: '000000',
				},
			},
		},
	},
});

// Salva o arquivo DOCX
Packer.toBuffer(doc).then((buffer) => {
	fs.writeFileSync(saidaDocx, buffer);
	console.log(`Arquivo gerado em: ${saidaDocx}`);
});
