import fs from 'fs';
import path from 'path';
import { Paragraph, TextRun } from 'docx';

// Converte nome (arquivo/pasta) em título (underscores = espaço). Remove prefixo NN- ou NN_
function parseName(raw) {
    const base = raw.replace(/\.[^.]+$/, '');
    const noPrefix = base.replace(/^\d{2,}[-_]+/, '');
    return noPrefix.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

// Ordenação: primeiro quem tem prefixo numérico
function sortEntries(a, b) {
    const pa = a.match(/^(\d{2,})[-_]/);
    const pb = b.match(/^(\d{2,})[-_]/);
    if (pa && pb) return Number(pa[1]) - Number(pb[1]);
    if (pa) return -1;
    if (pb) return 1;
    return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

// Carrega árvore recursiva
function loadTree(dir) {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true })
        .map(d => d.name)
        .filter(n => !n.startsWith('.'));
    entries.sort(sortEntries);

    const nodes = [];
    const dirBase = path.basename(dir); // nome da pasta atual (pode ter prefixo)

    for (const name of entries) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            const title = parseName(name);

            // Conteúdo introdutório da seção (index.txt ou <pasta>.txt)
            let content = '';
            const idx1 = path.join(full, 'index.txt');
            const idx2 = path.join(full, `${name}.txt`);
            if (fs.existsSync(idx1)) content = fs.readFileSync(idx1, 'utf8');
            else if (fs.existsSync(idx2)) content = fs.readFileSync(idx2, 'utf8');

            // Carrega filhos, mas EXCLUINDO os arquivos usados como conteúdo (index/<pasta>.txt)
            const children = loadTree(full).filter(childNode => true); // (recursão já cuida)

            nodes.push({
                title,
                content,
                children,
            });
        } else if (name.toLowerCase().endsWith('.txt')) {
            // Pula arquivos de conteúdo introdutório de uma pasta (index.txt ou <nomeDaPasta>.txt)
            const lower = name.toLowerCase();
            if (lower === 'index.txt') continue;
            // Se for um arquivo com o mesmo nome da pasta (incluindo prefixo), ignore (já lido como content)
            if (lower === `${dirBase.toLowerCase()}.txt`) continue;

            const title = parseName(name);
            const text = fs.readFileSync(full, 'utf8');
            nodes.push({
                title,
                content: text,
                children: [],
            });
        }
    }
    return nodes;
}

// Numeração hierárquica
function buildNumbering(nodes, prefix = []) {
    return nodes.map((n, i) => {
        const chain = [...prefix, i + 1];
        return {
            ...n,
            numbering: chain.join('.'),
            chain,
            children: buildNumbering(n.children, chain),
        };
    });
}

const FIRST_LINE_INDENT = 709; // ~1,25 cm

function textToParagraphs(text, level) {
    return text
        .split(/\r?\n\r?\n+/)
        .map(b => b.replace(/\r?\n+/g, ' ').trim())
        .filter(Boolean)
        .map(block =>
            new Paragraph({
                children: [new TextRun({ text: block })],
                alignment: 'both',
                spacing: { after: 200 },
                indent: { firstLine: FIRST_LINE_INDENT },
            })
        );
}

function headingStyle(level) {
    return `Heading${Math.min(level, 6)}`;
}

function indentLeftForLevel(level) {
    // 567 twips ≈ 1 cm. Ajuste se quiser mais/menos.
    return level > 1 ? (level - 1) * 567 : 0;
}

export function gerarSecoesConteudo(baseDir) {
    const tree = buildNumbering(loadTree(baseDir));
    const paragraphs = [];
    function walk(nodes, level = 1) {
        for (const n of nodes) {
            paragraphs.push(
                new Paragraph({
                    style: headingStyle(level),
                    children: [
                        new TextRun({
                            text: `${n.numbering} ${n.title.toUpperCase()}`,
                            bold: true,
                        }),
                    ],
                    spacing: { before: level === 1 ? 200 : 100, after: 200 },
                    indent: { left: indentLeftForLevel(level) },
                })
            );

            if (n.content) {
                paragraphs.push(...textToParagraphs(n.content, level));
            }

            if (n.children.length) walk(n.children, level + 1);
        }
    }
    walk(tree);
    return { secoes: paragraphs, arvore: tree };
}