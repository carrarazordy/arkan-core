/**
 * ARKAN NEURAL ARCHIVE: AST-BASED MARKDOWN PARSER
 * Provides instant in-situ rendering for the focus editor.
 */

export interface MarkdownToken {
    type: 'h1' | 'h2' | 'h3' | 'list' | 'quote' | 'text' | 'code' | 'bold' | 'italic';
    content: string;
    raw: string;
}

export class MarkdownParser {
    static parseLine(line: string): MarkdownToken {
        const trimmed = line.trimStart();

        if (trimmed.startsWith('# ')) {
            return { type: 'h1', content: trimmed.slice(2), raw: line };
        }
        if (trimmed.startsWith('## ')) {
            return { type: 'h2', content: trimmed.slice(3), raw: line };
        }
        if (trimmed.startsWith('### ')) {
            return { type: 'h3', content: trimmed.slice(4), raw: line };
        }
        if (trimmed.match(/^\d+\./) || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return { type: 'list', content: trimmed, raw: line };
        }
        if (trimmed.startsWith('> ')) {
            return { type: 'quote', content: trimmed.slice(2), raw: line };
        }
        if (trimmed.startsWith('```')) {
            return { type: 'code', content: trimmed, raw: line };
        }
        return { type: 'text', content: line, raw: line };
    }

    static processText(text: string): string {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary">$1</span>')
            .replace(/\*(.*?)\*/g, '<span class="italic text-primary/80">$1</span>');
    }

    static renderLine(line: string, isActive: boolean): string {
        const token = this.parseLine(line);
        const opacityClass = isActive ? 'opacity-100' : 'opacity-40 transition-opacity duration-500';
        const markerVisibility = isActive ? 'opacity-30' : 'hidden'; // Fading logic: dimmed on active, hidden on inactive

        // Calculate leading space for sub-bullets
        const leadingSpaces = token.raw.length - token.raw.trimStart().length;
        const indentRem = leadingSpaces > 0 ? (leadingSpaces * 0.5) : 0;
        const indentStyle = indentRem > 0 ? `style="padding-left: ${indentRem + 1}rem;"` : 'class="pl-4"';

        switch (token.type) {
            case 'h1':
                return `<h1 class="text-3xl font-bold text-primary neon-yellow-glow pb-2 ${opacityClass}"><span class="${markerVisibility}"># </span>${this.processText(token.content)}</h1>`;
            case 'h2':
                return `<h2 class="text-2xl font-bold text-primary/90 pb-1 ${opacityClass}"><span class="${markerVisibility}">## </span>${this.processText(token.content)}</h2>`;
            case 'h3':
                return `<h3 class="text-xl font-bold text-primary/80 ${opacityClass}"><span class="${markerVisibility}">### </span>${this.processText(token.content)}</h3>`;
            case 'list':
                // Check for task nodes
                if (token.content.startsWith('- [ ] ') || token.content.startsWith('* [ ] ')) {
                    return `<div ${indentStyle} class="py-0.5 text-primary/80 font-bold border-l-2 border-primary/20 bg-primary/5 ${opacityClass}"><span class="${markerVisibility}">- [ ] </span>${this.processText(token.content.slice(6))}</div>`;
                }

                // Match prefix (e.g. "- ", "* ", "1. ")
                const listPrefixMatch = token.content.match(/^(\d+\.|[-*])\s/);
                const listPrefix = listPrefixMatch ? listPrefixMatch[0] : '- ';
                const listText = listPrefixMatch ? token.content.slice(listPrefix.length) : token.content;

                return `<div ${indentStyle} class="py-0.5 text-white/80 monospaced-technical-list ${opacityClass}"><span class="${markerVisibility}">${listPrefix}</span>${this.processText(listText)}</div>`;
            case 'quote':
                return `<blockquote class="border-l-4 border-primary/30 pl-4 py-1 italic text-primary/60 block-quote-dim ${opacityClass}"><span class="${markerVisibility}">> </span>${this.processText(token.content)}</blockquote>`;
            case 'code':
                return `<pre class="bg-black/40 p-2 rounded border border-primary/10 my-2 font-mono text-[10px] text-primary/80 ${opacityClass}">${token.content}</pre>`;
            default:
                return `<p class="leading-relaxed text-white/70 ${opacityClass}">${this.processText(token.content) || '&nbsp;'}</p>`;
        }
    }
}
