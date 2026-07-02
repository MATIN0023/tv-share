from app.services.srt import segments_to_srt
from app.services.transcribe import TranscriptSegment


def test_segments_to_srt_format():
    segments = [
        TranscriptSegment(start=0.0, end=2.5, text="سلام"),
        TranscriptSegment(start=2.5, end=5.0, text="Hello world"),
    ]
    srt = segments_to_srt(segments)
    assert "1\n" in srt
    assert "00:00:00,000 --> 00:00:02,500" in srt
    assert "سلام" in srt
    assert "2\n" in srt
    assert "Hello world" in srt
