#!/usr/bin/env python3
"""Enhance monolithic_with_marks.txt with comprehensive metadata for Swift conversion."""
import re
import os

INPUT = "/Users/markflynn/Local Sites/yesallofus/swift-reference/monolithic_with_marks.txt"
OUTPUT = "/Users/markflynn/Local Sites/yesallofus/swift-reference/monolithic_enhanced.txt"

# ── Helpers ──────────────────────────────────────────────────────────────────

def classify_file_type(filepath, code):
    """Determine: Page Component, UI Component, API Route, Utility, Hook, Service, Config, Middleware."""
    fp = filepath.lower()

    if '/api/' in fp:
        return 'API Route'
    if fp.endswith('middleware.ts') or fp.endswith('middleware.tsx'):
        return 'Middleware'
    if '/hooks/' in fp or os.path.basename(fp).startswith('use'):
        return 'Hook'
    if '/services/' in fp or '/lib/' in fp:
        if 'xrpl' in fp or 'auth' in fp or 'wallet' in fp or 'sound' in fp:
            return 'Service'
        return 'Utility'
    if '/utils/' in fp or '/helpers/' in fp:
        return 'Utility'
    if '/config/' in fp or fp.endswith('config.ts') or fp.endswith('config.tsx'):
        return 'Config'
    if 'page.tsx' in fp or 'page.ts' in fp:
        return 'Page Component'
    if '/components/' in fp:
        return 'UI Component'
    if 'layout.tsx' in fp or 'layout.ts' in fp:
        return 'Layout Component'
    if '/context/' in fp or '/providers/' in fp:
        return 'Context Provider'
    if '/types/' in fp or fp.endswith('.d.ts'):
        return 'Type Definition'
    # Fallback: check for JSX/component patterns
    if re.search(r'export\s+(default\s+)?function\s+\w+', code) and ('<' in code):
        return 'UI Component'
    if re.search(r'(GET|POST|PUT|DELETE|PATCH)\s*\(', code):
        return 'API Route'
    return 'Module'


def classify_flow(filepath, code):
    """Determine: Affiliate, Vendor, Shared."""
    fp = filepath.lower()
    code_lower = code.lower()

    is_affiliate = (
        '/affiliate' in fp or
        'affiliate' in os.path.basename(fp).lower() or
        re.search(r'\baffiliate\b', code_lower[:2000]) is not None
    )
    is_vendor = (
        '/vendor' in fp or '/pos' in fp or '/inventory' in fp or '/staff' in fp or
        'vendor' in os.path.basename(fp).lower() or
        re.search(r'\bvendor\b', code_lower[:2000]) is not None
    )
    # Check for member-specific
    is_member = '/member' in fp or 'member' in os.path.basename(fp).lower()

    if is_affiliate and is_vendor:
        return 'SHARED'
    if is_affiliate:
        return 'AFFILIATE ONLY'
    if is_vendor:
        return 'VENDOR ONLY'
    if is_member:
        return 'MEMBER ONLY'

    # Shared indicators
    shared_indicators = [
        '/components/', '/lib/', '/services/', '/hooks/', '/utils/',
        '/context/', '/providers/', '/config/', 'layout.tsx',
        '/api/', '/types/', 'middleware'
    ]
    for ind in shared_indicators:
        if ind in fp:
            return 'SHARED'

    # Check route groups
    if '/(main)/' in fp:
        # Analyze page content
        if re.search(r'\b(affiliate|referral|commission|share.*link)\b', code_lower[:3000]):
            return 'AFFILIATE ONLY'
        if re.search(r'\b(vendor|pos|inventory|staff|barcode)\b', code_lower[:3000]):
            return 'VENDOR ONLY'

    return 'SHARED'


