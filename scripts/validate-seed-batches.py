import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

for p in sorted(Path("scripts/vocab-batches").glob("seeds-*.ts")):
    t = p.read_text(encoding="utf-8")
    ids = [int(x) for x in re.findall(r"id:\s*(\d+)", t)]
    print(p.name, "ids", len(ids), "range", min(ids) if ids else None, "-", max(ids) if ids else None)
    for field in ("phrase", "sentence"):
        for m in re.finditer(rf'{field}:\s*"([^"]*)"', t):
            s = m.group(1)
            if re.search(r"[A-Za-z]", s):
                print(" ASCII", field, s)
