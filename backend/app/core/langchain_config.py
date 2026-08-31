from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings


def text_splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=120,
        separators=["\n\n", "\n", ". ", " "],
    )


def llm_available() -> bool:
    return bool(settings.openai_api_key.strip())
