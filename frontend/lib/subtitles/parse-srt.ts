export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

export type SrtValidationResult = {
  cues: SubtitleCue[];
  errors: string[];
};

const MAX_FILE_BYTES = 512 * 1024;
const MAX_CUE_DURATION_SEC = 30;
const MAX_CUES = 5000;

/** Parse SRT subtitle file content into timed cues. */
export function parseSrt(content: string): SubtitleCue[] {
  return validateSrt(content).cues;
}

/** Strong SRT validation with detailed error messages. */
export function validateSrt(content: string, fileSizeBytes?: number): SrtValidationResult {
  const errors: string[] = [];

  if (fileSizeBytes != null && fileSizeBytes > MAX_FILE_BYTES) {
    errors.push(`حجم فایل بیش از ${MAX_FILE_BYTES / 1024}KB است`);
    return { cues: [], errors };
  }

  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) {
    errors.push("فایل خالی است");
    return { cues: [], errors };
  }

  if (!normalized.includes("-->")) {
    errors.push("فرمت SRT نامعتبر است (خط زمان‌بندی یافت نشد)");
    return { cues: [], errors };
  }

  const blocks = normalized.split(/\n\n+/);
  const cues: SubtitleCue[] = [];
  let prevEnd = -1;

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi].trim();
    if (!block) continue;

    const lines = block.split("\n").map((l) => l.trimEnd());
    if (lines.length < 2) {
      errors.push(`بلوک ${bi + 1}: حداقل دو خط (زمان و متن) لازم است`);
      continue;
    }

    let timeLineIdx = 0;
    if (/^\d+$/.test(lines[0].trim())) {
      timeLineIdx = 1;
      if (lines.length < 3) {
        errors.push(`بلوک ${bi + 1}: پس از شماره، خط زمان و متن لازم است`);
        continue;
      }
    }

    const times = lines[timeLineIdx].match(
      /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/
    );
    if (!times) {
      errors.push(`بلوک ${bi + 1}: فرمت زمان نامعتبر است (باید HH:MM:SS,mmm --> HH:MM:SS,mmm)`);
      continue;
    }

    const start = srtTimeToSeconds(times[1], times[2], times[3], times[4]);
    const end = srtTimeToSeconds(times[5], times[6], times[7], times[8]);

    if (end <= start) {
      errors.push(`بلوک ${bi + 1}: زمان پایان باید بعد از شروع باشد`);
      continue;
    }
    if (end - start > MAX_CUE_DURATION_SEC) {
      errors.push(`بلوک ${bi + 1}: مدت هر زیرنویس حداکثر ${MAX_CUE_DURATION_SEC} ثانیه`);
      continue;
    }
    if (start < prevEnd - 0.05) {
      errors.push(`بلوک ${bi + 1}: زمان‌بندی با بلوک قبلی هم‌پوشانی دارد`);
    }
    prevEnd = end;

    const text = lines
      .slice(timeLineIdx + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) {
      errors.push(`بلوک ${bi + 1}: متن زیرنویس خالی است`);
      continue;
    }

    cues.push({ start, end, text });
    if (cues.length > MAX_CUES) {
      errors.push(`بیش از ${MAX_CUES} خط زیرنویس مجاز نیست`);
      break;
    }
  }

  if (!cues.length && !errors.length) {
    errors.push("هیچ زیرنویس معتبری یافت نشد");
  }

  cues.sort((a, b) => a.start - b.start);
  return { cues, errors };
}

function srtTimeToSeconds(h: string, m: string, s: string, ms: string): number {
  const hh = Number(h);
  const mm = Number(m);
  const ss = Number(s);
  const mss = Number(ms);
  if ([hh, mm, ss, mss].some((n) => Number.isNaN(n))) return NaN;
  if (mm > 59 || ss > 59) return NaN;
  return hh * 3600 + mm * 60 + ss + mss / 1000;
}

export function cueAtTime(cues: SubtitleCue[], time: number): string | null {
  const cue = cues.find((c) => time >= c.start && time <= c.end);
  return cue?.text ?? null;
}
