const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    nav: { features: "Features", howItWorks: "How It Works", stats: "Stats", signIn: "Sign In", tryOnline: "Try online free", goToDashboard: "Go to Dashboard" },
    hero: { badge: "Advanced AI Crop Analysis", title1: "Your Personal AI", title2: "Crop Doctor", subtitle: "Instantly identify plant diseases, get personalized treatment plans, and maximize your yield using cutting-edge artificial intelligence.", cta: "Diagnose Crop Now", secondary: "Watch Demo" },
    sidebar: { dashboard: "Dashboard", analyze: "Analyze", history: "History", weather: "Weather", signOut: "Sign out" },
    dashboard: { title: "Farm Dashboard", subtitle: "Here is the current status of your primary crop.", healthScore: "Health Score" },
    analyze: {
      title: "AI Disease Scanner", subtitle: "Upload a clear photo of the affected plant leaf for instant analysis.", dragDrop: "Drag & Drop Image Here", supports: "Supports JPG, PNG up to 10MB. Ensure the leaf is clearly visible.", browse: "Browse Files", camera: "Use Camera", trust1: "ICAR Verified Data", trust2: "Instant Results", trust3: "95%+ Accuracy", qualityTitle: "Image Quality Check", qualityDesc: "Perfect lighting and focus.", excellent: "Excellent", analyzeBtn: "Analyze Crop Health", alertValidation: "AI Image Validation Failed:", alertFail: "Failed to analyze image. Please try again.",
      steps: { scanning: "Scanning leaf structure...", identifying: "Identifying crop species...", analyzing: "Analyzing for fungal and bacterial patterns...", crossReferencing: "Cross-referencing ICAR disease database...", generating: "Generating treatment protocol..." }
    },
    weather: { title: "Weather Forecast", subtitle: "7-day hyper-local weather forecast.", temp: "Temperature", humidity: "Humidity", wind: "Wind", rain: "Rain Chance" },
    history: { title: "Crop History", subtitle: "View past diagnoses and treatments.", date: "Date", crop: "Crop", disease: "Disease", status: "Status" }
  },
  hi: {
    nav: { features: "विशेषताएं", howItWorks: "यह कैसे काम करता है", stats: "आंकड़े", signIn: "लॉग इन करें", tryOnline: "ऑनलाइन मुफ़्त आज़माएं", goToDashboard: "डैशबोर्ड पर जाएं" },
    hero: { badge: "उन्नत एआई फसल विश्लेषण", title1: "आपका व्यक्तिगत एआई", title2: "फसल डॉक्टर", subtitle: "तुरंत पौधों की बीमारियों की पहचान करें, व्यक्तिगत उपचार योजनाएं प्राप्त करें, और अपनी उपज को अधिकतम करें।", cta: "अभी निदान करें", secondary: "डेमो देखें" },
    sidebar: { dashboard: "डैशबोर्ड", analyze: "विश्लेषण", history: "इतिहास", weather: "मौसम", signOut: "लॉग आउट" },
    dashboard: { title: "फार्म डैशबोर्ड", subtitle: "यहाँ आपकी प्राथमिक फसल की वर्तमान स्थिति है।", healthScore: "स्वास्थ्य स्कोर" },
    analyze: {
      title: "एआई रोग स्कैनर", subtitle: "त्वरित विश्लेषण के लिए प्रभावित पौधे की पत्ती की स्पष्ट फोटो अपलोड करें।", dragDrop: "यहां छवि खींचें और छोड़ें", supports: "JPG, PNG का समर्थन करता है (10MB तक)।", browse: "फ़ाइलें ब्राउज़ करें", camera: "कैमरा उपयोग करें", trust1: "ICAR सत्यापित डेटा", trust2: "त्वरित परिणाम", trust3: "95%+ सटीकता", qualityTitle: "छवि गुणवत्ता जांच", qualityDesc: "सही प्रकाश और फोकस।", excellent: "उत्कृष्ट", analyzeBtn: "फसल स्वास्थ्य का विश्लेषण करें", alertValidation: "एआई छवि सत्यापन विफल:", alertFail: "छवि का विश्लेषण करने में विफल।",
      steps: { scanning: "पत्ती संरचना स्कैनिंग...", identifying: "फसल प्रजातियों की पहचान...", analyzing: "कवक और जीवाणु पैटर्न का विश्लेषण...", crossReferencing: "ICAR डेटाबेस से मिलान...", generating: "उपचार प्रोटोकॉल जनरेट हो रहा है..." }
    },
    weather: { title: "मौसम पूर्वानुमान", subtitle: "7-दिवसीय स्थानीय मौसम पूर्वानुमान।", temp: "तापमान", humidity: "नमी", wind: "हवा", rain: "बारिश की संभावना" },
    history: { title: "फसल इतिहास", subtitle: "पिछले निदान और उपचार देखें।", date: "तारीख", crop: "फसल", disease: "बीमारी", status: "स्थिति" }
  },
  mr: {
    nav: { features: "वैशिष्ट्ये", howItWorks: "हे कसे कार्य करते", stats: "आकडेवारी", signIn: "साइन इन करा", tryOnline: "विनामूल्य ऑनलाइन वापरून पहा", goToDashboard: "डॅशबोर्डवर जा" },
    hero: { badge: "प्रगत AI पीक विश्लेषण", title1: "तुमचा वैयक्तिक AI", title2: "पीक डॉक्टर", subtitle: "वनस्पतींच्या आजारांची त्वरित ओळख करा, उपचार योजना मिळवा.", cta: "आता निदान करा", secondary: "डेमो पहा" },
    sidebar: { dashboard: "डॅशबोर्ड", analyze: "विश्लेषण", history: "इतिहास", weather: "हवामान", signOut: "साइन आउट" },
    dashboard: { title: "फार्म डॅशबोर्ड", subtitle: "येथे आपल्या प्राथमिक पिकाची सद्य स्थिती आहे.", healthScore: "आरोग्य स्कोअर" },
    analyze: { title: "एआय रोग स्कॅनर", subtitle: "त्वरित विश्लेषणासाठी प्रभावित पानाचा स्पष्ट फोटो अपलोड करा.", dragDrop: "येथे प्रतिमा ड्रॅग आणि ड्रॉप करा", supports: "10MB पर्यंत JPG, PNG.", browse: "फायली ब्राउझ करा", camera: "कॅमेरा वापरा", trust1: "ICAR सत्यापित", trust2: "त्वरित निकाल", trust3: "95%+ अचूकता", qualityTitle: "प्रतिमा गुणवत्ता", qualityDesc: "उत्तम प्रकाश आणि फोकस.", excellent: "उत्कृष्ट", analyzeBtn: "पीक आरोग्याचे विश्लेषण करा", alertValidation: "AI पडताळणी अयशस्वी:", alertFail: "विश्लेषण अयशस्वी. पुन्हा प्रयत्न करा.", steps: { scanning: "पाने स्कॅन करत आहे...", identifying: "पिके ओळखत आहे...", analyzing: "बुरशीजन्य आणि बॅक्टेरियाचे विश्लेषण...", crossReferencing: "डेटाबेसशी जुळवत आहे...", generating: "उपचार तयार करत आहे..." } },
    weather: { title: "हवामानाचा अंदाज", subtitle: "7-दिवसांचा स्थानिक हवामान अंदाज.", temp: "तापमान", humidity: "आर्द्रता", wind: "वारा", rain: "पावसाची शक्यता" },
    history: { title: "पीक इतिहास", subtitle: "मागील निदान आणि उपचार पहा.", date: "तारीख", crop: "पीक", disease: "रोग", status: "स्थिती" }
  },
  bn: {
    nav: { features: "বৈশিষ্ট্য", howItWorks: "কীভাবে কাজ করে", stats: "পরিসংখ্যান", signIn: "লগ ইন", tryOnline: "বিনা মূল্যে চেষ্টা করুন", goToDashboard: "ড্যাশবোর্ডে যান" },
    hero: { badge: "উন্নত এআই ফসল বিশ্লেষণ", title1: "আপনার ব্যক্তিগত এআই", title2: "ফসল ডাক্তার", subtitle: "উদ্ভিদের রোগ দ্রুত শনাক্ত করুন, চিকিৎসা পান।", cta: "রোগ নির্ণয় করুন", secondary: "ডেমো দেখুন" },
    sidebar: { dashboard: "ড্যাশবোর্ড", analyze: "বিশ্লেষণ", history: "ইতিহাস", weather: "আবহাওয়া", signOut: "সাইন আউট" },
    dashboard: { title: "খামার ড্যাশবোর্ড", subtitle: "এখানে আপনার প্রধান ফসলের বর্তমান অবস্থা রয়েছে।", healthScore: "স্বাস্থ্য স্কোর" },
    analyze: { title: "এআই ডিজিজ স্ক্যানার", subtitle: "তাত্ক্ষণিক বিশ্লেষণের জন্য পাতার ছবি আপলোড করুন।", dragDrop: "এখানে ছবি টেনে আনুন", supports: "১০এমবি পর্যন্ত জিপিজি, পিএনজি।", browse: "ফাইল ব্রাউজ করুন", camera: "ক্যামেরা ব্যবহার করুন", trust1: "ICAR যাচাইকৃত", trust2: "তাত্ক্ষণিক ফলাফল", trust3: "৯৫%+ সঠিকতা", qualityTitle: "ছবির গুণমান", qualityDesc: "সঠিক আলো এবং ফোকাস।", excellent: "চমৎকার", analyzeBtn: "ফসল স্বাস্থ্য বিশ্লেষণ করুন", alertValidation: "এআই যাচাইকরণ ব্যর্থ:", alertFail: "বিশ্লেষণ ব্যর্থ। আবার চেষ্টা করুন।", steps: { scanning: "পাতা স্ক্যান হচ্ছে...", identifying: "ফসল শনাক্ত করা হচ্ছে...", analyzing: "ছত্রাক এবং ব্যাকটেরিয়ার বিশ্লেষণ...", crossReferencing: "ডেটাবেস মেলানো হচ্ছে...", generating: "চিকিৎসা তৈরি হচ্ছে..." } },
    weather: { title: "আবহাওয়ার পূর্বাভাস", subtitle: "৭ দিনের স্থানীয় আবহাওয়ার পূর্বাভাস।", temp: "তাপমাত্রা", humidity: "আর্দ্রতা", wind: "বায়ু", rain: "বৃষ্টির সম্ভাবনা" },
    history: { title: "ফসলের ইতিহাস", subtitle: "অতীতের রোগ নির্ণয় এবং চিকিৎসা দেখুন।", date: "তারিখ", crop: "ফসল", disease: "রোগ", status: "অবস্থা" }
  },
  ta: {
    nav: { features: "அம்சங்கள்", howItWorks: "எப்படி செயல்படுகிறது", stats: "புள்ளிவிவரங்கள்", signIn: "உள்நுழைக", tryOnline: "இலவசமாக முயற்சிக்க", goToDashboard: "முகப்பிற்கு செல்" },
    hero: { badge: "மேம்பட்ட AI பயிர் பகுப்பாய்வு", title1: "உங்கள் தனிப்பட்ட AI", title2: "பயிர் மருத்துவர்", subtitle: "தாவர நோய்களை கண்டறியுங்கள், சிகிச்சை பெறுங்கள்.", cta: "கண்டறியவும்", secondary: "வீடியோ பார்க்க" },
    sidebar: { dashboard: "முகப்பு", analyze: "பகுப்பாய்வு", history: "வரலாறு", weather: "வானிலை", signOut: "வெளியேறு" },
    dashboard: { title: "பண்ணை முகப்பு", subtitle: "உங்கள் பயிரின் தற்போதைய நிலை.", healthScore: "சுகாதார மதிப்பெண்" },
    analyze: { title: "AI நோய் ஸ்கேனர்", subtitle: "பாதிக்கப்பட்ட இலையின் புகைப்படத்தை பதிவேற்றவும்.", dragDrop: "படத்தை இங்கே இழுத்து விடவும்", supports: "10MB வரை JPG, PNG.", browse: "கோப்புகளைத் தேடு", camera: "கேமராவை பயன்படுத்து", trust1: "ICAR சரிபார்க்கப்பட்டது", trust2: "உடனடி முடிவுகள்", trust3: "95%+ துல்லியம்", qualityTitle: "படத்தின் தரம்", qualityDesc: "சரியான வெளிச்சம்.", excellent: "சிறப்பு", analyzeBtn: "ஆரோக்கியத்தை பகுப்பாய்வு செய்", alertValidation: "AI சரிபார்ப்பு தோல்வி:", alertFail: "தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.", steps: { scanning: "இலை ஸ்கேன்...", identifying: "பயிர் அடையாளம்...", analyzing: "பகுப்பாய்வு...", crossReferencing: "தரவுத்தளம்...", generating: "சிகிச்சை..." } },
    weather: { title: "வானிலை அறிக்கை", subtitle: "7 நாள் அறிக்கை.", temp: "வெப்பநிலை", humidity: "ஈரப்பதம்", wind: "காற்று", rain: "மழை வாய்ப்பு" },
    history: { title: "வரலாறு", subtitle: "பழைய தரவுகளைக் காண்க.", date: "தேதி", crop: "பயிர்", disease: "நோய்", status: "நிலை" }
  },
  te: {
    nav: { features: "లక్షణాలు", howItWorks: "ఎలా పనిచేస్తుంది", stats: "గణాంకాలు", signIn: "సైన్ ఇన్", tryOnline: "ఆన్‌లైన్‌లో ఉచితంగా ప్రయత్నించండి", goToDashboard: "డాష్‌బోర్డ్" },
    hero: { badge: "అధునాతన AI పంట విశ్లేషణ", title1: "మీ వ్యక్తిగత AI", title2: "పంట డాక్టర్", subtitle: "వ్యాధులను కనుక్కోండి, చికిత్స పొందండి.", cta: "ఇప్పుడే నిర్ధారించండి", secondary: "డెమో చూడండి" },
    sidebar: { dashboard: "డాష్‌బోర్డ్", analyze: "విశ్లేషించండి", history: "చరిత్ర", weather: "వాతావరణం", signOut: "సైన్ అవుట్" },
    dashboard: { title: "ఫామ్ డాష్‌బోర్డ్", subtitle: "మీ పంట ప్రస్తుత స్థితి ఇక్కడ ఉంది.", healthScore: "ఆరోగ్య స్కోర్" },
    analyze: { title: "AI వ్యాధి స్కానర్", subtitle: "ప్రభావిత ఆకు ఫోటోను అప్‌లోడ్ చేయండి.", dragDrop: "చిత్రాన్ని ఇక్కడ వదలండి", supports: "10MB వరకు JPG, PNG.", browse: "ఫైళ్లను బ్రౌజ్ చేయండి", camera: "కెమెరాను ఉపయోగించండి", trust1: "ICAR ధృవీకరించబడింది", trust2: "తక్షణ ఫలితాలు", trust3: "95%+ ఖచ్చితత్వం", qualityTitle: "చిత్ర నాణ్యత", qualityDesc: "ఖచ్చితమైన లైటింగ్.", excellent: "అద్భుతమైన", analyzeBtn: "పంట ఆరోగ్యాన్ని విశ్లేషించండి", alertValidation: "AI ధృవీకరణ విఫలమైంది:", alertFail: "విఫలమైంది. మళ్లీ ప్రయత్నించండి.", steps: { scanning: "స్కాన్ చేస్తోంది...", identifying: "గుర్తిస్తోంది...", analyzing: "విశ్లేషిస్తోంది...", crossReferencing: "సరిపోల్చుతోంది...", generating: "చికిత్స..." } },
    weather: { title: "వాతావరణ సూచన", subtitle: "7 రోజుల అంచనా.", temp: "ఉష్ణోగ్రత", humidity: "తేమ", wind: "గాలి", rain: "వర్షం అవకాశం" },
    history: { title: "పంట చరిత్ర", subtitle: "గత రికార్డులను చూడండి.", date: "తేదీ", crop: "పంట", disease: "వ్యాధి", status: "స్థితి" }
  },
  gu: {
    nav: { features: "લક્ષણો", howItWorks: "તે કેવી રીતે કામ કરે છે", stats: "આંકડા", signIn: "સાઇન ઇન", tryOnline: "ઓનલાઇન મફત અજમાવો", goToDashboard: "ડેશબોર્ડ પર જાઓ" },
    hero: { badge: "એડવાન્સ્ડ AI પાક વિશ્લેષણ", title1: "તમારો વ્યક્તિગત AI", title2: "પાક ડોક્ટર", subtitle: "રોગો ઓળખો, સારવાર મેળવો.", cta: "હવે નિદાન કરો", secondary: "ડેમો જુઓ" },
    sidebar: { dashboard: "ડેશબોર્ડ", analyze: "વિશ્લેષણ", history: "ઇતિહાસ", weather: "હવામાન", signOut: "સાઇન આઉટ" },
    dashboard: { title: "ફાર્મ ડેશબોર્ડ", subtitle: "તમારા પાકની વર્તમાન સ્થિતિ.", healthScore: "આરોગ્ય સ્કોર" },
    analyze: { title: "AI રોગ સ્કેનર", subtitle: "અસરગ્રસ્ત પાનનો ફોટો અપલોડ કરો.", dragDrop: "છબી અહીં ખેંચો", supports: "10MB સુધી JPG, PNG.", browse: "ફાઇલો બ્રાઉઝ કરો", camera: "કેમેરાનો ઉપયોગ કરો", trust1: "ICAR ચકાસાયેલ", trust2: "ત્વરિત પરિણામો", trust3: "95%+ ચોકસાઈ", qualityTitle: "છબી ગુણવત્તા", qualityDesc: "યોગ્ય લાઇટિંગ.", excellent: "ઉત્તમ", analyzeBtn: "પાકના આરોગ્યનું વિશ્લેષણ કરો", alertValidation: "AI ચકાસણી નિષ્ફળ:", alertFail: "નિષ્ફળ. ફરી પ્રયાસ કરો.", steps: { scanning: "સ્કેનિંગ...", identifying: "ઓળખ...", analyzing: "વિશ્લેષણ...", crossReferencing: "મેળ ખાતું...", generating: "સારવાર..." } },
    weather: { title: "હવામાન આગાહી", subtitle: "7 દિવસની આગાહી.", temp: "તાપમાન", humidity: "ભેજ", wind: "પવન", rain: "વરસાદની સંભાવના" },
    history: { title: "ઇતિહાસ", subtitle: "ભૂતકાળના રેકોર્ડ્સ જુઓ.", date: "તારીખ", crop: "પાક", disease: "રોગ", status: "સ્થિતિ" }
  },
  kn: {
    nav: { features: "ವೈಶಿಷ್ಟ್ಯಗಳು", howItWorks: "ಇದು ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ", stats: "ಅಂಕಿಅಂಶಗಳು", signIn: "ಸೈನ್ ಇನ್", tryOnline: "ಆನ್‌ಲೈನ್ ಉಚಿತವಾಗಿ ಪ್ರಯತ್ನಿಸಿ", goToDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
    hero: { badge: "ಸುಧಾರಿತ AI ಬೆಳೆ ವಿಶ್ಲೇಷಣೆ", title1: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ AI", title2: "ಬೆಳೆ ವೈದ್ಯ", subtitle: "ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ, ಚಿಕಿತ್ಸೆ ಪಡೆಯಿರಿ.", cta: "ಈಗ ರೋಗನಿರ್ಣಯ ಮಾಡಿ", secondary: "ಡೆಮೊ ವೀಕ್ಷಿಸಿ" },
    sidebar: { dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", analyze: "ವಿಶ್ಲೇಷಿಸಿ", history: "ಇತಿಹಾಸ", weather: "ಹವಾಮಾನ", signOut: "ಸೈನ್ ಔಟ್" },
    dashboard: { title: "ಫಾರ್ಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", subtitle: "ನಿಮ್ಮ ಬೆಳೆಯ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ.", healthScore: "ಆರೋಗ್ಯ ಸ್ಕೋರ್" },
    analyze: { title: "AI ರೋಗ ಸ್ಕ್ಯಾನರ್", subtitle: "ಬಾಧಿತ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.", dragDrop: "ಚಿತ್ರವನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆಯಿರಿ", supports: "10MB ವರೆಗೆ JPG, PNG.", browse: "ಫೈಲ್‌ಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ", camera: "ಕ್ಯಾಮೆರಾ ಬಳಸಿ", trust1: "ICAR ಪರಿಶೀಲಿಸಲಾಗಿದೆ", trust2: "ತ್ವರಿತ ಫಲಿತಾಂಶಗಳು", trust3: "95%+ ನಿಖರತೆ", qualityTitle: "ಚಿತ್ರದ ಗುಣಮಟ್ಟ", qualityDesc: "ಸರಿಯಾದ ಬೆಳಕು.", excellent: "ಅತ್ಯುತ್ತಮ", analyzeBtn: "ಬೆಳೆ ಆರೋಗ್ಯವನ್ನು ವಿಶ್ಲೇಷಿಸಿ", alertValidation: "AI ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ:", alertFail: "ವಿಫಲವಾಗಿದೆ. ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.", steps: { scanning: "ಸ್ಕ್ಯಾನಿಂಗ್...", identifying: "ಗುರುತಿಸಲಾಗುತ್ತಿದೆ...", analyzing: "ವಿಶ್ಲೇಷಣೆ...", crossReferencing: "ಹೊಂದಾಣಿಕೆ...", generating: "ಚಿಕಿತ್ಸೆ..." } },
    weather: { title: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ", subtitle: "7 ದಿನಗಳ ಮುನ್ಸೂಚನೆ.", temp: "ತಾಪಮಾನ", humidity: "ಆರ್ದ್ರತೆ", wind: "ಗಾಳಿ", rain: "ಮಳೆಯ ಸಾಧ್ಯತೆ" },
    history: { title: "ಇತಿಹಾಸ", subtitle: "ಹಿಂದಿನ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ.", date: "ದಿನಾಂಕ", crop: "ಬೆಳೆ", disease: "ರೋಗ", status: "ಸ್ಥಿತಿ" }
  },
  pa: {
    nav: { features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", stats: "ਅੰਕੜੇ", signIn: "ਸਾਈਨ ਇਨ ਕਰੋ", tryOnline: "ਔਨਲਾਈਨ ਮੁਫ਼ਤ ਅਜ਼ਮਾਓ", goToDashboard: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਜਾਓ" },
    hero: { badge: "ਉੱਨਤ ਏਆਈ ਫਸਲ ਵਿਸ਼ਲੇਸ਼ਣ", title1: "ਤੁਹਾਡਾ ਨਿੱਜੀ ਏਆਈ", title2: "ਫਸਲ ਡਾਕਟਰ", subtitle: "ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ, ਇਲਾਜ ਪ੍ਰਾਪਤ ਕਰੋ।", cta: "ਹੁਣੇ ਤਸ਼ਖੀਸ ਕਰੋ", secondary: "ਡੈਮੋ ਦੇਖੋ" },
    sidebar: { dashboard: "ਡੈਸ਼ਬੋਰਡ", analyze: "ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ", history: "ਇਤਿਹਾਸ", weather: "ਮੌਸਮ", signOut: "ਸਾਈਨ ਆਉਟ" },
    dashboard: { title: "ਫਾਰਮ ਡੈਸ਼ਬੋਰਡ", subtitle: "ਤੁਹਾਡੀ ਫਸਲ ਦੀ ਮੌਜੂਦਾ ਸਥਿਤੀ।", healthScore: "ਸਿਹਤ ਸਕੋਰ" },
    analyze: { title: "ਏਆਈ ਰੋਗ ਸਕੈਨਰ", subtitle: "ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।", dragDrop: "ਚਿੱਤਰ ਇੱਥੇ ਛੱਡੋ", supports: "10MB ਤੱਕ JPG, PNG।", browse: "ਫਾਈਲਾਂ ਬ੍ਰਾਊਜ਼ ਕਰੋ", camera: "ਕੈਮਰਾ ਵਰਤੋ", trust1: "ICAR ਪ੍ਰਮਾਣਿਤ", trust2: "ਤੁਰੰਤ ਨਤੀਜੇ", trust3: "95%+ ਸ਼ੁੱਧਤਾ", qualityTitle: "ਚਿੱਤਰ ਗੁਣਵੱਤਾ", qualityDesc: "ਸਹੀ ਰੋਸ਼ਨੀ।", excellent: "ਸ਼ਾਨਦਾਰ", analyzeBtn: "ਫਸਲ ਦੀ ਸਿਹਤ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ", alertValidation: "ਏਆਈ ਪ੍ਰਮਾਣਿਕਤਾ ਅਸਫਲ:", alertFail: "ਅਸਫਲ. ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ.", steps: { scanning: "ਸਕੈਨਿੰਗ...", identifying: "ਪਛਾਣ...", analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ...", crossReferencing: "ਮੇਲ...", generating: "ਇਲਾਜ..." } },
    weather: { title: "ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ", subtitle: "7 ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ।", temp: "ਤਾਪਮਾਨ", humidity: "ਨਮੀ", wind: "ਹਵਾ", rain: "ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ" },
    history: { title: "ਇਤਿਹਾਸ", subtitle: "ਪਿਛਲੇ ਰਿਕਾਰਡ ਦੇਖੋ।", date: "ਮਿਤੀ", crop: "ਫਸਲ", disease: "ਬਿਮਾਰੀ", status: "ਸਥਿਤੀ" }
  },
  ml: {
    nav: { features: "സവിശേഷതകൾ", howItWorks: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു", stats: "സ്ഥിതിവിവരക്കണക്കുകൾ", signIn: "സൈൻ ഇൻ", tryOnline: "ഓൺലൈനിൽ സൗജന്യമായി പരീക്ഷിക്കുക", goToDashboard: "ഡാഷ്‌ബോർഡ്" },
    hero: { badge: "വിപുലമായ AI ക്രോപ്പ് അനാലിസിസ്", title1: "നിങ്ങളുടെ സ്വന്തം AI", title2: "ക്രോപ്പ് ഡോക്ടർ", subtitle: "രോഗങ്ങൾ കണ്ടെത്തുക, ചികിത്സ നേടുക.", cta: "കണ്ടെത്തുക", secondary: "ഡെമോ കാണുക" },
    sidebar: { dashboard: "ഡാഷ്‌ബോർഡ്", analyze: "വിശകലനം ചെയ്യുക", history: "ചരിത്രം", weather: "കാലാവസ്ഥ", signOut: "സൈൻ ഔട്ട്" },
    dashboard: { title: "ഫാം ഡാഷ്‌ബോർഡ്", subtitle: "നിങ്ങളുടെ വിളയുടെ നിലവിലെ അവസ്ഥ.", healthScore: "ആരോഗ്യ സ്കോർ" },
    analyze: { title: "AI ഡിസീസ് സ്കാനർ", subtitle: "ബാധിച്ച ഇലയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.", dragDrop: "ചിത്രം ഇവിടെ ഇടുക", supports: "10MB വരെയുള്ള JPG, PNG.", browse: "ഫയലുകൾ ബ്രൗസ് ചെയ്യുക", camera: "ക്യാമറ ഉപയോഗിക്കുക", trust1: "ICAR പരിശോധിച്ചു", trust2: "തൽക്ഷണ ഫലങ്ങൾ", trust3: "95%+ കൃത്യത", qualityTitle: "ചിത്രത്തിന്റെ ഗുണനിലവാരം", qualityDesc: "ശരിയായ വെളിച്ചം.", excellent: "മികച്ചതാണ്", analyzeBtn: "വിളയുടെ ആരോഗ്യം വിശകലനം ചെയ്യുക", alertValidation: "AI പരിശോധന പരാജയപ്പെട്ടു:", alertFail: "പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.", steps: { scanning: "സ്കാൻ ചെയ്യുന്നു...", identifying: "തിരിച്ചറിയുന്നു...", analyzing: "വിശകലനം...", crossReferencing: "യോജിപ്പിക്കുന്നു...", generating: "ചികിത്സ..." } },
    weather: { title: "കാലാവസ്ഥാ പ്രവചനം", subtitle: "7 ദിവസത്തെ പ്രവചനം.", temp: "താപനില", humidity: "ഈർപ്പം", wind: "കാറ്റ്", rain: "മഴ സാധ്യത" },
    history: { title: "ചരിത്രം", subtitle: "പഴയ രേഖകൾ കാണുക.", date: "തീയതി", crop: "വിള", disease: "രോഗം", status: "അവസ്ഥ" }
  }
};

const localesDir = path.join(__dirname, 'src', 'locales');

Object.keys(translations).forEach(lang => {
  const dirPath = path.join(localesDir, lang);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dirPath, 'translation.json'), JSON.stringify(translations[lang], null, 2));
});

console.log("Generated comprehensive translations for all 10 languages!");
