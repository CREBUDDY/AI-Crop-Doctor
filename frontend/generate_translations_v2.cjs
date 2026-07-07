const fs = require('fs');
const path = require('path');

const newLanding = {
  en: {
    howItWorks: { badge: "Simple Process", title: "Three taps to happy plants", subtitle: "Getting expert plant care has never been this easy (or this fun).", step1: { title: "Snap a photo", desc: "Point your camera at any plant — whether it looks healthy, sad, or somewhere in between. Our AI loves a good plant selfie!" }, step2: { title: "Get AI diagnosis", desc: "In seconds, our AI analyzes your photo and identifies diseases, deficiencies, or pests. It's like having a plant doctor on speed dial." }, step3: { title: "Follow your care plan", desc: "Receive a personalized treatment plan with step-by-step instructions. Set reminders so you never forget to water again!" } },
    features: { title: "Everything you need for healthy crops", f1: { title: "AI Disease Detection", desc: "Instantly scan leaves to identify diseases with high accuracy using deep learning." }, f2: { title: "Pest Detection", desc: "Identify harmful insects and pests automatically before they destroy your yield." }, f3: { title: "Verified Medicine", desc: "Receive ICAR-verified chemical and organic treatment recommendations." }, f4: { title: "Smart Irrigation", desc: "Optimize water usage with AI-driven watering schedules based on soil and weather." }, f5: { title: "Weather Intelligence", desc: "Proactive hyper-local weather alerts for fungal risks and optimal spraying times." }, f6: { title: "Crop History", desc: "Beautiful charts documenting the journey from disease detection to recovery." } },
    stats: { acc: "Detection Accuracy", crops: "Supported Crops", disease: "Disease Types", monitoring: "AI Monitoring" },
    footer: { copy: "© 2026 AI Crop Doctor. Crafted with Care." }
  },
  hi: {
    howItWorks: { badge: "सरल प्रक्रिया", title: "खुश पौधों के लिए तीन टैप", subtitle: "विशेषज्ञ पौधे की देखभाल प्राप्त करना इतना आसान (या इतना मजेदार) कभी नहीं रहा।", step1: { title: "एक फोटो लें", desc: "अपने कैमरे को किसी भी पौधे पर इंगित करें - चाहे वह स्वस्थ हो, उदास हो, या बीच में कहीं हो।" }, step2: { title: "एआई निदान प्राप्त करें", desc: "सेकंड में, हमारा एआई आपकी तस्वीर का विश्लेषण करता है और बीमारियों की पहचान करता है।" }, step3: { title: "देखभाल योजना का पालन करें", desc: "चरण-दर-चरण निर्देशों के साथ एक व्यक्तिगत उपचार योजना प्राप्त करें।" } },
    features: { title: "स्वस्थ फसलों के लिए आपकी जरूरत की हर चीज", f1: { title: "एआई रोग का पता लगाना", desc: "बीमारियों की तुरंत पहचान करें।" }, f2: { title: "कीट का पता लगाना", desc: "कीड़ों और कीटों की स्वचालित रूप से पहचान करें।" }, f3: { title: "सत्यापित दवा", desc: "ICAR-सत्यापित उपचार सिफारिशें प्राप्त करें।" }, f4: { title: "स्मार्ट सिंचाई", desc: "AI द्वारा संचालित पानी के शेड्यूल।" }, f5: { title: "मौसम बुद्धिमत्ता", desc: "स्थानीय मौसम अलर्ट।" }, f6: { title: "फसल इतिहास", desc: "सुंदर चार्ट।" } },
    stats: { acc: "पता लगाने की सटीकता", crops: "समर्थित फसलें", disease: "रोग के प्रकार", monitoring: "एआई निगरानी" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  mr: {
    howItWorks: { badge: "सोपी प्रक्रिया", title: "आनंदी वनस्पतींसाठी तीन टॅप", subtitle: "वनस्पतींची तज्ञ काळजी घेणे इतके सोपे कधीच नव्हते.", step1: { title: "एक फोटो घ्या", desc: "तुमचा कॅमेरा कोणत्याही झाडाकडे दाखवा." }, step2: { title: "AI निदान मिळवा", desc: "काही सेकंदात आमचे AI आजार ओळखते." }, step3: { title: "काळजी योजना पाळा", desc: "वैयक्तिकृत उपचार योजना प्राप्त करा." } },
    features: { title: "निरोगी पिकांसाठी आवश्यक सर्वकाही", f1: { title: "AI रोग शोध", desc: "त्वरित रोग ओळखा." }, f2: { title: "कीटक शोध", desc: "कीटक आपोआप ओळखा." }, f3: { title: "सत्यापित औषध", desc: "ICAR-सत्यापित शिफारसी." }, f4: { title: "स्मार्ट सिंचन", desc: "पाण्याचा इष्टतम वापर." }, f5: { title: "हवामान बुद्धिमत्ता", desc: "हवामानाचा इशारा." }, f6: { title: "पीक इतिहास", desc: "सुंदर चार्ट." } },
    stats: { acc: "अचूकता", crops: "समर्थित पिके", disease: "रोगाचे प्रकार", monitoring: "AI देखरेख" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  bn: {
    howItWorks: { badge: "সহজ প্রক্রিয়া", title: "সুখী উদ্ভিদের জন্য তিন ট্যাপ", subtitle: "বিশেষজ্ঞ গাছের যত্ন নেওয়া এত সহজ ছিল না।", step1: { title: "একটি ছবি তুলুন", desc: "আপনার ক্যামেরা যেকোন গাছে নির্দেশ করুন।" }, step2: { title: "এআই রোগ নির্ণয় পান", desc: "সেকেন্ডের মধ্যে রোগ শনাক্ত করুন।" }, step3: { title: "যত্নের পরিকল্পনা অনুসরণ করুন", desc: "ব্যক্তিগতকৃত চিকিৎসা পরিকল্পনা পান।" } },
    features: { title: "সুস্থ ফসলের জন্য প্রয়োজনীয় সবকিছু", f1: { title: "এআই রোগ সনাক্তকরণ", desc: "রোগ দ্রুত চিহ্নিত করুন।" }, f2: { title: "কীটপতঙ্গ সনাক্তকরণ", desc: "পোকামাকড় স্বয়ংক্রিয়ভাবে সনাক্ত করুন।" }, f3: { title: "যাচাইকৃত ঔষধ", desc: "ICAR-যাচাইকৃত সুপারিশ।" }, f4: { title: "স্মার্ট সেচ", desc: "জলের সর্বোত্তম ব্যবহার।" }, f5: { title: "আবহাওয়া বুদ্ধিমত্তা", desc: "আবহাওয়া সতর্কতা।" }, f6: { title: "ফসলের ইতিহাস", desc: "সুন্দর চার্ট।" } },
    stats: { acc: "সঠিকতা", crops: "সমর্থিত ফসল", disease: "রোগের প্রকার", monitoring: "এআই মনিটরিং" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  ta: {
    howItWorks: { badge: "எளிய முறை", title: "மகிழ்ச்சியான தாவரங்களுக்கு", subtitle: "தாவர பராமரிப்பு மிகவும் எளிதானது.", step1: { title: "படம் எடுக்கவும்", desc: "புகைப்படம் எடுக்கவும்." }, step2: { title: "AI கண்டறிதல்", desc: "நோய்களை அடையாளம் காணவும்." }, step3: { title: "சிகிச்சை திட்டம்", desc: "சிகிச்சை திட்டத்தைப் பெறவும்." } },
    features: { title: "ஆரோக்கியமான பயிர்களுக்கு", f1: { title: "AI நோய் கண்டறிதல்", desc: "நோய்களைக் கண்டறியவும்." }, f2: { title: "பூச்சி கண்டறிதல்", desc: "பூச்சிகளைக் கண்டறியவும்." }, f3: { title: "சரிபார்க்கப்பட்ட மருந்து", desc: "ICAR பரிந்துரைகள்." }, f4: { title: "ஸ்மார்ட் நீர்ப்பாசனம்", desc: "நீர்ப்பாசன திட்டங்கள்." }, f5: { title: "வானிலை", desc: "வானிலை எச்சரிக்கைகள்." }, f6: { title: "வரலாறு", desc: "விவரங்கள்." } },
    stats: { acc: "துல்லியம்", crops: "பயிர்கள்", disease: "நோய்கள்", monitoring: "AI கண்காணிப்பு" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  te: {
    howItWorks: { badge: "సరళమైన ప్రక్రియ", title: "సంతోషకరమైన మొక్కల కోసం", subtitle: "మొక్కల సంరక్షణ చాలా సులభం.", step1: { title: "ఫోటో తీయండి", desc: "ఫోటో తీయండి." }, step2: { title: "AI రోగ నిర్ధారణ", desc: "వ్యాధులను గుర్తించండి." }, step3: { title: "చికిత్స ప్రణాళిక", desc: "చికిత్స ప్రణాళికను పొందండి." } },
    features: { title: "ఆరోగ్యకరమైన పంటల కోసం", f1: { title: "AI వ్యాధి గుర్తింపు", desc: "వ్యాధులను గుర్తించండి." }, f2: { title: "తెగులు గుర్తింపు", desc: "తెగుళ్లను గుర్తించండి." }, f3: { title: "ధృవీకరించబడిన ఔషధం", desc: "ICAR సిఫార్సులు." }, f4: { title: "స్మార్ట్ నీటిపారుదల", desc: "నీటిపారుదల." }, f5: { title: "వాతావరణం", desc: "వాతావరణ హెచ్చరికలు." }, f6: { title: "చరిత్ర", desc: "వివరాలు." } },
    stats: { acc: "ఖచ్చితత్వం", crops: "పంటలు", disease: "వ్యాధులు", monitoring: "AI పర్యవేక్షణ" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  gu: {
    howItWorks: { badge: "સરળ પ્રક્રિયા", title: "ખુશ છોડ માટે", subtitle: "છોડની સંભાળ ખૂબ સરળ છે.", step1: { title: "ફોટો લો", desc: "ફોટો લો." }, step2: { title: "AI નિદાન", desc: "રોગો ઓળખો." }, step3: { title: "સારવાર યોજના", desc: "સારવાર યોજના મેળવો." } },
    features: { title: "તંદુરસ્ત પાક માટે", f1: { title: "AI રોગની ઓળખ", desc: "રોગો ઓળખો." }, f2: { title: "જીવાતની ઓળખ", desc: "જીવાતો ઓળખો." }, f3: { title: "ચકાસાયેલ દવા", desc: "ICAR ભલામણો." }, f4: { title: "સ્માર્ટ સિંચાઈ", desc: "સિંચાઈ." }, f5: { title: "હવામાન", desc: "હવામાન ચેતવણીઓ." }, f6: { title: "ઇતિહાસ", desc: "વિગતો." } },
    stats: { acc: "ચોકસાઈ", crops: "પાક", disease: "રોગો", monitoring: "AI મોનીટરીંગ" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  kn: {
    howItWorks: { badge: "ಸರಳ ಪ್ರಕ್ರಿಯೆ", title: "ಸಂತೋಷದ ಸಸ್ಯಗಳಿಗೆ", subtitle: "ಸಸ್ಯಗಳ ಆರೈಕೆ ತುಂಬಾ ಸುಲಭ.", step1: { title: "ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ", desc: "ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ." }, step2: { title: "AI ರೋಗನಿರ್ಣಯ", desc: "ರೋಗಗಳನ್ನು ಗುರುತಿಸಿ." }, step3: { title: "ಚಿಕಿತ್ಸಾ ಯೋಜನೆ", desc: "ಚಿಕಿತ್ಸಾ ಯೋಜನೆಯನ್ನು ಪಡೆಯಿರಿ." } },
    features: { title: "ಆರೋಗ್ಯಕರ ಬೆಳೆಗಳಿಗೆ", f1: { title: "AI ರೋಗ ಪತ್ತೆ", desc: "ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ." }, f2: { title: "ಕೀಟ ಪತ್ತೆ", desc: "ಕೀಟಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ." }, f3: { title: "ಪರಿಶೀಲಿಸಿದ ಔಷಧ", desc: "ICAR ಶಿಫಾರಸುಗಳು." }, f4: { title: "ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ", desc: "ನೀರಾವರಿ." }, f5: { title: "ಹವಾಮಾನ", desc: "ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು." }, f6: { title: "ಇತಿಹಾಸ", desc: "ವಿವರಗಳು." } },
    stats: { acc: "ನಿಖರತೆ", crops: "ಬೆಳೆಗಳು", disease: "ರೋಗಗಳು", monitoring: "AI ಮೇಲ್ವಿಚಾರಣೆ" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  pa: {
    howItWorks: { badge: "ਸਧਾਰਨ ਪ੍ਰਕਿਰਿਆ", title: "ਖੁਸ਼ਹਾਲ ਪੌਦਿਆਂ ਲਈ", subtitle: "ਪੌਦਿਆਂ ਦੀ ਦੇਖਭਾਲ ਬਹੁਤ ਆਸਾਨ ਹੈ।", step1: { title: "ਇੱਕ ਫੋਟੋ ਲਓ", desc: "ਫੋਟੋ ਲਓ." }, step2: { title: "ਏਆਈ ਨਿਦਾਨ", desc: "ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ।" }, step3: { title: "ਇਲਾਜ ਯੋਜਨਾ", desc: "ਇਲਾਜ ਯੋਜਨਾ ਪ੍ਰਾਪਤ ਕਰੋ।" } },
    features: { title: "ਸਿਹਤਮੰਦ ਫਸਲਾਂ ਲਈ", f1: { title: "ਏਆਈ ਰੋਗ ਦੀ ਪਛਾਣ", desc: "ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ।" }, f2: { title: "ਕੀੜਿਆਂ ਦੀ ਪਛਾਣ", desc: "ਕੀੜਿਆਂ ਦੀ ਪਛਾਣ ਕਰੋ।" }, f3: { title: "ਪ੍ਰਮਾਣਿਤ ਦਵਾਈ", desc: "ICAR ਸਿਫ਼ਾਰਸ਼ਾਂ।" }, f4: { title: "ਸਮਾਰਟ ਸਿੰਚਾਈ", desc: "ਸਿੰਚਾਈ." }, f5: { title: "ਮੌਸਮ", desc: "ਮੌਸਮ ਦੀਆਂ ਚੇਤਾਵਨੀਆਂ।" }, f6: { title: "ਇਤਿਹਾਸ", desc: "ਵੇਰਵੇ." } },
    stats: { acc: "ਸ਼ੁੱਧਤਾ", crops: "ਫਸਲਾਂ", disease: "ਬਿਮਾਰੀਆਂ", monitoring: "ਏਆਈ ਨਿਗਰਾਨੀ" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  },
  ml: {
    howItWorks: { badge: "ലളിതമായ പ്രക്രിയ", title: "സന്തോഷമുള്ള ചെടികൾക്ക്", subtitle: "സസ്യസംരക്ഷണം വളരെ എളുപ്പമാണ്.", step1: { title: "ഫോട്ടോ എടുക്കുക", desc: "ഫോട്ടോ എടുക്കുക." }, step2: { title: "AI രോഗനിർണയം", desc: "രോഗങ്ങൾ തിരിച്ചറിയുക." }, step3: { title: "ചികിത്സാ പദ്ധതി", desc: "ചികിത്സാ പദ്ധതി നേടുക." } },
    features: { title: "ആരോഗ്യമുള്ള വിളകൾക്ക്", f1: { title: "AI രോഗ നിർണയം", desc: "രോഗങ്ങൾ കണ്ടെത്തുക." }, f2: { title: "കീട നിർണയം", desc: "കീടങ്ങളെ കണ്ടെത്തുക." }, f3: { title: "പരിശോധിച്ച മരുന്ന്", desc: "ICAR ശുപാർശകൾ." }, f4: { title: "സ്മാർട്ട് ജലസേചനം", desc: "ജലസേചനം." }, f5: { title: "കാലാവസ്ഥ", desc: "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ." }, f6: { title: "ചരിത്രം", desc: "വിവരങ്ങൾ." } },
    stats: { acc: "കൃത്യത", crops: "വിളകൾ", disease: "രോഗങ്ങൾ", monitoring: "AI നിരീക്ഷണം" },
    footer: { copy: "© 2026 AI Crop Doctor." }
  }
};

const localesDir = path.join(__dirname, 'src', 'locales');

Object.keys(newLanding).forEach(lang => {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    existing.landing = newLanding[lang];
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  }
});

console.log("Appended landing page translations!");
