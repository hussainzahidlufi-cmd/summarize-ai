import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing with large limits for media files
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Shared Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Demo presets for immediate testing
const PRESETS = [
  {
    id: 'smc-lecture-1',
    title: '01. What is Smart Money Concept (SMC) & Why SMC is Important - Forex Dada (Level 3)',
    category: 'Forex & Trading',
    duration: '24:18',
    sourceType: 'video',
    targetLanguage: 'roman_urdu',
    description: 'Forex Dada Level 3 SMC Course - Smart Money Concept ki buniyadi wazahat aur banks / institutions ke trading tareeqay.',
    data: {
      title: 'Smart Money Concept (SMC) - Introduction & Importance',
      overview: 'Is lecture mein Forex Dada ne Retail Traders aur Institutional Traders (Smart Money jaise Banks aur Hedge Funds) ke darmiyan buniyadi farq ko wazeh kiya hai. Retail indicators (RSI, Trendlines, Support/Resistance) aksar retail traders ko trap karte hain kyunki banks liquidity grab karne ke baad asli move shuru karte hain. SMC seekhna is liye zaroori hai taake hum smart institutions ke flow ke sath trade karein, unke against nahi.',
      keyTakeaways: [
        'Retail vs Institutional: 95% retail traders lose money kyunki wo predictable support aur resistance par stop loss lagate hain jahan banks liquidity hunt karte hain.',
        'Liquidity Hunt (Stop Hunting): Smart money ko bare orders fill karne ke liye retail stop-losses ki zaroorat hoti hai. Isi liye breakout trades aksar fakeout bante hain.',
        'Market Manipulation: Market kabhi random nahi chalti, institutional algorithms (IPDA) price ko higher time frame liquidity levels ki taraf drive karte hain.',
        'Risk to Reward Ratio: Traditional trading mein 1:2 milna mushkil hota hai, jabke SMC ke zariye refined entries se 1:5 se 1:10+ ka reward ratio achieve kiya ja sakta hai.',
        'Higher Time Frame (HTF) Alignment: Trading hamesha 4H ya Daily market direction ke mutabiq karni chahiye, chote time frames (1M, 5M) sirf entry confirmation ke liye hain.'
      ],
      technicalConcepts: [
        { term: 'Smart Money', explanation: 'Central banks, commercial giants, aur financial institutions jinke paas market hilane ka capital hota hai.' },
        { term: 'Liquidity Pool', explanation: 'Wo area jahan bohot se retail stop losses jama hote hain (jaise Double Tops, Double Bottoms, aur Trendlines ke peeche).' },
        { term: 'Retail Traps', explanation: 'Aam chart patterns (Head & Shoulders, Flag patterns) jo retail ko buy/sell karwate hain taake smart money counter-trade kar sakay.' },
        { term: 'Order Block (OB)', explanation: 'Aakhri opposing candle jo aggressive institutional move se pehle create hui thi jahan unke unmitigated orders hotay hain.' },
        { term: 'Imbalance / FVG', explanation: 'Price mein tez movement ki wajah se khali reh jane wala gap jahan orders fill nahi hue aur market use fill karne wapas aati hai.' }
      ],
      chapters: [
        { timestamp: '00:00 - 04:30', title: 'Introduction to Level 3 SMC Course', summary: 'Retail trading methods ki limitations aur fail hone ki asal wajah ka tazkira.' },
        { timestamp: '04:31 - 11:15', title: 'Smart Money Mechanism & Bank Algorithms', summary: 'Institutions market ko kis tarah control karte hain aur liquidity kaise create hoti hai.' },
        { timestamp: '11:16 - 18:40', title: 'Why SMC gives superior Risk:Reward', summary: 'Precision entries aur sniper stops lagane ka method aur retail traps se bachne ki hikmat-e-amli.' },
        { timestamp: '18:41 - 24:18', title: 'Golden Rules & Course Roadmap', summary: 'Patience, disciplined risk management, aur aglay lectures (Order Blocks, BOS, CHoCH) ka introductory overview.' }
      ],
      actionableRules: [
        'Kabhi bhi retail trendline break par direct blind trade mat karein, hamesha liquidity grab aur mitigation ka wait karein.',
        'Apna maximum risk per trade 1% se 2% tak mehdood rakhein chahe kitna hi perfect setup kyun na lage.',
        'Higher time frame direction ko master karein: 4H trend agar bearish hai toh 15M par buy dhundna trap hai.'
      ],
      fullTranscript: [
        {
          timestamp: '00:00 - 02:15',
          speaker: 'Forex Dada (Instructor)',
          text: 'Assalam-o-Alaikum dosto, Forex Dada ke Level 3 Smart Money Concept course ke Lecture 1 mein aap sab ko khushamdeed. Aaj hum baat karenge ke Smart Money Concept yani SMC asal mein kya cheez hai aur har trader ko retail indicators chor kar isko kyun seekhna chahiye.'
        },
        {
          timestamp: '02:16 - 05:40',
          speaker: 'Forex Dada (Instructor)',
          text: 'Dekhein dosto, market mein do tarah ke log trade karte hain. Pehle hain Retail Traders yani aap aur hum jaise aam log, aur doosre hain Institutional Traders jinhe hum Smart Money kehte hain—jisme Central Banks, Hedge Funds aur Investment Banks shamil hain. Retail traders technical analysis mein RSI, MACD, Trendlines aur Support Resistance follow karte hain.'
        },
        {
          timestamp: '05:41 - 09:20',
          speaker: 'Forex Dada (Instructor)',
          text: 'Lekin kya aapne kabhi socha hai ke 95% retail traders kyun loss karte hain? Asal wajah ye hai ke retail patterns bilkul predictable hotay hain. Jab bhi market kisi double top par aati hai, retail trader wahan sell karta hai aur apna stop loss bilkul uske upar laga deta hai. Banks ko jab millions of dollars ke orders lagane hote hain, toh unko liquidity chahiye hoti hai. Wo price ko retail stop loss ki taraf le jate hain, unka stop loss hit karwate hain (jise hum Liquidity Hunt ya Stop Hunt kehte hain), aur phir asli direction mein move shuru hoti hai.'
        },
        {
          timestamp: '09:21 - 14:10',
          speaker: 'Forex Dada (Instructor)',
          text: 'Isi wajah se SMC ka main rule ye hai: Jahan retail trader trap hota hai aur uska stop loss hit hota hai, wahan se hamari entry confirm hoti hai. Smart money price ko chalane ke liye Interbank Price Delivery Algorithm (IPDA) ka sahara leti hai. Market kabhi bhi random nahi ghoomti balki ek targeted liquidity pool se doosre pool ki taraf jati hai.'
        },
        {
          timestamp: '14:11 - 19:30',
          speaker: 'Forex Dada (Instructor)',
          text: 'Agli ahem cheez jo hum is course mein seekhenge wo hai Risk to Reward Ratio. Retail trading mein 1:1 ya 1:2 milna bhi mushkil ho jata hai, jabke SMC ke zariye jab hum refined Order Blocks aur Fair Value Gaps (FVG) par sniper entry lete hain, toh hamara stop loss sirf 5 se 10 pips ka hota hai jabke target 50 se 100 pips ka hota hai—yani 1:5 se 1:10+ ka reward ratio.'
        },
        {
          timestamp: '19:31 - 24:18',
          speaker: 'Forex Dada (Instructor)',
          text: 'Aakhir mein meri aapse guzarish hai ke is course ko step-by-step follow karein. Next lectures mein hum Order Blocks, Break of Structure (BOS), Change of Character (CHoCH) aur Liquidity Sweep ko detail mein samjhenge. Chaliye ab milte hain aglay lecture mein!'
        }
      ],
      rawTranscriptText: 'Assalam-o-Alaikum dosto, Forex Dada ke Level 3 Smart Money Concept course ke Lecture 1 mein aap sab ko khushamdeed. Aaj hum baat karenge ke Smart Money Concept yani SMC asal mein kya cheez hai aur har trader ko retail indicators chor kar isko kyun seekhna chahiye. Dekhein dosto, market mein do tarah ke log trade karte hain. Pehle hain Retail Traders yani aap aur hum jaise aam log, aur doosre hain Institutional Traders jinhe hum Smart Money kehte hain—jisme Central Banks, Hedge Funds aur Investment Banks shamil hain. Retail traders technical analysis mein RSI, MACD, Trendlines aur Support Resistance follow karte hain. Lekin kya aapne kabhi socha hai ke 95% retail traders kyun loss karte hain? Asal wajah ye hai ke retail patterns bilkul predictable hotay hain. Jab bhi market kisi double top par aati hai, retail trader wahan sell karta hai aur apna stop loss bilkul uske upar laga deta hai. Banks ko jab millions of dollars ke orders lagane hote hain, toh unko liquidity chahiye hoti hai. Wo price ko retail stop loss ki taraf le jate hain, unka stop loss hit karwate hain (jise hum Liquidity Hunt ya Stop Hunt kehte hain), aur phir asli direction mein move shuru hoti hai. Isi wajah se SMC ka main rule ye hai: Jahan retail trader trap hota hai aur uska stop loss hit hota hai, wahan se hamari entry confirm hoti hai. Smart money price ko chalane ke liye Interbank Price Delivery Algorithm (IPDA) ka sahara leti hai. Market kabhi bhi random nahi ghoomti balki ek targeted liquidity pool se doosre pool ki taraf jati hai. Agli ahem cheez jo hum is course mein seekhenge wo hai Risk to Reward Ratio. Retail trading mein 1:1 ya 1:2 milna bhi mushkil ho jata hai, jabke SMC ke zariye jab hum refined Order Blocks aur Fair Value Gaps (FVG) par sniper entry lete hain, toh hamara stop loss sirf 5 se 10 pips ka hota hai jabke target 50 se 100 pips ka hota hai—yani 1:5 se 1:10+ ka reward ratio. Aakhir mein meri aapse guzarish hai ke is course ko step-by-step follow karein. Next lectures mein hum Order Blocks, Break of Structure (BOS), Change of Character (CHoCH) aur Liquidity Sweep ko detail mein samjhenge. Chaliye ab milte hain aglay lecture mein!',
      studyNotes: [
        {
          topic: '1. Retail Psychology vs Institutional Flow',
          timestamp: '00:00 - 05:40',
          content: 'Aam retail traders traditional support, resistance aur lagging indicators (RSI, Stochastic) ke signal par entries lete hain. Ye patterns banks aur algorithm ke liye sabse easy target hotay hain kyunki inke stop-losses clustered hotay hain.',
          keyBulletPoints: [
            'Retail stops banks ke liye liquidity source ka kaam karte hain.',
            'Breakout trades par 85% traps bante hain jinhe fakeout kaha jata hai.',
            'Indicators price ke derivative hotay hain, price action ke driver nahi.'
          ]
        },
        {
          topic: '2. Liquidity Pools & Stop Hunting Mechanics',
          timestamp: '05:41 - 14:10',
          content: 'Smart Money giant institutional capital deploy karti hai. Wo market order execute nahi kar sakte kyunki price slip ho jayegi. Wo hamesha equal highs (BSL) ya equal lows (SSL) ke upar/neeche retail stop losses ko trigger karwa kar apni buying/selling positions create karte hain.',
          keyBulletPoints: [
            'Buy Side Liquidity (BSL): Double tops ya resistance ke upar buy stop orders.',
            'Sell Side Liquidity (SSL): Double bottoms ya support ke neeche sell stop orders.',
            'Stop hunt ke baad banne wali aggressive rejection candle real move ka aaghaz hoti hai.'
          ]
        },
        {
          topic: '3. Risk:Reward Mathematical Advantage (Sniper Entries)',
          timestamp: '14:11 - 24:18',
          content: 'Traditional trading mein wide stops hotay hain jo trade ko 1:1 ya 1:2 par restrict kar dete hain. SMC higher time frame structure ko lower time frame order block par refine karti hai, jisse risk ultra-tight aur reward exponential ho jata hai.',
          keyBulletPoints: [
            'Target standard minimum 1:3 se shuru hota hai aur 1:10 tak jata hai.',
            'Har trade par capital ka sirf 1% risk karein.',
            'Higher Time Frame (4H/Daily) ke sath trade karein, counter-trend scalping avoid karein.'
          ]
        }
      ],
      conclusion: 'Smart Money Concept koi get-rich-quick formula nahi hai, balki market ki asli reality (Liquidity & Order Flow) ko samajhne ka structured tareeqa hai. Agar aap banks ke foot-prints ko follow karenge toh retail losses se mehfooz rahenge.',
      quizQuestions: [
        { question: 'Retail support aur resistance levels par institutions kya dhoondte hain?', answer: 'Liquidity (Retail traders ke stop loss orders) taake apne bare volumes fill kar sakein.' },
        { question: 'SMC trading mein sniper entries lene ke liye sabse ahem rule kya hai?', answer: 'Higher time frame trend ke sath align hona aur Fair Value Gap (FVG) / Order Block par confirmation wait karna.' },
        { question: 'Imbalance ya Fair Value Gap (FVG) ka matlab kya hota hai?', answer: 'Ek aisi tezi wali candle jahan buying/selling mein equilibrium nahi rehta aur market us gap ko balance karne wapas aati hai.' }
      ],
      wordCount: 1680
    }
  },
  {
    id: 'smc-lecture-4',
    title: '04. Order Flow & Smart Money Concept - Forex Dada (Level 3)',
    category: 'Forex & Trading',
    duration: '31:45',
    sourceType: 'video',
    targetLanguage: 'roman_urdu',
    description: 'Forex Dada Level 3 SMC Course - Order Flow ka deep dive, institutional momentum, mitigation chains aur BOS/CHoCH confirmation.',
    data: {
      title: 'Order Flow & Market Structure in Smart Money Concept',
      overview: 'Is comprehensive lecture mein Order Flow ki understanding par detail se baat ki gayi hai. Order Flow ka matlab hai institutional orders ki continuous chain jo price ko ek specific direction mein drive karti hai. Jab tak institutional order flow intact hai, market pullbacks sirf mitigation ke liye aati hain aur previous highs/lows ko break karti rehti hain.',
      keyTakeaways: [
        'Order Flow Definition: Price ka structural delivery mechanism jisme har Order Block pichle block ko mitigate kar ke naya high ya low banata hai.',
        'Break of Structure (BOS): Jab price current trend ke continuous direction mein previous structural swing ko candle body ke sath close kare.',
        'Change of Character (CHoCH): Trend reversal ka pehla signal, jab internal structure opposite direction mein pehli baar break hoti hai.',
        'Mitigation Cycle: Institutions apne drawdowns ko break-even par close karne ke liye price ko wapas order block par le aate hain, jise mitigation kehte hain.',
        'Premium vs Discount Zones: Buy hamesha Discount zone (50% Fibonacci se neeche) aur Sell hamesha Premium zone (50% se upar) mein dhoondein.'
      ],
      technicalConcepts: [
        { term: 'Order Flow (OF)', explanation: 'Price delivery process jisme institutional buying ya selling volume continuous wave banata hai.' },
        { term: 'BOS (Break of Structure)', explanation: 'Trend continuation ka clear proof jab price candle body ke sath key swing point cross karti hai.' },
        { term: 'CHoCH (Change of Character)', explanation: 'Early trend change ka signal jo alert karta hai ke order flow shift ho sakta hai.' },
        { term: 'Mitigation', explanation: 'Unhedged loss orders ko close karne ke liye price ka previous supply/demand zone tak wapas aana.' },
        { term: 'Inducement (IDM)', explanation: 'Pehla minor pullback jise retail trap samjhe baghair trade karta hai aur market unka SL hit karti hai.' }
      ],
      chapters: [
        { timestamp: '00:00 - 06:20', title: 'What is True Order Flow vs Price Action', summary: 'Simple candlesticks ke bajaye institutional delivery mechanism ki logic.' },
        { timestamp: '06:21 - 15:40', title: 'BOS aur CHoCH ka Sahi Farq', summary: 'Wick break vs Body candle close: Real breakout vs Fake liquidity sweep.' },
        { timestamp: '15:41 - 23:10', title: 'Live Chart Analysis on EURUSD & XAUUSD', summary: 'Gold aur Euro charts par live order flow tracing aur mitigation chain marking.' },
        { timestamp: '23:11 - 31:45', title: 'Entry Confirmation Checklist & Execution', summary: '5-step checklist jo trade lene se pehle har trader ko check karni chahiye.' }
      ],
      actionableRules: [
        'Sirf wick break par BOS mark mat karein; confirm candle body close ka wait lazmi karein.',
        'Agar Order Flow bullish hai toh counter-trend sell trades mat lein jab tak Higher Time Frame par clear CHoCH na ban jaye.',
        'Inducement (IDM) sweep hone se pehle entry na karein, warna aapka order khud liquidity ban jayega.'
      ],
      fullTranscript: [
        {
          timestamp: '00:00 - 04:30',
          speaker: 'Forex Dada (Instructor)',
          text: 'Assalam-o-Alaikum traders, Lecture 4 mein khushamdeed! Aaj ka topic sabse zyada practical aur powerful hai: Order Flow in Smart Money Concept. Agar aapne Order Flow ko samajh liya toh aapko kisi moving average ya RSI ki zaroorat nahi rahegi.'
        },
        {
          timestamp: '04:31 - 10:15',
          speaker: 'Forex Dada (Instructor)',
          text: 'Order Flow ka simple lafzon mein matlab hai institutional buy aur sell orders ki stream. Jab institutions kisi pair ko buy karte hain, toh wo series of order blocks create karte hain. Har naya pullback pichle order block ko mitigate (retest) karta hai aur naya high banata hai. Is continuous sequence ko hum Bullish Order Flow kehte hain.'
        },
        {
          timestamp: '10:16 - 17:45',
          speaker: 'Forex Dada (Instructor)',
          text: 'Ab aate hain BOS yani Break of Structure aur CHoCH yani Change of Character par. Yaad rakhein: agar price ne pichle high ko sirf wick se sweep kiya hai, toh ye BOS nahi hai! Ye sirf liquidity hunt hai. True BOS tab confirm hota hai jab candle ki body swing level ke upar close kare. CHoCH tab banta hai jab pehli baar opposite structural low break ho.'
        },
        {
          timestamp: '17:46 - 24:30',
          speaker: 'Forex Dada (Instructor)',
          text: 'Charts par sabse bara trap hota hai Inducement (IDM). Inducement wo pehla pullback hota hai jahan retail samjhta hai ke order block ban gaya aur buy kar leta hai, jabke institutions price ko uske neeche real Order Block tak le aate hain aur unka stop loss uda dete hain. Isliye Inducement sweep hone se pehle entry mat lein.'
        },
        {
          timestamp: '24:31 - 31:45',
          speaker: 'Forex Dada (Instructor)',
          text: 'Final trade entry checklist: Pehla step Higher Time Frame 4H Order Flow check karein. Doosra step Inducement sweep ka intezar karein. Teesri cheez 15M ya 5M par CHoCH dekhein. Aur chotha step Fair Value Gap (FVG) par sniper entry lein. In 4 rules ko follow karenge toh aapka strike rate 80% plus ho jayega.'
        }
      ],
      rawTranscriptText: 'Assalam-o-Alaikum traders, Lecture 4 mein khushamdeed! Aaj ka topic sabse zyada practical aur powerful hai: Order Flow in Smart Money Concept. Agar aapne Order Flow ko samajh liya toh aapko kisi moving average ya RSI ki zaroorat nahi rahegi. Order Flow ka simple lafzon mein matlab hai institutional buy aur sell orders ki stream. Jab institutions kisi pair ko buy karte hain, toh wo series of order blocks create karte hain. Har naya pullback pichle order block ko mitigate (retest) karta hai aur naya high banata hai. Is continuous sequence ko hum Bullish Order Flow kehte hain. Ab aate hain BOS yani Break of Structure aur CHoCH yani Change of Character par. Yaad rakhein: agar price ne pichle high ko sirf wick se sweep kiya hai, toh ye BOS nahi hai! Ye sirf liquidity hunt hai. True BOS tab confirm hota hai jab candle ki body swing level ke upar close kare. CHoCH tab banta hai jab pehli baar opposite structural low break ho. Charts par sabse bara trap hota hai Inducement (IDM). Inducement wo pehla pullback hota hai jahan retail samjhta hai ke order block ban gaya aur buy kar leta hai, jabke institutions price ko uske neeche real Order Block tak le aate hain aur unka stop loss uda dete hain. Isliye Inducement sweep hone se pehle entry mat lein. Final trade entry checklist: Pehla step Higher Time Frame 4H Order Flow check karein. Doosra step Inducement sweep ka intezar karein. Teesri cheez 15M ya 5M par CHoCH dekhein. Aur chotha step Fair Value Gap (FVG) par sniper entry lein. In 4 rules ko follow karenge toh aapka strike rate 80% plus ho jayega.',
      studyNotes: [
        {
          topic: '1. True Order Flow vs Traditional Price Action',
          timestamp: '00:00 - 10:15',
          content: 'Order Flow institutional orders ki delivery chain hai. Trendlines aur support resistance market nahi chalate, balki unmitigated order blocks ki retesting market ko aagay drive karti hai.',
          keyBulletPoints: [
            'Bullish OF: Har previous supply zone demand mein convert hoti hai.',
            'Mitigation: Jab institutions apne drawdown positions ko break-even par close karte hain.',
            'Discount Zone (50% Fib se neeche) buy ke liye ideal hai.'
          ]
        },
        {
          topic: '2. Break of Structure (BOS) vs Change of Character (CHoCH)',
          timestamp: '10:16 - 17:45',
          content: 'Wick break aur candle body close ke darmiyan farq trading career bacha sakta hai. Wick break sirf retail liquidity sweep hai jabke body close real institutional continuation hai.',
          keyBulletPoints: [
            'Wick Sweep = Liquidity Grab (Reversal expected)',
            'Body Close = Valid BOS (Continuation expected)',
            'CHoCH = First warning sign of internal market structure shift'
          ]
        },
        {
          topic: '3. Inducement (IDM) & Entry Confirmation Checklist',
          timestamp: '17:46 - 31:45',
          content: 'Inducement retail buyers ko attract karne ke liye banaya gaya trap hota hai. Real valid entry tab banti hai jab inducement sweep ho jaye aur price extreme FVG / Order Block par tap kare.',
          keyBulletPoints: [
            'Rule 1: HTF 4H Order Flow alignment',
            'Rule 2: Inducement (IDM) sweep confirmation',
            'Rule 3: 5M/15M lower time frame CHoCH with displacement',
            'Rule 4: Stop loss strictly behind the invalidation order block'
          ]
        }
      ],
      conclusion: 'Order Flow trading chart par indicators ki mohtaji khatam kar deti hai. Jab aap Order Flow aur Market Structure ko combine karte hain toh trading random guessing ke bajaye ek logical probability ban jati hai.',
      quizQuestions: [
        { question: 'BOS aur Wick Sweep mein kya farq hai?', answer: 'BOS mein candle body swing point se bahar close hoti hai jabke sweep mein sirf wick liquidity lekar wapas aa jati hai.' },
        { question: 'CHoCH kab form hota hai?', answer: 'Jab market apne last structural opposite low (bullish mein) ya high (bearish mein) ko break kar ke trend change ka signal de.' },
        { question: 'Inducement (IDM) ka kya role hota hai?', answer: 'Ye retail traders ko premature entry dilane ke liye banaya gaya trap hota hai jise sweep karne ke baad real institutional move shuru hoti hai.' }
      ],
      wordCount: 1940
    }
  },
  {
    id: 'ai-foundations-2026',
    title: 'Generative AI & LLM Architecture Explained Simply - Tech Explainer',
    category: 'Technology & AI',
    duration: '18:50',
    sourceType: 'audio',
    targetLanguage: 'roman_urdu',
    description: 'LLMs, Neural Networks, Transformers, Tokens, aur Context Windows ki asaan Roman Urdu wazahat.',
    data: {
      title: 'Demystifying Large Language Models (LLMs) & Transformers',
      overview: 'Is session mein Generative AI aur Modern LLMs (jaise Gemini) ke working architecture ko baghair mushkil maths ke bohot aam-fehm Roman Urdu mein samjhaya gaya hai. Transformers kaise parallel attention use karte hain, tokens kaise predict hotay hain aur context window ka memory se kya talluq hai.',
      keyTakeaways: [
        'Tokenization: Computer words ko direct nahi samajhta balki unhe numbers (tokens) mein convert karta hai.',
        'Self-Attention Mechanism: Sentence ke har word ka doosray tamam words ke sath relation aur importance measure ki jati hai.',
        'Next Token Prediction: AI dar-asal aglay sabse logical word ki statistical probability calculate karta hai.',
        'Context Window: Model ek waqt mein kitni lambi kitab ya video ka data yaad rakh sakta hai (Gemini ka context millions of tokens tak pohnch chuka hai).'
      ],
      technicalConcepts: [
        { term: 'Transformer', explanation: 'AI architecture jo sequential RNNs ke bajaye parallel data process karta hai.' },
        { term: 'Attention Heads', explanation: 'Wo neural filters jo context aur grammar ke alag alag pehluon par nazar rakhte hain.' },
        { term: 'Multimodal AI', explanation: 'Sirf text nahi balki image, video, aur audio ko aik sath process karne ki salahiyat.' }
      ],
      chapters: [
        { timestamp: '00:00 - 05:00', title: 'Why Old AI Failed & Transformer Revolution', summary: 'RNNs vs Transformers ka comparison.' },
        { timestamp: '05:01 - 12:00', title: 'How Next Token Prediction Actually Works', summary: 'Probabilities aur temperature parameter ka asar.' },
        { timestamp: '12:01 - 18:50', title: 'Future of Multimodal Video & Audio Reasoning', summary: 'Direct video inputs aur real-time voice translation.' }
      ],
      actionableRules: [
        'Prompting mein context aur clear instructions dein taake hallucinations kam se kam hon.',
        'System instructions use karein taake output format (JSON, Bullet points) strictly maintain rahe.'
      ],
      conclusion: 'Generative AI koi magic nahi balki advanced pattern recognition aur high-dimensional vector math hai jo insani zuban aur media ko decode karti hai.',
      quizQuestions: [
        { question: 'Transformer model ka sabse bara breakthrough kya tha?', answer: 'Self-Attention mechanism jo context ko simultaneously process karta hai.' },
        { question: 'LLM mein temperature setting ka kya asar hota hai?', answer: 'Low temperature answers ko focused aur factual banata hai, jabke high temperature creativity aur randomness barhata hai.' }
      ]
    }
  }
];

