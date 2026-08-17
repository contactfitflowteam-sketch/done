import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'gu' | 'pt' | 'hi';

export const LANGUAGES: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pt', label: 'Portuguese', native: 'Português (BR)', flag: '🇧🇷' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
];

type Dict = Record<string, string>;

const en: Dict = {
  // common
  next: 'Next', skip: 'Skip', getStarted: 'Get Started', continue: 'Continue', save: 'Save', cancel: 'Cancel', reset: 'Reset', done: 'Done', saved: 'Saved',
  allow: 'Allow', granted: 'Granted', deleteAll: 'Delete All',
  // onboarding
  onb1Title: 'Welcome to Your Daily Fitness Journey', onb1Sub: 'Count your steps every day and stay active.',
  onb2Title: 'Burn Calories, Build Habits', onb2Sub: 'Track calories, water, and sleep in a single premium dashboard.',
  onb3Title: 'Keep Your Streak Alive', onb3Sub: 'Complete daily goals and rise up the streaks leaderboard.',
  // language
  chooseLanguage: 'Choose Your Language', chooseLanguageSub: 'You can change this anytime in Settings.', changeLanguage: 'Change Language',
  // permissions
  motionTitle: 'Turn Motion Access On', motionSub: 'To count your steps, we need your permission to access motion and fitness activity.',
  physicalActivity: 'Physical Activity', physicalActivitySub: 'Live step count & distance',
  notifications: 'Notifications', notificationsSub: 'Step, water, workout & streak reminders',
  // tabs
  home: 'Home', steps: 'Steps', workout: 'Workout', habits: 'Habits', body: 'Body',
  // home
  hi: 'Hi', welcomeBack: 'Welcome back to FitFlow', dailyGoal: 'Daily Goal', editGoal: 'Edit Goal', stepsLabel: 'Steps', complete: 'Complete',
  calories: 'Calories', distance: 'Distance', hydration: 'Hydration', sleep: 'Sleep', lastNight: 'last night',
  weeklyProgress: 'Weekly Progress', avg: 'Avg', dailyGoals: 'Daily Goals', viewAll: 'View All',
  waterGoal: 'Water Goal', sleepGoal: 'Sleep Goal', stepGoal: 'Step Goal', resetToday: "Reset Today's Data",
  resetTitle: "Reset all today's data?", resetBody: 'This will reset steps, calories, distance, water, and daily progress for today.',
  // steps
  your: 'Your', day: 'Day', week: 'Week', month: 'Month', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
  insights: 'Insights', totalDistance: 'Total Distance', totalCalories: 'Total Calories', bestDay: 'Best Day', activeTime: 'Active Time',
  avgSteps: 'Avg {n} steps', trend: 'Trend', tapPoint: 'Tap a bar to see its value',
  // workout
  walking: 'Walking', running: 'Running', cycling: 'Cycling', custom: 'Custom', ready: 'Ready', live: 'Live', paused: 'Paused',
  start: 'Start', pause: 'Pause', resume: 'Resume', stop: 'Stop', duration: 'Duration', recentSessions: 'Recent Sessions', noWorkouts: 'No workouts yet. Start your first session above.',
  // habits
  habitsHint: 'Tap a habit to mark it complete for today.', drinkWater: 'Drink Water', walkGoal: 'Walk Goal', dailyActivity: 'Daily Activity',
  dayStreak: '{n} day streak', startStreak: 'Start a streak today',
  // body
  bodyMeasurements: 'Body Measurements', gender: 'Gender', male: 'Male', female: 'Female', other: 'Other', birthYear: 'Birth Year',
  weight: 'Weight', height: 'Height', stepLength: 'Step Length', auto: 'auto', manual: 'manual', saveMeasurements: 'Save Measurements',
  // settings
  settings: 'Settings', general: 'General', personal: 'Personal', activity: 'Activity', appearance: 'Appearance', data: 'Data', about: 'About',
  social: 'Follow Us', app: 'App', theme: 'Theme', profile: 'Profile',
  distanceUnit: 'Distance Unit', calorieSettings: 'Calorie Settings', glassSize: 'Glass Size', waterReminders: 'Water Reminders',
  sleepTracking: 'Sleep Tracking', dailyStepReminder: 'Daily Step Reminder', waterReminder: 'Water Reminder', workoutReminder: 'Workout Reminder', streakReminder: 'Streak Reminder',
  resetAllData: 'Reset All Data', exportData: 'Export Data', appVersion: 'App Version', privacyPolicy: 'Privacy Policy', terms: 'Terms', contact: 'Contact',
  instagram: 'Instagram', twitter: 'X (Twitter)', facebook: 'Facebook', rateApp: 'Rate This App', homeWidget: 'Home Screen Widget', enableWidget: 'Enable Widget',
  resetAllTitle: 'Reset ALL data?', resetAllBody: 'This permanently deletes profile, workouts, history and habits. Cannot be undone.',
  // goals
  dailyStepGoal: 'Daily Step Goal', selectedGoal: 'Selected Goal', stepsPerDay: 'steps / day', saveGoal: 'Save Goal',
  hydrationGoal: 'Hydration Goal', sleepGoalTitle: 'Sleep Goal', perNight: 'per night', logSleep: 'Log Sleep', saveSleep: 'Save Sleep',
  hours: 'Hours', minutes: 'Minutes', ofDailyGoal: 'of daily goal', quickAdd: 'Quick add (ml)', glass: 'Glass', weeklyHistory: 'Weekly History', weeklySleep: 'Weekly Sleep',
  estimatedBurn: 'Estimated Burn', today: 'Today', weeklyTotal: 'Weekly total',
};