def classify_framework(filepath, code):
    """Determine: React, Next.js, Node.js, TypeScript."""
    fp = filepath.lower()
    if '/api/' in fp:
        if 'NextRequest' in code or 'NextResponse' in code:
            return 'Next.js API Route'
        return 'Node.js'
    if "'use client'" in code or '"use client"' in code:
        return 'React (Client Component)'
    if 'use server' in code:
        return 'Next.js (Server Action)'
    if re.search(r'(getServerSideProps|getStaticProps|generateMetadata|generateStaticParams)', code):
        return 'Next.js (Server Component)'
    if fp.endswith('.tsx') or fp.endswith('.jsx'):
        if '<' in code and ('return' in code or 'render' in code):
            return 'Next.js (Server Component)'
    if fp.endswith('.ts'):
        return 'TypeScript'
    return 'Next.js'


def extract_state_variables(code):
    """Extract useState and useReducer declarations with types."""
    states = []

    # useState: const [x, setX] = useState<Type>(initial) or useState(initial)
    for m in re.finditer(
        r'const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState'
        r'(?:<([^>]+)>)?'
        r'\(([^)]*)\)',
        code
    ):
        name = m.group(1)
        setter = m.group(2)
        explicit_type = m.group(3) or ''
        initial = m.group(4).strip()

        if explicit_type:
            typ = explicit_type
        else:
            typ = infer_type_from_initial(initial)

        states.append({
            'name': name,
            'setter': setter,
            'type': typ,
            'initial': initial,
            'kind': 'useState'
        })

    # useReducer
    for m in re.finditer(
        r'const\s+\[(\w+),\s*(\w+)\]\s*=\s*useReducer\s*\((\w+)',
        code
    ):
        states.append({
            'name': m.group(1),
            'setter': m.group(2),
            'type': 'Reducer',
            'initial': m.group(3),
            'kind': 'useReducer'
        })

    return states


def infer_type_from_initial(initial):
    """Infer TypeScript type from initial value."""
    if not initial or initial == '':
        return 'unknown'
    if initial in ('true', 'false'):
        return 'boolean'
    if initial in ('null', 'undefined'):
        return 'nullable'
    if initial == "''":
        return 'string'
    if initial == '""':
        return 'string'
    if initial.startswith("'") or initial.startswith('"'):
        return 'string'
    if initial == '[]':
        return 'Array'
    if initial == '{}':
        return 'Object'
    if initial == '0' or initial == '1' or re.match(r'^-?\d+(\.\d+)?$', initial):
        return 'number'
    if initial.startswith('{'):
        return 'Object'
    if initial.startswith('['):
        return 'Array'
    if initial.startswith('new Date'):
        return 'Date'
    return initial  # could be a variable reference


def extract_props(code):
    """Extract component props."""
    props = []

    # Pattern 1: function Component({ prop1, prop2 }: Props)
    m = re.search(
        r'(?:export\s+(?:default\s+)?)?function\s+\w+\s*\(\s*\{([^}]+)\}',
        code
    )
    if m:
        raw = m.group(1)
        for p in re.split(r',', raw):
            p = p.strip()
            if p and not p.startswith('//'):
                # Clean up default values
                name = re.split(r'\s*[=:]\s*', p)[0].strip()
                if name:
                    props.append(name)

    # Pattern 2: const Component = ({ prop1, prop2 }: Props) =>
    if not props:
        m = re.search(
            r'(?:export\s+)?const\s+\w+\s*[:=]\s*(?:\w+\s*)?(?:React\.FC\s*<[^>]*>\s*)?\(?\s*\{\s*([^}]+)\}',
            code
        )
        if m:
            raw = m.group(1)
            for p in re.split(r',', raw):
                p = p.strip()
                if p and not p.startswith('//'):
                    name = re.split(r'\s*[=:]\s*', p)[0].strip()
                    if name:
                        props.append(name)

    # Pattern 3: interface Props / type Props
    if not props:
        m = re.search(r'(?:interface|type)\s+\w*Props\w*\s*(?:=\s*)?\{([^}]+)\}', code, re.DOTALL)
        if m:
            raw = m.group(1)
            for line in raw.split('\n'):
                line = line.strip().rstrip(';').rstrip(',')
                if line and not line.startswith('//'):
                    name = re.split(r'\s*[?:]\s*', line)[0].strip()
                    if name and not name.startswith('{'):
                        props.append(name)

    return props