// 1. Get presets
app.get('/api/presets', (req, res) => {
  res.json({
    success: true,
    presets: PRESETS.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      duration: p.duration,
      sourceType: p.sourceType,
      targetLanguage: p.targetLanguage,
      description: p.description
    }))
  });
});

// 2. Load preset details
app.get('/api/presets/:id', (req, res) => {
  const preset = PRESETS.find(p => p.id === req.params.id);
  if (!preset) {
    return res.status(404).json({ success: false, error: 'Preset not found' });
  }
  res.json({ success: true, data: preset.data, meta: preset });
});

// 3. Summarize endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const {
      type, // 'youtube' | 'file' | 'transcript' | 'preset'
      youtubeUrl,
      fileData, // base64 string
      mimeType,
      fileName,
      transcript,
      targetLanguage = 'roman_urdu', // 'roman_urdu' | 'urdu' | 'english'
      summaryStyle = 'comprehensive',
      customInstructions = ''
    } = req.body;

    // Language guidelines in system prompt
    let languageInstruction = '';
    if (targetLanguage === 'roman_urdu') {
      languageInstruction = `
Target Language: ROMAN URDU (Urdu written in English alphabets, like 'Yeh video trading aur market structure ke baare mein hai. Isme ahem points yeh hain...').
Ensure the tone is natural, conversational, authentic Pakistani/Hindustani Roman Urdu, easy to read, with correct terminology. Do not switch to pure English except for standard technical jargon (e.g. 'Order Block', 'Liquidity', 'Break of Structure').
`;
    } else if (targetLanguage === 'urdu') {
      languageInstruction = `
Target Language: URDU (اردو رسم الخط - Nastaliq/Arabic script).
Ensure fluent, professional, educational Urdu prose with clean terminology.
`;
    } else {
      languageInstruction = `
Target Language: ENGLISH.
Ensure articulate, polished, structured professional English with executive clarity.
`;
    }

    const systemPrompt = `
You are an elite multimedia summarization and speech transcription intelligence, specialized in analyzing videos, lectures, podcasts, webinars, and audio files.
You excel at educational content, technical trading lectures (Smart Money Concept / SMC, Forex, Crypto, Stocks), technology, business, and academic material.

CRITICAL REQUIREMENT:
The user explicitly requires:
1. FULL VOICE-OVER TRANSCRIPTION: Convert all spoken voice-over dialogue from the video/audio into text WITHOUT MISSING any parts. Provide detailed timestamped intervals and a complete continuous transcript.
2. IN-DEPTH VIDEO-TO-TEXT STUDY NOTES: Generate rich, thorough, high-utility study notes explaining every step, formula, rule, and concept mentioned so the student can study without needing to watch the video again.

${languageInstruction}

Your task is to thoroughly analyze the provided media or content and return a structured JSON object according to this exact schema:
{
  "title": "Concise, descriptive title for the media/lecture",
  "overview": "A rich 3-5 sentence overview capturing the core objective, context, and overarching narrative.",
  "keyTakeaways": ["Bullet point 1 with explanation", "Bullet point 2 with explanation", "Bullet point 3 with explanation", "Bullet point 4 with explanation", "Bullet point 5 with explanation"],
  "fullTranscript": [
    {
      "timestamp": "e.g. 00:00 - 01:30",
      "speaker": "Speaker / Narrator",
      "text": "Complete spoken voice-over dialogue for this interval without missing any details or explanation."
    }
  ],
  "rawTranscriptText": "The complete, continuous paragraph-by-paragraph spoken text transcript of the entire media.",
  "studyNotes": [
    {
      "topic": "Detailed Section / Topic Title",
      "timestamp": "e.g. 00:00 - 06:15",
      "content": "Comprehensive, deep study notes explaining everything taught in this section.",
      "keyBulletPoints": ["Specific rule or detail", "Formula / parameter", "Important warning or tip"]
    }
  ],
  "technicalConcepts": [
    { "term": "Concept or Technical Term", "explanation": "Clear breakdown of what it means and why it matters" }
  ],
  "chapters": [
    { "timestamp": "Estimated timestamp or section marker (e.g. 00:00 - 05:00)", "title": "Chapter Heading", "summary": "Key discussion in this chapter" }
  ],
  "actionableRules": ["Rule 1 for practical execution or application", "Rule 2", "Rule 3"],
  "conclusion": "Final wrap-up takeaway and key lesson.",
  "quizQuestions": [
    { "question": "Check understanding question 1", "answer": "Clear, concise correct answer based on the video" },
    { "question": "Check understanding question 2", "answer": "Clear, concise correct answer" }
  ],
  "wordCount": 1500
}

Return ONLY valid JSON matching this schema. No markdown code fences, no extra text outside the JSON.
`;

    const parts: any[] = [];

    if (type === 'file' && fileData && mimeType) {
      // Strip any data:*;base64, prefix if present
      const cleanBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
      parts.push({
        text: `Analyze this uploaded media file (${fileName || 'uploaded media'}) and generate a comprehensive summary. ${customInstructions || ''}`,
      });
    } else if (type === 'youtube' && youtubeUrl) {
      parts.push({
        text: `
Please analyze this YouTube Video URL: ${youtubeUrl}
Video URL: ${youtubeUrl}
${fileName ? `Video Title/Context: ${fileName}` : ''}
${transcript ? `Provided Transcript / Notes: ${transcript}` : ''}

Provide a deep, accurate summary of this video's subject, especially identifying if it is an educational, trading (such as Forex Dada SMC, Market Structure, Order Flow, Crypto, Stocks), technical, or informational video.
${customInstructions || ''}
`,
      });
    } else if (type === 'transcript' && transcript) {
      parts.push({
        text: `
Please analyze the following transcript / spoken notes (${fileName || 'Custom Spoken Content'}):

"""
${transcript}
"""

${customInstructions || ''}
`,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: Please provide a YouTube URL, an uploaded audio/video file, or transcript text.',
      });
    }

    console.log(`Processing summarization with model gemini-3.8-flash for type: ${type}`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      // Clean possible markdown code fences if model enclosed it
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      data: parsedData,
      meta: {
        type,
        targetLanguage,
        summaryStyle,
        fileName: fileName || (type === 'youtube' ? youtubeUrl : 'Analyzed Media'),
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error generating summary with Gemini:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Gemini processing failed. Please verify your file or link and try again.',
    });
  }
});