const gu: Dict = {
  next: 'આગળ', skip: 'છોડો', getStarted: 'શરૂ કરો', continue: 'ચાલુ રાખો', save: 'સાચવો', cancel: 'રદ કરો', reset: 'રીસેટ', done: 'પૂર્ણ', saved: 'સાચવ્યું',
  allow: 'મંજૂરી', granted: 'મંજૂર', deleteAll: 'બધું કાઢી નાખો',
  onb1Title: 'તમારી દૈનિક ફિટનેસ યાત્રામાં આપનું સ્વાગત છે', onb1Sub: 'દરરોજ તમારા પગલાં ગણો અને સક્રિય રહો.',
  onb2Title: 'કેલરી બાળો, આદતો બનાવો', onb2Sub: 'એક જ ડેશબોર્ડમાં કેલરી, પાણી અને ઊંઘ ટ્રૅક કરો.',
  onb3Title: 'તમારી સ્ટ્રીક જાળવી રાખો', onb3Sub: 'દૈનિક લક્ષ્યો પૂર્ણ કરો અને આગળ વધો.',
  chooseLanguage: 'તમારી ભાષા પસંદ કરો', chooseLanguageSub: 'તમે આ ગમે ત્યારે સેટિંગ્સમાં બદલી શકો છો.', changeLanguage: 'ભાષા બદલો',
  motionTitle: 'મોશન ઍક્સેસ ચાલુ કરો', motionSub: 'તમારા પગલાં ગણવા માટે અમને મોશન અને ફિટનેસ પ્રવૃત્તિની મંજૂરી જોઈએ છે.',
  physicalActivity: 'શારીરિક પ્રવૃત્તિ', physicalActivitySub: 'લાઇવ પગલાં અને અંતર',
  notifications: 'સૂચનાઓ', notificationsSub: 'પગલાં, પાણી, વર્કઆઉટ અને સ્ટ્રીક રિમાઇન્ડર',
  home: 'હોમ', steps: 'પગલાં', workout: 'વર્કઆઉટ', habits: 'આદતો', body: 'શરીર',
  hi: 'નમસ્તે', welcomeBack: 'FitFlow માં પાછા આપનું સ્વાગત છે', dailyGoal: 'દૈનિક લક્ષ્ય', editGoal: 'લક્ષ્ય બદલો', stepsLabel: 'પગલાં', complete: 'પૂર્ણ',
  calories: 'કેલરી', distance: 'અંતર', hydration: 'પાણી', sleep: 'ઊંઘ', lastNight: 'ગઈ રાત',
  weeklyProgress: 'સાપ્તાહિક પ્રગતિ', avg: 'સરેરાશ', dailyGoals: 'દૈનિક લક્ષ્યો', viewAll: 'બધું જુઓ',
  waterGoal: 'પાણી લક્ષ્ય', sleepGoal: 'ઊંઘ લક્ષ્ય', stepGoal: 'પગલાં લક્ષ્ય', resetToday: 'આજનો ડેટા રીસેટ કરો',
  resetTitle: 'આજનો બધો ડેટા રીસેટ કરવો?', resetBody: 'આ આજ માટે પગલાં, કેલરી, અંતર, પાણી અને પ્રગતિ રીસેટ કરશે.',
  your: 'તમારા', day: 'દિવસ', week: 'અઠવાડિયું', month: 'મહિનો', daily: 'દૈનિક', weekly: 'સાપ્તાહિક', monthly: 'માસિક',
  insights: 'આંતરદૃષ્ટિ', totalDistance: 'કુલ અંતર', totalCalories: 'કુલ કેલરી', bestDay: 'શ્રેષ્ઠ દિવસ', activeTime: 'સક્રિય સમય',
  avgSteps: 'સરેરાશ {n} પગલાં', trend: 'વલણ', tapPoint: 'મૂલ્ય જોવા બાર પર ટૅપ કરો',
  walking: 'ચાલવું', running: 'દોડવું', cycling: 'સાયકલિંગ', custom: 'કસ્ટમ', ready: 'તૈયાર', live: 'લાઇવ', paused: 'થોભાવ્યું',
  start: 'શરૂ', pause: 'થોભો', resume: 'ફરી શરૂ', stop: 'બંધ', duration: 'સમયગાળો', recentSessions: 'તાજેતરના સત્રો', noWorkouts: 'હજુ કોઈ વર્કઆઉટ નથી. ઉપર શરૂ કરો.',
  habitsHint: 'આજ માટે પૂર્ણ ચિહ્નિત કરવા આદત પર ટૅપ કરો.', drinkWater: 'પાણી પીવો', walkGoal: 'ચાલવાનું લક્ષ્ય', dailyActivity: 'દૈનિક પ્રવૃત્તિ',
  dayStreak: '{n} દિવસ સ્ટ્રીક', startStreak: 'આજે સ્ટ્રીક શરૂ કરો',
  bodyMeasurements: 'શરીર માપ', gender: 'લિંગ', male: 'પુરુષ', female: 'સ્ત્રી', other: 'અન્ય', birthYear: 'જન્મ વર્ષ',
  weight: 'વજન', height: 'ઊંચાઈ', stepLength: 'પગલાંની લંબાઈ', auto: 'ઑટો', manual: 'મેન્યુઅલ', saveMeasurements: 'માપ સાચવો',
  settings: 'સેટિંગ્સ', general: 'સામાન્ય', personal: 'વ્યક્તિગત', activity: 'પ્રવૃત્તિ', appearance: 'દેખાવ', data: 'ડેટા', about: 'વિશે',
  social: 'અમને ફોલો કરો', app: 'ઍપ', theme: 'થીમ', profile: 'પ્રોફાઇલ',
  distanceUnit: 'અંતર એકમ', calorieSettings: 'કેલરી સેટિંગ્સ', glassSize: 'ગ્લાસ કદ', waterReminders: 'પાણી રિમાઇન્ડર',
  sleepTracking: 'ઊંઘ ટ્રૅકિંગ', dailyStepReminder: 'દૈનિક પગલાં રિમાઇન્ડર', waterReminder: 'પાણી રિમાઇન્ડર', workoutReminder: 'વર્કઆઉટ રિમાઇન્ડર', streakReminder: 'સ્ટ્રીક રિમાઇન્ડર',
  resetAllData: 'બધો ડેટા રીસેટ કરો', exportData: 'ડેટા નિકાસ', appVersion: 'ઍપ આવૃત્તિ', privacyPolicy: 'ગોપનીયતા નીતિ', terms: 'શરતો', contact: 'સંપર્ક',
  instagram: 'ઇન્સ્ટાગ્રામ', twitter: 'X (ટ્વિટર)', facebook: 'ફેસબુક', rateApp: 'આ ઍપને રેટ કરો', homeWidget: 'હોમ સ્ક્રીન વિજેટ', enableWidget: 'વિજેટ સક્ષમ કરો',
  resetAllTitle: 'બધો ડેટા રીસેટ કરવો?', resetAllBody: 'આ કાયમ માટે પ્રોફાઇલ, વર્કઆઉટ, ઇતિહાસ અને આદતો કાઢી નાખશે.',
  dailyStepGoal: 'દૈનિક પગલાં લક્ષ્ય', selectedGoal: 'પસંદ કરેલ લક્ષ્ય', stepsPerDay: 'પગલાં / દિવસ', saveGoal: 'લક્ષ્ય સાચવો',
  hydrationGoal: 'પાણી લક્ષ્ય', sleepGoalTitle: 'ઊંઘ લક્ષ્ય', perNight: 'પ્રતિ રાત', logSleep: 'ઊંઘ નોંધો', saveSleep: 'ઊંઘ સાચવો',
  hours: 'કલાક', minutes: 'મિનિટ', ofDailyGoal: 'દૈનિક લક્ષ્યનું', quickAdd: 'ઝડપી ઉમેરો (ml)', glass: 'ગ્લાસ', weeklyHistory: 'સાપ્તાહિક ઇતિહાસ', weeklySleep: 'સાપ્તાહિક ઊંઘ',
  estimatedBurn: 'અંદાજિત બર્ન', today: 'આજે', weeklyTotal: 'સાપ્તાહિક કુલ',
};

