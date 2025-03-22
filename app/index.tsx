import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QuestionnaireScreen() {
  const questions = [
    { key: 'age', text: 'Enter your Age:', type: 'input', keyboardType: 'numeric' },
    { key: 'gender', text: 'Gender:', type: 'picker', options: ['Male', 'Female', 'Kirby', 'Other'] },
    { key: 'duration', text: 'Duration: How long have you had tinnitus?', type: 'input' },
    { key: 'loudness', text: 'Loudness: How loud is your tinnitus?', type: 'picker', options: ['Soft', 'Moderate', 'Loud'] },
    { key: 'perception', text: 'Where do you perceive your tinnitus?', type: 'picker', options: ['left ear', 'right ear', 'both ears, worse in left', 'both ears, worse in right', 'both ears', 'inside the head'] },
    { key: 'pitch', text: 'Please describe the pitch of your tinnitus?', type: 'picker', options: ['very high frequency', 'high frequency', 'medium frequency', 'low frequency'] },
    { key: 'psychological treatment', text: 'Are you currently under treatment for psychiatric problems?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'dizziness', text: 'Do you suffer from dizziness or vertigo?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'submitted', text: 'Thank you for filling out the questionnaire.', type: 'submitted'},
  ];
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    if (currentQuestionIndex == questions.length - 2) {
      console.log(responses);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const loadSettings = async () => {
    const storedDarkMode = await AsyncStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setIsDarkMode(JSON.parse(storedDarkMode));
    }
  };
  useEffect(() => {
    loadSettings();
  }, []);

  const themeStyles = isDarkMode ? darkStyles : lightStyles;

  useEffect(() => {
    const loadSettings = async () => {
      const storedDarkMode = await AsyncStorage.getItem('darkMode');
      if (storedDarkMode !== null) {
        setIsDarkMode(JSON.parse(storedDarkMode));
      }
    };
    loadSettings();
  }, []);

  const toggleDarkMode = async (value) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('darkMode', JSON.stringify(value));
  };

  useEffect(() => {
    setInterval(() => {
      loadSettings();
    }, 100);  // 1000 Millisekunden = 1 Sekunde
  },);

  
  
  return (
    <View style={themeStyles.container}>
      <Text style={themeStyles.title}>Questionnaire</Text>
      <Text style={themeStyles.label}>{currentQuestion.text}</Text>
      
      <View style={themeStyles.inputContainer}>
        {currentQuestion.type === 'input' ? (
          <TextInput 
            style={themeStyles.input} 
            keyboardType={currentQuestion.keyboardType || 'default'}
            value={responses[currentQuestion.key] || ''} 
            onChangeText={(text) => handleChange(currentQuestion.key, text)}
          />
        ) : currentQuestion.type === 'picker' ? (
          <Picker
            selectedValue={responses[currentQuestion.key] || ''}
            style={themeStyles.picker}
            onValueChange={(itemValue) => handleChange(currentQuestion.key, itemValue)}
          >
            <Picker.Item label="Select an option" value="" />
            {currentQuestion.options.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        ) : (<></>)}
      </View>

      <View style={themeStyles.buttonContainer}>
        <TouchableOpacity style={currentQuestionIndex == 0 ? themeStyles.buttonDisabled : themeStyles.button} onPress={handlePrev} disabled={currentQuestionIndex == 0}>
          <Text style={themeStyles.buttonText}>{'Previous'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={currentQuestion.key === 'submitted' ? themeStyles.buttonDisabled : themeStyles.button} onPress={handleNext} disabled={currentQuestion.key === 'submitted'}>
          <Text style={themeStyles.buttonText}>{'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: { margin: 'auto', justifyContent: 'center', padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  inputContainer: { flex: 1, justifyContent: 'center', padding: 20, maxHeight: 100 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: '#fff', marginBottom: 20 },
  picker: { height: 50, width: '100%', marginBottom: 20, backgroundColor: '#fff' },
  button: { backgroundColor: '#4A90E2', paddingTop: 6, paddingBottom: 6, paddingRight: 10, paddingLeft: 10, margin: 10, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc', paddingTop: 6, paddingBottom: 6, paddingRight: 10, paddingLeft: 10, margin: 10, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  buttonContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, marginLeft: 'auto', marginRight: 'auto' }
});

const darkStyles = StyleSheet.create({
  container: { margin: 'auto', justifyContent: 'center', padding: 20, backgroundColor: '#333', borderRadius: 10 },
  inputContainer: { flex: 1, justifyContent: 'center', padding: 20, maxHeight: 100 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#fff' },
  label: { fontSize: 16, marginBottom: 20, color: '#ccc' },
  input: { borderWidth: 1, borderColor: '#555', borderRadius: 8, padding: 10, backgroundColor: '#444', marginBottom: 20, color: '#fff' },
  picker: { height: 50, width: '100%', marginBottom: 20, backgroundColor: '#444', color: '#fff' },
  button: { backgroundColor: '#555', paddingTop: 6, paddingBottom: 6, paddingRight: 10, paddingLeft: 10, margin: 10, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#1E1E1E', paddingTop: 6, paddingBottom: 6, paddingRight: 10, paddingLeft: 10, margin: 10, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  buttonContainer: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, marginLeft: 'auto', marginRight: 'auto' }
});
