import { Paragraph, TextRun } from 'docx';

export function criarListaSiglasAbreviaturasABNT(data = []) {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Ordena alfabeticamente pela sigla (case insensitive)
    const ordenado = [...data].filter(it => it && it.sigla).sort((a, b) =>
        a.sigla.localeCompare(b.sigla, 'pt-BR', { sensitivity: 'base' })
    );

    const pars = [];

    // Título
    pars.push(
        new Paragraph({
            children: [new TextRun({ text: 'LISTA DE ABREVIATURAS E SIGLAS', bold: true })],
            alignment: 'center',
            spacing: { after: 400 },
        })
    );

    // Itens
    for (const item of ordenado) {
        const sigla = (item.sigla || '').trim();
        const desc = (item.descricao || '').trim();
        if (!sigla || !desc) continue;

        pars.push(
            new Paragraph({
                children: [
                    new TextRun({ text: sigla, bold: true }),
                    new TextRun({ text: ' - ' + desc }),
                ],
                alignment: 'left',
                spacing: { after: 200 },
            })
        );
    }

    return pars;
}