// 4. Interactive Q&A / Chat with the media
app.post('/api/chat', async (req, res) => {
  try {
    const {
      question,
      summaryContext,
      targetLanguage = 'roman_urdu',
      history = []
    } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    let languageRule = 'Respond in natural, fluent Roman Urdu (Urdu in English alphabet). Keep it direct and helpful.';
    if (targetLanguage === 'urdu') {
      languageRule = 'Respond in clear Urdu script (اردو).';
    } else if (targetLanguage === 'english') {
      languageRule = 'Respond in clear, professional English.';
    }

    const systemInstruction = `
You are an expert tutor and interactive study assistant answering questions about a video/audio lecture that was summarized.
Here is the summary context of the video:
${JSON.stringify(summaryContext, null, 2)}

${languageRule}
Provide actionable, accurate answers directly addressing the user's question about the concepts in this media.
If the question is about Smart Money Concept (SMC), Order Flow, Trading, or the lecture specifics, explain the exact mechanisms, rules, and chart criteria.
`;

    const chatContents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        chatContents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.text }]
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
      }
    });

    res.json({
      success: true,
      answer: response.text || 'Koi jawab generate nahi ho saka.'
    });

  } catch (error: any) {
    console.error('Error in Q&A chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Chat query failed',
    });
  }
});

// 5. Text-To-Speech (TTS) endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Zephyr' } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required for TTS' });
    }

    // Limit text size for audio synthesis
    const trimmedText = text.slice(0, 1500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Clear, articulate, natural cadence educational narration',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ success: false, error: 'Audio data not received from model' });
    }

    res.json({
      success: true,
      audioData: `data:audio/wav;base64,${base64Audio}`,
    });

  } catch (error: any) {
    console.error('Error generating speech with Gemini TTS:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Speech generation failed',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
    model: 'gemini-3.8-flash',
    time: new Date().toISOString()
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SummarizeAI Server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
