import { Paragraph, TextRun } from 'docx';

export function criarResumoABNT({ texto = '', palavrasChave = [] } = {}) {
    const pars = [];
    const body = (texto || '').trim();
    const hasKeywords = Array.isArray(palavrasChave) && palavrasChave.length > 0;

    if (!body && !hasKeywords) return pars;

    // Título
    pars.push(
        new Paragraph({
            children: [new TextRun({ text: 'RESUMO', bold: true })],
            alignment: 'center',
            spacing: { after: 400 },
        })
    );

    // Texto (quebra por linha em branco)
    if (body) {
        const blocos = body.split(/\r?\n\r?\n+/);
        blocos.forEach((bloco, idx) => {
            const linha = bloco.replace(/\r?\n+/g, ' ').trim();
            if (!linha) return;
            pars.push(
                new Paragraph({
                    children: [new TextRun({ text: linha })],
                    alignment: 'both',
                    spacing: { after: 200 },
                })
            );
        });
    }

    // Quebra de linha extra antes das palavras‑chave
    if (hasKeywords) {
        pars.push(
            new Paragraph({
                children: [],
                spacing: { after: 200 },
            })
        );
        const joined = palavrasChave.map(k => k.trim()).filter(Boolean).join(', ');
        pars.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Palavras‑chave: ', bold: true }),
                    new TextRun({ text: joined, bold: true }),
                ],
                alignment: 'left',
                spacing: { before: 200, after: 0 },
            })
        );
    }

    return pars;
}