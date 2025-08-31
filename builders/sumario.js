import { Paragraph, TextRun, TableOfContents } from 'docx';

// Gera seção de SUMÁRIO (ABNT: título em caixa alta, centralizado)
export function criarSumarioABNT() {
    return [
        new Paragraph({
            children: [new TextRun({ text: 'SUMÁRIO', bold: true })],
            alignment: 'center',
            spacing: { after: 400 },
        }),
        new TableOfContents('', {
            hyperlink: false,
            headingStyleRange: '1-6',
            rightTabStopPosition: 9000,
        }),
    ];
}