const pt: Dict = {
  next: 'Próximo', skip: 'Pular', getStarted: 'Começar', continue: 'Continuar', save: 'Salvar', cancel: 'Cancelar', reset: 'Redefinir', done: 'Concluído', saved: 'Salvo',
  allow: 'Permitir', granted: 'Concedido', deleteAll: 'Excluir tudo',
  onb1Title: 'Bem-vindo à sua jornada fitness diária', onb1Sub: 'Conte seus passos todos os dias e mantenha-se ativo.',
  onb2Title: 'Queime calorias, crie hábitos', onb2Sub: 'Acompanhe calorias, água e sono em um único painel premium.',
  onb3Title: 'Mantenha sua sequência viva', onb3Sub: 'Complete metas diárias e suba no ranking de sequências.',
  chooseLanguage: 'Escolha seu idioma', chooseLanguageSub: 'Você pode mudar isso a qualquer momento nas Configurações.', changeLanguage: 'Mudar idioma',
  motionTitle: 'Ative o acesso ao movimento', motionSub: 'Para contar seus passos, precisamos de permissão para acessar movimento e atividade física.',
  physicalActivity: 'Atividade física', physicalActivitySub: 'Passos e distância ao vivo',
  notifications: 'Notificações', notificationsSub: 'Lembretes de passos, água, treino e sequência',
  home: 'Início', steps: 'Passos', workout: 'Treino', habits: 'Hábitos', body: 'Corpo',
  hi: 'Olá', welcomeBack: 'Bem-vindo de volta ao FitFlow', dailyGoal: 'Meta diária', editGoal: 'Editar meta', stepsLabel: 'Passos', complete: 'Completo',
  calories: 'Calorias', distance: 'Distância', hydration: 'Hidratação', sleep: 'Sono', lastNight: 'ontem à noite',
  weeklyProgress: 'Progresso semanal', avg: 'Média', dailyGoals: 'Metas diárias', viewAll: 'Ver tudo',
  waterGoal: 'Meta de água', sleepGoal: 'Meta de sono', stepGoal: 'Meta de passos', resetToday: 'Redefinir dados de hoje',
  resetTitle: 'Redefinir todos os dados de hoje?', resetBody: 'Isso redefinirá passos, calorias, distância, água e progresso de hoje.',
  your: 'Seus', day: 'Dia', week: 'Semana', month: 'Mês', daily: 'Diário', weekly: 'Semanal', monthly: 'Mensal',
  insights: 'Insights', totalDistance: 'Distância total', totalCalories: 'Calorias totais', bestDay: 'Melhor dia', activeTime: 'Tempo ativo',
  avgSteps: 'Média {n} passos', trend: 'Tendência', tapPoint: 'Toque numa barra para ver o valor',
  walking: 'Caminhada', running: 'Corrida', cycling: 'Ciclismo', custom: 'Personalizado', ready: 'Pronto', live: 'Ao vivo', paused: 'Pausado',
  start: 'Iniciar', pause: 'Pausar', resume: 'Retomar', stop: 'Parar', duration: 'Duração', recentSessions: 'Sessões recentes', noWorkouts: 'Nenhum treino ainda. Comece acima.',
  habitsHint: 'Toque num hábito para marcá-lo como concluído hoje.', drinkWater: 'Beber água', walkGoal: 'Meta de caminhada', dailyActivity: 'Atividade diária',
  dayStreak: 'sequência de {n} dias', startStreak: 'Comece uma sequência hoje',
  bodyMeasurements: 'Medidas corporais', gender: 'Gênero', male: 'Masculino', female: 'Feminino', other: 'Outro', birthYear: 'Ano de nascimento',
  weight: 'Peso', height: 'Altura', stepLength: 'Comprimento do passo', auto: 'auto', manual: 'manual', saveMeasurements: 'Salvar medidas',
  settings: 'Configurações', general: 'Geral', personal: 'Pessoal', activity: 'Atividade', appearance: 'Aparência', data: 'Dados', about: 'Sobre',
  social: 'Siga-nos', app: 'App', theme: 'Tema', profile: 'Perfil',
  distanceUnit: 'Unidade de distância', calorieSettings: 'Configurações de calorias', glassSize: 'Tamanho do copo', waterReminders: 'Lembretes de água',
  sleepTracking: 'Rastreamento de sono', dailyStepReminder: 'Lembrete diário de passos', waterReminder: 'Lembrete de água', workoutReminder: 'Lembrete de treino', streakReminder: 'Lembrete de sequência',
  resetAllData: 'Redefinir todos os dados', exportData: 'Exportar dados', appVersion: 'Versão do app', privacyPolicy: 'Política de privacidade', terms: 'Termos', contact: 'Contato',
  instagram: 'Instagram', twitter: 'X (Twitter)', facebook: 'Facebook', rateApp: 'Avaliar este app', homeWidget: 'Widget na tela inicial', enableWidget: 'Ativar widget',
  resetAllTitle: 'Redefinir TODOS os dados?', resetAllBody: 'Isso exclui permanentemente perfil, treinos, histórico e hábitos. Não pode ser desfeito.',
  dailyStepGoal: 'Meta diária de passos', selectedGoal: 'Meta selecionada', stepsPerDay: 'passos / dia', saveGoal: 'Salvar meta',
  hydrationGoal: 'Meta de hidratação', sleepGoalTitle: 'Meta de sono', perNight: 'por noite', logSleep: 'Registrar sono', saveSleep: 'Salvar sono',
  hours: 'Horas', minutes: 'Minutos', ofDailyGoal: 'da meta diária', quickAdd: 'Adição rápida (ml)', glass: 'Copo', weeklyHistory: 'Histórico semanal', weeklySleep: 'Sono semanal',
  estimatedBurn: 'Queima estimada', today: 'Hoje', weeklyTotal: 'Total semanal',
};