def extract_contexts(code):
    """Extract React context providers used."""
    contexts = []

    # useContext(XContext)
    for m in re.finditer(r'useContext\((\w+)\)', code):
        contexts.append(m.group(1))

    # Custom context hooks: useAuth(), useWallet(), etc.
    known_context_hooks = {
        'useAuth': 'AuthContext',
        'useWallet': 'WalletContext',
        'useXRPL': 'XRPLContext',
        'useTheme': 'ThemeContext',
        'useSession': 'SessionContext',
        'useUser': 'UserContext',
        'useToast': 'ToastContext',
        'useRouter': 'NextRouter',
        'usePathname': 'NextRouter',
        'useSearchParams': 'NextRouter',
        'useParams': 'NextRouter',
    }
    for hook, ctx in known_context_hooks.items():
        if re.search(rf'\b{hook}\s*\(', code):
            if ctx not in contexts:
                contexts.append(ctx)

    return contexts


def extract_api_endpoints(code):
    """Extract API endpoints called."""
    endpoints = []

    # fetch('/api/...') — literal /api paths
    for m in re.finditer(r"""fetch\s*\(\s*[`'"](/api/[^`'"]+)[`'"]""", code):
        ep = m.group(1)
        ep = re.sub(r'\$\{[^}]+\}', '{param}', ep)
        if ep not in endpoints:
            endpoints.append(ep)

    # fetch(`/api/...`) — template literal /api paths
    for m in re.finditer(r'fetch\s*\(\s*`(/api/[^`]+)`', code):
        ep = m.group(1)
        ep = re.sub(r'\$\{[^}]+\}', '{param}', ep)
        if ep not in endpoints:
            endpoints.append(ep)

    # fetch(`${API_URL}/path...`) — template literal with API_URL variable
    for m in re.finditer(r'fetch\s*\(\s*`\$\{[^}]+\}(/[^`]+)`', code):
        ep = m.group(1)
        ep = re.sub(r'\$\{[^}]+\}', '{param}', ep)
        if ep not in endpoints:
            endpoints.append(ep)

    # fetch(`https://api.dltpays.com/...`) — hardcoded API domain
    for m in re.finditer(r'fetch\s*\(\s*[`\'"]https?://api\.dltpays\.com(/[^`\'"]+)[`\'"]', code):
        ep = m.group(1)
        ep = re.sub(r'\$\{[^}]+\}', '{param}', ep)
        if ep not in endpoints:
            endpoints.append(ep)

    # fetch(`https://tokencanvas.io/api/...`) or other external APIs
    for m in re.finditer(r'fetch\s*\(\s*[`\'"]https?://([^/]+)(/[^`\'"]+)[`\'"]', code):
        domain = m.group(1)
        path = m.group(2)
        if domain != 'api.dltpays.com':  # already handled above
            path = re.sub(r'\$\{[^}]+\}', '{param}', path)
            ep = f'EXTERNAL:{domain}{path}'
            if ep not in endpoints:
                endpoints.append(ep)

    # axios.get/post/put/delete — literal paths
    for m in re.finditer(r"""axios\.\w+\s*\(\s*[`'"](/[^`'"]+)[`'"]""", code):
        ep = m.group(1)
        ep = re.sub(r'\$\{[^}]+\}', '{param}', ep)
        if ep not in endpoints:
            endpoints.append(ep)

    # axios with template literal ${API_URL}
    for m in re.finditer(r'axios\.\w+\s*\(\s*`\$\{[^}]+\}(/[^`]+)`', code):
        ep = m.group(1)
        ep = re.sub(r'\$\{[^}]+\}', '{param}', ep)
        if ep not in endpoints:
            endpoints.append(ep)

    # API route handler: export async function GET/POST/etc
    for m in re.finditer(r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(', code):
        method = m.group(1)
        if f'HANDLER:{method}' not in endpoints:
            endpoints.append(f'HANDLER:{method}')

    return endpoints


def extract_imports(code):
    """Extract imported modules and components."""
    imports = []

    # ES6 imports: import X from 'Y' or import { X } from 'Y'
    for m in re.finditer(r"import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*)\s+from\s+['\"]([^'\"]+)['\"]", code):
        source = m.group(1)
        if not source.startswith('.'):
            # External package
            pkg = source.split('/')[0]
            if pkg.startswith('@'):
                pkg = '/'.join(source.split('/')[:2])
            if pkg not in imports:
                imports.append(pkg)
        else:
            # Local import
            basename = os.path.basename(source).replace('.tsx', '').replace('.ts', '').replace('.js', '')
            if basename and basename not in imports:
                imports.append(basename)

    # Dynamic imports: import('X')
    for m in re.finditer(r"import\s*\(\s*['\"]([^'\"]+)['\"]", code):
        source = m.group(1)
        basename = os.path.basename(source).replace('.tsx', '').replace('.ts', '').replace('.js', '')
        if basename and basename not in imports:
            imports.append(basename)

    # require('X')
    for m in re.finditer(r"require\s*\(\s*['\"]([^'\"]+)['\"]", code):
        source = m.group(1)
        if not source.startswith('.'):
            pkg = source.split('/')[0]
            if pkg.startswith('@'):
                pkg = '/'.join(source.split('/')[:2])
            if pkg not in imports:
                imports.append(pkg)
        else:
            basename = os.path.basename(source).replace('.tsx', '').replace('.ts', '').replace('.js', '')
            if basename and basename not in imports:
                imports.append(basename)

    return imports


def extract_imported_names(code):
    """Extract specific names imported (for dependency tree)."""
    names = {}  # name -> source

    for m in re.finditer(
        r"import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+['\"]([^'\"]+)['\"]",
        code
    ):
        braced = m.group(1)
        default_name = m.group(2)
        source = m.group(3)

        if braced:
            for item in braced.split(','):
                item = item.strip()
                if ' as ' in item:
                    item = item.split(' as ')[-1].strip()
                if item:
                    names[item] = source
        if default_name and default_name not in ('React', 'type'):
            names[default_name] = source

    return names


def build_dependency_tree(filepath, code, imported_names):
    """Build a visual dependency tree."""
    # Get component name
    comp_match = re.search(
        r'(?:export\s+(?:default\s+)?)?(?:function|const)\s+([A-Z]\w+)',
        code
    )
    comp_name = comp_match.group(1) if comp_match else os.path.basename(filepath).replace('.tsx', '').replace('.ts', '')

    # Categorize dependencies
    services = []
    components = []
    hooks = []
    libs = []

    for name, source in imported_names.items():
        if source.startswith('.'):
            # Local
            if name.startswith('use') and name[3:4].isupper():
                hooks.append(name)
            elif name[0:1].isupper():
                components.append(name)
            else:
                services.append(name)
        else:
            libs.append(name)

    # Also find hooks used in code that may not be in imports
    for m in re.finditer(r'\b(use[A-Z]\w+)\s*\(', code):
        hook_name = m.group(1)
        if hook_name not in hooks and hook_name not in ('useState', 'useEffect', 'useCallback',
            'useMemo', 'useRef', 'useReducer', 'useContext', 'useLayoutEffect',
            'useImperativeHandle', 'useDebugValue', 'useDeferredValue',
            'useTransition', 'useId', 'useSyncExternalStore', 'useInsertionEffect'):
            hooks.append(hook_name)

    tree_lines = []
    tree_lines.append(f'// {comp_name}')

    entries = []
    if hooks:
        entries.append(('hooks', sorted(set(hooks))))
    if components:
        entries.append(('uses', sorted(set(components))))
    if services:
        entries.append(('services', sorted(set(services))))
    if libs:
        entries.append(('libs', sorted(set(libs[:8]))))  # Cap at 8 to avoid noise

    for i, (label, items) in enumerate(entries):
        is_last = (i == len(entries) - 1)
        prefix = '└── ' if is_last else '├── '
        tree_lines.append(f'// {prefix}{label}: {", ".join(items)}')

    return tree_lines


def add_type_annotations(lines, states):
    """Insert TYPE annotations above useState/useReducer declarations."""
    if not states:
        return lines

    result = []
    state_map = {}
    for s in states:
        # Build a search pattern for this state declaration
        key = f'[{s["name"]}, {s["setter"]}]'
        state_map[key] = s

    for line in lines:
        stripped = line.strip()
        # Check if this line has a useState/useReducer
        for key, s in state_map.items():
            pattern = re.escape(s['name']) + r',\s*' + re.escape(s['setter'])
            if re.search(pattern, stripped) and ('useState' in stripped or 'useReducer' in stripped):
                indent = len(line) - len(line.lstrip())
                spaces = ' ' * indent
                result.append(f'{spaces}// TYPE: {s["type"]}\n')
                break
        result.append(line)

    return result


# ── Main Processing ──────────────────────────────────────────────────────────

def parse_sections(all_lines):
    """Split into file sections based on // FILE: markers."""
    sections = []
    current_header = []
    current_body = []
    current_filepath = None

    i = 0
    while i < len(all_lines):
        line = all_lines[i]
        stripped = line.strip()

        if stripped.startswith('// FILE:'):
            # Save previous section
            if current_filepath is not None:
                sections.append({
                    'filepath': current_filepath,
                    'header': current_header,
                    'body': current_body
                })

            # Start new section
            current_filepath = stripped.replace('// FILE:', '').strip()
            current_header = []
            current_body = []

            # Collect header lines (separator lines)
            # Look back for === separator
            if current_header == [] and sections == [] and i > 0:
                # Check if previous lines were separators
                pass

            # Include the === line before FILE: if present
            if len(sections) == 0 and i > 0 and all_lines[i-1].strip().startswith('// ===='):
                current_header.append(all_lines[i-1])

            current_header.append(line)

            # Check next line for ===
            if i + 1 < len(all_lines) and all_lines[i+1].strip().startswith('// ===='):
                current_header.append(all_lines[i+1])
                i += 2
                continue
        elif stripped.startswith('// ====') and current_filepath is None:
            # Pre-first-file separator
            current_header.append(line)
        else:
            if current_filepath is not None:
                current_body.append(line)
            else:
                # Content before first file marker
                if not sections:
                    current_body.append(line)

        i += 1

    # Save last section
    if current_filepath is not None:
        sections.append({
            'filepath': current_filepath,
            'header': current_header,
            'body': current_body
        })

    return sections


def process_section(section):
    """Process a single file section and add metadata."""
    filepath = section['filepath']
    header_lines = section['header']
    body_lines = section['body']
    code = ''.join(body_lines)

    # Analyze
    file_type = classify_file_type(filepath, code)
    flow = classify_flow(filepath, code)
    framework = classify_framework(filepath, code)
    states = extract_state_variables(code)
    props = extract_props(code)
    contexts = extract_contexts(code)
    api_endpoints = extract_api_endpoints(code)
    all_imports = extract_imports(code)
    imported_names = extract_imported_names(code)

    # Build output
    result = []

    # Original separator
    result.append('\n')
    result.append('// =================================================\n')
    result.append(f'// FILE: {filepath}\n')
    result.append('// =================================================\n')

    # FLOW label
    result.append(f'// FLOW: {flow}\n')
    result.append('\n')

    # META headers
    result.append(f'// META: Type: {file_type}\n')
    result.append(f'// META: Flow: {flow}\n')
    result.append(f'// META: Framework: {framework}\n')

    if states:
        state_strs = [f'{s["name"]}:{s["type"]}' for s in states]
        result.append(f'// META: State: [{", ".join(state_strs)}]\n')
    else:
        result.append('// META: State: [none]\n')

    if props:
        result.append(f'// META: Props: [{", ".join(props)}]\n')
    else:
        result.append('// META: Props: [none]\n')

    if contexts:
        result.append(f'// META: Context: [{", ".join(contexts)}]\n')
    else:
        result.append('// META: Context: [none]\n')

    if api_endpoints:
        result.append(f'// META: APIs: [{", ".join(api_endpoints)}]\n')
    else:
        result.append('// META: APIs: [none]\n')

    if all_imports:
        result.append(f'// META: Dependencies: [{", ".join(all_imports)}]\n')
    else:
        result.append('// META: Dependencies: [none]\n')

    result.append('\n')

    # DEPENDENCY TREE
    tree = build_dependency_tree(filepath, code, imported_names)
    result.append('// DEPENDENCY TREE:\n')
    for tl in tree:
        result.append(tl + '\n')
    result.append('\n')

    # Body with TYPE annotations added
    annotated_body = add_type_annotations(body_lines, states)
    result.extend(annotated_body)

    return result


def main():
    print("Reading input file...")
    with open(INPUT, 'r', encoding='utf-8', errors='replace') as f:
        all_lines = f.readlines()

    print(f"Input: {len(all_lines)} lines")

    print("Parsing file sections...")
    sections = parse_sections(all_lines)
    print(f"Found {len(sections)} file sections")

    print("Processing sections...")
    output = []

    # Stats
    stats = {
        'types': {},
        'flows': {},
        'frameworks': {},
        'total_states': 0,
        'total_props': 0,
        'total_apis': 0,
        'total_contexts': 0,
    }

    for i, section in enumerate(sections):
        filepath = section['filepath']
        code = ''.join(section['body'])

        file_type = classify_file_type(filepath, code)
        flow = classify_flow(filepath, code)
        framework = classify_framework(filepath, code)
        states = extract_state_variables(code)
        props = extract_props(code)
        apis = extract_api_endpoints(code)
        contexts = extract_contexts(code)

        stats['types'][file_type] = stats['types'].get(file_type, 0) + 1
        stats['flows'][flow] = stats['flows'].get(flow, 0) + 1
        stats['frameworks'][framework] = stats['frameworks'].get(framework, 0) + 1
        stats['total_states'] += len(states)
        stats['total_props'] += len(props)
        stats['total_apis'] += len(apis)
        stats['total_contexts'] += len(contexts)

        processed = process_section(section)
        output.extend(processed)

        if (i + 1) % 20 == 0:
            print(f"  Processed {i + 1}/{len(sections)} sections...")

    print(f"\nWriting output to {OUTPUT}...")
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.writelines(output)

    print(f"\n{'='*60}")
    print(f"ENHANCEMENT COMPLETE")
    print(f"{'='*60}")
    print(f"Sections processed: {len(sections)}")
    print(f"Output lines: {len(output)}")
    print(f"\nFile Types:")
    for t, c in sorted(stats['types'].items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")
    print(f"\nFlow Distribution:")
    for f, c in sorted(stats['flows'].items(), key=lambda x: -x[1]):
        print(f"  {f}: {c}")
    print(f"\nFrameworks:")
    for fw, c in sorted(stats['frameworks'].items(), key=lambda x: -x[1]):
        print(f"  {fw}: {c}")
    print(f"\nTotal state variables found: {stats['total_states']}")
    print(f"Total props extracted: {stats['total_props']}")
    print(f"Total API endpoints found: {stats['total_apis']}")
    print(f"Total context providers found: {stats['total_contexts']}")


if __name__ == '__main__':
    main()
