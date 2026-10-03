export interface Translations {
  appName: string;
  tagline: string;
  logVitals: string;
  bloodPressure: string;
  systolic: string;
  diastolic: string;
  weight: string;
  swelling: string;
  swellingNone: string;
  swellingMild: string;
  swellingSevere: string;
  symptoms: string;
  headacheVision: string;
  epigastricPain: string;
  babyMovement: string;
  babyMovementNormal: string;
  babyMovementDecreased: string;
  babyMovementAbsent: string;
  medications: string;
  appointments: string;
  emergencySos: string;
  saveLog: string;
  saving: string;
  offlineNotice: string;
  syncedSuccess: string;
  riskStable: string;
  riskWarning: string;
  riskCritical: string;
  callCHW: string;
  voiceGuide: string;
  speakToLog: string;
  streakTitle: string;
  daysStreak: string;
  maternalPoints: string;
  badgesEarned: string;
  unlockedBadgeToast: string;
  levelTitle: string;
  streakReinforcement: string;
}

export const translations: Record<string, Translations> = {
  en: {
    appName: 'MatruSuraksha',
    tagline: 'Sacred Maternal Health & Clinical Triage',
    logVitals: 'Log Today’s Health',
    bloodPressure: 'Blood Pressure',
    systolic: 'Top Number (Systolic)',
    diastolic: 'Bottom Number (Diastolic)',
    weight: 'Body Weight',
    swelling: 'Swelling / Edema',
    swellingNone: 'No Swelling',
    swellingMild: 'Mild (Feet only)',
    swellingSevere: 'Severe (Face & Legs)',
    symptoms: 'Danger Warning Signs',
    headacheVision: 'Severe Headache or Flashing Lights',
    epigastricPain: 'Upper Belly / Rib Pain',
    babyMovement: 'Baby Movement',
    babyMovementNormal: 'Active Kicking (Normal)',
    babyMovementDecreased: 'Less Kicking than usual',
    babyMovementAbsent: 'No kicks in 12 hours',
    medications: 'Daily Medicines',
    appointments: 'Next Clinic Visit',
    emergencySos: 'Emergency SOS Help',
    saveLog: 'Submit Health Log',
    saving: 'Saving...',
    offlineNotice: 'Offline Mode: Stored safely on device. Will sync when network returns.',
    syncedSuccess: 'Synced successfully with clinic database!',
    riskStable: 'All Good & Stable',
    riskWarning: 'Moderate Watch Needed',
    riskCritical: 'CRITICAL: Urgent Help Alerted',
    callCHW: 'Call Community Health Worker',
    voiceGuide: 'Listen to Voice Guide',
    speakToLog: 'Tap to Speak',
    streakTitle: 'Daily Health Streak',
    daysStreak: 'Day Streak',
    maternalPoints: 'Health Care Points',
    badgesEarned: 'Safe Motherhood Badges',
    unlockedBadgeToast: 'Hongera Mama! New Badge Unlocked!',
    levelTitle: 'Maternal Care Level',
    streakReinforcement: 'Wonderful dedication! Daily checks protect you and your baby.',
  },
  sw: {
    appName: 'MatruSuraksha',
    tagline: 'Afya ya Mama Mjamzito na Mtoto',
    logVitals: 'Rekodi Afya ya Leo',
    bloodPressure: 'Shinikizo la Damu (BP)',
    systolic: 'Namba ya Juu',
    diastolic: 'Namba ya Chini',
    weight: 'Uzito wa Mwili',
    swelling: 'Kuvimba Mwili / Miguu',
    swellingNone: 'Hakuna Kuvimba',
    swellingMild: 'Kiasi (Miguu tu)',
    swellingSevere: 'Kikubwa (Uso na Miguu)',
    symptoms: 'Dalili za Hatari',
    headacheVision: 'Maumivu Makali ya Kichwa au Macho Kutoona Vizuri',
    epigastricPain: 'Maumivu ya Juu ya Tumbo',
    babyMovement: 'Mchezo wa Mtoto Tumboni',
    babyMovementNormal: 'Anacheza Vizuri (Kawaida)',
    babyMovementDecreased: 'Mchezo Umepungua',
    babyMovementAbsent: 'Hajacheza kwa saa 12',
    medications: 'Dawa za Leo',
    appointments: 'Tarehe ya Kliniki',
    emergencySos: 'Msaada wa Dharura (SOS)',
    saveLog: 'Tuma Taarifa za Afya',
    saving: 'Inahifadhi...',
    offlineNotice: 'Bila Mtandao: Imehifadhiwa kwenye simu. Itatuma mtandao ukipatikana.',
    syncedSuccess: 'Taarifa zimetumwa kliniki kwa ufanisi!',
    riskStable: 'Hali Yako Iko Shwari',
    riskWarning: 'Uangalizi Maalumu Unahitajika',
    riskCritical: 'HATARI: Mhudumu wa Afya Amejulishwa Mara Moja',
    callCHW: 'Piga Simu kwa Mhudumu wa Afya',
    voiceGuide: 'Sikiliza Maelekezo kwa Sauti',
    speakToLog: 'Bonyeza Uongee',
    streakTitle: 'Mfululizo wa Afya',
    daysStreak: 'Siku Mfululizo',
    maternalPoints: 'Pointi za Afya',
    badgesEarned: 'Nishani za Mama Bora',
    unlockedBadgeToast: 'Hongera Mama! Umepata Nishani Mpya!',
    levelTitle: 'Kiwango cha Utunzaji',
    streakReinforcement: 'Kazi nzuri sana Mama! Kurekodi kila siku kunalinda mtoto wako.',
  },
  hi: {
    appName: 'MatruSuraksha',
    tagline: 'मातृ स्वास्थ्य सुरक्षा ट्रैकर',
    logVitals: 'आज का स्वास्थ्य दर्ज करें',
    bloodPressure: 'रक्तचाप (ब्लड प्रेशर)',
    systolic: 'ऊपर की संख्या',
    diastolic: 'नीचे की संख्या',
    weight: 'शरीर का वजन',
    swelling: 'शरीर या पैरों में सूजन',
    swellingNone: 'कोई सूजन नहीं',
    swellingMild: 'हल्की सूजन (केवल पैर)',
    swellingSevere: 'गंभीर सूजन (चेहरा और पैर)',
    symptoms: 'खतरे के लक्षण',
    headacheVision: 'तेज सिरदर्द या आंखों के आगे धुंधलापन',
    epigastricPain: 'पेट के ऊपरी हिस्से में तेज दर्द',
    babyMovement: 'शिशु की हलचल',
    babyMovementNormal: 'सामान्य हलचल (स्वस्थ)',
    babyMovementDecreased: 'हलचल कम हुई है',
    babyMovementAbsent: '12 घंटे से कोई हलचल नहीं',
    medications: 'दवाइयां',
    appointments: 'अगली क्लिनिक जांच',
    emergencySos: 'आपातकालीन सहायता (SOS)',
    saveLog: 'दर्ज करें',
    saving: 'सुरक्षित किया जा रहा है...',
    offlineNotice: 'ऑफलाइन मोड: फोन में सुरक्षित है। इंटरनेट आने पर सिंक होगा।',
    syncedSuccess: 'अस्पताल को जानकारी भेज दी गई है!',
    riskStable: 'सब ठीक और सुरक्षित है',
    riskWarning: 'निगरानी की आवश्यकता',
    riskCritical: 'गंभीर चेतावनी: स्वास्थ्य कार्यकर्ता को अलर्ट भेजा गया',
    callCHW: 'आशा / स्वास्थ्य कार्यकर्ता को कॉल करें',
    voiceGuide: 'आवाज़ में निर्देश सुनें',
    speakToLog: 'बोलने के लिए दबाएं',
    streakTitle: 'दैनिक स्वास्थ्य स्ट्रीक',
    daysStreak: 'दिन की स्ट्रीक',
    maternalPoints: 'मातृ सुरक्षा पॉइंट्स',
    badgesEarned: 'सुरक्षित मातृत्व बैज',
    unlockedBadgeToast: 'बधाई हो! आपको नया बैज मिला है!',
    levelTitle: 'स्वास्थ्य स्तर',
    streakReinforcement: 'बहुत बढ़िया! नियमित रूप से जांच दर्ज करने से आप और आपका शिशु सुरक्षित रहते हैं।',
  },
  es: {
    appName: 'MatruSuraksha',
    tagline: 'Monitoreo Materno y Alerta Temprana',
    logVitals: 'Registrar Salud de Hoy',
    bloodPressure: 'Presión Arterial (PA)',
    systolic: 'Número Superior (Sistólica)',
    diastolic: 'Número Inferior (Diastólica)',
    weight: 'Peso Corporal',
    swelling: 'Hinchazón / Edema',
    swellingNone: 'Sin Hinchazón',
    swellingMild: 'Leve (Solo pies)',
    swellingSevere: 'Severa (Rostro y piernas)',
    symptoms: 'Signos de Alarma',
    headacheVision: 'Dolor de cabeza intenso o visión borrosa',
    epigastricPain: 'Dolor en la boca del estómago',
    babyMovement: 'Movimientos del Bebé',
    babyMovementNormal: 'Patea normal (Activo)',
    babyMovementDecreased: 'Menos movimientos que lo habitual',
    babyMovementAbsent: 'Sin movimientos en 12 horas',
    medications: 'Medicamentos del Día',
    appointments: 'Próxima Cita Prenatal',
    emergencySos: 'Ayuda de Emergencia (SOS)',
    saveLog: 'Guardar Registro',
    saving: 'Guardando...',
    offlineNotice: 'Modo sin conexión: Guardado en el teléfono. Se sincronizará al haber red.',
    syncedSuccess: '¡Datos enviados exitosamente a la clínica!',
    riskStable: 'Todo Estable y Normal',
    riskWarning: 'Monitoreo Requerido',
    riskCritical: 'CRÍTICO: Promotora de Salud Alertada',
    callCHW: 'Llamar a la Promotora de Salud',
    voiceGuide: 'Escuchar Guía por Voz',
    speakToLog: 'Presione para Hablar',
    streakTitle: 'Racha de Cuidado Diario',
    daysStreak: 'Días Consecutivos',
    maternalPoints: 'Puntos de Cuidado',
    badgesEarned: 'Insignias de Maternidad Segura',
    unlockedBadgeToast: '¡Felicidades Mamá! ¡Nueva Insignia Desbloqueada!',
    levelTitle: 'Nivel de Cuidado',
    streakReinforcement: '¡Excelente dedicación! El registro diario protege tu salud y la de tu bebé.',
  },
  fr: {
    appName: 'MatruSuraksha',
    tagline: 'Suivi de Santé Maternelle',
    logVitals: 'Enregistrer la Santé du Jour',
    bloodPressure: 'Tension Artérielle',
    systolic: 'Chiffre du haut (Systolique)',
    diastolic: 'Chiffre du bas (Diastolique)',
    weight: 'Poids corporel',
    swelling: 'Gonflement / Œdème',
    swellingNone: 'Aucun gonflement',
    swellingMild: 'Léger (Pieds uniquement)',
    swellingSevere: 'Sévère (Visage et jambes)',
    symptoms: 'Signes de Danger',
    headacheVision: 'Forts maux de tête ou troubles visuels',
    epigastricPain: 'Douleurs au creux de l’estomac',
    babyMovement: 'Mouvements du Bébé',
    babyMovementNormal: 'Bouge bien (Normal)',
    babyMovementDecreased: 'Mouvements diminués',
    babyMovementAbsent: 'Aucun mouvement depuis 12h',
    medications: 'Médicaments quotidiens',
    appointments: 'Prochaine Consultation',
    emergencySos: 'Urgence SOS',
    saveLog: 'Soumettre',
    saving: 'Enregistrement...',
    offlineNotice: 'Mode hors ligne : Stocké sur l’appareil. Synchronisation dès reconnexion.',
    syncedSuccess: 'Données envoyées avec succès au centre de santé !',
    riskStable: 'Tout est Stable',
    riskWarning: 'Surveillance Recommandée',
    riskCritical: 'CRITIQUE : Alerte envoyée à l’agent de santé',
    callCHW: 'Appeler l’Agent de Santé',
    voiceGuide: 'Écouter le guide vocal',
    speakToLog: 'Appuyez pour parler',
    streakTitle: 'Série de Suivi Quotidien',
    daysStreak: 'Jours Consécutifs',
    maternalPoints: 'Points de Santé Maternelle',
    badgesEarned: 'Badges Maternité Protégée',
    unlockedBadgeToast: 'Félicitations Maman ! Nouveau Badge Débloqué !',
    levelTitle: 'Niveau d’Engagement',
    streakReinforcement: 'Bravo pour votre régularité ! Ce suivi protège votre santé et celle de votre bébé.',
  },
};
