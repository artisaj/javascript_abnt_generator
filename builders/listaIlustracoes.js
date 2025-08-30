import { Paragraph, TextRun } from 'docx';

export function criarListaIlustracoesABNT(data = {}) {
    const itens = Array.isArray(data.ilustracoes) ? data.ilustracoes : [];
    if (!itens.length) return [];

    const pars = [];

    // Título
    pars.push(
        new Paragraph({
            children: [new TextRun({ text: 'LISTA DE ILUSTRAÇÕES', bold: true })],
            alignment: 'center',
            spacing: { after: 400 },
        })
    );

    // Linhas: Ilustração <n> - <texto>
    itens.forEach((raw, idx) => {
        const texto = (typeof raw === 'string') ? raw.trim() : '';
        if (!texto) return;
        pars.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `Ilustração ${idx + 1} - ${texto}`,
                    }),
                ],
                alignment: 'left',
                spacing: { after: 200 },
            })
        );
    });

    return pars;
}