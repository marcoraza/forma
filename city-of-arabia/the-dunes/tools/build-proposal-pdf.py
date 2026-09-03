from pathlib import Path

from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT_ROOT / "delivery" / "tmp" / "pdfs"
OUTPUT_PATH = (
    PROJECT_ROOT
    / "delivery"
    / "output"
    / "pdf"
    / "FORMA x OUI - The Dunes - Sound Proposal.pdf"
)

PAGE_WIDTH = 960
PAGE_HEIGHT = 540


def build_pdf() -> None:
    pages = [SOURCE_DIR / f"proposal-final-{index:02d}.png" for index in range(1, 7)]
    missing = [str(page) for page in pages if not page.exists()]
    if missing:
        raise FileNotFoundError(f"Missing proposal pages: {', '.join(missing)}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    document = canvas.Canvas(
        str(OUTPUT_PATH),
        pagesize=(PAGE_WIDTH, PAGE_HEIGHT),
        pageCompression=1,
        pdfVersion=(1, 7),
    )
    document.setTitle("FORMA x OUI - The Dunes - Sound Proposal")
    document.setAuthor("FORMA")
    document.setSubject("Original score and sound design proposal for The Dunes")
    document.setCreator("FORMA")
    document.setKeywords("FORMA, OUI, The Dunes, sound proposal, original score, sound design")

    for page_path in pages:
        document.drawImage(
            ImageReader(str(page_path)),
            0,
            0,
            width=PAGE_WIDTH,
            height=PAGE_HEIGHT,
            preserveAspectRatio=True,
            anchor="c",
            mask="auto",
        )
        document.showPage()

    document.save()
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_pdf()
