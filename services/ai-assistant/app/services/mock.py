"""Rule-based answers when no LLM API key is configured."""

from app.models import ChatMessage

FAQ: list[tuple[list[str], str, list[str]]] = [
    (
        ["اتاق", "room", "watch", "party", "روم", "واچ"],
        "برای ساخت اتاق: از منوی «روم‌ها» گزینه «ساخت اتاق» را بزنید. لینک دعوت را با دوستان به اشتراک بگذارید. میزبان کنترل پخش را دارد.",
        ["چطور به اتاق بپیوندم؟", "How do I join a room?"],
    ),
    (
        ["join", "invite", "دعوت", "کد", "code"],
        "کد دعوت یا لینک را از میزبان بگیرید → «پیوستن به اتاق» → کد را وارد کنید.",
        ["ساخت اتاق", "Create a room"],
    ),
    (
        ["otp", "کد", "sms", "ورود", "login", "موبایل"],
        "ورود با OTP: در صفحه ورود تب «کد یکبارمصرف» → شماره موبایل → کد ۵ رقمی. در محیط dev کد در لاگ سرور چاپ می‌شود.",
        ["ورود با گوگل", "Google sign-in"],
    ),
    (
        ["google", "گوگل"],
        "روی «ادامه با Google» کلیک کنید. اگر GOOGLE_CLIENT_ID تنظیم نشده باشد دکمه غیرفعال است.",
        ["ورود با OTP", "OTP login"],
    ),
    (
        ["upload", "video", "ویدیو", "آپلود", "url", "لینک"],
        "در کتابخانه: «آپلود ویدیو» → تب URL یا CDN → عنوان + لینک مستقیم ویدیو (mp4/m3u8). پردازش HLS به‌زودی.",
        ["کیفیت پخش", "Playback quality"],
    ),
    (
        ["sub", "plan", "اشتراک", "billing", "پرداخت"],
        "پلن رایگان محدودیت تعداد اتاق دارد. از «اشتراک / پرداخت» پلن را ارتقا دهید.",
        ["تیکت پشتیبانی", "Support ticket"],
    ),
    (
        ["sync", "lag", "تاخیر", "همگام"],
        "اگر پخش همگام نیست: اتصال اینترنت را بررسی کنید. فقط میزبان play/pause/seek می‌زند. صفحه را refresh کنید.",
        ["گزارش مشکل", "Report issue"],
    ),
    (
        ["help", "سلام", "hello", "hi", "کمک"],
        "سلام! من دستیار MovieSync هستم. درباره اتاق، ورود، آپلود ویدیو یا اشتراک بپرسید.",
        ["ساخت اتاق", "How to upload video?"],
    ),
]


def mock_reply(message: str, history: list[ChatMessage], locale: str) -> tuple[str, list[str]]:
    text = message.lower()
    for keywords, answer_fa, suggestions in FAQ:
        if any(kw in text for kw in keywords):
            if locale == "en":
                # Simple EN mirror for common topics
                en_map = {
                    FAQ[0][1]: "To create a room: go to Rooms → Create room. Share the invite link. The host controls playback.",
                    FAQ[1][1]: "Get an invite code from the host → Join room → enter the code.",
                    FAQ[2][1]: "OTP login: Login page → OTP tab → mobile number → 5-digit code. In dev, code is in server logs.",
                    FAQ[3][1]: "Click Continue with Google. Button is disabled until GOOGLE_CLIENT_ID is configured.",
                    FAQ[4][1]: "Library → Upload video → URL or CDN tab → title + direct video link (mp4/m3u8).",
                    FAQ[5][1]: "Free plan has room limits. Upgrade from Subscription / Billing.",
                    FAQ[6][1]: "If playback is out of sync: check network. Only host controls play/pause/seek. Try refresh.",
                    FAQ[7][1]: "Hi! I'm the MovieSync assistant. Ask about rooms, login, uploads, or subscriptions.",
                }
                return en_map.get(answer_fa, answer_fa), suggestions
            return answer_fa, suggestions

    default_fa = (
        "سؤال شما را دریافت کردم. برای پاسخ دقیق‌تر، کلید OpenAI یا Anthropic را در ai-assistant تنظیم کنید "
        "(AI_PROVIDER=openai). فعلاً می‌توانید درباره اتاق، OTP، آپلود یا اشتراک بپرسید."
    )
    default_en = (
        "Got your question. For smarter answers, set OPENAI_API_KEY or ANTHROPIC_API_KEY on the ai-assistant service. "
        "Try asking about rooms, OTP login, uploads, or billing."
    )
    if locale == "en":
        return default_en, ["Create a room", "OTP login", "Upload video"]
    return default_fa, ["ساخت اتاق", "ورود OTP", "آپلود ویدیو"]
