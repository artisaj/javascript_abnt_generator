import { Paragraph, TextRun } from 'docx';

export function criarAbstractABNT({ texto = '', palavrasChave = [], keywords = [] } = {}) {
    // aceita palavrasChave ou keywords
    const lista = (Array.isArray(palavrasChave) && palavrasChave.length) ? palavrasChave : keywords;
    const pars = [];
    const body = (texto || '').trim();
    const hasKeywords = Array.isArray(lista) && lista.length > 0;

    if (!body && !hasKeywords) return pars;

    // Título
    pars.push(
        new Paragraph({
            children: [new TextRun({ text: 'ABSTRACT', bold: true })],
            alignment: 'center',
            spacing: { after: 400 },
        })
    );

    // Texto (parágrafos separados por linha em branco)
    if (body) {
        const blocos = body.split(/\r?\n\r?\n+/);
        for (const bloco of blocos) {
            const linha = bloco.replace(/\r?\n+/g, ' ').trim();
            if (!linha) continue;
            pars.push(
                new Paragraph({
                    children: [new TextRun({ text: linha })],
                    alignment: 'both',
                    spacing: { after: 200 },
                })
            );
        }
    }

    // Espaço extra antes das keywords
    if (hasKeywords) {
        pars.push(new Paragraph({ children: [], spacing: { after: 200 } }));
        const joined = lista.map(k => k.trim()).filter(Boolean).join(', ');
        pars.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Keywords: ', bold: true }),
                    new TextRun({ text: joined, bold: true }),
                ],
                alignment: 'left',
                spacing: { before: 200, after: 0 },
            })
        );
    }

    return pars;
}