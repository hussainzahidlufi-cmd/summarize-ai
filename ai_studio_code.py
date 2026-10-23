import os
import sys
from faster_whisper import WhisperModel
import ollama
import yt_dlp

print("=" * 60)
print("🚀 100% FREE & UNLIMITED OFFLINE VIDEO/AUDIO TRANSCRIBER & SUMMARIZER")
print("=" * 60)


# 1. YouTube se audio nikalna (agar link ho)
def get_audio(source_input):
    if source_input.startswith("http://") or source_input.startswith(
        "https://"
    ):
        print("\n⏳ YouTube link detect hua! Audio download ho rahi hai...")
        ydl_opts = {
            "format": "ba/b",
            "outtmpl": "temp_offline_audio.%(ext)s",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(source_input, download=True)
            return ydl.prepare_filename(info)
    return source_input


# 2. Faster-Whisper ke zariye Offline Speech-to-Text
def transcribe_offline(audio_path):
    print(
        "\n⏳ Audio ko text mein badla ja raha hai (Faster-Whisper Offline)..."
    )
    print("📢 Lafz ba lafz voice-over transcript tayyar ho raha hai...\n")

    # 'base' model fast aur light hai (CPU par araam se chalta hai)
    model = WhisperModel("base", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, beam_size=5)

    full_transcript = []
    for s in segments:
        mins_start, secs_start = divmod(s.start, 60)
        mins_end, secs_end = divmod(s.end, 60)
        timestamp = (
            f"[{int(mins_start):02d}:{int(secs_start):02d} -> "
            f"{int(mins_end):02d}:{int(secs_end):02d}]"
        )
        line = f"{timestamp} {s.text}"
        print(line)
        full_transcript.append(line)

    return "\n".join(full_transcript)


# 3. Local Llama-3 ke zariye Roman Urdu Summary & Notes
def summarize_offline(transcript_text):
    print("\n🤖 Local Llama-3 Roman Urdu mein mukammal notes bana raha hai...")

    prompt = f"""
    Aap ek expert tutor aur mentor hain. Neeche diye gaye lecture transcript ko mukammal samjhein aur Roman Urdu mein comprehensive notes banayein.
    
    Structure:
    1. Overall Summary / Lecture ka Maqsad
    2. Ahem Points & Technical Trading/Educational Rules (Bullet points mein)
    3. Actionable Rules (Real practice ke liye rules)
    4. Final Conclusion
    
    Transcript:
    {transcript_text[:12000]}
    """

    response = ollama.chat(
        model="llama3", messages=[{"role": "user", "content": prompt}]
    )
    return response["message"]["content"]


# --- MAIN PROGRAM ---
def main():
    user_input = input(
        "\nVideo file ka path ya YouTube link enter karein:\n👉 "
    ).strip()
    user_input = user_input.replace('"', "").replace("'", "")

    if not user_input:
        print("❌ Kuch enter nahi kiya gaya!")
        return

    # 1. Audio extract karein
    audio_path = get_audio(user_input)

    # 2. Full Verbatim Transcript banayein
    full_transcript = transcribe_offline(audio_path)

    # File save karein
    transcript_filename = "Full_Voice_Over_Transcript.txt"
    with open(transcript_filename, "w", encoding="utf-8") as f:
        f.write(full_transcript)
    print(f"\n✅ Mukammal transcript '{transcript_filename}' mein save ho gaya!")

    # 3. Roman Urdu Summary & Notes banayein
    summary_notes = summarize_offline(full_transcript)

    # Notes save karein
    notes_filename = "Video_To_Text_Study_Notes.txt"
    with open(notes_filename, "w", encoding="utf-8") as f:
        f.write(summary_notes)
    print(f"✅ Mukammal study notes '{notes_filename}' mein save ho gaye!")

    # Screen par display karein
    print("\n" + "=" * 25 + " SUMMARY & NOTES (Roman Urdu) " + "=" * 25)
    print(summary_notes)
    print("=" * 70)


if __name__ == "__main__":
    main()