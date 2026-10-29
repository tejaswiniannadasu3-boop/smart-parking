import { AppLanguage } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  activeMallHub: string;
  allMalls: string;
  allMallsInIndia: string;
  entryGate: string;
  view3d: string;
  view2d: string;
  myParking: string;
  analytics: string;
  admin: string;
  findNearest: string;
  findNearestDesc: string;
  bookSlot: string;
  digitalTicket: string;
  activeTicket: string;
  turnByTurn: string;
  openTicket: string;
  orbitZoom: string;
  selectBay: string;
  available: string;
  occupied: string;
  reserved: string;
  selected: string;
  // Overstay / Overtime System
  overstayAlert: string;
  overstayTitle: string;
  overstayDesc: string;
  gracePeriodActive: string;
  gracePeriodDesc: string;
  conflictShieldActive: string;
  conflictShieldDesc: string;
  scheduledTimeExceeded: string;
  timeRemaining: string;
  overtimeElapsed: string;
  extendNow: string;
  quickExtend30: string;
  quickExtend60: string;
  quickExtend120: string;
  extensionSuccess: string;
  simulateOverstay: string;
  simulateOverstayDesc: string;
  exitSettlement: string;
  fairTariffNotice: string;
  noPenaltyGuarantee: string;
  driverParksGateSensor: string;
  driverLeavesSlotFree: string;
  gateSensorScanner: string;
  // Smart Auto-Extend
  smartAutoExtend: string;
  smartAutoExtendDesc: string;
  smartAutoExtendEnabled: string;
  smartAutoExtendDisabled: string;
  autoExtensionsUsed: string;
  penaltyWarning: string;
  triggerAutoExtendTest: string;
  // Languages
  language: string;
  english: string;
  telugu: string;
  hindi: string;
  tamil: string;
  kannada: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  en: {
    appName: 'SmartPark',
    appSubtitle: 'Intelligent Mall Parking • ADSA Min-Heap • Python ML • DBMS',
    activeMallHub: 'Active Mall Hub',
    allMalls: 'All Malls',
    allMallsInIndia: 'All Malls in India Directory',
    entryGate: 'Entry Gate',
    view3d: '3D View',
    view2d: '2D Map',
    myParking: 'My Parking',
    analytics: 'Analytics',
    admin: 'Admin',
    findNearest: 'Find Nearest Slot (Min-Heap)',
    findNearestDesc: 'ADSA Min-Heap calculates closest Euclidean bay instantly',
    bookSlot: 'Book Parking Slot',
    digitalTicket: 'Digital Pass',
    activeTicket: 'Active Parking Pass',
    turnByTurn: 'Turn-by-Turn Route',
    openTicket: 'Open Digital Ticket',
    orbitZoom: 'Orbit: Click & Drag • Zoom: Scroll Wheel',
    selectBay: 'Select: Click Bay',
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    selected: 'Selected',
    // Overstay / Overtime System
    overstayAlert: 'Overstay Intelligent Buffer',
    overstayTitle: 'Parking Time Exceeded — Smart Resolution Active',
    overstayDesc: 'Your scheduled booking time has expired while vehicle is parked in bay.',
    gracePeriodActive: '15-Minute Courtesy Grace Period Active',
    gracePeriodDesc: 'Zero extra charge during the first 15 minutes of overtime.',
    conflictShieldActive: 'Intelligent Conflict Shield & Dynamic Rerouting Active',
    conflictShieldDesc: 'ADSA Min-Heap has automatically rerouted consecutive incoming reservations to alternative bays. No wheel clamping, towing, or punitive fines.',
    scheduledTimeExceeded: 'Scheduled Duration Expired',
    timeRemaining: 'Remaining Time',
    overtimeElapsed: 'Overtime Elapsed',
    extendNow: 'Extend Parking Duration',
    quickExtend30: '+30 Mins (Prorated)',
    quickExtend60: '+1 Hour (Movie / Dining)',
    quickExtend120: '+2 Hours (Extended Shopping)',
    extensionSuccess: 'Parking pass successfully extended. Bay conflict locks updated.',
    simulateOverstay: 'Simulate Vehicle Overstay (+45 Mins)',
    simulateOverstayDesc: 'Test intelligent overstay auto-extension, conflict shield, and grace buffer',
    exitSettlement: 'Automated Exit Clearance & Pro-rated Settlement',
    fairTariffNotice: 'Transparent Pro-rated Billing (₹ standard hourly rate only)',
    noPenaltyGuarantee: 'Zero Punitive Fine Guarantee by SmartPark',
    driverParksGateSensor: 'Driver Parks (Gate Sensor)',
    driverLeavesSlotFree: 'Driver Leaves (Release Bay)',
    gateSensorScanner: 'Simulate Gate QR Code Sensor Scan',
    // Smart Auto-Extend
    smartAutoExtend: 'Smart Auto-Extend',
    smartAutoExtendDesc: 'Automatically adds a 30-minute block upon overstay up to 3 times before applying any penalty, notifying you each time.',
    smartAutoExtendEnabled: 'Enabled (Up to 3x 30m blocks)',
    smartAutoExtendDisabled: 'Disabled',
    autoExtensionsUsed: 'Auto-Extensions Used',
    penaltyWarning: 'Maximum 3 auto-extensions reached (90 mins). Standard overtime tariff & penalty now active.',
    triggerAutoExtendTest: 'Test Smart Auto-Extend (+30m Block)',
    // Languages
    language: 'Language',
    english: 'English',
    telugu: 'తెలుగు (Telugu)',
    hindi: 'हिंदी (Hindi)',
    tamil: 'தமிழ் (Tamil)',
    kannada: 'ಕನ್ನಡ (Kannada)',
  },

  te: {
    appName: 'స్మార్ట్ పార్క్',
    appSubtitle: 'ఇంటెలిజెంట్ మాల్ పార్కింగ్ • ADSA మిన్-హీప్ • పైథాన్ ML • DBMS',
    activeMallHub: 'యాక్టివ్ మాల్ హబ్',
    allMalls: 'అన్ని మాల్స్',
    allMallsInIndia: 'భారతదేశంలోని ప్రముఖ మాల్స్ జాబితా',
    entryGate: 'ప్రవేశ ద్వారం',
    view3d: '3D వీక్షణ',
    view2d: '2D మ్యాప్',
    myParking: 'నా పార్కింగ్',
    analytics: 'విశ్లేషణలు',
    admin: 'నిర్వాహకుడు',
    findNearest: 'సమీప స్లాట్ కనుగొనండి (మిన్-హీప్)',
    findNearestDesc: 'ADSA మిన్-హీప్ అత్యంత సమీపంలోని పార్కింగ్ స్లాట్‌ను కేటాయిస్తుంది',
    bookSlot: 'పార్కింగ్ స్లాట్ బుక్ చేయండి',
    digitalTicket: 'డిజిటల్ పాస్',
    activeTicket: 'సక్రియ పార్కింగ్ పాస్',
    turnByTurn: 'రూట్ నావిగేషన్',
    openTicket: 'డిజిటల్ టికెట్ తెరవండి',
    orbitZoom: 'తిప్పడానికి: క్లిక్ & డ్రాగ్ • జూమ్: స్క్రోల్ వీల్',
    selectBay: 'ఎంచుకోవడానికి: స్లాట్‌పై క్లిక్ చేయండి',
    available: 'అందుబాటులో ఉంది',
    occupied: 'పార్కింగ్ చేయబడింది',
    reserved: 'రిజర్వ్ చేయబడింది',
    selected: 'ఎంచుకోబడింది',
    // Overstay / Overtime System
    overstayAlert: 'సమయం మించిన ఇంటెలిజెంట్ బఫర్',
    overstayTitle: 'పార్కింగ్ సమయం ముగిసింది — తెలివైన రక్షణ సక్రియంగా ఉంది',
    overstayDesc: 'మీరు బుక్ చేసిన సమయం ముగిసినప్పటికీ వాహనం ఇంకా స్లాట్‌లో పార్క్ చేయబడి ఉంది.',
    gracePeriodActive: '15 నిమిషాల ఉచిత గ్రేస్ పీరియడ్ సక్రియంగా ఉంది',
    gracePeriodDesc: 'మొదటి 15 నిమిషాల అదనపు సమయానికి ఎలాంటి రుసుము ఉండదు.',
    conflictShieldActive: 'తెలివైన వివాద రక్షణ & ప్రత్యామ్నాయ స్లాట్ కేటాయింపు సక్రియం',
    conflictShieldDesc: 'ADSA మిన్-హీప్ అల్గోరిథం తదుపరి వచ్చే డ్రైవర్లను స్వయంచాలకంగా ఇతర ఖాళీ స్లాట్‌లకు మళ్ళించింది. వాహనాన్ని లాక్ చేయడం లేదా జరిమానా విధించడం జరగదు.',
    scheduledTimeExceeded: 'కేటాయించిన సమయం ముగిసింది',
    timeRemaining: 'మిగిలిన సమయం',
    overtimeElapsed: 'అదనపు సమయం',
    extendNow: 'పార్కింగ్ సమయాన్ని పొడిగించండి',
    quickExtend30: '+30 నిమిషాలు (సాధారణ రుసుము)',
    quickExtend60: '+1 గంట (సినిమా / భోజనం)',
    quickExtend120: '+2 గంటలు (షాపింగ్)',
    extensionSuccess: 'పార్కింగ్ సమయం విజయవంతంగా పొడిగించబడింది.',
    simulateOverstay: 'అదనపు సమయం అనుకరించండి (+45 నిమిషాలు)',
    simulateOverstayDesc: 'స్మార్ట్ గ్రేస్ పీరియడ్ మరియు ఆటో-రీరూటింగ్ సిస్టమ్‌ను పరీక్షించండి',
    exitSettlement: 'నిష్క్రమణ వద్ద ఆటోమేటెడ్ బిల్లు క్లియరెన్స్',
    fairTariffNotice: 'పారదర్శక సాధారణ గంటల రుసుము మాత్రమే (ఎలాంటి పెనాల్టీ లేదు)',
    noPenaltyGuarantee: 'స్మార్ట్ పార్క్ ద్వారా జీరో పెనాల్టీ హామీ',
    driverParksGateSensor: 'వాహనం పార్క్ చేయండి (గేట్ సెన్సార్)',
    driverLeavesSlotFree: 'నిష్క్రమించండి (స్లాట్ విడుదల)',
    gateSensorScanner: 'గేట్ QR సెన్సార్ స్కానింగ్ అనుకరణ',
    // Smart Auto-Extend
    smartAutoExtend: 'స్మార్ట్ ఆటో-ఎక్స్‌టెండ్',
    smartAutoExtendDesc: 'సమయం మించినప్పుడు జరిమానా లేకుండా 3 సార్లు వరకు స్వయంచాలకంగా 30 నిమిషాల బ్లాక్‌ను జోడిస్తుంది, ప్రతిసారీ నోటిఫికేషన్ అందిస్తుంది.',
    smartAutoExtendEnabled: 'సక్రియం (గరిష్టంగా 3x 30 నిమిషాల బ్లాక్‌లు)',
    smartAutoExtendDisabled: 'నిష్క్రియం',
    autoExtensionsUsed: 'ఉపయోగించిన ఆటో-ఎక్స్‌టెన్షన్‌లు',
    penaltyWarning: 'గరిష్ట 3 ఆటో-ఎక్స్‌టెన్షన్‌లు పూర్తయ్యాయి (90 నిమిషాలు). ఇప్పుడు సాధారణ ఓవర్‌స్టే రుసుము వర్తిస్తుంది.',
    triggerAutoExtendTest: 'ఆటో-ఎక్స్‌టెండ్ పరీక్షించండి (+30 నిమిషాలు)',
    // Languages
    language: 'భాష',
    english: 'English (ఇంగ్లీష్)',
    telugu: 'తెలుగు',
    hindi: 'हिंदी (హిందీ)',
    tamil: 'தமிழ் (తమిళ్)',
    kannada: 'ಕನ್ನಡ (కన్నడ)',
  },

  hi: {
    appName: 'स्मार्टपार्क',
    appSubtitle: 'इंटेलिजेंट मॉल पार्किंग • ADSA न्यूनतम-हीप • पायथन ML • DBMS',
    activeMallHub: 'सक्रिय मॉल हब',
    allMalls: 'सभी मॉल',
    allMallsInIndia: 'भारत के प्रमुख शॉपिंग मॉल डायरेक्टरी',
    entryGate: 'प्रवेश द्वार',
    view3d: '3D दृश्य',
    view2d: '2D नक्शा',
    myParking: 'मेरी पार्किंग',
    analytics: 'एनालिटिक्स',
    admin: 'प्रशासक',
    findNearest: 'निकटतम स्लॉट खोजें (न्यूनतम-हीप)',
    findNearestDesc: 'ADSA एल्गोरिदम निकटतम खाली बे की त्वरित गणना करता है',
    bookSlot: 'पार्किंग स्लॉट बुक करें',
    digitalTicket: 'डिजिटल पास',
    activeTicket: 'सक्रिय पार्किंग पास',
    turnByTurn: 'मार्ग दिशानिर्देश',
    openTicket: 'डिजिटल टिकट खोलें',
    orbitZoom: 'घुमाएं: क्लिक और ड्रैग • ज़ूम: स्क्रॉल व्हील',
    selectBay: 'चुनें: बे पर क्लिक करें',
    available: 'उपलब्ध',
    occupied: 'पार्क किया हुआ',
    reserved: 'आरक्षित',
    selected: 'चयनित',
    // Overstay / Overtime System
    overstayAlert: 'अतिरिक्त समय इंटेलिजेंट बफर',
    overstayTitle: 'पार्किंग समय समाप्त — स्मार्ट सुरक्षा सक्रिय',
    overstayDesc: 'आपका निर्धारित बुकिंग समय समाप्त हो चुका है जबकि वाहन अभी भी स्लॉट में पार्क है।',
    gracePeriodActive: '15 मिनट की निःशुल्क छूट अवधि सक्रिय',
    gracePeriodDesc: 'अतिरिक्त समय के पहले 15 मिनट तक कोई अतिरिक्त शुल्क नहीं लगेगा।',
    conflictShieldActive: 'इंटेलिजेंट विवाद निवारण और स्वचालित स्लॉट पुनर्निर्देशन सक्रिय',
    conflictShieldDesc: 'ADSA मिन-हीप ने आगामी बुकिंग्स को स्वचालित रूप से अन्य खाली बे में पुनर्निर्देशित कर दिया है। कोई व्हील क्लैंप या जुर्माना नहीं लगेगा।',
    scheduledTimeExceeded: 'निर्धारित समय समाप्त',
    timeRemaining: 'शेष समय',
    overtimeElapsed: 'अतिरिक्त बीता समय',
    extendNow: 'पार्किंग समय बढ़ाएं',
    quickExtend30: '+30 मिनट (साधारण दर)',
    quickExtend60: '+1 घंटा (मूवी / डाइनिंग)',
    quickExtend120: '+2 घंटे (विस्तृत खरीदारी)',
    extensionSuccess: 'पार्किंग समय सफलतापूर्वक बढ़ा दिया गया है।',
    simulateOverstay: 'ओवरस्टे का अनुकरण करें (+45 मिनट)',
    simulateOverstayDesc: 'स्मार्ट छूट अवधि, विवाद सुरक्षा और ऑटो-एक्सटेंशन का परीक्षण करें',
    exitSettlement: 'निकास पर स्वचालित प्रो-राटा बिलिंग',
    fairTariffNotice: 'पारदर्शी मानक प्रति घंटा दर (कोई दंडात्मक शुल्क नहीं)',
    noPenaltyGuarantee: 'स्मार्टपार्क द्वारा शून्य जुर्माना गारंटी',
    driverParksGateSensor: 'ड्राइवर पार्क करें (गेट सेंसर)',
    driverLeavesSlotFree: 'ड्राइवर प्रस्थान करें (स्लॉट मुक्त)',
    gateSensorScanner: 'गेट QR कोड सेंसर स्कैन का अनुकरण करें',
    // Smart Auto-Extend
    smartAutoExtend: 'स्मार्ट ऑटो-एक्सटेंड',
    smartAutoExtendDesc: 'ओवरस्टे होने पर बिना किसी जुर्माने के 3 बार तक 30 मिनट का ब्लॉक स्वचालित रूप से जोड़ता है और हर बार सूचित करता है।',
    smartAutoExtendEnabled: 'सक्रिय (अधिकतम 3x 30 मिनट ब्लॉक)',
    smartAutoExtendDisabled: 'निष्क्रिय',
    autoExtensionsUsed: 'प्रयुक्त ऑटो-एक्सटेंशन',
    penaltyWarning: 'अधिकतम 3 ऑटो-एक्सटेंशन पूरे हो चुके हैं (90 मिनट)। अब मानक ओवरस्टे शुल्क लागू होगा।',
    triggerAutoExtendTest: 'ऑटो-एक्सटेंड का परीक्षण करें (+30 मिनट)',
    // Languages
    language: 'भाषा',
    english: 'English (अंग्रेज़ी)',
    telugu: 'తెలుగు (तेलुगु)',
    hindi: 'हिंदी',
    tamil: 'தமிழ் (तमिल)',
    kannada: 'ಕನ್ನಡ (कन्नड़)',
  },

  ta: {
    appName: 'ஸ்மார்ட்பார்க்',
    appSubtitle: 'அறிவார்ந்த மால் பார்க்கிங் • ADSA மின்-ஹீப் • பைதான் ML • DBMS',
    activeMallHub: 'செயலில் உள்ள மால்',
    allMalls: 'அனைத்து மால்கள்',
    allMallsInIndia: 'இந்தியாவின் முக்கிய மால்கள் அடைவு',
    entryGate: 'நுழைவு வாயில்',
    view3d: '3D பார்வை',
    view2d: '2D வரைபடம்',
    myParking: 'என் பார்க்கிங்',
    analytics: 'பகுப்பாய்வு',
    admin: 'நிர்வாகி',
    findNearest: 'அருகிலுள்ள இடத்தை கண்டுபிடி',
    findNearestDesc: 'ADSA அல்காரிதம் மிக அருகிலுள்ள பார்க்கிங் இடத்தை ஒதுக்குகிறது',
    bookSlot: 'பார்க்கிங் முன்பதிவு செய்',
    digitalTicket: 'டிஜிட்டல் பாஸ்',
    activeTicket: 'செயலில் உள்ள பாஸ்',
    turnByTurn: 'பாதை வழிகாட்டி',
    openTicket: 'டிஜிட்டல் டிக்கெட் திற',
    orbitZoom: 'சுழற்ற: கிளிக் & இழுக்கவும் • பெரிதாக்க: ஸ்க்ரோல்',
    selectBay: 'தேர்ந்தெடுக்க கிளிக் செய்க',
    available: 'கிடைக்கிறது',
    occupied: 'நிறுத்தப்பட்டுள்ளது',
    reserved: 'முன்பதிவு செய்யப்பட்டது',
    selected: 'தேர்ந்தெடுக்கப்பட்டது',
    // Overstay / Overtime System
    overstayAlert: 'கூடுதல் நேர நுண்ணறிவு பஃபர்',
    overstayTitle: 'பார்க்கிங் நேரம் முடிந்தது — ஸ்மார்ட் பாதுகாப்பு செயலில் உள்ளது',
    overstayDesc: 'முன்பதிவு செய்த நேரம் முடிந்த பிறகும் வாகனம் இன்னும் நிறுத்தப்பட்டுள்ளது.',
    gracePeriodActive: '15 நிமிட இலவச சலுகை நேரம் செயலில் உள்ளது',
    gracePeriodDesc: 'கூடுதல் நேரத்தின் முதல் 15 நிமிடங்களுக்கு கட்டணம் ஏதும் இல்லை.',
    conflictShieldActive: 'ஸ்மார்ட் மோதல் தீர்வு மற்றும் தானியங்கி மறுவழிகாட்டல்',
    conflictShieldDesc: 'ADSA அடுத்த வாடிக்கையாளர்களை மாற்று இடங்களுக்கு திருப்பிவிட்டுள்ளது. அபராதம் ஏதும் விதிக்கப்படாது.',
    scheduledTimeExceeded: 'முன்பதிவு நேரம் முடிந்தது',
    timeRemaining: 'மீதமுள்ள நேரம்',
    overtimeElapsed: 'கூடுதல் நேரம்',
    extendNow: 'பார்க்கிங் நேரத்தை நீட்டிக்கவும்',
    quickExtend30: '+30 நிமிடங்கள் (சாதாரண கட்டணம்)',
    quickExtend60: '+1 மணிநேரம் (திரைப்படம் / உணவு)',
    quickExtend120: '+2 மணிநேரம் (ஷாப்பிங்)',
    extensionSuccess: 'பார்க்கிங் நேரம் வெற்றிகரமாக நீட்டிக்கப்பட்டது.',
    simulateOverstay: 'கூடுதல் நேரத்தை சோதிக்கவும் (+45 நிமிடங்கள்)',
    simulateOverstayDesc: 'ஸ்மார்ட் சலுகை நேரம் மற்றும் பாதுகாப்பு அமைப்பை சோதிக்கவும்',
    exitSettlement: 'வெளியேறும் போது தானியங்கி கட்டண தீர்வு',
    fairTariffNotice: 'வெளிப்படையான மணிநேர கட்டணம் மட்டுமே (அபராதம் இல்லை)',
    noPenaltyGuarantee: 'பூஜ்ஜிய அபராத உத்தரவாதம்',
    driverParksGateSensor: 'வாகனம் நிறுத்துங்கள் (சென்சார்)',
    driverLeavesSlotFree: 'வெளியேறுங்கள் (இடத்தை விடுவிக்கவும்)',
    gateSensorScanner: 'கேட் QR குறியீடு ஸ்கேனர் உருவகப்படுத்துதல்',
    // Smart Auto-Extend
    smartAutoExtend: 'ஸ்மார்ட் தானியங்கி நீட்டிப்பு',
    smartAutoExtendDesc: 'கூடுதல் நேரத்தைக் கண்டறியும் போது அபராதமின்றி 3 முறை வரை தானாகவே 30 நிமிடங்களை சேர்க்கிறது.',
    smartAutoExtendEnabled: 'இயக்கப்பட்டது (3x 30 நிமிடம் வரை)',
    smartAutoExtendDisabled: 'முடக்கப்பட்டது',
    autoExtensionsUsed: 'பயன்படுத்தப்பட்ட தானியங்கி நீட்டிப்புகள்',
    penaltyWarning: 'அதிகபட்ச 3 தானியங்கி நீட்டிப்புகள் முடிந்தது (90 நிமிடங்கள்). இப்போது சாதாரண கூடுதல் நேரக் கட்டணம் பொருந்தும்.',
    triggerAutoExtendTest: 'தானியங்கி நீட்டிப்பை சோதிக்கவும் (+30 நிமிடம்)',
    // Languages
    language: 'மொழி',
    english: 'English (ஆங்கிலம்)',
    telugu: 'తెలుగు (தெலுங்கு)',
    hindi: 'हिंदी (இந்தி)',
    tamil: 'தமிழ்',
    kannada: 'ಕನ್ನಡ (கன்னடம்)',
  },

  kn: {
    appName: 'ಸ್ಮಾರ್ಟ್‌ಪಾರ್ಕ್',
    appSubtitle: 'ಬುದ್ಧಿವಂತ ಮಾಲ್ ಪಾರ್ಕಿಂಗ್ • ADSA ಮಿನ್-ಹೀಪ್ • ಪೈಥಾನ್ ML • DBMS',
    activeMallHub: 'ಸಕ್ರಿಯ ಮಾಲ್ ಹಬ್',
    allMalls: 'ಎಲ್ಲಾ ಮಾಲ್‌ಗಳು',
    allMallsInIndia: 'ಭಾರತದ ಪ್ರಮುಖ ಶಾಪಿಂಗ್ ಮಾಲ್‌ಗಳ ಡೈರೆಕ್ಟರಿ',
    entryGate: 'ಪ್ರವೇಶ ದ್ವಾರ',
    view3d: '3D ನೋಟ',
    view2d: '2D ನಕ್ಷೆ',
    myParking: 'ನನ್ನ ಪಾರ್ಕಿಂಗ್',
    analytics: 'ವಿಶ್ಲೇಷಣೆ',
    admin: 'ನಿರ್ವಾಹಕ',
    findNearest: 'ಹತ್ತಿರದ ಸ್ಲಾಟ್ ಹುಡುಕಿ (ಮಿನ್-ಹೀಪ್)',
    findNearestDesc: 'ADSA ಅಲ್ಗಾರಿದಮ್ ತಕ್ಷಣವೇ ಹತ್ತಿರದ ಖಾಲಿ ಜಾಗವನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ',
    bookSlot: 'ಪಾರ್ಕಿಂಗ್ ಸ್ಲಾಟ್ ಕಾಯ್ದಿರಿಸಿ',
    digitalTicket: 'ಡಿಜಿಟಲ್ ಪಾಸ್',
    activeTicket: 'ಸಕ್ರಿಯ ಪಾರ್ಕಿಂಗ್ ಪಾಸ್',
    turnByTurn: 'ಮಾರ್ಗಸೂಚಿ',
    openTicket: 'ಡಿಜಿಟಲ್ ಟಿಕೆಟ್ ತೆರೆಯಿರಿ',
    orbitZoom: 'ತಿರುಗಿಸಲು: ಕ್ಲಿಕ್ & ಎಳೆಯಿರಿ • ಜೂಮ್: ಸ್ಕ್ರೋಲ್ ವೀಲ್',
    selectBay: 'ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    available: 'ಲಭ್ಯವಿದೆ',
    occupied: 'ಪಾರ್ಕ್ ಮಾಡಲಾಗಿದೆ',
    reserved: 'ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
    selected: 'ಆಯ್ಕೆಮಾಡಲಾಗಿದೆ',
    // Overstay / Overtime System
    overstayAlert: 'ಹೆಚ್ಚುವರಿ ಸಮಯದ ಇಂಟೆಲಿಜೆಂಟ್ ಬಫರ್',
    overstayTitle: 'ಪಾರ್ಕಿಂಗ್ ಸಮಯ ಮುಗಿದಿದೆ — ಸ್ಮಾರ್ಟ್ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ',
    overstayDesc: 'ನಿಮ್ಮ ನಿಗದಿತ ಬುಕಿಂಗ್ ಸಮಯ ಮುಗಿದಿದೆ ಆದರೆ ವಾಹನ ಇನ್ನೂ ಪಾರ್ಕಿಂಗ್‌ನಲ್ಲಿದೆ.',
    gracePeriodActive: '15 ನಿಮಿಷಗಳ ಉಚಿತ ರಿಯಾಯಿತಿ ಸಮಯ ಸಕ್ರಿಯವಾಗಿದೆ',
    gracePeriodDesc: 'ಮೊದಲ 15 ನಿಮಿಷಗಳ ಹೆಚ್ಚುವರಿ ಸಮಯಕ್ಕೆ ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲ.',
    conflictShieldActive: 'ಬುದ್ಧಿವಂತ ವಿವಾದ ಪರಿಹಾರ & ಸ್ವಯಂಚಾಲಿತ ಮರುನಿರ್ದೇಶನ',
    conflictShieldDesc: 'ADSA ಮುಂದಿನ ಗ್ರಾಹಕರನ್ನು ಪರ್ಯಾಯ ಸ್ಲಾಟ್‌ಗಳಿಗೆ ಮರುನಿರ್ದೇಶಿಸಿದೆ. ಯಾವುದೇ ದಂಡ ಅಥವಾ ಕ್ಲಾಂಪ್ ಇರುವುದಿಲ್ಲ.',
    scheduledTimeExceeded: 'ನಿಗದಿತ ಅವಧಿ ಮುಗಿದಿದೆ',
    timeRemaining: 'ಉಳಿದ ಸಮಯ',
    overtimeElapsed: 'ಹೆಚ್ಚುವರಿ ಕಳೆದ ಸಮಯ',
    extendNow: 'ಪಾರ್ಕಿಂಗ್ ಸಮಯ ವಿಸ್ತರಿಸಿ',
    quickExtend30: '+30 ನಿಮಿಷಗಳು (ಸಾಮಾನ್ಯ ದರ)',
    quickExtend60: '+1 ಗಂಟೆ (ಸಿನಿಮಾ / ಊಟ)',
    quickExtend120: '+2 ಗಂಟೆಗಳು (ಶಾಪಿಂಗ್)',
    extensionSuccess: 'ಪಾರ್ಕಿಂಗ್ ಸಮಯವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ವಿಸ್ತರಿಸಲಾಗಿದೆ.',
    simulateOverstay: 'ಹೆಚ್ಚುವರಿ ಸಮಯ ಸಿಮ್ಯುಲೇಶನ್ (+45 ನಿಮಿಷಗಳು)',
    simulateOverstayDesc: 'ಉಚಿತ ರಿಯಾಯಿತಿ ಅವಧಿ ಮತ್ತು ಆಟೋ-ರೀರೂಟಿಂಗ್ ಪರೀಕ್ಷಿಸಿ',
    exitSettlement: 'ನಿರ್ಗಮನದಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಬಿಲ್ಲಿಂಗ್',
    fairTariffNotice: 'ಪಾರದರ್ಶಕ ಸಾಮಾನ್ಯ ಗಂಟೆಯ ದರ ಮಾತ್ರ (ಯಾವುದೇ ದಂಡವಿಲ್ಲ)',
    noPenaltyGuarantee: 'ಸ್ಮಾರ್ಟ್‌ಪಾರ್ಕ್ ಶೂನ್ಯ ದಂಡ ಖಾತರಿ',
    driverParksGateSensor: 'ವಾಹನ ನಿಲ್ಲಿಸಿ (ಗೇಟ್ ಸೆನ್ಸಾರ್)',
    driverLeavesSlotFree: 'ನಿರ್ಗಮಿಸಿ (ಸ್ಲಾಟ್ ಮುಕ್ತಗೊಳಿಸಿ)',
    gateSensorScanner: 'ಗೇಟ್ ಕ್ಯೂಆರ್ ಸೆನ್ಸಾರ್ ಸ್ಕ್ಯಾನ್ ಸಿಮ್ಯುಲೇಶನ್',
    // Smart Auto-Extend
    smartAutoExtend: 'ಸ್ಮಾರ್ಟ್ ಆಟೋ-ವಿಸ್ತರಣೆ',
    smartAutoExtendDesc: 'ಸಮಯ ಮೀರಿದಾಗ ಯಾವುದೇ ದಂಡವಿಲ್ಲದೆ 3 ಬಾರಿ 30 ನಿಮಿಷಗಳ ಬ್ಲಾಕ್ ಅನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇರಿಸುತ್ತದೆ ಮತ್ತು ಪ್ರತಿ ಬಾರಿ ತಿಳಿಸುತ್ತದೆ.',
    smartAutoExtendEnabled: 'ಸಕ್ರಿಯ (ಗರಿಷ್ಠ 3x 30 ನಿಮಿಷಗಳ ಬ್ಲಾಕ್‌ಗಳು)',
    smartAutoExtendDisabled: 'ನಿಷ್ಕ್ರಿಯ',
    autoExtensionsUsed: 'ಬಳಸಿದ ಆಟೋ-ವಿಸ್ತರಣೆಗಳು',
    penaltyWarning: 'ಗರಿಷ್ಠ 3 ಆಟೋ-ವಿಸ್ತರಣೆಗಳನ್ನು ತಲುಪಲಾಗಿದೆ (90 ನಿಮಿಷಗಳು). ಈಗ ದಂಡ ಅನ್ವಯಿಸುತ್ತದೆ.',
    triggerAutoExtendTest: 'ಆಟೋ-ವಿಸ್ತರಣೆ ಪರೀಕ್ಷಿಸಿ (+30 ನಿಮಿಷ)',
    // Languages
    language: 'ಭಾಷೆ',
    english: 'English (ಇಂಗ್ಲಿಷ್)',
    telugu: 'తెలుగు (ತೆಲುಗು)',
    hindi: 'हिंदी (ಹಿಂದಿ)',
    tamil: 'தமிழ் (ತಮಿಳು)',
    kannada: 'ಕನ್ನಡ',
  },
};
