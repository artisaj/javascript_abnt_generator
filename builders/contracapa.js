import { Paragraph, TextRun } from 'docx';

export function criarContracapaABNT({
    universidade,
    nomeAluno,
    tituloTCC,
    subtituloTCC,
    natureza,
    nomeOrientador,
}) {
    return [
        // Universidade no topo (centralizado)
        new Paragraph({
            children: [new TextRun({ text: universidade, font: 'Times New Roman', size: 24 })],
            alignment: 'center',
            spacing: { after: 200 },
        }),

        // Nome do aluno (centralizado)
        nomeAluno
            ? new Paragraph({
                  children: [new TextRun({ text: nomeAluno, font: 'Times New Roman', size: 24 })],
                  alignment: 'center',
                  spacing: { after: 200 },
              })
            : null,

        // Espaçador grande antes do título para posicioná‑lo mais ao centro da página
        new Paragraph({ children: [], spacing: { after: 3000 } }),

        // Título centralizado, fonte maior
        tituloTCC
            ? new Paragraph({
                  children: [new TextRun({ text: tituloTCC, bold: true, font: 'Times New Roman', size: 32 })],
                  alignment: 'center',
                  spacing: { after: 100 },
              })
            : null,

        // Subtítulo centralizado (se houver)
        subtituloTCC
            ? new Paragraph({
                  children: [new TextRun({ text: subtituloTCC, font: 'Times New Roman', size: 24 })],
                  alignment: 'center',
                  spacing: { after: 400 },
              })
            : null,

        // Espaçador para mover natureza/orientador mais para baixo (antes do rodapé)
        new Paragraph({ children: [], spacing: { after: 2000 } }),

        // Natureza alinhada à direita
        natureza
            ? new Paragraph({
                  children: [new TextRun({ text: natureza, font: 'Times New Roman', size: 24 })],
                  alignment: 'right',
                  spacing: { after: 100 },
              })
            : null,

        // Orientador alinhado à direita (ajustado conforme solicitado)
        nomeOrientador
            ? new Paragraph({
                  children: [new TextRun({ text: `Orientador: ${nomeOrientador}`, font: 'Times New Roman', size: 24 })],
                  alignment: 'right',
                  spacing: { after: 100 },
              })
            : null,
    ].filter(Boolean);
}