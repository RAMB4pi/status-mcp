"""Build a deterministic, contained private plugin archive. No credentials included."""
from pathlib import Path
import json
import re
import zipfile
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
source = root / 'plugin' / 'harthad-status'
manifest = json.loads((source / 'plugin.json').read_text())
assert manifest['name'] == source.name
assert re.fullmatch(r'\d+\.\d+\.\d+', manifest['version'])
interface = manifest['extensions']['com.openai']['interface']
assert len(interface['shortDescription']) <= 30
assert not {'apps', 'skills', 'mcpServers', 'interface'} & manifest.keys()
assert 'apps' not in manifest['extensions']['com.openai']
mcp = json.loads((source / 'mcp.json').read_text())
assert mcp['mcpServers'] == {'status': {'type': 'streamable-http', 'url': 'https://status.harthad.com/mcp'}}
for key in ['logo', 'composerIcon', 'logoDark', 'composerIconDark']:
    asset = (source / interface[key]).resolve()
    assert asset.is_relative_to(source.resolve()) and asset.is_file()
    svg = ET.parse(asset).getroot()
    assert svg.get('width') == svg.get('height')
    assert asset.stat().st_size <= 5 * 1024 * 1024
skill = (source / 'skills/status/SKILL.md').read_text()
assert skill.startswith('---\nname: status\ndescription:')
paths = sorted(source.rglob('*'))
for p in paths:
    assert not p.is_symlink()
    assert p.name not in ['.env', '.app.json', 'node_modules']
output = root / 'dist' / 'harthad-status-plugin.zip'
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in paths:
        if p.is_file():
            info = zipfile.ZipInfo(str(p.relative_to(source.parent)), (2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, p.read_bytes())
with zipfile.ZipFile(output) as z:
    assert z.testzip() is None
    assert len(z.namelist()) == 6
print(output)
