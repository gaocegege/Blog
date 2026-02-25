#!/usr/bin/env python3
"""Migrate Jekyll posts to Hugo format."""

import os
import re
import shutil
from pathlib import Path

def parse_front_matter(content):
    """Parse YAML front matter from markdown content."""
    if not content.startswith('---'):
        return None, content
    
    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, content
    
    return parts[1].strip(), parts[2].strip()

def convert_front_matter(fm_text):
    """Convert Jekyll front matter to Hugo front matter."""
    # Replace 'category:' with 'categories:' and convert to list format
    fm_text = re.sub(r'^category:\s*(.+)$', r'categories:\n  - \1', fm_text, flags=re.MULTILINE)
    
    # Remove layout line
    fm_text = re.sub(r'^layout:\s*\S+\n', '', fm_text, flags=re.MULTILINE)
    
    # Convert tags from [tag1, tag2] format if needed
    fm_text = re.sub(r'^tags:\s*\[([^\]]+)\]', lambda m: 'tags:\n  - ' + m.group(1).replace(', ', '\n  - '), fm_text, flags=re.MULTILINE)
    
    return fm_text

def migrate_post(src_path, dst_dir):
    """Migrate a single post from Jekyll to Hugo format."""
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fm_text, body = parse_front_matter(content)
    
    if fm_text is None:
        print(f"Warning: No front matter found in {src_path}")
        return
    
    # Convert front matter
    new_fm = convert_front_matter(fm_text)
    
    # Reconstruct the file
    new_content = f"---\n{new_fm}\n---\n\n{body}"
    
    # Generate new filename (Hugo doesn't need date prefix, but we'll keep it for ordering)
    filename = os.path.basename(src_path)
    dst_path = os.path.join(dst_dir, filename)
    
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Migrated: {filename}")

def main():
    jekyll_posts_dir = '/Users/gaoce/code/Blog/_posts'
    hugo_posts_dir = '/Users/gaoce/code/Blog/hugo-blog/content/posts'
    
    # Get all markdown files
    post_files = sorted([f for f in os.listdir(jekyll_posts_dir) if f.endswith('.md')])
    
    print(f"Found {len(post_files)} posts to migrate")
    
    for filename in post_files:
        src_path = os.path.join(jekyll_posts_dir, filename)
        migrate_post(src_path, hugo_posts_dir)
    
    print(f"\nMigration complete! Migrated {len(post_files)} posts to {hugo_posts_dir}")

if __name__ == '__main__':
    main()
