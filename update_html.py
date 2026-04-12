import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern to remove old chapter-banner whole divs
html = re.sub(r'<div class="chapter-banner">.*?</div>\s*', '', html, flags=re.DOTALL)

# Now, insert the cropped illustrations inside the section elements!
sections = ['brunch', 'smallplates', 'burgers', 'fiesta', 'pasta', 'pizza', 'mains', 'sundaes']

for sec in sections:
    img_tag = f'<img src="images/{sec}_illus.png" alt="{sec} illustration" class="illustration-overlay" loading="lazy" />'
    
    # We replace <section class="menu-section" id="{sec}" data-section="{sec}">
    # With that tag + the img tag
    target = f'<section class="menu-section" id="{sec}" data-section="{sec}">'
    replacement = f'{target}\n    {img_tag}'
    html = html.replace(target, replacement)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated index.html to use illustration overlays inside sections!')
