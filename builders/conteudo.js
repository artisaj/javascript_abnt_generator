import fs from 'fs';
import path from 'path';
import { Paragraph, TextRun, HeadingLevel, ExternalHyperlink } from 'docx';

const FIRST_LINE_INDENT = 709;

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

function headingStyle(level) {
    return `Heading${Math.min(level, 6)}`;
}

function indentLeftForLevel(level) {
    return level > 1 ? (level - 1) * 567 : 0;
}

// Parágrafos de corpo
function textToParagraphs(text) {
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

function isReferencesTitle(titleUpper) {
    // Detecta diversas variações
    return /(REFERÊNCIAS|REFERENCIAS)/.test(titleUpper);
}

const URL_REGEX = /https?:\/\/[^\s<>"')]+/g;

function decodeEntities(txt) {
    return txt
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function runsWithLinksFromPlain(text, style) {
    const out = [];
    let last = 0; let m;
    while ((m = URL_REGEX.exec(text)) !== null) {
        if (m.index > last) {
            out.push(new TextRun({
                text: text.slice(last, m.index),
                bold: style.bold,
                italics: style.italic,
                underline: style.underline ? {} : undefined,
            }));
        }
        const url = m[0].replace(/[),.;:!?]+$/, u => {
            // strip trailing punctuation from URL
            return ''; // punctuation ignored (simpler)
        });
        out.push(new ExternalHyperlink({
            link: url,
            children: [new TextRun({ text: url, color: '0000FF', underline: { type: 'single' } })],
        }));
        last = m.index + m[0].length;
    }
    if (last < text.length) {
        out.push(new TextRun({
            text: text.slice(last),
            bold: style.bold,
            italics: style.italic,
            underline: style.underline ? {} : undefined,
        }));
    }
    return out;
}

// Interpreta tags HTML simples (<b>/<strong>, <i>/<em>, <u>, <br>)
function parseInlineHtml(html) {
    const runs = [];
    let bold = false, italic = false, underline = false;
    // Normaliza <br>
    html = html.replace(/<br\s*\/?>/gi, '\n');
    // Divide em tags suportadas
    const tokens = html.split(/(<\/?(?:b|strong|i|em|u)\s*>)/i);
    for (let token of tokens) {
        if (!token) continue;
        const lower = token.toLowerCase();
        if (lower === '<b>' || lower === '<strong>') { bold = true; continue; }
        if (lower === '</b>' || lower === '</strong>') { bold = false; continue; }
        if (lower === '<i>' || lower === '<em>') { italic = true; continue; }
        if (lower === '</i>' || lower === '</em>') { italic = false; continue; }
        if (lower === '<u>') { underline = true; continue; }
        if (lower === '</u>') { underline = false; continue; }
        if (/<\/?/.test(token)) continue; // ignora outras tags
        token = decodeEntities(token);
        // Quebra por linhas (inserir break)
        const lines = token.split(/\n/);
        lines.forEach((line, idx) => {
            if (line.length) {
                runs.push(...runsWithLinksFromPlain(line, { bold, italic, underline }));
            }
            if (idx < lines.length - 1) runs.push(new TextRun({ break: 1 }));
        });
    }
    return runs;
}

function parseReferencesBlocks(htmlText) {
    // Junta URLs quebradas (linhas consecutivas sem espaço)
    htmlText = htmlText.replace(/https?:\/\/[^\s\r\n]+(?:\r?\n[^\s\r\n]+)+/g, m => m.replace(/\r?\n/g, ''));
    const blocks = htmlText
        .split(/\r?\n\r?\n+/)
        .map(b => b.trim())
        .filter(Boolean);
    return blocks.map(block => {
        const runs = parseInlineHtml(block);
        return new Paragraph({
            children: runs,
            alignment: 'left',
            spacing: { after: 200 },
        });
    });
}

export function gerarSecoesConteudo(baseDir) {
    const tree = buildNumbering(loadTree(baseDir));
    const paragraphs = [];

    function walk(nodes, level = 1) {
        for (const n of nodes) {
            const titleUpper = n.title.toUpperCase();
            const refs = isReferencesTitle(titleUpper) && level === 1;

            // Heading (coloca pageBreakBefore diretamente aqui; remove parágrafo vazio extra)
            paragraphs.push(
                new Paragraph({
                    heading:
                        level === 1 ? HeadingLevel.HEADING_1 :
                        level === 2 ? HeadingLevel.HEADING_2 :
                        level === 3 ? HeadingLevel.HEADING_3 :
                        level === 4 ? HeadingLevel.HEADING_4 :
                        level === 5 ? HeadingLevel.HEADING_5 :
                        HeadingLevel.HEADING_6,
                    children: [
                        new TextRun({
                            // adiciona ponto após a numeração (ex: "1. ", "1.1. ", "1.1.1. ")
                            text: `${n.numbering}. ${titleUpper}`,
                            bold: true,
                        }),
                    ],
                    spacing: { before: level === 1 ? 200 : 100, after: 200 },
                    indent: { left: indentLeftForLevel(level) },
                    pageBreakBefore: refs,
                })
            );

            if (n.content) {
                if (refs) {
                    paragraphs.push(...parseReferencesBlocks(n.content));
                } else {
                    paragraphs.push(...textToParagraphs(n.content));
                }
            }

            if (n.children.length) walk(n.children, level + 1);
        }
    }

    walk(tree);
    return { secoes: paragraphs, arvore: tree };
}