import os

def generate_tree(dir_path: str, prefix: str = '') -> str:
    tree_str = ''
    entries = sorted(os.listdir(dir_path))
    entries = [e for e in entries if e not in {
        '.git',
        '__pycache__',
        '.venv',
        'venv',
        '.idea',
        '.env',
        '.DS_Store',
        'Thumbs.db',
        'node_modules',
        'dist',
        'env',
        '.vscode',
        'project_structure.txt',
        'generate_tree.py',
        'data'
    }]
    for i, entry in enumerate(entries):
        path = os.path.join(dir_path, entry)
        connector = '├── ' if i < len(entries) - 1 else '└── '
        tree_str += f"{prefix}{connector}{entry}\n"
        if os.path.isdir(path):
            extension = '│   ' if i < len(entries) - 1 else '    '
            tree_str += generate_tree(path, prefix + extension)
    return tree_str

if __name__ == '__main__':
    base_dir = '.'  # Or any other directory you want
    abs_base_dir = os.path.abspath(base_dir)
    root_name = os.path.basename(abs_base_dir.rstrip('/\\'))

    # Add the root directory name as the first line
    tree_output = f"{root_name}/\n"
    tree_output += generate_tree(base_dir)

    with open('project_structure.txt', 'w', encoding='utf-8') as f:
        f.write(tree_output)
    print(tree_output)