const hi: Dict = {
  next: 'आगे', skip: 'छोड़ें', getStarted: 'शुरू करें', continue: 'जारी रखें', save: 'सहेजें', cancel: 'रद्द करें', reset: 'रीसेट', done: 'पूर्ण', saved: 'सहेजा गया',
  allow: 'अनुमति दें', granted: 'स्वीकृत', deleteAll: 'सब हटाएं',
  onb1Title: 'अपनी दैनिक फिटनेस यात्रा में आपका स्वागत है', onb1Sub: 'हर दिन अपने कदम गिनें और सक्रिय रहें।',
  onb2Title: 'कैलोरी जलाएं, आदतें बनाएं', onb2Sub: 'एक ही डैशबोर्ड में कैलोरी, पानी और नींद ट्रैक करें।',
  onb3Title: 'अपनी स्ट्रीक बनाए रखें', onb3Sub: 'दैनिक लक्ष्य पूरे करें और आगे बढ़ें।',
  chooseLanguage: 'अपनी भाषा चुनें', chooseLanguageSub: 'आप इसे कभी भी सेटिंग्स में बदल सकते हैं।', changeLanguage: 'भाषा बदलें',
  motionTitle: 'मोशन एक्सेस चालू करें', motionSub: 'आपके कदम गिनने के लिए हमें मोशन और फिटनेस गतिविधि की अनुमति चाहिए।',
  physicalActivity: 'शारीरिक गतिविधि', physicalActivitySub: 'लाइव कदम और दूरी',
  notifications: 'सूचनाएं', notificationsSub: 'कदम, पानी, वर्कआउट और स्ट्रीक रिमाइंडर',
  home: 'होम', steps: 'कदम', workout: 'वर्कआउट', habits: 'आदतें', body: 'शरीर',
  hi: 'नमस्ते', welcomeBack: 'FitFlow में वापस स्वागत है', dailyGoal: 'दैनिक लक्ष्य', editGoal: 'लक्ष्य बदलें', stepsLabel: 'कदम', complete: 'पूर्ण',
  calories: 'कैलोरी', distance: 'दूरी', hydration: 'पानी', sleep: 'नींद', lastNight: 'पिछली रात',
  weeklyProgress: 'साप्ताहिक प्रगति', avg: 'औसत', dailyGoals: 'दैनिक लक्ष्य', viewAll: 'सभी देखें',
  waterGoal: 'पानी लक्ष्य', sleepGoal: 'नींद लक्ष्य', stepGoal: 'कदम लक्ष्य', resetToday: 'आज का डेटा रीसेट करें',
  resetTitle: 'आज का सारा डेटा रीसेट करें?', resetBody: 'इससे आज के कदम, कैलोरी, दूरी, पानी और प्रगति रीसेट होगी।',
  your: 'आपके', day: 'दिन', week: 'सप्ताह', month: 'महीना', daily: 'दैनिक', weekly: 'साप्ताहिक', monthly: 'मासिक',
  insights: 'अंतर्दृष्टि', totalDistance: 'कुल दूरी', totalCalories: 'कुल कैलोरी', bestDay: 'सर्वश्रेष्ठ दिन', activeTime: 'सक्रिय समय',
  avgSteps: 'औसत {n} कदम', trend: 'रुझान', tapPoint: 'मान देखने के लिए बार टैप करें',
  walking: 'चलना', running: 'दौड़ना', cycling: 'साइक्लिंग', custom: 'कस्टम', ready: 'तैयार', live: 'लाइव', paused: 'रुका हुआ',
  start: 'शुरू', pause: 'रोकें', resume: 'फिर शुरू', stop: 'बंद', duration: 'अवधि', recentSessions: 'हाल के सत्र', noWorkouts: 'अभी कोई वर्कआउट नहीं। ऊपर शुरू करें।',
  habitsHint: 'आज पूरा चिह्नित करने के लिए आदत टैप करें।', drinkWater: 'पानी पिएं', walkGoal: 'चलने का लक्ष्य', dailyActivity: 'दैनिक गतिविधि',
  dayStreak: '{n} दिन स्ट्रीक', startStreak: 'आज स्ट्रीक शुरू करें',
  bodyMeasurements: 'शरीर माप', gender: 'लिंग', male: 'पुरुष', female: 'महिला', other: 'अन्य', birthYear: 'जन्म वर्ष',
  weight: 'वजन', height: 'ऊंचाई', stepLength: 'कदम की लंबाई', auto: 'ऑटो', manual: 'मैनुअल', saveMeasurements: 'माप सहेजें',
  settings: 'सेटिंग्स', general: 'सामान्य', personal: 'व्यक्तिगत', activity: 'गतिविधि', appearance: 'रूप', data: 'डेटा', about: 'के बारे में',
  social: 'हमें फॉलो करें', app: 'ऐप', theme: 'थीम', profile: 'प्रोफ़ाइल',
  distanceUnit: 'दूरी इकाई', calorieSettings: 'कैलोरी सेटिंग्स', glassSize: 'गिलास आकार', waterReminders: 'पानी रिमाइंडर',
  sleepTracking: 'नींद ट्रैकिंग', dailyStepReminder: 'दैनिक कदम रिमाइंडर', waterReminder: 'पानी रिमाइंडर', workoutReminder: 'वर्कआउट रिमाइंडर', streakReminder: 'स्ट्रीक रिमाइंडर',
  resetAllData: 'सारा डेटा रीसेट करें', exportData: 'डेटा निर्यात', appVersion: 'ऐप संस्करण', privacyPolicy: 'गोपनीयता नीति', terms: 'शर्तें', contact: 'संपर्क',
  instagram: 'इंस्टाग्राम', twitter: 'X (ट्विटर)', facebook: 'फेसबुक', rateApp: 'इस ऐप को रेट करें', homeWidget: 'होम स्क्रीन विजेट', enableWidget: 'विजेट सक्षम करें',
  resetAllTitle: 'सारा डेटा रीसेट करें?', resetAllBody: 'यह प्रोफ़ाइल, वर्कआउट, इतिहास और आदतें स्थायी रूप से हटा देगा। पूर्ववत नहीं किया जा सकता।',
  dailyStepGoal: 'दैनिक कदम लक्ष्य', selectedGoal: 'चयनित लक्ष्य', stepsPerDay: 'कदम / दिन', saveGoal: 'लक्ष्य सहेजें',
  hydrationGoal: 'पानी लक्ष्य', sleepGoalTitle: 'नींद लक्ष्य', perNight: 'प्रति रात', logSleep: 'नींद दर्ज करें', saveSleep: 'नींद सहेजें',
  hours: 'घंटे', minutes: 'मिनट', ofDailyGoal: 'दैनिक लक्ष्य का', quickAdd: 'त्वरित जोड़ें (ml)', glass: 'गिलास', weeklyHistory: 'साप्ताहिक इतिहास', weeklySleep: 'साप्ताहिक नींद',
  estimatedBurn: 'अनुमानित बर्न', today: 'आज', weeklyTotal: 'साप्ताहिक कुल',
};

const DICTS: Record<Lang, Dict> = { en, gu, pt, hi };
const KEY = '@fitflow.lang';

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof en, vars?: Record<string, string | number>) => string; ready: boolean };
const I18nContext = createContext<I18nCtx>({ lang: 'en', setLang: () => {}, t: (k) => String(k), ready: false });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);
  useEffect(() => { AsyncStorage.getItem(KEY).then((v) => { if (v && v in DICTS) setLangState(v as Lang); setReady(true); }); }, []);
  const setLang = useCallback((l: Lang) => { setLangState(l); AsyncStorage.setItem(KEY, l); }, []);
  const t = useCallback((k: keyof typeof en, vars?: Record<string, string | number>) => {
    let str = DICTS[lang][k] ?? en[k] ?? String(k);
    if (vars) Object.keys(vars).forEach((vk) => { str = str.replace(`{${vk}}`, String(vars[vk])); });
    return str;
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t, ready }), [lang, setLang, t, ready]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export const LANG_KEY = KEY;
