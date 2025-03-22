import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Colors } from './theme.js';

export default function QuestionnaireScreen() {
  // supabase
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // questionnaire
  const questions = [
    { key: 'age', text: 'Enter your Age:', type: 'input', keyboardType: 'numeric' },
    { key: 'gender', text: 'Gender:', type: 'picker', options: ['Male', 'Female', 'Kirby', 'Other'] },
    { key: 'duration', text: 'Duration: How long have you had tinnitus?', type: 'input' },
    { key: 'loudness', text: 'Loudness: How loud is your tinnitus?', type: 'picker', options: ['Soft', 'Moderate', 'Loud'] },
    { key: 'perception', text: 'Where do you perceive your tinnitus?', type: 'picker', options: ['left ear', 'right ear', 'both ears, worse in left', 'both ears, worse in right', 'both ears', 'inside the head'] },
    { key: 'pitch', text: 'Please describe the pitch of your tinnitus?', type: 'picker', options: ['very high frequency', 'high frequency', 'medium frequency', 'low frequency'] },
    { key: 'psychological treatment', text: 'Are you currently under treatment for psychiatric problems?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'dizziness', text: 'Do you suffer from dizziness or vertigo?', type: 'picker', options: ['Yes', 'No'] },
    { key: 'submitted', text: 'Your information has been saved.', type: 'submitted' },
  ];

  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleChange = (key, value) => {
    setResponses({ ...responses, [key]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    if (currentQuestionIndex === questions.length - 2) {
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
    }, 100); // 1000 Millisekunden = 1 Sekunde
  });

  return (
    <SafeAreaView style={themeStyles.mainContainer}>
      <View style={themeStyles.header}>
        <Text style={themeStyles.title}>Questionnaire</Text>
      </View>
      <ScrollView contentContainerStyle={themeStyles.scrollContainer}>
        <View style={themeStyles.container}>
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
            ) : null}
          </View>
          <View style={themeStyles.buttonContainer}>
            <TouchableOpacity
              style={currentQuestionIndex === 0 ? themeStyles.buttonDisabled : themeStyles.button}
              onPress={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={themeStyles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={currentQuestion.key === 'submitted' ? themeStyles.buttonDisabled : themeStyles.button}
              onPress={handleNext}
              disabled={currentQuestion.key === 'submitted'}
            >
              <Text style={themeStyles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const lightStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the content horizontally
    padding: 20,
    maxHeight: 100,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    width: '100%',
    maxWidth: 500, // Maximum width on larger screens
    alignSelf: 'center', // Center the input
  },
  picker: {
    height: 50,
    width: '100%',
    maxWidth: 500, // Maximum width on larger screens
    marginBottom: 20,
    backgroundColor: '#fff',
    alignSelf: 'center', // Center the picker
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    paddingLeft: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    paddingLeft: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

const darkStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#333',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    backgroundColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center the content horizontally
    padding: 20,
    maxHeight: 100,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    fontWeight: 'bold',
    color: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#444',
    marginBottom: 20,
    color: '#fff',
    width: '100%',
    maxWidth: 500, // Maximum width on larger screens
    alignSelf: 'center', // Center the input
  },
  picker: {
    height: 50,
    width: '100%',
    maxWidth: 500, // Maximum width on larger screens
    marginBottom: 20,
    backgroundColor: '#444',
    color: '#fff',
    alignSelf: 'center', // Center the picker
  },
  button: {
    backgroundColor: '#555',
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    paddingLeft: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1E1E1E',
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    paddingLeft: 10,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});
