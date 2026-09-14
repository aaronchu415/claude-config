#!/usr/bin/env python3
"""TRD gauge: rough numbers for flow, detail level, and language on a markdown file.

Usage: python3 gauge.py file.md [more.md ...]
Numbers are a smoke detector, not a score. Targets are calibrated on Aaron's own TRDs; see SKILL.md §5.
"""
import json, os, re, sys

TIER1 = r"in this document|this document (does|maps|follows)|earlier draft|previous(ly)? |no longer|withdrawn|(we|it) used to|worth reading|load-bearing|largest|most (important|likely to (fail|be))|the one to watch|honest position|not a preference|so (it|they) (is|are) not re-litigated|so this is [a-z ]{3,30}, not |what makes (it|this) [a-z]+ is |section \d+ (uses|covers|shows) (it|this)"
TIER2 = r"this document provides|comprehensive overview|(it's|it is) worth noting|elegantly|best of both|bottom line|(in|to) summary|overall,|(anywhere|nowhere) to go\b|sets the date"
NARRATING = r"^(introduction|table of contents|what this document|why this matters|why this document|summary|conclusion|overview)"
APPENDIX = r"^(#+\s*)?(\d+\.?\s*)?(engineering appendix|appendix|references)\b"

# The employer, its products and its vendors; and colleagues who must not be named
# outside a byline. Both are site-specific, so they live in an uncommitted
# gauge.local.json next to this file: {"we": ["acme", ...], "names": ["Dana", ...]}.
_local = {}
_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gauge.local.json")
if os.path.exists(_path):
    with open(_path) as f:
        _local = json.load(f)

WE = r"\b(we|our|us|ours|%sthe (function|ledger|island|host|storefront|poller|broker|widget|checkout|cart|order))\b" % (
    "".join(re.escape(w) + "|" for w in _local.get("we", ()))
)
NAMES = r"\b(%s)\b" % "|".join(re.escape(x) for x in _local.get("names", ())) if _local.get("names") else r"(?!)"


def split_code(text):
    prose, code, in_code, code_lines = [], [], False, 0
    for line in text.splitlines():
        if line.strip().startswith("```"):
            in_code = not in_code
            if in_code:
                code.append(1)
            continue
        (code_lines := code_lines + 1) if in_code else prose.append(line)
    return prose, len(code), code_lines


def gauge(path):
    text = open(path).read()
    prose_lines, code_blocks, code_lines = split_code(text)
    prose = "\n".join(prose_lines)
    headings = [(len(m.group(1)), m.group(2).strip()) for m in re.finditer(r"^(#{1,6})\s+(.*)$", prose, re.M)]
    words = re.findall(r"[A-Za-z][A-Za-z'-]*", re.sub(r"`[^`]*`", " ", prose))
    n = max(len(words), 1)

    # flow: share of words in H2 sections that are not about us (a tutorial or primer)
    top = 1 if sum(1 for l, _ in headings if l == 1) >= 2 else 2
    sections = re.split(r"^(?=#{%d}\s)" % top, prose, flags=re.M)
    tutorial_words = 0
    for sec in sections:
        paras = [p for p in re.split(r"\n\s*\n", sec) if p.strip() and not p.lstrip().startswith("#")]
        if not paras:
            continue
        we_ratio = sum(1 for p in paras if re.search(WE, p, re.I)) / len(paras)
        sw = len(re.findall(r"[A-Za-z][A-Za-z'-]*", re.sub(r"`[^`]*`", " ", sec)))
        if we_ratio < 0.2:
            tutorial_words += sw
    tutorial_pct = round(100 * tutorial_words / n)
    narrating = [h for _, h in headings if re.match(NARRATING, h, re.I)]

    # detail: identifiers per 1000 prose words, body vs appendix
    app_idx = next((i for i, (_, h) in enumerate(headings) if re.match(APPENDIX, h, re.I)), None)
    app_pos = prose.find("\n#" + "#" * (headings[app_idx][0] - 1) + " " + headings[app_idx][1]) if app_idx is not None else len(prose)
    body, appendix = prose[:app_pos], prose[app_pos:]
    def idents(s):
        return len(re.findall(r"`[^`\n]+`", s))
    def wc(s):
        return max(len(re.findall(r"[A-Za-z][A-Za-z'-]*", re.sub(r"`[^`]*`", " ", s))), 1)
    body_ident_k = round(1000 * idents(body) / wc(body))
    anchors = len(re.findall(r"[\w./-]+\.(?:tsx?|jsx?|py|cs|json|ya?ml):\d+|github\.com/[^\s)]+#L\d+", prose))
    tables = len(re.findall(r"^\|.*\|\s*$", prose, re.M))
    table_rows = tables

    # language
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", re.sub(r"^\|.*$|^#.*$|^\s*[-*]\s", "", prose, flags=re.M)) if len(s.split()) > 2]
    slen = [len(s.split()) for s in sentences]
    avg_sent = round(sum(slen) / max(len(slen), 1), 1)
    long_sent = round(100 * sum(1 for l in slen if l > 30) / max(len(slen), 1))
    paras = [p for p in re.split(r"\n\s*\n", body) if p.strip() and not p.lstrip().startswith(("#", "|", "-", "*", "`", "!"))]
    plen = [len(p.split()) for p in paras]
    long_para = round(100 * sum(1 for l in plen if l > 120) / max(len(plen), 1))

    # cross-references to sections that do not exist
    numbered = {m.group(1).rstrip(".") for m in re.finditer(r"^#{1,6}\s+(\d+(?:\.\d+)*)\.?\s", prose, re.M)}
    refs = {r.rstrip(".") for r in re.findall(r"§\s?(\d+(?:\.\d+)*)", prose)}
    dangling = sorted(r for r in refs if numbered and r not in numbered and r.split(".")[0] not in numbered)

    t1 = len(re.findall(TIER1, prose, re.I))
    t2 = len(re.findall(TIER2, prose, re.I))
    names = len(re.findall(NAMES, prose))
    owners = len(re.findall(r"\bOwner:|\| *(Owner|Owner\(s\)) *\||\b(verify|confirm|check) with [A-Z]", prose))
    fills = len(re.findall(r"\[FILL\]|\bTBD\b|\bTBC\b", prose))

    return {
        "file": path.split("/")[-1],
        "words": n,
        "tutorial%": tutorial_pct,
        "narrating_headings": len(narrating),
        "summary_section": int(any(re.match(r"^(summary|conclusion)", h, re.I) for _, h in headings)),
        "sections": sum(1 for l, _ in headings if l == top),
        "code_blocks": code_blocks,
        "code%": round(100 * code_lines / max(code_lines + len(prose_lines), 1)),
        "body_ident/k": body_ident_k,
        "anchors": anchors,
        "table_rows": table_rows,
        "avg_sent": avg_sent,
        "sent>30%": long_sent,
        "para>120%": long_para,
        "tier1": t1,
        "tier2": t2,
        "names": names,
        "dangling_refs": ",".join(dangling) or 0,
        "owners": owners,
        "fills": fills,
    }


if __name__ == "__main__":
    rows = [gauge(p) for p in sys.argv[1:]]
    keys = list(rows[0].keys())
    w = [max(len(k), *(len(str(r[k])) for r in rows)) for k in keys]
    print(" | ".join(k.ljust(w[i]) for i, k in enumerate(keys)))
    for r in rows:
        print(" | ".join(str(r[k]).ljust(w[i]) for i, k in enumerate(keys)))
