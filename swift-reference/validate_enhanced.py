#!/usr/bin/env python3
"""Validate monolithic_enhanced.txt for accuracy and consistency."""
import re
import os
from collections import Counter

INPUT = "/Users/markflynn/Local Sites/yesallofus/swift-reference/monolithic_enhanced.txt"
ORIGINAL = "/Users/markflynn/Local Sites/yesallofus/swift-reference/monolithic_with_marks.txt"
REPORT = "/Users/markflynn/Local Sites/yesallofus/swift-reference/validation_report.txt"

# ── Parse sections ──────────────────────────────────────────────────────────

def parse_sections(filepath):
    """Parse file into sections based on // FILE: markers."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        all_lines = f.readlines()

    sections = []
    current = None
    current_body_lines = []
    current_meta_lines = []

    for line in all_lines:
        stripped = line.strip()
        if stripped.startswith('// FILE:'):
            if current is not None:
                current['body'] = ''.join(current_body_lines)
                current['body_lines'] = current_body_lines
                current['meta_lines'] = current_meta_lines
                sections.append(current)

            filepath_val = stripped.replace('// FILE:', '').strip()
            current = {'filepath': filepath_val}
            current_body_lines = []
            current_meta_lines = []
        elif current is not None:
            if stripped.startswith('// META:') or stripped.startswith('// FLOW:') or stripped.startswith('// DEPENDENCY TREE:'):
                current_meta_lines.append(line)
            current_body_lines.append(line)

    if current is not None:
        current['body'] = ''.join(current_body_lines)
        current['body_lines'] = current_body_lines
        current['meta_lines'] = current_meta_lines
        sections.append(current)

    return sections


def extract_meta_field(meta_lines, field):
    """Extract a specific META field value."""
    for line in meta_lines:
        s = line.strip()
        prefix = f'// META: {field}:'
        if s.startswith(prefix):
            return s[len(prefix):].strip()
    return None


def extract_flow_label(meta_lines):
    """Extract FLOW label."""
    for line in meta_lines:
        s = line.strip()
        if s.startswith('// FLOW:'):
            return s.replace('// FLOW:', '').strip()
    return None


# ── Validation ──────────────────────────────────────────────────────────────

errors = []
warnings = []
info_items = []

def add_error(category, filepath, message):
    errors.append({'category': category, 'file': os.path.basename(filepath), 'path': filepath, 'message': message})

def add_warning(category, filepath, message):
    warnings.append({'category': category, 'file': os.path.basename(filepath), 'path': filepath, 'message': message})

def add_info(message):
    info_items.append(message)


def check_flow_accuracy(section):
    fp = section['filepath']
    body = section['body'].lower()
    flow = extract_flow_label(section['meta_lines'])
    if not flow:
        add_error('FLOW', fp, 'Missing FLOW label')
        return
    fp_lower = fp.lower()

    affiliate_kw = ['affiliate', 'referral', 'commission', 'referral-link', 'refer-earn',
                    'affiliate-dashboard', 'affiliatecount', 'affiliate_count', 'referral_code']
    vendor_kw = ['vendor dashboard', 'pos terminal', 'point-of-sale', 'inventory manage',
                 'barcode scan', 'staff-management']

    if flow == 'AFFILIATE ONLY':
        vendor_hits = sum(1 for kw in vendor_kw if kw in body)
        aff_hits = sum(1 for kw in affiliate_kw if kw in body)
        if vendor_hits > 2 and aff_hits == 0:
            add_warning('FLOW', fp, f'Marked AFFILIATE ONLY but has {vendor_hits} vendor keywords, 0 affiliate keywords')

    elif flow == 'VENDOR ONLY':
        aff_hits = sum(1 for kw in affiliate_kw if kw in body)
        vendor_hits = sum(1 for kw in vendor_kw if kw in body)
        if aff_hits > 2 and vendor_hits == 0:
            add_warning('FLOW', fp, f'Marked VENDOR ONLY but has {aff_hits} affiliate keywords, 0 vendor keywords')

    elif flow == 'SHARED':
        if '/affiliate-dashboard' in fp_lower or '/affiliate/' in fp_lower:
            if '/vendor' not in fp_lower:
                add_warning('FLOW', fp, 'Path contains affiliate-specific route but marked SHARED')


def check_meta_completeness(section):
    fp = section['filepath']
    required = ['Type', 'Flow', 'Framework', 'State', 'Props', 'Context', 'APIs', 'Dependencies']
    for field in required:
        val = extract_meta_field(section['meta_lines'], field)
        if val is None:
            add_error('META', fp, f'Missing META field: {field}')


def check_state_accuracy(section):
    fp = section['filepath']
    body = section['body']
    state_meta = extract_meta_field(section['meta_lines'], 'State')

    actual_useState = re.findall(r'const\s+\[(\w+),\s*\w+\]\s*=\s*useState', body)
    actual_useReducer = re.findall(r'const\s+\[(\w+),\s*\w+\]\s*=\s*useReducer', body)
    actual_total = len(actual_useState) + len(actual_useReducer)

    if state_meta == '[none]' or state_meta is None:
        meta_count = 0
    else:
        # Count top-level comma-separated entries
        depth = 0
        count = 1 if state_meta.strip('[] ') else 0
        for ch in state_meta.strip('[]'):
            if ch in '([{<':
                depth += 1
            elif ch in ')]}>':
                depth -= 1
            elif ch == ',' and depth == 0:
                count += 1
        meta_count = count

    if actual_total > 0 and meta_count == 0:
        add_error('STATE', fp, f'META: State says [none] but code has {actual_total} state variables')
    elif meta_count > 0 and actual_total == 0:
        add_error('STATE', fp, f'META: State lists {meta_count} vars but code has no useState/useReducer')
    elif abs(actual_total - meta_count) > 2:
        add_warning('STATE', fp, f'State count mismatch: META={meta_count}, code={actual_total} (diff={abs(actual_total - meta_count)})')


def check_api_accuracy(section):
    fp = section['filepath']
    body = section['body']
    api_meta = extract_meta_field(section['meta_lines'], 'APIs')
    apis_none = (api_meta == '[none]' or api_meta is None)

    # Detect fetch calls with actual URLs
    url_fetches = len(re.findall(r'fetch\s*\(\s*[`\'"]', body))
    template_fetches = len(re.findall(r'fetch\s*\(\s*`\$\{', body))
    total_fetches = url_fetches + template_fetches

    if total_fetches > 0 and apis_none:
        add_error('API', fp, f'META: APIs says [none] but code has {total_fetches} fetch calls with URLs')


def check_context_accuracy(section):
    fp = section['filepath']
    body = section['body']
    ctx_meta = extract_meta_field(section['meta_lines'], 'Context')

    contexts_found = []
    for m in re.finditer(r'useContext\s*\(\s*(\w+)\s*\)', body):
        contexts_found.append(m.group(1))
    known_hooks = {'useAuth': 'AuthContext', 'useWallet': 'WalletContext',
                   'useRouter': 'NextRouter', 'usePathname': 'NextRouter',
                   'useSearchParams': 'NextRouter', 'useParams': 'NextRouter'}
    for hook, ctx in known_hooks.items():
        if re.search(rf'\b{hook}\s*\(', body):
            if ctx not in contexts_found:
                contexts_found.append(ctx)

    ctx_none = (ctx_meta == '[none]' or ctx_meta is None)
    if contexts_found and ctx_none:
        add_error('CONTEXT', fp, f'META: Context says [none] but code uses: {", ".join(set(contexts_found))}')


def check_props_accuracy(section):
    fp = section['filepath']
    body = section['body']
    props_meta = extract_meta_field(section['meta_lines'], 'Props')
    props_none = (props_meta == '[none]' or props_meta is None)

    has_props = bool(re.search(r'(?:export\s+(?:default\s+)?)?function\s+\w+\s*\(\s*\{[^}]+\}', body))
    has_props_type = bool(re.search(r'(?:interface|type)\s+\w*Props\w*\s*(?:=\s*)?\{', body))

    if (has_props or has_props_type) and props_none:
        add_warning('PROPS', fp, 'Code has props but META: Props says [none]')


def check_type_annotations(section):
    fp = section['filepath']
    issues = 0
    for i, line in enumerate(section['body_lines']):
        s = line.strip()
        if s.startswith('// TYPE:'):
            type_val = s.replace('// TYPE:', '').strip()
            next_line = section['body_lines'][i + 1].strip() if i + 1 < len(section['body_lines']) else ''

            if type_val == 'unknown':
                add_warning('TYPE', fp, f'Vague type "unknown" — {next_line[:70]}')
                issues += 1
            elif type_val == 'nullable':
                add_warning('TYPE', fp, f'Vague type "nullable" — {next_line[:70]}')
                issues += 1
            elif type_val == 'Array':
                add_warning('TYPE', fp, f'Generic "Array" (no element type) — {next_line[:70]}')
                issues += 1
            elif type_val == 'Object':
                add_warning('TYPE', fp, f'Generic "Object" (no structure) — {next_line[:70]}')
                issues += 1
    return issues


def check_dependency_tree(section):
    fp = section['filepath']
    body = section['body']
    tree_items = []
    in_tree = False
    for line in section['meta_lines']:
        s = line.strip()
        if s == '// DEPENDENCY TREE:':
            in_tree = True
            continue
        if in_tree and s.startswith('//') and ('├──' in s or '└──' in s):
            m = re.search(r'(?:├──|└──)\s*\w+:\s*(.+)', s)
            if m:
                items = [x.strip() for x in m.group(1).split(',')]
                tree_items.extend(items)
        elif in_tree and not s.startswith('//'):
            in_tree = False

    phantom = [item for item in tree_items if item and not re.search(r'\b' + re.escape(item) + r'\b', body)]
    if phantom and len(phantom) > len(tree_items) * 0.4:
        add_warning('DEPS', fp, f'{len(phantom)}/{len(tree_items)} tree items not found in code: {", ".join(phantom[:5])}')


def check_duplicates(sections):
    paths = [s['filepath'] for s in sections]
    dupes = {p: c for p, c in Counter(paths).items() if c > 1}
    for p, c in dupes.items():
        add_error('DUPLICATE', p, f'File appears {c} times')
    return len(dupes)


def compare_with_original():
    try:
        with open(ORIGINAL, 'r', encoding='utf-8', errors='replace') as f:
            return [l.strip().replace('// FILE:', '').strip()
                    for l in f if l.strip().startswith('// FILE:')]
    except Exception:
        return None


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    print("Parsing enhanced file...")
    sections = parse_sections(INPUT)
    print(f"Found {len(sections)} sections")

    print("Checking duplicates...")
    dup_count = check_duplicates(sections)

    print("Comparing with original...")
    orig_files = compare_with_original()
    if orig_files is not None:
        enhanced_set = set(s['filepath'] for s in sections)
        orig_set = set(orig_files)
        missing = orig_set - enhanced_set
        extra = enhanced_set - orig_set
        for m in missing:
            add_error('MISSING', m, 'In original but missing from enhanced')
        for e in extra:
            add_warning('EXTRA', e, 'In enhanced but not in original')
        add_info(f"Original sections: {len(orig_files)}")
        add_info(f"Enhanced sections: {len(sections)}")
        add_info(f"Missing: {len(missing)}, Extra: {len(extra)}")

    type_issues = 0
    print("Running per-section validation...")
    for i, section in enumerate(sections):
        if (i + 1) % 20 == 0:
            print(f"  {i+1}/{len(sections)}...")
        check_flow_accuracy(section)
        check_meta_completeness(section)
        check_state_accuracy(section)
        check_api_accuracy(section)
        check_context_accuracy(section)
        check_props_accuracy(section)
        type_issues += check_type_annotations(section)
        check_dependency_tree(section)

    total_checks = len(sections) * 8
    deductions = len(errors) + (len(warnings) * 0.5)
    accuracy = max(0, (1 - deductions / total_checks) * 100)

    # ── Build report ──
    R = []
    R.append("=" * 70)
    R.append("VALIDATION REPORT: monolithic_enhanced.txt")
    R.append("=" * 70)
    R.append("")
    R.append("SUMMARY")
    R.append("-" * 40)
    R.append(f"Total file sections:     {len(sections)}")
    R.append(f"Total checks performed:  {total_checks}")
    R.append(f"Errors found:            {len(errors)}")
    R.append(f"Warnings found:          {len(warnings)}")
    R.append(f"Type annotation issues:  {type_issues}")
    R.append(f"Duplicate sections:      {dup_count}")
    R.append(f"Accuracy score:          {accuracy:.1f}%")
    R.append("")
    for i in info_items:
        R.append(f"  {i}")
    R.append("")

    # Distributions
    flows = Counter()
    types = Counter()
    fws = Counter()
    for s in sections:
        fl = extract_flow_label(s['meta_lines'])
        if fl: flows[fl] += 1
        ft = extract_meta_field(s['meta_lines'], 'Type')
        if ft: types[ft] += 1
        fw = extract_meta_field(s['meta_lines'], 'Framework')
        if fw: fws[fw] += 1

    R.append("FLOW DISTRIBUTION")
    R.append("-" * 40)
    for f, c in flows.most_common(): R.append(f"  {f}: {c}")
    R.append("")
    R.append("FILE TYPE DISTRIBUTION")
    R.append("-" * 40)
    for t, c in types.most_common(): R.append(f"  {t}: {c}")
    R.append("")
    R.append("FRAMEWORK DISTRIBUTION")
    R.append("-" * 40)
    for fw, c in fws.most_common(): R.append(f"  {fw}: {c}")
    R.append("")

    # Errors
    if errors:
        R.append("=" * 70)
        R.append("ERRORS (Must Fix)")
        R.append("=" * 70)
        R.append("")
        ecats = {}
        for e in errors:
            ecats.setdefault(e['category'], []).append(e)
        for cat in sorted(ecats):
            R.append(f"[{cat}] ({len(ecats[cat])} errors)")
            R.append("-" * 40)
            for e in ecats[cat]:
                R.append(f"  File: {e['file']}")
                R.append(f"  Path: {e['path']}")
                R.append(f"  Issue: {e['message']}")
                R.append("")
    else:
        R.append("NO ERRORS FOUND")
        R.append("")

    # Warnings
    if warnings:
        R.append("=" * 70)
        R.append("WARNINGS (Review Recommended)")
        R.append("=" * 70)
        R.append("")
        wcats = {}
        for w in warnings:
            wcats.setdefault(w['category'], []).append(w)
        for cat in sorted(wcats):
            R.append(f"[{cat}] ({len(wcats[cat])} warnings)")
            R.append("-" * 40)
            for w in wcats[cat]:
                R.append(f"  File: {w['file']}")
                R.append(f"  Issue: {w['message']}")
                R.append("")
    else:
        R.append("NO WARNINGS FOUND")
        R.append("")

    # Corrections
    R.append("=" * 70)
    R.append("SUGGESTED CORRECTIONS")
    R.append("=" * 70)
    R.append("")
    state_errs = [e for e in errors if e['category'] == 'STATE']
    api_errs = [e for e in errors if e['category'] == 'API']
    ctx_errs = [e for e in errors if e['category'] == 'CONTEXT']
    flow_warns = [w for w in warnings if w['category'] == 'FLOW']
    type_warns = [w for w in warnings if w['category'] == 'TYPE']
    state_warns = [w for w in warnings if w['category'] == 'STATE']
    props_warns = [w for w in warnings if w['category'] == 'PROPS']

    corr = 1
    if state_errs:
        R.append(f"{corr}. STATE METADATA: {len(state_errs)} sections have State mismatches.")
        R.append("   Action: Re-run state extraction with improved regex.")
        R.append(""); corr += 1
    if api_errs:
        R.append(f"{corr}. API METADATA: {len(api_errs)} sections have undetected API calls.")
        R.append("   Action: Improve fetch detection for variable-based URLs.")
        R.append(""); corr += 1
    if ctx_errs:
        R.append(f"{corr}. CONTEXT METADATA: {len(ctx_errs)} sections have undetected context usage.")
        R.append("   Action: Expand context hook pattern matching.")
        R.append(""); corr += 1
    if flow_warns:
        R.append(f"{corr}. FLOW LABELS: {len(flow_warns)} sections may be mislabeled.")
        R.append("   Action: Review path-based flow assignment logic.")
        R.append(""); corr += 1
    if type_warns:
        R.append(f"{corr}. TYPE ANNOTATIONS: {len(type_warns)} annotations lack specificity.")
        R.append("   Action: Infer element types from usage context.")
        R.append(""); corr += 1
    if state_warns:
        R.append(f"{corr}. STATE COUNTS: {len(state_warns)} sections have count discrepancies.")
        R.append("   Action: Check for multi-line or conditional useState patterns.")
        R.append(""); corr += 1
    if props_warns:
        R.append(f"{corr}. PROPS: {len(props_warns)} sections have undetected props.")
        R.append("   Action: Improve destructured props regex.")
        R.append(""); corr += 1
    if corr == 1:
        R.append("No corrections needed.")
        R.append("")

    # Verdict
    R.append("=" * 70)
    R.append("FINAL VERDICT")
    R.append("=" * 70)
    R.append("")
    if accuracy >= 95:
        R.append(f"ACCURACY: {accuracy:.1f}% — EXCELLENT")
        R.append("Metadata is highly accurate and suitable for Swift conversion reference.")
    elif accuracy >= 85:
        R.append(f"ACCURACY: {accuracy:.1f}% — GOOD")
        R.append("Metadata is mostly accurate. Address errors before using for Swift conversion.")
    elif accuracy >= 70:
        R.append(f"ACCURACY: {accuracy:.1f}% — FAIR")
        R.append("Significant corrections needed before relying on this reference.")
    else:
        R.append(f"ACCURACY: {accuracy:.1f}% — NEEDS IMPROVEMENT")
        R.append("Major corrections required.")
    R.append("")

    report = '\n'.join(R)
    with open(REPORT, 'w', encoding='utf-8') as f:
        f.write(report)
    print(report)
    print(f"\nReport saved to: {REPORT}")

if __name__ == '__main__':
    main()
