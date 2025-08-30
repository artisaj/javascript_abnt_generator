import { Paragraph, TextRun } from 'docx';

export function criarAgradecimentosABNT(textoRaw) {
    const texto = (textoRaw || '').trim();
    if (!texto) return [];

    const pars = [];

    // Título
    pars.push(
        new Paragraph({
            children: [new TextRun({ text: 'AGRADECIMENTOS', bold: true })],
            alignment: 'center',
            spacing: { after: 400 },
        })
    );

    // Quebra em parágrafos por linha em branco
    const blocos = texto.split(/\r?\n\r?\n+/);
    for (const bloco of blocos) {
        const linha = bloco.replace(/\r?\n+/g, ' ').trim();
        if (!linha) continue;
        pars.push(
            new Paragraph({
                children: [new TextRun({ text: linha })],
                alignment: 'both', // justify
                spacing: { after: 200 },
            })
        );
    }

    return pars;
}