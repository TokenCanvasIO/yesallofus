#!/usr/bin/env python3
"""Add Apple-style // MARK: comments to each file section in the monolithic file."""
import re

INPUT = "/Users/markflynn/Local Sites/yesallofus/swift-reference/monolithic_swift_ready.txt"
OUTPUT = "/Users/markflynn/Local Sites/yesallofus/swift-reference/monolithic_with_marks.txt"

def process_file_section(lines):
    result = []
    seen = set()
    
    for line in lines:
        s = line.strip()
        
        # Skip blanks/comments for classification
        if not s or s.startswith('//') or s.startswith('/*') or s.startswith('*'):
            result.append(line)
            continue
        
        # Imports
        if 'import' not in seen:
            if s.startswith('import ') or s.startswith('from ') or (s.startswith("const ") and "require(" in s) or s.startswith("'use client'") or s.startswith('"use client"'):
                seen.add('import')
                result.append('// MARK: - Imports & Dependencies\n')
        
        # Types & Interfaces
        if 'types' not in seen:
            if (s.startswith('interface ') or s.startswith('type ') or 
                s.startswith('export interface') or s.startswith('export type ') or
                s.startswith('enum ')):
                seen.add('types')
                result.append('\n// MARK: - Types & Interfaces\n')
        
        # Constants (top-level ALL_CAPS or config objects)
        if 'constants' not in seen and 'component' not in seen:
            if re.match(r"^(export\s+)?const\s+[A-Z_]{2,}", s) and 'useState' not in s:
                seen.add('constants')
                result.append('\n// MARK: - Constants & Configuration\n')
        
        # Component definition
        if 'component' not in seen:
            if (re.match(r'^export\s+default\s+function\s+\w+', s) or
                re.match(r'^(export\s+)?function\s+[A-Z]\w+', s) or
                (re.match(r"^(export\s+)?const\s+[A-Z]\w+", s) and ('=>' in s or ': React' in s or 'FC' in s))):
                seen.add('component')
                result.append('\n// MARK: - Component Definition\n')
        
        # State Management
        if 'state' not in seen and 'component' in seen:
            if 'useState(' in s or 'useReducer(' in s:
                seen.add('state')
                result.append('\n// MARK: - State Management\n')
        
        # Hooks & Effects
        if 'effects' not in seen and 'component' in seen:
            if s.strip().startswith('useEffect(') or s.strip().startswith('useEffect ('):
                seen.add('effects')
                result.append('\n// MARK: - Hooks & Effects\n')
        
        # Event Handlers
        if 'handlers' not in seen and 'component' in seen:
            if re.match(r'\s*(const\s+)?(handle[A-Z]|on[A-Z])\w+\s*=', s):
                seen.add('handlers')
                result.append('\n// MARK: - Event Handlers\n')
        
        # API Calls (standalone fetch functions)
        if 'api' not in seen and 'component' in seen:
            if re.match(r'\s*(const\s+)?(fetch|load|get|post|create|update|delete|save|submit)\w+\s*=\s*(async\s*)?\(', s, re.IGNORECASE):
                seen.add('api')
                result.append('\n// MARK: - API Calls & Data Fetching\n')
        
        # Main Render
        if 'render' not in seen and 'component' in seen:
            if re.match(r'\s*return\s*\(?\s*$', s) or re.match(r'\s*return\s*\(<', s):
                seen.add('render')
                result.append('\n// MARK: - Main Render\n')
        
        # Exports
        if 'exports' not in seen:
            if s == 'export default' or (s.startswith('export default ') and 'function' not in s) or s.startswith('module.exports'):
                seen.add('exports')
                result.append('\n// MARK: - Exports\n')
        
        result.append(line)
    
    return result

def main():
    with open(INPUT, 'r', encoding='utf-8', errors='replace') as f:
        all_lines = f.readlines()
    
    output = []
    section = []
    file_count = 0
    separator_lines = []
    
    for line in all_lines:
        # Detect file separator: "// FILE:" line
        if line.strip().startswith('// FILE:'):
            # Flush previous section
            if section:
                processed = process_file_section(section)
                output.extend(processed)
                section = []
                file_count += 1
            # Also flush any accumulated separator lines
            output.extend(separator_lines)
            separator_lines = []
            output.append(line)
            continue
        
        # Detect the === separator lines
        if line.strip().startswith('// ===='):
            separator_lines.append(line)
            continue
        
        # Flush separators into section if not followed by FILE:
        if separator_lines:
            section.extend(separator_lines)
            separator_lines = []
        
        section.append(line)
    
    # Last section
    if separator_lines:
        section.extend(separator_lines)
    if section:
        processed = process_file_section(section)
        output.extend(processed)
        file_count += 1
    
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.writelines(output)
    
    print(f"Processed {file_count} file sections")
    print(f"Output: {len(output)} lines")

if __name__ == '__main__':
    main()
