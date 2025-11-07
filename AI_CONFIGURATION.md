# AI Configuration Documentation

## 🔑 API Keys Required

### Primary AI Provider: Google Gemini
- **Environment Variable**: `GOOGLE_GEMINI_API_KEY`
- **Model**: `gemini-2.5-flash`
- **Used For**: Review reply generation, Auto-reply functionality
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`

### Fallback AI Providers (for general content generation)
These are used in `/api/ai/generate` as fallback options:

1. **Groq**
   - **Environment Variable**: `GROQ_API_KEY`
   - **Model**: `mixtral-8x7b-32768`
   - **Priority**: 1st fallback

2. **DeepSeek**
   - **Environment Variable**: `DEEPSEEK_API_KEY`
   - **Model**: `deepseek-chat`
   - **Priority**: 2nd fallback

3. **Together AI**
   - **Environment Variable**: `TOGETHER_API_KEY`
   - **Model**: `mistralai/Mixtral-8x7B-Instruct-v0.1`
   - **Priority**: 3rd fallback

4. **OpenAI**
   - **Environment Variable**: `OPENAI_API_KEY`
   - **Model**: `gpt-4`
   - **Priority**: 4th fallback

---

## 📍 Where Each AI is Used

### 1. Review Reply Generation
- **Route**: `/api/ai/generate-review-reply`
- **AI Provider**: Google Gemini (`gemini-2.5-flash`)
- **API Key**: `GOOGLE_GEMINI_API_KEY`
- **Used In**:
  - `components/reviews/reply-dialog.tsx` - Manual reply generation
  - `server/actions/auto-reply.ts` - Auto-reply functionality
  - `app/api/reviews/ai-response/route.ts` - AI response endpoint

### 2. General Content Generation
- **Route**: `/api/ai/generate`
- **AI Providers**: Groq → DeepSeek → Together → OpenAI (fallback chain)
- **Used In**:
  - General content generation
  - Posts, descriptions, FAQs

---

## ⚙️ Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Primary AI Provider (Required for Reviews)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Fallback Providers (Optional, for general content)
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
TOGETHER_API_KEY=your_together_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Getting API Keys

1. **Google Gemini API Key**:
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy and add to `.env.local`

2. **Groq API Key** (Optional):
   - Visit: https://console.groq.com/
   - Sign up and get your API key

3. **DeepSeek API Key** (Optional):
   - Visit: https://platform.deepseek.com/
   - Sign up and get your API key

4. **Together AI Key** (Optional):
   - Visit: https://together.ai/
   - Sign up and get your API key

5. **OpenAI API Key** (Optional):
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key

---

## 🎯 Current Implementation

### Reviews Tab AI Features:
- ✅ **Auto-Reply**: Uses Google Gemini
- ✅ **Manual Reply Generation**: Uses Google Gemini
- ✅ **AI Assistant Sidebar**: Shows "Powered by Google Gemini"

### AI Models Used:
- **Primary**: `gemini-2.5-flash` (Google Gemini)
- **Fallback**: Multiple providers for general content

---

## 🔄 How It Works

1. **User clicks "Generate AI Reply"**:
   - Calls `/api/ai/generate-review-reply`
   - Uses Google Gemini API
   - Returns generated reply

2. **Auto-Reply Triggered**:
   - When new review is synced
   - Checks auto-reply settings
   - Calls `processAutoReply()` function
   - Uses Google Gemini to generate reply
   - Sends automatically (or saves for approval)

3. **General Content Generation**:
   - Calls `/api/ai/generate`
   - Tries providers in order: Groq → DeepSeek → Together → OpenAI
   - Uses first available provider

---

## 📝 Notes

- **Google Gemini** is the primary and required AI provider for review functionality
- Fallback providers are optional and only used for general content generation
- All API keys should be kept secure and never committed to git
- The AI Assistant Sidebar displays "Powered by Google Gemini" to reflect the actual provider

