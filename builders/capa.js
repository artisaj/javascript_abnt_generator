import { Paragraph, TextRun } from 'docx';

export function criarCapaABNT({ universidade, nomeAluno, tituloTCC, subtituloTCC, local, ano }) {
    return [
        // Universidade no topo
        new Paragraph({
            children: [
                new TextRun({ text: universidade, bold: false, font: 'Times New Roman', size: 24 }),
            ],
            alignment: 'center',
            spacing: { after: 400 },
        }),
        // Espaço para descer o nome do aluno
        new Paragraph({ children: [], spacing: { after: 2000 } }),
        // Nome do aluno centralizado
        new Paragraph({
            children: [
                new TextRun({ text: nomeAluno, bold: false, font: 'Times New Roman', size: 24 }),
            ],
            alignment: 'center',
            spacing: { after: 2000 },
        }),
        // Espaço para descer o título
        new Paragraph({ children: [], spacing: { after: 2000 } }),
        // Título centralizado, fonte maior
        new Paragraph({
            children: [
                new TextRun({ text: tituloTCC, bold: true, font: 'Times New Roman', size: 32 }),
            ],
            alignment: 'center',
            spacing: { after: 400 },
        }),
        // Subtítulo centralizado, fonte normal
        subtituloTCC ? new Paragraph({
            children: [
                new TextRun({ text: subtituloTCC, bold: false, font: 'Times New Roman', size: 24 }),
            ],
            alignment: 'center',
            spacing: { after: 2000 },
        }) : null,
    ].filter(Boolean);
}