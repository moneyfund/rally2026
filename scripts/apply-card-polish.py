from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Pattern not found: {label}")
    return text.replace(old, new, 1)

# Refresh demo venture imagery with warmer, more home-grown reference photos.
path = Path("components/DiscoverClient.tsx")
text = path.read_text()
replacements = {
    '4: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=82"':
        '4: "https://images.unsplash.com/photo-1778399950106-1433820eb601?auto=format&fit=crop&w=1200&q=82"',
    '5: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=82"':
        '5: "https://images.unsplash.com/photo-1759523146335-0069847ceb16?auto=format&fit=crop&w=1200&q=82"',
    '7: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82"':
        '7: "https://images.unsplash.com/photo-1737529807163-1d8a3fb6c403?auto=format&fit=crop&w=1200&q=82"',
    '8: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82"':
        '8: "https://images.unsplash.com/photo-1758611971329-94fa9d6aa8a5?auto=format&fit=crop&w=1200&q=82"',
}
for old, new in replacements.items():
    text = replace_once(text, old, new, f"venture image {old[:3]}")

old_return = 'return href ? <Link href={href} className="directory-card">{content}</Link> : <article className="directory-card">{content}</article>;'
new_return = 'const cardClass = profile.kind === "persona" ? "directory-card directory-card-talent" : "directory-card";\n  return href ? <Link href={href} className={cardClass}>{content}</Link> : <article className={cardClass}>{content}</article>;'
text = replace_once(text, old_return, new_return, "talent-only card class")
path.write_text(text)

# Add navy borders to talent and job cards while keeping the existing visual language.
path = Path("app/marketplace.css")
text = path.read_text()
marker = "/* NAVY CARD SEPARATION V1 */"
if marker not in text:
    text += '''\n\n/* NAVY CARD SEPARATION V1 */\n.directory-card-talent,\n.discover-job-card,\n.featured-job-card {\n  border: 2px solid #0b2e4f;\n}\n.directory-card-talent:hover,\n.discover-job-card:hover,\n.featured-job-card:hover {\n  border-color: #174b78;\n}\n'''
path.write_text(text)
