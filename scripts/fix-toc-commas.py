from pathlib import Path

toc = Path("src/data/toc.ts").read_text(encoding="utf-8")
before = toc.count(",,")
toc = toc.replace(",,", ",")
toc = toc.replace('\n"word-501-510",', '\n  "word-501-510",')
toc = toc.replace('\n"quiz-vocab-501-510",', '\n  "quiz-vocab-501-510",')
Path("src/data/toc.ts").write_text(toc, encoding="utf-8")
print("fixed double commas", before, "->", toc.count(",,"))
